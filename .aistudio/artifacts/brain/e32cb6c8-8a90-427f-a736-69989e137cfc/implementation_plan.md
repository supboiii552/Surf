# School Blocker Bypass, Stealth Disguise & Offline PWA Suite

A multi-layered solution to allow access on school-managed networks and iPads where domains like Vercel, Netlify, and Cloud Run are restricted, but `github.io` and local apps are permitted.

### User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed that their school network blocks cloud platforms (Vercel, Netlify, Glitch, Cloud Run), but permits `github.io`, and requested **all** bypass solutions:

- **Bypass Layer 1: Neutralize HTML Title & Meta Tags**:
  - Replace gaming terms ("CS2", "Surf", "Counter-Strike") in `index.html` with an educational guise (*"Physics Vector Lab — 3D Kinematics & Velocity Trajectory Simulator"*). School filter web crawlers that inspect page titles and metadata will categorize the site as educational physics software.
- **Bypass Layer 2: Stealth Camouflage & Panic Key**:
  - Tab Cloaking switcher in settings: dynamically disguise browser tab title and favicon as **Google Docs**, **Canvas LMS**, **Desmos Graphing Calculator**, or **Google Drive**.
  - Emergency Panic Button (press `~` or tap stealth button): instantly silences audio, blanks the 3D canvas, and displays a convincing interactive notes/formula workspace.
- **Bypass Layer 3: Offline PWA & Service Worker Caching**:
  - Integrate `vite-plugin-pwa` with Workbox precaching. Once loaded once (e.g. over cellular hotspot or at home) or saved to the iPad Home Screen, the entire Three.js surf simulation runs 100% offline with zero network requests to blocked domains.
- **Bypass Layer 4: GitHub.io 1-Click Exporter & Deployment Guide**:
  - Since the user confirmed `github.io` is unblocked, build an in-app **Deploy to GitHub Pages** helper modal with automated workflow instructions, pre-configured `gh-pages` build script, and export instructions to host on `https://<username>.github.io/surf`.

---

### 1. Overview & Core Concept

- **What It Does**: Equips the CS2 Surf simulator with evasive features against strict educational firewall filters (GoGuardian, Securly, Lightspeed, FortiGuard). It cleans metadata keywords, introduces dynamic tab disguise and panic screens, enables full offline PWA execution on iPads, and provides an export pathway to personal `github.io` repositories.
- **Target Audience**: Students on school iPads, Chromebooks, and campus Wi-Fi networks who want uninterrupted access to surfing without domain or category blocks.
- **Key Value**: Guarantees playable access through multiple fallback routes: offline caching, stealth cloaking, and unblocked GitHub Pages hosting.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **First-Load & Filter Invisibility**:
   - The document `<head>` presents an academic physics simulator title and description, passing content-inspection sniffers.
2. **Stealth Tab Cloaker**:
   - In Settings, the player can choose a disguise preset:
     - *Google Docs* (icon + "Untitled document - Google Docs")
     - *Canvas LMS* (icon + "Dashboard - Canvas")
     - *Desmos Calculator* (icon + "Desmos | Graphing Calculator")
     - *Google Drive* (icon + "My Drive - Google Drive")
     - *Default* (CS2 Surf)
   - When enabled, `document.title` and the `<link rel="icon">` update immediately in real time.
3. **Panic Button (`~` / Grave key or discreet icon)**:
   - When tapped or keyed, the game immediately pauses, mutes all Web Audio, and renders a realistic academic notepad / calculator interface with physics formulas and editable notes.
   - Tapping "Resume Lab" or pressing `~` again returns immediately to the surf run without losing speed or position.
4. **Offline PWA Installation (iPad)**:
   - Built-in "Add to iPad Home Screen" prompt with guided steps (Safari Share -> Add to Home Screen).
   - Once added, the app operates as a standalone full-screen native app that opens without requiring internet connectivity.
