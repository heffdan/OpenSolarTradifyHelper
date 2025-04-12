// This script runs in the context of the web page and interacts with the DOM
function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => {
      if (key.includes('[')) {
          const [mainKey, index] = key.replace(']', '').split('[');
          return acc?.[mainKey]?.[+index];
      }
      return acc?.[key];
  }, obj);
}

function autofillForm(sourceSystem, targetSystem, data) {
  const sourceFields = window.fieldmap[sourceSystem].customer;
  const targetFields = window.fieldmap[targetSystem].customer;

  for (const logicalKey in sourceFields) {
    const sourcePath = sourceFields[logicalKey];
    const targetModel = targetFields[logicalKey];

    if (!sourcePath || !targetModel) continue;

    const value = getByPath(data, sourcePath);
    if (!value) continue;

    // Find the input field using the target model
    const selector = `[value="${targetModel}"]`;
    $(selector + ' input').val(value);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "pasteToTradify") {
    const project = request.project;
    //log to console
    console.log("Received project data:", project);

    // Delay to let Angular/Wijmo render the fields
    setTimeout(() => {
      autofillForm("OpenSolar", "Tradify", project);

    }, 1500);
  }
});
