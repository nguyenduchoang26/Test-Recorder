/**
 * renderer.js - Electron renderer process.
 * Manages UI, IPC events for interaction tracking,
 * updates DOM with event details and screenshots, and initiates script translation.
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
    value: d.value
  }));
  const script = translator.generateOutput(mappedData, mappedData.length, demoFlag, verifyFlag);
  document.getElementById('robot-output').textContent = script;
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
    value: d.value
  }));
  const script = translator.generateOutput(mappedData, mappedData.length, demoFlag, verifyFlag);
  document.getElementById('robot-output').textContent = script;
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
});

ipcRenderer.on('save-complete', (event, savePath) => {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = `Saved interactions to: ${savePath}`;
  msgDiv.style.marginTop = '10px';
  document.getElementById('controls').appendChild(msgDiv);
});
