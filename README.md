# Architecture Diagram

## Overview
The application is an Electron-based desktop recorder that captures user interactions on a webpage using Selenium WebDriver and translates them into Robot Framework scripts.

### Architecture Details
- **Electron Main Process (main.js)**: Creates the BrowserWindow, initializes Selenium WebDriver, injects event listeners into the page, polls for interaction events, and forwards them via IPC to the renderer.
- **Electron Renderer Process (renderer.js)**: Manages the UI lifecycle, handles Start/Stop commands, receives interaction events, updates the DOM with screenshots and details, and invokes the translator to generate Robot scripts.
- **Locator Modules (`locator/`)**: Analyze DOM elements, classify input types, and build robust XPath selectors for accurate element identification.
- **Scanner (`locator/scanner.js`)**: Traverses the DOM tree to collect element attributes and generate locator paths.
- **Translator (`translator/robot-translator.js`)**: Converts recorded interactions into executable Robot Framework test or task scripts, supporting both SeleniumLibrary and RFBrowser syntaxes.

### Dependencies
- `electron`: Desktop application framework
- `selenium-webdriver`: Browser automation library
- `browser-driver-manager`: Manages WebDriver binaries
- `dotenv`: Loads environment variables for WebDriver configuration

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
