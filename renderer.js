const { ipcRenderer } = require('electron');

const urlInput = document.getElementById('url-input');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const interactionsList = document.getElementById('interactions');

startBtn.addEventListener('click', () => {
  const url = urlInput.value;
  if (!url) {
    alert('Please enter a URL');
    return;
  }
  startBtn.disabled = true;
  stopBtn.disabled = false;
  ipcRenderer.send('start-tracking', url);
});

stopBtn.addEventListener('click', () => {
  stopBtn.disabled = true;
  startBtn.disabled = false;
  ipcRenderer.send('stop-tracking');
});

ipcRenderer.on('interaction', (event, data) => {
  const li = document.createElement('li');
  li.className = 'interaction';

  const img = document.createElement('img');
  img.className = 'screenshot';
  img.src = `data:image/png;base64,${data.screenshot}`;

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
  li.append(img, details);
  interactionsList.appendChild(li);
});
