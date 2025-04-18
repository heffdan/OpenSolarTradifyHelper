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

function simulateInput(input, value) {
  /**
   * This function simulates typing into an input field.
   * It sets the input value, waits for a debounce period, and then simulates keyboard events.
   * @param {jQuery} input - The input field to simulate typing into.
   * @param {string} value - The value to type into the input field.
   * @returns {void}
   * 
   */
  if (input) {
    input.focus();

    // Step 1: Set all but the last character
    input.val(value.slice(0, -1));
    input[0].dispatchEvent(new Event('input', { bubbles: true }));

    // Step 2: Wait for debounce period
    setTimeout(() => {
      input.val(value);
      input[0].dispatchEvent(new Event('input', { bubbles: true }));

      // Step 3: Wait for dropdown to appear, then simulate keyboard interaction
      setTimeout(() => {
        input.focus();
        input[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true }));
        input[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
        console.log("[Extension] Simulated ArrowDown + Enter for address");
        //input.blur();
      }, 600);
    }, 1000);
  }
}


function autofillForm(fieldmap, data, parent) {
  /**
    * This function autofills a form based on the provided fieldmap and data.
    * It iterates through the fieldmap, retrieves the source and target paths, and fills in the form fields with the corresponding data.
    * @param {object} fieldmap - The mapping of form fields to data sources.
    * @param {object} data - The data to fill in the form.
    * @returns {void}
    * 
   */

  for (const logicalKey in fieldmap) {
    const { source, target, elementType, simulatedInput } = fieldmap[logicalKey];
    const valueMap = fieldmap[logicalKey].mapping || {};
    console.log("logical key:", logicalKey, ", Source:",source,", Target: ",target); ///TODO Remove
    if (!source || !target) continue;

    const value = getByPath(data, source);
    console.log("Value found for key:", logicalKey, "Value:", value); //TODO Remove
    if (!value) continue;
    // Find the input field using the target model
    const wrapperSelector = `[value="${target}"]`; // or whatever identifies the wrapper
    const input = parent.find(`${wrapperSelector} ${elementType}`).first();

    if (input.length === 0) continue;
    console.log("Input found:", input); //TODO Remove
        //check if valueMap is not empty and if so, get the value from the mapping
    let mappedValue = valueMap[value] || value; // Get the mapped value or use the original value
    console.log("Mapped value:", mappedValue); //TODO Remove
    switch(simulatedInput) {
      case "true":
        simulateInput(input, mappedValue);
        continue;
      default:
        input.val(mappedValue);
        input[0].dispatchEvent(new Event('input', { bubbles: true }));
        input[0].dispatchEvent(new Event('change', { bubbles: true }));
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
  /**
   * This function injects a button into the UI.
   * It checks if the button already exists before creating a new one.
   * @returns {void}
   */
  const {location, id , title, className, textContent, svg} = window.btnElement[platform]; // Get the button element details from the fieldmap
  let parent;
  if (document.getElementById(id)) return; // Check if the button already exists, if so exit
  const target = $(location); // Get the parent element of the target location
  if (target.length > 0) { // Check if the target (location) element exists
    for (selector in window.parentSelector) {
      parent = target.closest(window.parentSelector[selector]); // Get the parent element of the target location
      if (parent.length > 0) {
        console.log("Parent element found for selector:", window.parentSelector[selector]);
        break; // Exit the for loop
      }
      console.warn(`[Extension] Parent element not found for selector ${window.parentSelector[selector]}`);
      continue; // Continue to the next selector
    } 
    if (parent.length === 0) {
      console.warn(`[Extension] Parent element not found`);
      return;
    }
    const btn = document.createElement('button');
    btn.id = id;
    btn.title = title;
    btn.className = className;
    btn.innerHTML = svg + textContent; // Set the button's inner HTML to the SVG and text content

    btn.addEventListener("click", () => {
      reqFormFill(parent);
    });
    target.append(btn);
  }
}

function reqFormFill(parent) {
  let form = "";
  //log to console
  chrome.storage.local.get("openSolarProjectData", (result) => {
    const data = result.openSolarProjectData;
    if (!data) {
      userMessage = "No project data found. Please copy from OpenSolar first.";
      return;
    }

  console.log("Received project data:", data);
  autofillForm(window.fieldmap, data, parent); // Call the autofillForm function with the fieldmap and project data
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

function handleDOMChange(mutationsList, observer) {
  injectButton('TradifyPopup');
  injectButton('Tradify');
  console.log("DOM changed");
}
/**
waitForElement(window.btnElement[platform].location, () => {
  injectButton(platform);
});
*/


// Create a new MutationObserver instance
const observer = new MutationObserver(handleDOMChange);

// Configuration for the observer
const observerConfig = {
  childList: true, // Watch for changes in the child nodes of the target
  subtree: true, // Watch for changes in the entire subtree of the target
};

// Start observing the DOM with the specified configuration
observer.observe(document, observerConfig);


