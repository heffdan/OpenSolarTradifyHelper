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

function autofillForm(sourceSystem, targetSystem, data) {
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
  const sourceFields = window.fieldmap[sourceSystem];
  const targetFields = window.fieldmap[targetSystem];

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

    //determine which form to use based on the presence of the divs, formMap defined in fieldmap.js
  for (const key in window.formMap) {
    if ($(key).length) {
      form = window.formMap[key];
      break;
    }
  }

  // Delay to let Angular/Wijmo render the fields
  setTimeout(() => {
    sourceSystem = `OpenSolar.${form}`;
    targetSystem = `Tradify.${form}`;
    console.log("Source System:", sourceSystem); ///TODO Remove
    autofillForm(sourceSystem, targetSystem, project);
  }, 100);
  }
});
