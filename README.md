# OpenSolar Project Info Chrome Extension

This extension extracts a Project ID from the current URL in the OpenSolar application (e.g. `https://app.opensolar.com/#/projects/00000/manage`), and then fetches project details (address & contacts) using the OpenSolar API. Results are displayed in a popup table, and each value can be copied with a single click.

## Installation

1. **Clone or download** this repository onto your local machine.

2. **Create** a file called `secret.js` in the project’s root folder (same level as `manifest.json` and `popup.js`).

3. Open **`secret.js`** (which is already in `.gitignore` to prevent accidental commits) and populate it with your org ID and bearer token:
   ```js
   // secret.js
   window.OPEN_SOLAR_CONFIG = {
     ORG_ID: "REPLACE_WITH_YOUR_ORG_ID",
     OPEN_SOLAR_BEARER_TOKEN: "REPLACE_WITH_YOUR_OPEN_SOLAR_TOKEN"
   };
4. **Load** the extension in Chrome:

5. Navigate to chrome://extensions.

6. Enable **Developer mode** (toggle in the top-right corner).

7. Click **"Load unpacked"**.

8. Select the folder containing this project’s files (including manifest.json).

9. **Pin** the extension if you like (optional).

Open any valid OpenSolar project URL (like https://app.opensolar.com/#/projects/12345/manage) and click the extension icon. The popup should show the project details fetched from the OpenSolar API.