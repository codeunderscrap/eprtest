# Sharing and Deployment Instructions

## Overview
You have built a **static web application** that runs on a local Node.js server. The app consists of static HTML, CSS, and JavaScript files and can be served by any static file host.

## 1. Package the Project
1. Locate the project folder:
   - **Lithium EPR Agent**: `C:\Users\harsh\.gemini\antigravity\scratch\lithium_epr_agent`
   - **Vendor Portal** (if needed): `C:\Users\harsh\.gemini\antigravity\scratch\minimines_vendor_portal`
2. Compress the entire folder into a ZIP archive:
   - Right‑click the folder → *Send to → Compressed (zipped) folder*.
   - Name it something like `lithium_epr_agent.zip`.
3. The ZIP file can now be attached to an email, uploaded to a file‑sharing service (Google Drive, Dropbox, OneDrive), or shared via a messaging platform.

## 2. Deploy to a Public URL (Recommended)
Static sites can be published for free with services such as **GitHub Pages**, **Netlify**, or **Vercel**. Below are quick steps for each.

### A. GitHub Pages
1. Create a new GitHub repository (e.g., `lithium-epr-agent`).
2. Clone the repo locally:
   ```bash
   git clone https://github.com/your-username/lithium-epr-agent.git
   ```
3. Copy all files from `lithium_epr_agent` into the cloned repo folder.
4. Commit and push:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
5. In the repository **Settings → Pages**, set the source to the `main` branch (root folder). GitHub will publish the site at `https://your-username.github.io/lithium-epr-agent/`.

### B. Netlify (Drag‑and‑Drop)
1. Go to https://app.netlify.com and sign in.
2. Click **New site from Git** (or **Deploy manually** for a quick drag‑and‑drop).
3. If using drag‑and‑drop, simply upload the ZIP or the extracted folder.
4. Netlify will assign a random URL (e.g., `https://wonderful‑panda‑123.netlify.app`). You can customize the subdomain in **Site settings → Domain management**.

### C. Vercel
1. Sign in at https://vercel.com.
2. Choose **New Project → Import Git Repository** and select your GitHub repo.
3. No build step is required for a pure static site; Vercel will detect it automatically.
4. After deployment you get a URL like `https://lithium-epr-agent.vercel.app`.

## 3. Expose a Local Development Server (Temporary Sharing)
If you need to share the running local server temporarily (e.g., for a demo), use a tunneling service such as **ngrok**:
1. Install ngrok from https://ngrok.com and add it to your PATH.
2. Start your local server (your existing `node server.js`).
3. In a new terminal, run:
   ```bash
   ngrok http 8080   # replace 8080 with the port your server uses
   ```
4. ngrok prints a public HTTPS URL that forwards to your localhost. Share that URL with the recipient.

## 4. Deploying the Google Apps Script Backend (Vendor Portal)
The vendor portal writes data to Google Sheets via a Google Apps Script Web App.
1. Open the script editor at https://script.google.com.
2. Paste the provided `Code.gs` (found in the `minimines_vendor_portal` folder).
3. Click **Deploy → New deployment** → **Web app**.
4. Set **Execute as** to `Me` and **Who has access** to `Anyone` (or `Anyone with the link`).
5. Deploy and copy the generated URL – this is the endpoint your JavaScript will POST data to.
6. Update `app.js` in the portal folder with this URL if you haven't already.

## 5. Share the Final URL
Once the site is live on any hosting platform, simply send the public URL to your collaborator. They can open it in any browser; no additional installation is required.

---
**Tip:** Keep a copy of the original project folder untouched as a “source of truth.” When you need to make updates, modify the source, push the changes, and the hosting platform will automatically rebuild the site.

---
If you need further assistance with a specific hosting provider or want to automate the deployment via a CI/CD pipeline, let me know!
