const { ORG_ID, OPEN_SOLAR_BEARER_TOKEN } = window.OPEN_SOLAR_CONFIG;
let platform = "OpenSolar"; // Set the platform to OpenSolar

function setMessage(text) {
    console.log(`[${platform}] ${text}`);
}

function getProject() {
    const url = window.location.href;
    const match = url.match(/#\/projects\/(\d+)\//);
    if (match && match[1]) {
        const projectId = match[1];
        setMessage(`Project #${projectId} found. Fetching details...`);
        fetchProjectDetails(ORG_ID, projectId);
    } else {
        setMessage("Could not find a project number in this URL.");
    }

    chrome.storage.local.get("openSolarProjectData", (result) => {
        const data = result.openSolarProjectData;
        if (!data) {
            setMessage("No project data found.");
            return;
        }
    });

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
                //display alert to user
                alert(`Project data stored for ${data.title}\n\nPlease switch to the Tradify tab to paste the data.`);

            });
        })
        .catch((err) => {
            setMessage(`Error: ${err.message}`);
        });
}

function waitForElement(selector, callback, timeout = 10000, interval = 100) {
    const startTime = Date.now();

    const check = () => {
        const el = $(selector);
        if (el.length > 0) {
            callback(el);
        } else if (Date.now() - startTime < timeout) {
            setTimeout(check, interval);
        } else {
            console.warn(`[Extension] Element "${selector}" not found within ${timeout}ms.`);
        }
    };

    check();
}

function injectButton(platform) {
    /**
     * This function injects a button into the UI.
     * It checks if the button already exists before creating a new one.
     * @returns {void}
     */
    const { location, id, title, className, textContent, svg } = window.btnElement[platform]; // Get the button element details from the fieldmap
    const $el = $(`#${id}`);
    if ($el.length > 0) return; // Check if the button already exists, if so exit
    const target = $(location).parent(); // Get the parent element of the target location
    if (target.length > 0 && target.find(`#${id}`).length === 0) { // Check if the target (location) element exists and if the button is not already present
        const btn = document.createElement('button');
        btn.id = id;
        btn.title = title;
        btn.className = className;
        btn.innerHTML = svg + textContent; // Set the button's inner HTML to the SVG and text content
        btn.addEventListener("click", () => {
            getProject();
        });
        target.append(btn);
    }
}

waitForElement(window.btnElement[platform].location, () => {
    injectButton(platform);
  });

console.log("opensolar script running");