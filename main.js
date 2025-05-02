/**
 * main.js - Electron main process.
 * Initializes the application window, manages Selenium WebDriver,
 * records user interactions, and communicates with the renderer.
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { Builder, By } = require('selenium-webdriver');
require('dotenv').config({ path: path.resolve(require('os').homedir(), '.browser-driver-manager/.env') });
console.log(process.env.CHROMEDRIVER_TEST_PATH);

let mainWindow;
let driver;
let pollInterval;
let savePath;
let actionCounter = 0;

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
  const timestamp = new Date().toISOString().replace(/:/g, '_');
  savePath = path.join(__dirname, 'recordings', timestamp);
  fs.mkdirSync(savePath, { recursive: true });
  actionCounter = 0;
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
          timestamp: new Date().toISOString(),
          rect: e.target.getBoundingClientRect()
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
        actionCounter++;
        const seq = actionCounter;
        // capture full-page screenshot
        const screenshotFull = await driver.takeScreenshot();
        const screenshotFullPath = path.join(savePath, `screenshot-full-${seq}.png`);
        fs.writeFileSync(screenshotFullPath, Buffer.from(screenshotFull, 'base64'));
        // capture element-only screenshot with fallback
        let screenshotElement;
        try {
          const elem = await driver.findElement(By.css(info.selector));
          screenshotElement = await elem.takeScreenshot();
        } catch (err) {
          const sharp = require("sharp");
          const buffer = Buffer.from(screenshotFull, 'base64');
          try {
            const croppedBuffer = await sharp(buffer)
              .extract({
                left: Math.round(info.rect.left),
                top: Math.round(info.rect.top),
                width: Math.round(info.rect.width),
                height: Math.round(info.rect.height)
              })
              .toBuffer();
            screenshotElement = croppedBuffer.toString('base64');
          } catch (innerErr) {
            screenshotElement = screenshotFull;
          }
        }
        const screenshotElemPath = path.join(savePath, `screenshot-elem-${seq}.png`);
        fs.writeFileSync(screenshotElemPath, Buffer.from(screenshotElement, 'base64'));
        const pageSource = await driver.getPageSource();
        const domPath = path.join(savePath, `dom-${seq}.html`);
        fs.writeFileSync(domPath, pageSource, 'utf-8');
        const actionPath = path.join(savePath, `action-${seq}.json`);
        fs.writeFileSync(actionPath, JSON.stringify(info, null, 2), 'utf-8');
        mainWindow.webContents.send('interaction', { ...info, screenshotFull, screenshotElement });
      }
    } catch (err) {
      console.error(err);
    }
  }, 10);
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
  mainWindow.webContents.send('save-complete', savePath);
});

/**
 * Quit the app when all windows are closed, except on macOS.
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
