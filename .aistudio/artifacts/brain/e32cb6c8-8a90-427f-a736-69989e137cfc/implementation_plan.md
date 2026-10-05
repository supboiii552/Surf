# GitHub Pages White Screen Resolution & Relative Base Path Fix

Fixes the white screen issue on `username.github.io/repo-name/` caused by absolute root asset paths (`/assets/...`) failing with 404 on project-level sub-paths in iOS Safari and GitHub Pages.

### User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed their deployment is a project repository (`username.github.io/repo-name/`) viewed on iOS:

- **Root Cause Confirmed**:
  - Vite's default configuration assumes deployment at the root domain (`/`), emitting script tags like `<script src="/assets/index.js">`.
  - When hosted at `https://username.github.io/repo-name/`, iOS Safari requests `https://username.github.io/assets/index.js` (missing the `/repo-name/` path segment), causing a 404 error and leaving a blank white screen.
- **The Solution**:
  1. Set `base: './'` in `vite.config.ts`: forces Vite to emit relative asset paths (`./assets/index.js`), making the build work seamlessly on any repository name (`/repo-name/`, `/cs2-surf/`, etc.) without hardcoding.
  2. Add `public/.nojekyll`: instructs GitHub Pages to disable Jekyll processing, ensuring all static asset folders and chunks are served without filtering.
  3. Update `GitHubDeployModal.tsx`: display the updated `vite.config.ts` configuration and step-by-step instructions so the user's GitHub build succeeds immediately.
  4. Asset Fallback Safety in `index.html`: if assets fail to load or take too long, display an informative diagnostic card instead of an unstyled white screen.

---

### 1. Overview & Core Concept

- **What It Does**: Resolves sub-path asset routing on GitHub Pages so the CS2 surf simulation runs flawlessly on iPad and iPhone Safari under `https://<username>.github.io/<repo-name>/`.
- **Target Audience**: Students and mobile users hosting personal forks on GitHub Pages.
- **Key Value**: Zero-configuration compatibility: works out of the box regardless of what the user names their GitHub repository.

---

### 2. Technical Architecture & File Changes

```
┌───────────────────────────────────────────────────────────┐
│                      vite.config.ts                       │
│   Set base: './' (Relative paths for GitHub Pages subpath) │
└─────────────────────────────┬─────────────────────────────┘
                              │
       ┌──────────────────────┴──────────────────────┐
       ▼                                             ▼
┌──────────────┐                             ┌──────────────┐
│public/       │                             │src/components│
│  .nojekyll   │                             │  /GitHub...  │
│(Disable      │                             │(Updated guide│
│Jekyll filter)│                             │& build steps)│
└──────────────┘                             └──────────────┘
```

#### Detailed Changes
1. **`vite.config.ts`**:
   - Add `base: './'` so all script, style, and image tags in `dist/index.html` use relative paths (`./assets/...`).
2. **`public/.nojekyll`**:
   - Create an empty `.nojekyll` file so GitHub Pages does not drop files or mangle asset URLs.
3. **`src/components/GitHubDeployModal.tsx`**:
   - Highlight the `base: './'` fix and include ready-to-copy GitHub Actions workflow and push commands.
4. **`index.html`**:
   - Ensure the noscript and fallback banner helps mobile users diagnose any asset issues immediately.

---

### Step-by-Step Implementation Sequence

1. Update `vite.config.ts` to add `base: './'`.
2. Create `public/.nojekyll` to disable GitHub Pages Jekyll engine.
3. Update `src/components/GitHubDeployModal.tsx` with clear instructions on the `base: './'` fix.
4. Verify compilation with `compile_applet` and lint with `lint_applet`.
