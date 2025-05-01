/**
 * main.js - Electron main process.
 * Initializes the application window, manages Selenium WebDriver,
 * records user interactions, and communicates with the renderer.
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Builder } = require('selenium-webdriver');
require('dotenv').config({ path: path.resolve(require('os').homedir(), '.browser-driver-manager/.env') });
console.log(process.env.CHROMEDRIVER_TEST_PATH);

let mainWindow;
let driver;
let pollInterval;

/**
 * Creates the main application window with predefined dimensions
 * and web preferences, then loads the UI from index.html.
 */
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

/**
 * Handles the 'start-tracking' IPC event from renderer.
 * Launches Selenium WebDriver for Chrome, navigates to the provided URL,
 * injects event listeners into the page to record interactions,
 * and starts polling for events.
 */
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

/**
 * Handles the 'stop-tracking' IPC event.
 * Clears polling interval and shuts down the WebDriver.
 */
ipcMain.on('stop-tracking', async () => {
  if (pollInterval) {
    clearInterval(pollInterval);
  }
  if (driver) {
    await driver.quit();
  }
});

/**
 * Quit the app when all windows are closed, except on macOS.
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
