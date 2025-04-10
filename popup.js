// Grab your org/token from the config.js file:
const { ORG_ID, OPEN_SOLAR_BEARER_TOKEN } = window.OPEN_SOLAR_CONFIG;

document.addEventListener("DOMContentLoaded", () => {
  // Extract the project ID from the current tab's URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs.length) {
      setMessage("No active tab found.");
      return;
    }

    const url = tabs[0].url || "";
    // Looking for: #/projects/<digits>/manage
    const match = url.match(/#\/projects\/(\d+)\//);
    if (match && match[1]) {
      const projectId = match[1];
      setMessage(`Project #${projectId} found. Fetching details...`);
      fetchProjectDetails(ORG_ID, projectId);
    } else {
      setMessage("Could not find a project number in this URL.");
    }
  });
});

/** Updates the message div for status/errors. */
function setMessage(text) {
  document.getElementById("message").textContent = text;
}

/** Fetch project details from the OpenSolar API. */
function fetchProjectDetails(orgId, projectId) {
  const endpoint = `https://api.opensolar.com/api/orgs/${orgId}/projects/${projectId}/`;

  fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${OPEN_SOLAR_BEARER_TOKEN}`
    }
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API request failed with status ${response.status}: ${errorText}`
        );
      }
      return response.json();
    })
    .then((data) => {
      createResultsTable(data);
      setMessage("Project details loaded.");
    })
    .catch((err) => {
      setMessage(`Error: ${err.message}`);
    });
}

/** Dynamically create a table with address & contacts, plus "Copy" buttons. */
function createResultsTable(apiData) {
  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = ""; // Clear existing

  const table = document.createElement("table");
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  // Helper to add a row with a copy button
  const addRow = (label, value) => {
    const row = document.createElement("tr");

    // Field name
    const labelTd = document.createElement("td");
    labelTd.textContent = label;
    row.appendChild(labelTd);

    // Value
    const valueTd = document.createElement("td");
    valueTd.textContent = value;
    row.appendChild(valueTd);

    // Copy button
    const buttonTd = document.createElement("td");
    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", () => {
      copyToClipboard(value);
    });
    buttonTd.appendChild(copyButton);
    row.appendChild(buttonTd);

    tbody.appendChild(row);
  };

  // 1) Address
  const address = apiData.address || "N/A";
  addRow("Address", address);

  // 2) Contacts (assuming apiData.contacts_data is an array of contact objects)
  const contactsData = Array.isArray(apiData.contacts_data)
    ? apiData.contacts_data
    : [];

  if (!contactsData.length) {
    addRow("Contacts", "No contacts found");
  } else {
    contactsData.forEach((contact, index) => {
      const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(" ");
      addRow(`Contact #${index + 1} - Name`, fullName || "N/A");
      addRow(`Contact #${index + 1} - Phone`, contact.phone || "N/A");
      addRow(`Contact #${index + 1} - Email`, contact.email || "N/A");
    });
  }

  tableContainer.appendChild(table);
}

/** Copy text to clipboard (via the Clipboard API). */
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert(`Copied: ${text}`);
    })
    .catch((err) => {
      alert(`Failed to copy: ${err}`);
    });
}