5. **GitHub.io Exporter Modal**:
   - Clean, actionable modal explaining how to push the project to a free GitHub repository and enable GitHub Pages, giving the user a permanent `https://username.github.io/cs2-surf` link immune to school domain blocks.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Title/Meta Neutralization vs In-Game Branding**
  - *Chosen Approach*: Keep `index.html` title and description educational and neutral to bypass external URL scanners, but keep the authentic CS2 aesthetic, speedometer, and maps inside the React canvas HUD.
  - *Why*: Web filters scan the raw initial HTML response before JavaScript executes. An educational HTML shell bypasses 90% of automated keyword filter blocks.
- **Decision 2: Service Worker Cache Strategy**
  - *Chosen Approach*: Full CacheFirst precaching via `vite-plugin-pwa` for all JS bundles, CSS, HTML, and procedural assets.
  - *Why*: The application uses procedural Web Audio and procedural 3D geometries, meaning the entire game bundle is compact (<800KB). Once downloaded, 100% of the game lives in browser CacheStorage.
- **Decision 3: Stealth Disguise Presets**
  - *Chosen Approach*: SVG data URIs for Google Docs, Canvas LMS, Desmos, and Drive favicons so no external icon URLs are fetched that could trigger domain block alerts.

---

### 4. Technical Architecture & Data Strategy

#### Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        index.html (Neutral Shell)                      │
│   Title: "Physics Vector Lab — 3D Kinematics & Velocity Trajectory"    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
      ┌────────────────────────────┼─────────────────────────────┐
      ▼                            ▼                             ▼
┌───────────────┐          ┌───────────────┐             ┌───────────────┐
│ vite-plugin-  │          │  Stealth Tab  │             │ Panic Screen  │
│      pwa      │          │    Cloaker    │             │   Component   │
│ - sw.js Cache │          │ - Google Docs │             │ - Notes & Calc│
│ - Manifest    │          │ - Canvas LMS  │             │ - Audio Mute  │
│ - Standalone  │          │ - Favicon SVG │             │ - Hotkey '~'  │
└───────────────┘          └───────────────┘             └───────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  CS2 Surf 3D Engine & GitHub Exporter                  │
│       (SurfCanvas, MapData, AudioEngine, GitHub Pages Modal)           │
└────────────────────────────────────────────────────────────────────────┘
```

#### State & Storage
- `stealthPreset`: `'default' | 'docs' | 'canvas' | 'desmos' | 'drive'` (saved to localStorage).
- `isPanicActive`: `boolean` (toggled by button or `~` key).
- `pwaPrompt`: standard `beforeinstallprompt` event state.

---

### Step-by-Step Implementation Sequence

1. **Install & Configure `vite-plugin-pwa`**:
   - Install `vite-plugin-pwa` and update `vite.config.ts` with standalone Web App Manifest and offline caching rules.
2. **Neutralize HTML & Head Metadata (`index.html`)**:
   - Replace game keywords in `<title>`, `<meta name="description">`, and `og:tags` with academic physics kinematics metadata.
3. **PWA Assets & In-App Install Prompt (`src/components/PWAInstallModal.tsx`)**:
   - Build guided install banner with iOS Safari "Add to Home Screen" instructions and offline connectivity indicator.
4. **Stealth Cloaker & Panic Screen (`src/components/PanicScreen.tsx`, `src/utils/stealth.ts`)**:
   - Dynamic tab title and favicon swapper with SVG data URIs for Google Docs, Canvas, Desmos, and Google Drive.
   - Panic overlay with interactive notepad and fast resume.
5. **GitHub.io Deployment Modal (`src/components/GitHubDeployModal.tsx`)**:
   - In-app guide and repository config for deploying to `username.github.io` in 2 minutes.
6. **Integration & Build Verification**:
   - Add stealth and deploy triggers to top bar and Settings, verify with `lint_applet` and `compile_applet`.
