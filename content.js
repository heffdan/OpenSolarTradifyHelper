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

    const selector = `[ng-model="${targetModel}"]`;
    const el = document.querySelector(selector);
    if (el) el.value = value;
}
}
//event listener for if DOM is loaded and ready
document.addEventListener("DOMContentLoaded", () => {
  // Check if the OpenSolar project data is already stored
  chrome.storage.local.get("openSolarProjectData", (result) => {
    const data = result.openSolarProjectData;
    if (data) {
      console.log("Project data already loaded.");
    } else {
      console.log("No project data found. Please copy from OpenSolar first.");
    }
  });

  // Check if the current page is "https://go.tradifyhq.com/#/customer"
  if (window.location.href === "https://go.tradifyhq.com/#/customer") {
  //insert new action button in form
    const button = document.createElement("button");
    button.textContent = "Paste from OpenSolar";
    button.style.position = "absolute";
    button.style.top = "10px";
    button.style.right = "10px";
    button.style.zIndex = "1000";
    button.style.backgroundColor = "#4CAF50"; // Green
    button.style.color = "white";
    button.style.border = "none";
    button.style.padding = "10px 20px";
    button.style.cursor = "pointer";

    // Append the button to the body or a specific container
    document.body.appendChild(button);

    // Add click event listener to the button
    button.addEventListener("click", () => {
      chrome.storage.local.get("openSolarProjectData", (result) => {
        const data = result.openSolarProjectData;
        if (data) {
          autofillForm("OpenSolar", "Tradify", data);
        } else {
          console.log("No project data found. Please copy from OpenSolar first.");
        }
      });
    });
  } else {
    console.log("Current page is not 'https://go.tradifyhq.com/#/customer'.");
  }
});

/**
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "pasteToTradify") {
      const project = request.project;
      const contact = project.contacts_data?.[0] || {};
      const customerName = contact.first_name || "" + " " + (contact.last_name || "");
      const name = customerName.trim(); // Customer Name from OpenSolar
      const phone = contact.phone || "";
      const email = contact.email || "";
      const customerNameWidget = $("[value='vm.customer.customerName']");


      // Delay to let Angular/Wijmo render the fields
      setTimeout(() => {

        if (customerNameWidget.length) {
          const input = customerNameWidget.find("input");
      
          if (input.length) {
            input.val(name).trigger("input"); // Set value and trigger change detection
          } else {
            console.warn("Input inside customer name widget not found.");
          }
        } else {
          console.warn("Customer name container not found.");
        }
        //Find input fields using their associated labels:
        const nameInput = findInputByLabelText("Customer Name");
        const phoneInput = findInputByLabelText("Phone");
        const emailInput = findInputByLabelText("Email Address(es)");
  
        if (nameInput) {
          fillInput(nameInput, name, "N");
          console.log("✅ Customer Name pasted:", name);
        } else {
          console.warn("❌ Customer Name input not found.");
        }
  
        if (phoneInput) {
          fillInput(phoneInput, phone, "P");
          console.log("✅ Phone pasted:", phone);
        } else {
          console.warn("❌ Phone input not found.");
        }
  
        if (emailInput) {
          fillInput(emailInput, email, "E");
          console.log("✅ Email pasted:", email);
        } else {
          console.warn("❌ Email input not found.");
        }
      }, 1500);

    }
  });
  
  // Helper: Finds the input element corresponding to the label text.
  // It looks for span elements with class "span-title control-label" and checks their text.
  function findInputByLabelText(labelText) {
    const labels = Array.from(document.querySelectorAll('.span-title.control-label'));
    for (const label of labels) {
      if (label.textContent.trim().startsWith(labelText)) {
        // Go up to the container that houses this label and its input.
        // You might need to tweak 'closest' if the structure differs.
        const container = label.closest('div');
        if (container) {
          // Look for an input element within this container
          const input = container.querySelector('input');
          if (input) return input;
        }
      }
    }
    return null;
  }
  
  // Helper: Simulates filling the input similar to a real user.
  function fillInput(input, value, fakeKey) {
    input.focus();
    input.value = value;
  
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: fakeKey }));
    input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: fakeKey }));
  }**/