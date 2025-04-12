// This script runs in the context of the web page and interacts with the DOM
const buttonId = 'btnOpenSolarImport';
let currentTab = null;

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

function injectButton() {
  /**
   * This function injects the Import button into the UI in the lower action bar.
   * It checks if the button already exists to avoid duplicates.
   * @returns {void}
   * @throws {Error} If the button cannot be injected.
   * 
   */
  // Avoid duplicate buttons
  if (document.getElementById(buttonId)) return;

  const target = $(window.buttonLocation);
  if (target.length > 0) {
    const btn = document.createElement('button');
    btn.id = buttonId;
    btn.textContent = "Insert from OpenSolar";
    btn.class = "btn btn-black";
    btn.addEventListener("click", () => {
      alert("Button clicked!");
      // You can call your autofill function or other logic here
    });
    target.append(btn);
  }
}

function watchForTab() {
  /**
   * This function watches for the active tab in the UI.
   * It checks if the tab is active and injects the button if it is.
   * @returns {void}
   * @throws {Error} If the tab is not found.
   * 
   */
  const observer = new MutationObserver(() => {
    for (tab in window.tabList) {
      if (isTabActive(tab)) {
        let currentTab = tab;
        injectButton();
        return;
      } else {
        currentTab = null;
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  /**
   * This function listens for messages from the background script.
   * When it receives a message with the action "pasteToTradify",
   * it extracts the project data and determines which form to use.
   * It then calls the autofillForm function to fill in the form fields.
   * @param {object} request - The message request object.
   * @param {object} sender - The sender object.
   * @param {function} sendResponse - The function to send a response back.
   * @return {void}
   * @throws {Error} If the action is not recognized.
   * 
   * @example
   * 
   * chrome.runtime.sendMessage({
   *   action: "pasteToTradify",
   */
  if (request.action === "pasteToTradify") {
    const project = request.project;
    let form = "";
    //log to console
    console.log("Received project data:", project);
    injectButton();

    //determine which form to use based on the presence of the divs, formMap defined in fieldmap.js
  for (const key in window.formMap) {
    if ($(key).length) {
      form = window.formMap[key];
      break;
    }
  }

  // Delay to let Angular/Wijmo render the fields
  setTimeout(() => {
    sourceSystem = `OpenSolar`;
    targetSystem = `Tradify`;
    autofillForm(sourceSystem, targetSystem, form, project);
  }, 100);
  }
});

document.addEventListener("DOMContentLoaded", watchForTab);

