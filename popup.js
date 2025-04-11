const { ORG_ID, OPEN_SOLAR_BEARER_TOKEN } = window.OPEN_SOLAR_CONFIG;

document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs.length) {
      setMessage("No active tab found.");
      return;
    }

    const url = tabs[0].url || "";
    const match = url.match(/#\/projects\/(\d+)\//);
    if (match && match[1]) {
      const projectId = match[1];
      setMessage(`Project #${projectId} found. Fetching details...`);
      fetchProjectDetails(ORG_ID, projectId);
    } else {
      setMessage("Could not find a project number in this URL.");
    }
  });

  // check if on tradify page first
  document.getElementById("paste-button").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url.includes("tradifyhq.com")) {
        setMessage("Please switch to the Tradify tab before pasting.");
        return;
      }
// warning if not data 
      chrome.storage.local.get("openSolarProjectData", (result) => {
        const data = result.openSolarProjectData;
        if (!data) {
          setMessage("No project data found. Please copy from OpenSolar first.");
          return;
        }
//action for content.js to pull data from
        chrome.tabs.sendMessage(tab.id, {
          action: "pasteToTradify",
          project: data
        });
      });
    });
  });
});

function setMessage(text) {
  document.getElementById("message").textContent = text;
}

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
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      return response.json();
    })
    .then((data) => {
      createResultsTable(data);
      setMessage("Project details loaded.");
      chrome.storage.local.set({ openSolarProjectData: data }, () => {
        console.log("Project data stored.");
      });
    })
    .catch((err) => {
      setMessage(`Error: ${err.message}`);
    });
}

function createResultsTable(apiData) {
  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = "";
  const table = document.createElement("table");
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  const addRow = (label, value) => {
    const row = document.createElement("tr");
    const labelTd = document.createElement("td");
    labelTd.textContent = label;
    row.appendChild(labelTd);
    const valueTd = document.createElement("td");
    valueTd.textContent = value;
    row.appendChild(valueTd);
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

  addRow("Address", apiData.address || "N/A");
  const contactsData = Array.isArray(apiData.contacts_data) ? apiData.contacts_data : [];
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

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`Copied: ${text}`);
  }).catch((err) => {
    alert(`Failed to copy: ${err}`);
  });
}