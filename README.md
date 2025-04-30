# Architecture Diagram

## Summary
The repository is an Electron-based application designed to record user interactions on a webpage using Selenium WebDriver.

### Purpose
The app records user interactions (clicks, inputs, scrolls) on a webpage and displays them in the UI along with screenshots.

### Key Components
1. **Electron**: Provides the desktop application framework.
2. **Selenium WebDriver**: Automates browser interactions and captures events.
3. **HTML/CSS**: Defines the UI structure and styling.
4. **JavaScript**:
   - `main.js`: Handles Electron's main process, initializes the Selenium WebDriver, and communicates with the renderer process.
   - `renderer.js`: Manages the UI, listens for user actions, and displays recorded interactions.

### Dependencies
- `electron`: Framework for building the desktop app.
- `selenium-webdriver`: Library for browser automation.
- `browser-driver-manager`: Manages browser drivers.
- `dotenv`: Loads environment variables.

## Architecture Diagram
```mermaid
graph TD
    A[Electron Main Process main.js] -->|Creates BrowserWindow| B[Renderer Process renderer.js]
    B -->|Loads UI| C[HTML index.html]
    B -->|Displays Interactions| D[Interactions List]
    A -->|Starts Selenium WebDriver| E[Selenium WebDriver]
    E -->|Automates Browser| F[Target Webpage]
    F -->|Records Events| E
    E -->|Sends Data| A
    A -->|Forwards Data| B
    B -->|Updates UI| D
