const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Builder } = require('selenium-webdriver');
require('dotenv').config({ path: path.resolve(require('os').homedir(), '.browser-driver-manager/.env') });
console.log(process.env.CHROMEDRIVER_TEST_PATH);

let mainWindow;
let driver;
let pollInterval;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.on('start-tracking', async (event, url) => {
  driver = await new Builder().forBrowser('chrome').build();
  await driver.get(url);
  await driver.executeScript(function() {
    window.interactions = [];
    function recordEvent(e) {
      try {
        var info = {
          type: e.type,
          selector: e.target.tagName + (e.target.id ? '#' + e.target.id : '') + (e.target.className ? '.' + e.target.className.split(' ').join('.') : ''),
          text: e.target.innerText || null,
          value: e.target.value || null,
          timestamp: new Date().toISOString()
        };
        window.interactions.push(info);
      } catch (err) {}
    }
    ['click', 'input'].forEach(function(ev) {
      document.addEventListener(ev, recordEvent, true);
    });
    window.addEventListener('scroll', recordEvent, true);
  });
  pollInterval = setInterval(async () => {
    try {
      const interactions = await driver.executeScript(`
        const events = window.interactions.slice();
        window.interactions = [];
        return events;
      `);
      for (const info of interactions) {
        const screenshot = await driver.takeScreenshot();
        mainWindow.webContents.send('interaction', { ...info, screenshot });
      }
    } catch (err) {
      console.error(err);
    }
  }, 250);
});

ipcMain.on('stop-tracking', async () => {
  if (pollInterval) {
    clearInterval(pollInterval);
  }
  if (driver) {
    await driver.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
