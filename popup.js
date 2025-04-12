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

//check if on tradify page first
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
          action: "pasteToTradify"
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

      setMessage("Project details loaded. project number: " + data.project_number);
      chrome.storage.local.set({ openSolarProjectData: data }, () => {
        console.log("Project data stored.");
      });
    })
    .catch((err) => {
      setMessage(`Error: ${err.message}`);
    });
}

