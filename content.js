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
        /** Find input fields using their associated labels:
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
      }, 1500);**/

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
  }