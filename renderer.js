/**
 * renderer.js - Electron renderer process.
 * Manages UI, IPC events for interaction tracking,
 * updates DOM with event details and screenshots, and initiates script translation.
 * Allows editing and customization of generated Robot Framework scripts.
 */
const { ipcRenderer } = require('electron');
const { initializeTranslator } = require('./translator/robot-translator');
let interactionsData = [];
let translator;
const demoFlag = true;
const verifyFlag = true;

const urlInput = document.getElementById('url-input');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const interactionsList = document.getElementById('interactions');
const robotOutput = document.getElementById('robot-output');
const editBtn = document.getElementById('edit-script-btn');
const saveScriptBtn = document.getElementById('save-script-btn');
const scriptEditor = document.getElementById('robot-editor');
const newSessionBtn = document.getElementById('new-session-btn');
let isEditing = false;
let originalScript = '';

/**
 * Handle Start button click:
 * - Validate URL input
 * - Disable start button, enable stop button
 * - Send 'start-tracking' IPC event to main process
 * - Initialize translator and clear previous data
 */
startBtn.addEventListener('click', () => {
  const url = urlInput.value;
  if (!url) {
    alert('Please enter a URL');
    return;
  }
  startBtn.disabled = true;
  stopBtn.disabled = false;
  ipcRenderer.send('start-tracking', url);
  translator = initializeTranslator('SeleniumLibrary', 'testing');
  interactionsData = [];
  document.getElementById('robot-output').textContent = '';
});

/**
 * Handle Stop button click:
 * - Disable stop button, enable start button
 * - Send 'stop-tracking' IPC event to main process
 * - Map collected interaction data to translator format
 * - Generate output script and display in the UI
 */
