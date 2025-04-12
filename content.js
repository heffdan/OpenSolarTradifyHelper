// This script runs in the context of the web page and interacts with the DOM
const buttonId = 'btnOpenSolarImport';
let currentTab = null;
let userMessage = null;

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
    const selector = `[value="${targetModel}"]`;
    $(selector + ' input').val(value);
  }
}

function injectButton(platform) {
  /**
   * This function injects a button into the UI.
   * It checks if the button already exists before creating a new one.
   * @returns {void}
   */
  const {location, id , title, className, textContent, svg} = window.btnElement[platform]; // Get the button element details from the fieldmap
  if (document.getElementById(id)) return; // Check if the button already exists, if so exit
  const target = $(location);
  if (target.length > 0) { // Check if the target (location) element exists
    const btn = document.createElement('button');
    btn.id = id;
    btn.title = title;
    btn.className = className;
    btn.innerHTML = svg + textContent; // Set the button's inner HTML to the SVG and text content
    btn.addEventListener("click", () => {
      reqFormFill(); // Add click event listener to the button
    });
    target.append(btn);
  }
}



function reqFormFill() {
  let form = "";
  injectButton('Tradify'); // TODO remove
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  /**
   * This function listens for messages from the background script. 
   * It checks if the action is "pasteToTradify" and calls the reqFormFill function with the project data.
   */
  if (request.action === "pasteToTradify") {
    reqFormFill();
  }
});

document.addEventListener("DOMContentLoaded", injectButton('Tradify'));

