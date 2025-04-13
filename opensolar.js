const { ORG_ID, OPEN_SOLAR_BEARER_TOKEN } = window.OPEN_SOLAR_CONFIG;
let platform = "OpenSolar"; // Set the platform to OpenSolar

function setMessage(text) {
    console.log(`[${platform}] ${text}`);
}

function getProject() {
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
                    alert(`Project data stored. Project Number: ${data.project_number}`);

                });
            })
            .catch((err) => {
                setMessage(`Error: ${err.message}`);
            });
    }

    function waitForElement(selector, callback, timeout = 5000, interval = 100) {
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

    function injectButton(platform, callback) {
        /**
         * This function injects a button into the UI.
         * It checks if the button already exists before creating a new one.
         * @returns {void}
         */
        const { location, id, title, className, textContent, svg } = window.btnElement[platform]; // Get the button element details from the fieldmap
        if (document.getElementById(id)) return; // Check if the button already exists, if so exit
        const target = $(location);
        if (target.length > 0) { // Check if the target (location) element exists
            const btn = document.createElement('button');
            btn.id = id;
            btn.title = title;
            btn.className = className;
            btn.innerHTML = svg + textContent; // Set the button's inner HTML to the SVG and text content
            btn.addEventListener("click", () => {
                callback; // Add click event listener to the button
            });
            target.append(btn);
        }
    }

waitForElement(window.btnElement[platform].location, () => {
    injectButton(platform, getProject());
  });