# Danfoss DriveFinder

**Overview**

Danfoss DriveFinder is a web-based wizard that guides users through a series of questions to recommend suitable Danfoss low-voltage frequency converters (drives) for specific application needs. The app is built with Ionic and Angular frameworks, providing a responsive, slide-based interface.

---

## Table of Contents
1. [Step 1: Select Country](#step-1-select-country)
2. [Step 2: Choose Industry](#step-2-choose-industry)
3. [Step 3: Choose Application](#step-3-choose-application)
4. [Step 4: Drive Usage & Location](#step-4-drive-usage--location)
5. [Step 5: Specific Requirements](#step-5-specific-requirements)
6. [Step 6: Recommendation Results](#step-6-recommendation-results)
7. [Step 7: Download & Contact](#step-7-download--contact)

---

### Step 1: Select Country
- **UI Element**: A stacked dropdown (`delta-select`) with placeholder "Please select".
- **Action**: User clicks the dropdown (`action-1`), selects a country (e.g., Australia).
- **Purpose**: Tailor subsequent options (e.g., voltage, regulations) to the selected country.

![Step 1 Screenshot](recordings/2025-06-25T09_11_33.399Z/screenshot-full-1.png)

---

### Step 2: Choose Industry
- **UI Element**: A card selection interface showing industry options.
- **Action**: User clicks on the relevant industry card (e.g., "Food & Beverage").
- **Purpose**: Narrow drive series based on typical industry requirements.

![Step 2 Screenshot](recordings/2025-06-25T09_11_33.399Z/screenshot-full-4.png)

---

### Step 3: Choose Application
- **UI Element**: Card selection for specific applications (e.g., Pump, Fan, Conveyor).
- **Action**: User selects the application card.
- **Purpose**: Filter drives optimized for that application.

![Step 3 Screenshot](recordings/2025-06-25T09_11_33.399Z/screenshot-full-6.png)

---

### Step 4: Drive Usage & Location
- **Form Fields**:
  - Phase (`delta-select`)
  - Mains Voltage (`delta-select`)
  - Motor Size (numeric input)
  - Unit (kW or HP)
  - Overloadability (`delta-select`)
  - Fieldbus Type (`delta-select`)
  - Installation Location (card selection for IP rating)
- **Action**: User fills in parameters and chooses location.
- **Validation**: Required fields are marked with "*".

![Step 4 Screenshot](recordings/2025-06-25T09_11_33.399Z/screenshot-full-16.png)

---

### Step 5: Specific Requirements
- **Toggles** to enable advanced options:
  - Condition-based monitoring
  - Basic / Advanced functional safety
  - ATEX sensor input
  - Corrosion-resistant coatings
  - Cybersecurity hardware
  - Screened motor cables support
  - Functional expansion via options
- **Action**: User enables toggles as needed.
- **Purpose**: Refine selection to drives supporting these features.

![Step 5 Screenshot](recordings/2025-06-25T09_11_33.399Z/screenshot-full-17.png)

---

### Step 6: Recommendation Results
- **Outcome**: If no exact match is found, a message prompts review of selections or contacting Danfoss.
- **Card Slider**: Shows recommended series or next steps.

![Step 6 Screenshot](recordings/2025-06-25T09_11_33.399Z/screenshot-full-18.png)

---

### Step 7: Download & Contact
- **Form**:
  - Project Name (text input)
  - Contact Details (text input)
  - Comments (textarea)
- **Actions**:
  - Download PDF report of selections
  - Links to additional MyDrive® tools
  - Contact button for direct communication with Danfoss

![Step 7 Screenshot](recordings/2025-06-25T09_11_33.399Z/screenshot-full-19.png)

---

## Additional Resources
- MyDrive® Select: https://select.mydrive.danfoss.com
- MyDrive® Harmonics: https://harmonics.mydrive.danfoss.com
- MyDrive® Energy: https://energy.mydrive.danfoss.com
- MyDrive® Suite: https://suite.mydrive.danfoss.com

---

*End of knowledge base entry.*