stopBtn.addEventListener('click', () => {
  stopBtn.disabled = true;
  startBtn.disabled = false;
  ipcRenderer.send('stop-tracking');
  const mappedData = interactionsData.map(d => ({
    type: d.type === 'input' ? 'text' : d.type,
    path: d.selector,
    value: d.value,
    title: urlInput.value.replace(/^https?:\/\//, '') // Use the URL as title
  }));
  originalScript = translator.generateFile(mappedData, mappedData.length, demoFlag, verifyFlag);
  robotOutput.textContent = originalScript;
  
  // Enable edit button after script generation
  editBtn.disabled = false;
  
  // Clear the editor and update with generated script
  scriptEditor.value = originalScript;
  
  // Note: We don't need to explicitly save here since the main process will request it
});

/**
 * Handle Edit button click:
 * - Toggle between viewing and editing modes for the Robot script
 * - Show/hide appropriate UI elements
 */
editBtn.addEventListener('click', () => {
  isEditing = !isEditing;
  if (isEditing) {
    // Switch to edit mode
    robotOutput.style.display = 'none';
    scriptEditor.style.display = 'block';
    scriptEditor.value = robotOutput.textContent;
    editBtn.textContent = 'Cancel Editing';
  } else {
    // Switch back to view mode
    robotOutput.style.display = 'block';
    scriptEditor.style.display = 'none';
    editBtn.textContent = 'Edit Script';
  }
});

/**
 * Handle Save Script button click:
 * - Update the displayed script with custom edits if in edit mode
 * - Save the script to disk
 */
saveScriptBtn.addEventListener('click', () => {
  // If in edit mode, update the script content from editor
  if (isEditing) {
    const customScript = scriptEditor.value;
    robotOutput.textContent = customScript;
    originalScript = customScript;
  }
  
  // Save the script to disk (either custom edited or auto-generated)
  ipcRenderer.send('save-custom-script', robotOutput.textContent);
});

/**
 * Handle New Session button click:
 * - Clear interaction data and UI elements
 * - Reset button states
 * - Reset script output
 */
newSessionBtn.addEventListener('click', () => {
  // Ask for confirmation before clearing
  if (interactionsData.length > 0 && !confirm('This will clear all current session data. Continue?')) {
    return;
  }
  
  // Clear interaction data
  interactionsData = [];
  
  // Clear DOM elements
  interactionsList.innerHTML = '';
  robotOutput.textContent = '';
  scriptEditor.value = '';
  
  // Clear any existing success/info messages
  // Bug fix: Only remove message divs, not the control buttons
  const messages = document.querySelectorAll('#controls > div:not(.button-group), #script-controls > .success-message');
  messages.forEach(msg => msg.remove());
  
  // Reset UI state
  startBtn.disabled = false;
  stopBtn.disabled = true;
  editBtn.disabled = true;
  
  // Reset editor state
  if (isEditing) {
    robotOutput.style.display = 'block';
    scriptEditor.style.display = 'none';
    isEditing = false;
    editBtn.textContent = 'Edit Script';
  }
  
  // Signal to main process to clear any session data
  ipcRenderer.send('clear-session');
  
  // Visual feedback
  newSessionBtn.classList.add('highlight-button');
  setTimeout(() => {
    newSessionBtn.classList.remove('highlight-button');
  }, 2000);
});

/**
 * Receive 'interaction' IPC event from main process:
 * - Append new interaction data to array
 * - Regenerate translated script and update output area
 * - Create list item with screenshot and details in the UI
 */
ipcRenderer.on('interaction', (event, data) => {
  interactionsData.push(data);
  const mappedData = interactionsData.map(d => ({
    type: d.type === 'input' ? 'text' : d.type,
    path: d.selector,
    value: d.value,
    title: urlInput.value.replace(/^https?:\/\//, '') // Use the URL as title
  }));
  
  // Only update the auto-generated script if not in edit mode
  if (!isEditing) {
    originalScript = translator.generateFile(mappedData, mappedData.length, demoFlag, verifyFlag);
    robotOutput.textContent = originalScript;
  }
  
  const li = document.createElement('li');
  li.className = 'interaction';

  // full-page screenshot
  const imgFull = document.createElement('img');
  imgFull.className = 'screenshot-full';
  imgFull.src = `data:image/png;base64,${data.screenshotFull}`;
  // element-only screenshot
  const imgElem = document.createElement('img');
  imgElem.className = 'screenshot-elem';
  imgElem.src = `data:image/png;base64,${data.screenshotElement}`;

  const details = document.createElement('div');
  details.className = 'details';

  const selectorDiv = document.createElement('div');
  selectorDiv.textContent = `Selector: ${data.selector}`;
  const textDiv = document.createElement('div');
  textDiv.textContent = `Text: ${data.text || ''}`;
  const valueDiv = document.createElement('div');
  valueDiv.textContent = `Value: ${data.value || ''}`;
  const timeDiv = document.createElement('div');
  timeDiv.textContent = `Timestamp: ${data.timestamp}`;

  details.append(selectorDiv, textDiv, valueDiv, timeDiv);
li.append(imgElem, imgFull, details);
  interactionsList.appendChild(li);
  
  // Ensure layout updates with new content
  setTimeout(handleWindowResize, 10);
});

/**
 * Receive notification about where recordings were saved
 */
ipcRenderer.on('save-complete', (event, savePath) => {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = `Saved interactions to: ${savePath}`;
  msgDiv.style.marginTop = '10px';
  
  // Fix: Create a messages container if it doesn't exist
  let messagesContainer = document.getElementById('messages-container');
  if (!messagesContainer) {
    messagesContainer = document.createElement('div');
    messagesContainer.id = 'messages-container';
    document.getElementById('controls').appendChild(messagesContainer);
  }
  
  // Append message to the messages container instead of controls directly
  messagesContainer.appendChild(msgDiv);
});

/**
 * Receive confirmation that a custom script was saved
 */
ipcRenderer.on('script-saved', (event, filePath) => {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = `Custom script saved to: ${filePath}`;
  msgDiv.style.marginTop = '10px';
  msgDiv.className = 'success-message';
  document.getElementById('script-controls').appendChild(msgDiv);
  
  // Remove the message after 5 seconds
  setTimeout(() => {
    if (msgDiv.parentNode) {
      msgDiv.parentNode.removeChild(msgDiv);
    }
  }, 5000);
});

/**
 * Listen for auto-save requests from main process
 * Sends the current script content for automatic saving
 */
ipcRenderer.on('request-auto-save', () => {
  // Send the current script content to be auto-saved
  // The third parameter (true) indicates this is an auto-save
  ipcRenderer.send('save-custom-script', robotOutput.textContent, true);
});

/**
 * Receive confirmation that a script was auto-saved
 */
ipcRenderer.on('script-auto-saved', (event, filePath) => {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = `Script auto-saved to: ${filePath}`;
  msgDiv.style.marginTop = '10px';
  msgDiv.className = 'info-message';
  
  // Fix: Create a messages container if it doesn't exist
  let messagesContainer = document.getElementById('messages-container');
  if (!messagesContainer) {
    messagesContainer = document.createElement('div');
    messagesContainer.id = 'messages-container';
    document.getElementById('controls').appendChild(messagesContainer);
  }
  
  messagesContainer.appendChild(msgDiv);
  
  // Remove the message after 5 seconds
  setTimeout(() => {
    if (msgDiv.parentNode) {
      msgDiv.parentNode.removeChild(msgDiv);
    }
  }, 5000);
});

/**
 * Handle window resize events to adjust the UI layout
 * Ensures components resize appropriately when window dimensions change
 */
function handleWindowResize() {
  const contentHeight = window.innerHeight - 150; // Adjust for header/controls height
  const contentElement = document.getElementById('content');
  contentElement.style.height = `${contentHeight}px`;
  
  // If we're in a narrow view (mobile/tablet), adjust the layout
  if (window.innerWidth <= 768) {
    // Each container should be at most 50% of the content height
    const containerHeight = Math.floor(contentHeight / 2);
    document.getElementById('interactions-container').style.maxHeight = `${containerHeight}px`;
    document.getElementById('script-container').style.maxHeight = `${containerHeight}px`;
  } else {
    // In wider views, let containers take their natural height
    document.getElementById('interactions-container').style.maxHeight = '';
    document.getElementById('script-container').style.maxHeight = '';
  }
  
  // Adjust textarea/output height to fill available space
  const scriptOutput = document.getElementById('script-output');
  const scriptControls = document.getElementById('script-controls');
  const availableScriptHeight = document.getElementById('script-container').clientHeight - 
                               scriptControls.offsetHeight - 40; // account for margins/paddings
  
  scriptOutput.style.height = `${availableScriptHeight}px`;
}

// Initialize layout on page load and add resize listener
window.addEventListener('load', handleWindowResize);
window.addEventListener('resize', handleWindowResize);
