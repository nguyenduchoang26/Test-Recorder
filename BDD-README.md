# MyDrive Select Test Automation

This directory contains Behavior-Driven Development (BDD) test automation for the MyDrive Select application. The tests are written in Gherkin syntax and implemented using Python with the Behave framework.

## Directory Structure

- `mydrive_select_test.feature` - Gherkin feature file containing test scenarios
- `steps/` - Python implementation of the test steps
  - `mydrive_select_steps.py` - Step definitions for the MyDrive Select tests
  - `environment.py` - Test environment setup and teardown

## Prerequisites

- Python 3.7 or higher
- Chrome browser installed

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows:
     ```bash
     .\venv\Scripts\activate
     ```
   - MacOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. Install required packages:
   ```bash
   pip install behave selenium webdriver-manager
   ```

## Running the Tests

To run all tests:
```bash
behave
```

To run specific feature file:
```bash
behave mydrive_select_test.feature
```

To run with detailed output:
```bash
behave -v mydrive_select_test.feature
```

## Test Reports

For generating HTML reports:
```bash
behave -f html -o reports/behave-report.html
```

## Generated from Test Recorder

These tests were created based on recorded user interactions captured on May 28, 2025 using the Test Recorder tool. The recordings are stored in:
```
recordings/2025-05-28T12_49_23.408Z/
```

The recording contains actions, DOM snapshots, and screenshots that document the original user journey being tested.
