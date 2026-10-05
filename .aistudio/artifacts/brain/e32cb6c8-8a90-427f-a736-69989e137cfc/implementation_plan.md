# Cloudflare Pages Deployment & Modular TypeScript Architecture

Optimizes the modular TypeScript/TSX CS2 Surf application for automated Cloudflare Pages deployment, ensuring zero-configuration builds from GitHub, full PWA caching, and reliable asset delivery at `*.pages.dev`.

### User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed they prefer **Cloudflare Pages with automatic Vite build** and want to keep the clean, modular TSX architecture intact (no single-file smashing).

- **Confirmed Architectural Direction**:
  - Preserve 100% of the modular TypeScript/TSX structure (`src/App.tsx`, `src/physics/surfPhysics.ts`, `src/maps/mapData.ts`, `src/components/`, etc.).
  - Cloudflare Pages connects directly to the user's GitHub repository and automatically runs `npm run build` using the standard Vite pipeline, deploying the compiled `dist/` directory to high-speed global edge servers (`*.pages.dev`).
- **Cloudflare Pages Optimizations**:
  1. **SPA Redirect Rules (`public/_redirects`)**:
     - Add `/*  /index.html  200` in `public/_redirects` so Cloudflare Pages serves the single-page application smoothly for all sub-paths without 404s.
  2. **Edge Cache Headers (`public/_headers`)**:
     - Provide caching directives for immutable 3D WebGL assets, scripts, and PWA manifests.
  3. **Build Target & Environment**:
     - Ensure `vite.config.ts` outputs production assets cleanly to `dist/`, compatible with both root domains (`*.pages.dev`) and custom school domains.
  4. **In-App Cloudflare Pages Setup Guide**:
     - Update the in-app deployment helper with one-click copyable settings for Cloudflare Pages:
       - **Framework Preset**: `Vite`
       - **Build Command**: `npm run build`
       - **Build Output Directory**: `dist`
       - **Root Directory**: `/`

---

### 1. Overview & Core Concept

- **What It Does**: Enables instant, automatic CI/CD deployment on Cloudflare Pages. Whenever the user pushes changes to their GitHub repository, Cloudflare Pages automatically triggers a Vite build and updates their live `*.pages.dev` URL within seconds.
- **Target Audience**: Students and players who need a fast, reliable, unblocked hosting alternative that respects modern modular TypeScript web development.
- **Key Value**: Delivers blazing 60+ FPS WebGL performance with zero white screens, automated builds, and full offline PWA capabilities.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **GitHub to Cloudflare Connection**:
   - The user creates or connects their repository in the Cloudflare Pages dashboard.
   - Cloudflare auto-detects the project as **Vite**.
   - Cloudflare runs `npm run build` on Node.js 20 and deploys the `dist/` directory.
2. **Accessing the Live Site**:
   - The user receives an unblocked `https://<project-name>.pages.dev` address.
   - The application launches instantly in the browser or iPad home screen with all 4 maps, touch controls, sound effects, and stealth cloaking intact.
3. **In-App Deployment Guide**:
   - In Settings, players can open the **Deploy to Cloudflare Pages** modal to see exact configuration values, copy Git push commands, and view the 3-step setup guide.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Modular TSX vs Single-File Bundle**
  - *Chosen Approach*: Keep the codebase strictly modular with typed components, separation of concerns, and clean hooks.
  - *Why*: The user explicitly requested preserving modular TSX code. Modern hosting like Cloudflare Pages is built specifically to compile modular Vite projects automatically.
- **Decision 2: Cloudflare `_redirects` and `_headers`**
  - *Chosen Approach*: Add static configuration files in `public/` that Cloudflare Pages natively interprets during deployment.
  - *Why*: Guarantees that client-side routing, service workers, and static asset caching execute with zero server-side latency.

---

### 4. Technical Architecture & File Changes

```
┌───────────────────────────────────────────────────────────┐
│                    GitHub Repository                      │
│   (Modular TSX, Vite config, package.json, public/)       │
└─────────────────────────────┬─────────────────────────────┘
                              │ Git Push
                              ▼
┌───────────────────────────────────────────────────────────┐
│              Cloudflare Pages Automated CI/CD             │
│   - Detects Framework: Vite                               │
│   - Runs: npm run build                                   │
│   - Reads: public/_redirects and public/_headers          │
│   - Serves: dist/ folder                                  │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│           Live Site (https://<project>.pages.dev)         │
│   - 100% Unblocked, Full Source Surf Physics, PWA Offline │
└───────────────────────────────────────────────────────────┘
```

#### Detailed Changes
1. **`public/_redirects`**:
   - Add Cloudflare SPA rewrite rule (`/* /index.html 200`).
2. **`public/_headers`**:
   - Set optimal cache headers for static assets (`/assets/*: Cache-Control: public, max-age=31536000, immutable`).
3. **`src/components/CloudflareDeployModal.tsx`**:
   - Replace the legacy manual instructions with an easy Cloudflare Pages guide (Framework preset, build command, output dir, and push commands).
4. **`src/components/SettingsModal.tsx` & `src/App.tsx`**:
   - Update labels and triggers to point to the Cloudflare Pages helper.

---

### Step-by-Step Implementation Sequence

1. Create `public/_redirects` for Cloudflare Pages SPA routing.
2. Create `public/_headers` for high-performance asset caching.
3. Update `src/components/CloudflareDeployModal.tsx` with straightforward Cloudflare Pages setup steps.
4. Update references in `SettingsModal.tsx` and `App.tsx`.
5. Run `compile_applet` and `lint_applet` to verify compilation.
