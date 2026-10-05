/**
 * Stealth Camouflage & Tab Cloaker Utility
 * Dynamically switches document.title and favicon to educational disguise presets.
 */

export type StealthPreset = 'default' | 'docs' | 'canvas' | 'desmos' | 'drive' | 'physics';

interface PresetConfig {
  title: string;
  iconSvg: string;
}

const PRESETS: Record<StealthPreset, PresetConfig> = {
  default: {
    title: 'Physics Vector Lab — 3D Kinematics',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="14" fill="#090d16"/><path d="M8 24 C 12 20, 16 14, 20 8 C 22 5, 26 7, 28 9" stroke="#f59e0b" stroke-width="2.5" fill="none"/></svg>`,
  },
  docs: {
    title: 'Untitled document - Google Docs',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><path d="M6 3 h13 l7 7 v19 h-20 z" fill="#4285f4"/><path d="M19 3 v7 h7 z" fill="#a1c2fa"/><path d="M10 14 h12 M10 18 h12 M10 22 h8" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  canvas: {
    title: 'Dashboard - Canvas LMS',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="14" fill="#e1382b"/><circle cx="16" cy="16" r="8" fill="#ffffff"/><circle cx="16" cy="16" r="4" fill="#e1382b"/></svg>`,
  },
  desmos: {
    title: 'Desmos | Graphing Calculator',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="6" fill="#147347"/><path d="M4 22 Q 10 6 16 16 T 28 10" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  },
  drive: {
    title: 'My Drive - Google Drive',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><path d="M11 6 L21 6 L28 18 L18 18 Z" fill="#ffba00"/><path d="M4 18 L11 6 L18 18 L11 30 Z" fill="#0066da"/><path d="M18 18 L28 18 L21 30 L11 30 Z" fill="#00ac47"/></svg>`,
  },
  physics: {
    title: 'Kinematic Vector Simulation - Inertia Lab',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="14" fill="#0f172a"/><ellipse cx="16" cy="16" rx="12" ry="4" stroke="#38bdf8" stroke-width="1.5" fill="none" transform="rotate(30 16 16)"/><ellipse cx="16" cy="16" rx="12" ry="4" stroke="#38bdf8" stroke-width="1.5" fill="none" transform="rotate(-30 16 16)"/><circle cx="16" cy="16" r="3" fill="#f59e0b"/></svg>`,
  },
};

export function applyStealthPreset(preset: StealthPreset) {
  const config = PRESETS[preset] || PRESETS.default;

  // 1. Update Title
  document.title = config.title;

  // 2. Update Favicon with SVG data URI
  let favicon = document.getElementById('app-favicon') as HTMLLinkElement | null;
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.id = 'app-favicon';
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }

  const encodedSvg = encodeURIComponent(config.iconSvg);
  favicon.href = `data:image/svg+xml;utf8,${encodedSvg}`;

  try {
    localStorage.setItem('cs2_surf_stealth', preset);
  } catch {}
}

export function getSavedStealthPreset(): StealthPreset {
  try {
    const saved = localStorage.getItem('cs2_surf_stealth');
    if (saved && saved in PRESETS) {
      return saved as StealthPreset;
    }
  } catch {}
  return 'default';
}
