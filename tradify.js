// This script runs in the context of the web page and interacts with the DOM

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

  for (const logicalKey in fieldmap) { // Iterate through each key in the fieldmap
    const { source, target, elementType, simulatedInput, mapping} = fieldmap[logicalKey]; // Get the source, target, and elementType from the fieldmap

    if (!source || !target) continue; // Check if source and target are defined, else skip to next iteration

    let value = getByPath(data, source);// Get the value from the data object using the source path
    if (!value) continue; // Check if value is defined, else skip to next iteration
    
    // Find the input field using the target model, where div value is equal to target
    const wrapperSelector = `[value="${target}"]`; 
    const input = parent.find(`${wrapperSelector} ${elementType}`).first(); // Find the first input field that is a child of the selector
    if (input.length === 0) continue; // Check if input field exists, else skip to next iteration

    //check if valueMap is not empty and if so, get the value from the mapping
    //if mapping is not empty, get the value from the mapping
    value = String(value); // Convert value to string to match key
    if (mapping && Object.keys(mapping).length > 0) {
      value = mapping[value];
  }
    // Check if the input field requires simulated user input
    switch(simulatedInput) {
      case "true":
        simulateInput(input, value);
        continue;
      default:
        input.val(value);
        input[0].dispatchEvent(new Event('input', { bubbles: true }));
        input[0].dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
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

  const target = $(location); // Get the target location for the button (the parent)
  if (target.length > 0) { // confirm parent exists

    /**
     * This block checks for the nearest parent element of the target location that matches window.parentselector.
     * this will be passed to the autofillForm function to find the input fields that are only children of the parent element
     * this is to ensure that if using the autofill function, it will only fill the input fields that are children of the parent element
     * and not fill in fields behind the popup if the button was in the popup
     */
    for (selector in window.parentSelector) {
      parent = target.closest(window.parentSelector[selector]); // Get the parent element of the target location
      if (parent.length > 0) {
        break; // Exit the for loop
      }
      console.warn(`[Extension] Parent element not found for selector ${window.parentSelector[selector]}`);
      continue; // Continue to the next selector
    } 
    if (parent.length === 0) {
      console.warn(`[Extension] Parent element not found`);
      return;
    }

    //inject button
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
  /**
   * This function handles the button click event for autofilling the form.
   * It retrieves the project data from local storage and calls the autofillForm function.
   * @returns {void}
   */
  chrome.storage.local.get("openSolarProjectData", (result) => {
    const data = result.openSolarProjectData;
    if (!data) {
      alert("No project data found. Please copy from OpenSolar first.");
      return;
    }

  console.log("Received project data:", data);
  autofillForm(window.fieldmap, data, parent); // Call the autofillForm function with the fieldmap and project data
  });
}

function handleDOMChange(mutationsList, observer) {
  /**
   * This function handles DOM changes and injects buttons into the UI.
   * It checks if the target element is present and injects the buttons accordingly.
   * These functions are called on every change in the DOM, but exited if the button already exists
   */
  injectButton('TradifyPopup'); 
  injectButton('Tradify');
  console.log("DOM changed");
}


// Create a new MutationObserver instance
const observer = new MutationObserver(handleDOMChange);

// Configuration for the observer
const observerConfig = {
  childList: true, // Watch for changes in the child nodes of the target
  subtree: true, // Watch for changes in the entire subtree of the target
};

// Start observing the DOM with the specified configuration
observer.observe(document, observerConfig);


