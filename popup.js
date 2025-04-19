// Destructure org ID and token from config file
const { ORG_ID, OPEN_SOLAR_BEARER_TOKEN } = window.OPEN_SOLAR_CONFIG;

document.addEventListener("DOMContentLoaded", () => {
  // Check if project data is already in storage (e.g., user already loaded it earlier)
  chrome.storage.local.get("openSolarProjectData", (result) => {
    const data = result.openSolarProjectData;
    if (data) {
      setMessage(
        `Project loaded: ${data.title || "Unnamed Project"}.\n\nPlease navigate to Tradify and click "Import from OpenSolar" in the bottom toolbar.`
      );
    }
  });

  // Get the currently active tab to see if we're on a valid OpenSolar project URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs.length) {
      setMessage("No active tab found.");
      return;
    }

    const url = tabs[0].url || "";
    const match = url.match(/#\/projects\/(\d+)\//); // Match project ID from OpenSolar URL

    if (match && match[1]) {
      const projectId = match[1];
      setMessage(`Project #${projectId} found. Fetching details...`);
      fetchProjectDetails(ORG_ID, projectId); // Fetch project info via API
    } else {
      setMessage("Could not find a project number in this URL.");
    }
  });
});

// Updates the message area in the popup
function setMessage(text) {
  document.getElementById("message").textContent = text;
}

// Calls OpenSolar API to fetch project data and stores it locally
function fetchProjectDetails(orgId, projectId) {
  const endpoint = `https://api.opensolar.com/api/orgs/${orgId}/projects/${projectId}/`;

  fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${OPEN_SOLAR_BEARER_TOKEN}`
    }
  })
    .then(async (response) => {
      // Handle any API errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      return response.json();
    })
    .then((data) => {
      // Store project data and inform user
      chrome.storage.local.set({ openSolarProjectData: data }, () => {
        console.log("Project data stored.");
        setMessage(
          `Project loaded: ${data.title || "Unnamed Project"}.\n\nPlease navigate to Tradify and click "Import from OpenSolar" in the bottom toolbar.`
        );
      });
    })
    .catch((err) => {
      setMessage(`Error: ${err.message}`);
    });
}
