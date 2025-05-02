/**
 * main.js - Electron main process.
 * 
 * This module initializes the application window, manages Selenium WebDriver,
 * records user interactions, and communicates with the renderer process.
 * It handles the core functionality of the test recording system, including:
 * - Setting up the Electron application window
 * - Launching and controlling Selenium WebDriver sessions
 * - Capturing screenshots and DOM snapshots
 * - Managing the recording workflow and file storage
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { Builder, By } = require('selenium-webdriver');
// Load environmental variables for WebDriver configuration
require('dotenv').config({ path: path.resolve(require('os').homedir(), '.browser-driver-manager/.env') });
console.log(process.env.CHROMEDRIVER_TEST_PATH);

// Global application state variables
let mainWindow;          // Main application window reference
let driver;              // Selenium WebDriver instance
let pollInterval;        // Timer for polling recorded interactions
let savePath;            // Directory where recordings are stored
let actionCounter = 0;   // Counter to track sequential actions

/**
 * Creates the main application window with predefined dimensions
 * and web preferences, then loads the UI from index.html.
 * 
 * @function createWindow
 * @returns {void}
 */
function createWindow() {
  // Ensure styles directory exists
  const stylesDir = path.join(__dirname, 'styles');
  if (!fs.existsSync(stylesDir)) {
    fs.mkdirSync(stylesDir, { recursive: true });
  }
  
  // Create recordings directory if it doesn't exist
  const recordingsDir = path.join(__dirname, 'recordings');
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,     // Allows direct use of Node.js APIs in renderer
      contextIsolation: false    // Disables context isolation for IPC communication
    }
  });
  mainWindow.loadFile('index.html');
}

// Initialize the application window when Electron is ready
app.whenReady().then(createWindow);

/**
 * Handles the 'start-tracking' IPC event from renderer.
 * Launches Selenium WebDriver for Chrome, navigates to the provided URL,
 * injects event listeners into the page to record interactions,
 * and starts polling for events.
 * 
 * @event ipcMain#start-tracking
 * @param {Event} event - The IPC event object
 * @param {string} url - The URL to navigate to and start tracking
 * @returns {Promise<void>}
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
 * 
 * @event ipcMain#stop-tracking
 * @returns {Promise<void>}
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
 * Handles the 'save-custom-script' IPC event.
 * Saves the custom Robot Framework script to a file.
 * 
 * @event ipcMain#save-custom-script
 * @param {Event} event - The IPC event object
 * @param {string} scriptContent - The custom script content to save
 */
ipcMain.on('save-custom-script', async (event, scriptContent) => {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '_');
    const scriptPath = path.join(savePath || path.join(__dirname, 'scripts'), `robot_script_${timestamp}.robot`);
    
    // Ensure the directory exists
    const scriptDir = path.dirname(scriptPath);
    fs.mkdirSync(scriptDir, { recursive: true });
    
    // Write the script to file
    fs.writeFileSync(scriptPath, scriptContent, 'utf-8');
    
    // Notify the renderer process
    mainWindow.webContents.send('script-saved', scriptPath);
  } catch (err) {
    console.error('Error saving custom script:', err);
    mainWindow.webContents.send('script-save-error', err.message);
  }
});

/**
 * Quit the app when all windows are closed, except on macOS.
 * 
 * @event app#window-all-closed
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
