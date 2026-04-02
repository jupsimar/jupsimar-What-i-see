# What I See — AI Object Detection Demo

A simple static web app that uses your **browser camera** and **TensorFlow.js (COCO-SSD)** to detect objects in real time. No server needed — everything runs in the browser.

Built as a classroom demo for **Cambrian College — Azure Static Web Apps**.

---

## How it works

1. The page loads the COCO-SSD AI model from a CDN
2. Student clicks **Start Camera** → browser asks for webcam permission
3. The model detects objects frame-by-frame
4. Bounding boxes are drawn on screen and detected items listed on the right panel

---

## Project structure

```
what-i-see/
├── index.html                  # Main page
├── styles.css                  # All styling
├── script.js                   # TensorFlow.js detection logic
├── staticwebapp.config.json    # Azure Static Web Apps config
└── README.md
```

---

## Deploy to Azure Static Web Apps

### Step 1 — Push to GitHub
1. Create a new GitHub repository (e.g. `what-i-see`)
2. Upload all files to the root of the repo

### Step 2 — Create Azure Static Web App
1. Go to [portal.azure.com](https://portal.azure.com)
2. Search **Static Web Apps** → click **Create**
3. Fill in:
   - **Subscription**: your subscription
   - **Resource Group**: create new or use existing
   - **Name**: `what-i-see` (or any name)
   - **Region**: East US 2 (or closest)
   - **Source**: GitHub
4. Sign in to GitHub and select your repo and branch (`main`)
5. **Build details**:
   - App location: `/`
   - API location: *(leave blank)*
   - Output location: `/`
6. Click **Review + Create** → **Create**

### Step 3 — Live URL
Azure will give you a URL like:
```
https://lively-sand-xxxxx.azurestaticapps.net
```
Open it on any device over HTTPS to use the camera.

---

## Technologies used

| Library | Version | Purpose |
|---|---|---|
| TensorFlow.js | 4.17.0 | ML runtime in browser |
| COCO-SSD | 2.2.3 | Pre-trained object detection model |
| Vanilla JS | — | No framework needed |

---

## Notes for students

- The app needs **HTTPS** to access the camera (Azure Static Web Apps provides this automatically)
- All AI inference happens **client-side** — no data is sent to any server
- The COCO-SSD model can detect 80 different object classes (person, chair, laptop, bottle, etc.)
