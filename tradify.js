// This script runs in the context of the web page and interacts with the DOM
let currentTab = null;
let userMessage = '';
let platform = "Tradify"; // TODO remove

function isTabActive(key) {
  /**
   * This function checks if a specific tab is active in the UI.
    * It uses jQuery to find the tab based on the provided key.
    * @param {string} key - The key of the tab to check.
    * @returns {boolean} - Returns true if the tab is active, false otherwise.
    * 
   */
  return $(`[ng-if="vm.selectedTabKey == '${key}'"]`).length > 0;
}

function getByPath(obj, path) {
  /**
   * This function retrieves a value from an object using a dot-separated path.
   * It supports array indexing using square brackets.
   * @param {object} obj - The object to retrieve the value from.
   * @param {string} path - The dot-separated path to the value.
   * @returns {*} The value at the specified path, or undefined if not found.
   * @example
   * getByPath(data, 'user.name.first');
   * 
   */
  return path.split('.').reduce((acc, key) => {
      if (key.includes('[')) {
          const [mainKey, index] = key.replace(']', '').split('[');
          return acc?.[mainKey]?.[+index];
      }
      return acc?.[key];
  }, obj);
}

function autofillForm(sourceSystem, targetSystem, form, data) {
  /**
   * This function takes the source and target system names and the data object.
   * It uses the fieldmap to find the corresponding fields in the source and target systems.
   * It then fills the target fields with the values from the source fields.
   * @param {string} sourceSystem - The source system name (e.g., "OpenSolar").
   * @param {string} targetSystem - The target system name (e.g., "Tradify").
   * @param {object} data - The data object containing the source data.
   * @returns {void}
   * @throws {Error} If the source or target system is not found in the fieldmap.
   * @example
   * autofillForm("OpenSolar", "Tradify", projectData);
   * 
   */
  const sourceFields = window.fieldmap[sourceSystem][form];
  const targetFields = window.fieldmap[targetSystem][form];
  console.log("Source Fields:", sourceFields); ///TODO Remove
  for (const logicalKey in sourceFields) {
    const sourcePath = sourceFields[logicalKey];
    const targetModel = targetFields[logicalKey];
    console.log("Source Path:", sourcePath); ///TODO Remove
    if (!sourcePath || !targetModel) continue;

    const value = getByPath(data, sourcePath);
    if (!value) continue;

    // Find the input field using the target model
    let input;

    if (logicalKey === "address") {
      // Find the special Wijmo-style address input
      input = document.querySelector('div.wj-input input.wj-form-control[placeholder*="10 Main Street"]');
      if (input) {
        input.focus();
    
        // Step 1: Set all but the last character
        input.value = value.slice(0, -1);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    
        // Step 2: Wait for debounce period
        setTimeout(() => {
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
    
          // Step 3: Wait for dropdown to appear, then simulate keyboard interaction
          setTimeout(() => {
            input.focus();
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true }));
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
            console.log("[Extension] Simulated ArrowDown + Enter for address");
            //input.blur();
          }, 600);
        }, 1000);
      }
    } else {
      //Continue on with normal pasting of regular values
      const selector = `[value="${targetModel}"]`;
      input = $(selector + ' input')[0];
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }
}

function waitForElement(selector, callback, timeout = 5000, interval = 100) {
  const startTime = Date.now();

  const check = () => {
    const el = $(selector);
    if (el.length > 0) {
      callback(el);
    } else if (Date.now() - startTime < timeout) {
      setTimeout(check, interval);
    } else {
      console.warn(`[Extension] Element "${selector}" not found within ${timeout}ms.`);
    }
  };

  check();
}

function injectButton(platform) {
  const { location, id, title, className, textContent, svg } = window.btnElement[platform];
  if (document.getElementById(id)) return;

  const target = $(location);
  if (target.length > 0) {
    // Create the button
    const btn = document.createElement('button');
    btn.id = id;
    btn.title = title;
    btn.className = className;

    // Create the logo image
    const logo = document.createElement('img');
    logo.src = chrome.runtime.getURL('proven_logo.png');
    logo.alt = 'Proven Logo';
    logo.style.width = '16px';
    logo.style.height = '16px';
    logo.style.verticalAlign = 'middle';
    logo.style.marginRight = '6px';

    // Combine image and text into a span wrapper
    const textSpan = document.createElement('span');
    textSpan.textContent = textContent;

    btn.appendChild(logo);
    btn.appendChild(textSpan);

    btn.addEventListener("click", () => {
      reqFormFill();
    });

    target.append(btn);
  }
}

function reqFormFill() {
  let form = "";
  //log to console
  chrome.storage.local.get("openSolarProjectData", (result) => {
    const data = result.openSolarProjectData;
    if (!data) {
      userMessage = "No project data found. Please copy from OpenSolar first.";
      return;
    }

  console.log("Received project data:", data);
  //determine which form to use based on the presence of the divs, formMap defined in fieldmap.js
  for (const key in window.formMap) {
    if ($(key).length) {
      form = window.formMap[key];
      break;
    }
  }
  if (!form) {
    userMessage = "No form found. Please switch to the correct tab.";
    return;
  }
  console.log("Form to fill:", form);
  sourceSystem = `OpenSolar`;
  targetSystem = `Tradify`;
  autofillForm(sourceSystem, targetSystem, form, data);
  });
}

chrome.runtime.onMessage.addListener((request) => {
  /**
   * This function listens for messages from the background script. 
   * It checks if the action is "pasteToTradify" and calls the reqFormFill function with the project data.
   */
  if (request.action === "pasteToTradify") {
    reqFormFill();
  }
});


waitForElement(window.btnElement[platform].location, () => {
  injectButton(platform);
});


