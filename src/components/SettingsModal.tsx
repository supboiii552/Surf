/**
 * CS2 Surf Settings & Customization Drawer
 * Allows comprehensive customization of touch layouts, physics presets, display, and stealth school bypass.
 */

import React, { useState } from 'react';
import { GameSettings, TouchLayoutType, TouchButtonSize, PhysicsPreset } from '../types';
import { StealthPreset, applyStealthPreset } from '../utils/stealth';
import { X, Sliders, Gamepad2, Monitor, Volume2, Shield, EyeOff, Download, Github, BookOpen, Cloud } from 'lucide-react';
import { surfAudio } from '../audio/surfAudio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
  onOpenPWAInstall?: () => void;
  onOpenGitHubDeploy?: () => void;
  onOpenCloudflareDeploy?: () => void;
  onTriggerPanic?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onOpenPWAInstall,
  onOpenGitHubDeploy,
  onOpenCloudflareDeploy,
  onTriggerPanic,
}) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'physics' | 'visuals' | 'stealth'>('controls');

  const update = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);

    if (key === 'volume' || key === 'soundEnabled') {
      surfAudio.setVolume(updated.volume, updated.soundEnabled);
    }
  };

  const handleStealthChange = (preset: StealthPreset) => {
    update('stealthPreset', preset);
    applyStealthPreset(preset);
  };

  const applyPhysicsPreset = (preset: PhysicsPreset) => {
    if (preset === 'cs2-authentic') {
      onUpdateSettings({
        ...settings,
        physicsPreset: 'cs2-authentic',
        airAccelerate: 150,
        maxAirSpeed: 30,
        gravity: 800,
        rampStickAssist: false,
        autoBhop: true,
        subTickSmooth: true,
      });
    } else if (preset === 'hardcore') {
      onUpdateSettings({
        ...settings,
        physicsPreset: 'hardcore',
        airAccelerate: 100,
        maxAirSpeed: 30,
        gravity: 800,
        rampStickAssist: false,
        autoBhop: false,
        subTickSmooth: true,
      });
    } else if (preset === 'casual-flow') {
      onUpdateSettings({
        ...settings,
        physicsPreset: 'casual-flow',
        airAccelerate: 260,
        maxAirSpeed: 45,
        gravity: 700,
        rampStickAssist: true,
        autoBhop: true,
        subTickSmooth: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 pointer-events-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Settings & Controls</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('controls')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'controls' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('physics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'physics' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Physics</span>
          </button>

          <button
            onClick={() => setActiveTab('visuals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'visuals' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Visuals</span>
          </button>

          <button
            onClick={() => setActiveTab('stealth')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'stealth' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>School Bypass</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          {/* ----------------- TAB: CONTROLS ----------------- */}
          {activeTab === 'controls' && (
            <div className="space-y-6">
              {/* Touch Layout Selector */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                  Touch Control Scheme (iPad & Tablets)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'strafe-buttons', label: 'Dual Strafe Buttons', desc: 'Dedicated A / D thumb triggers' },
                    { id: 'joystick', label: 'Analog Thumbstick', desc: 'Floating dynamic thumb joystick' },
                    { id: 'split-screen', label: 'Split-Screen Zones', desc: 'Tap left/right halves to strafe' },
                  ].map(scheme => (
                    <button
                      key={scheme.id}
                      onClick={() => update('touchLayout', scheme.id as TouchLayoutType)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                        settings.touchLayout === scheme.id
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-semibold text-xs text-amber-300">{scheme.label}</span>
                      <span className="text-[11px] text-slate-400 mt-1">{scheme.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Touch Button Size */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                  Touch Button Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as TouchButtonSize[]).map(size => (
                    <button
                      key={size}
                      onClick={() => update('touchButtonSize', size)}
                      className={`py-2 px-3 rounded-xl border capitalize text-xs font-medium transition-colors ${
                        settings.touchButtonSize === size
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Touch Opacity Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Touch Controls Opacity
                  </label>
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    {Math.round(settings.touchOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={settings.touchOpacity}
                  onChange={e => update('touchOpacity', parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Touch Sensitivity Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Touch Look Sensitivity
                  </label>
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    {settings.touchSensitivity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={settings.touchSensitivity}
                  onChange={e => update('touchSensitivity', parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Desktop Mouse Sensitivity */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Desktop Mouse Sensitivity
                  </label>
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    {settings.mouseSensitivity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={settings.mouseSensitivity}
                  onChange={e => update('mouseSensitivity', parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Toggles: Swap Hands, Invert Y */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.swapTouchHands}
                    onChange={e => update('swapTouchHands', e.target.checked)}
                    className="rounded accent-amber-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-200 font-medium">Left-Handed Layout</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.invertY}
                    onChange={e => update('invertY', e.target.checked)}
                    className="rounded accent-amber-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-200 font-medium">Invert Y-Axis</span>
                </label>
              </div>
            </div>
          )}

          {/* ----------------- TAB: PHYSICS ----------------- */}
          {activeTab === 'physics' && (
            <div className="space-y-6">
              {/* Presets */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                  Physics Difficulty Preset
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'cs2-authentic', label: 'CS2 Authentic', desc: '128-tick 150 airaccel, standard ramps' },
                    { id: 'hardcore', label: 'Hardcore', desc: '100 airaccel, strict ramp entry' },
                    { id: 'casual-flow', label: 'Casual Flow', desc: '260 airaccel + gentle ramp assist' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => applyPhysicsPreset(p.id as PhysicsPreset)}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        settings.physicsPreset === p.id
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-semibold text-xs text-amber-300 block">{p.label}</span>
                      <span className="text-[11px] text-slate-400 mt-1 block">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular Sliders */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Air Acceleration (sv_airaccelerate)
                  </label>
                  <span className="font-mono text-xs text-amber-400 font-bold">{settings.airAccelerate}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="400"
                  step="10"
                  value={settings.airAccelerate}
                  onChange={e => {
                    update('airAccelerate', parseInt(e.target.value));
                    update('physicsPreset', 'custom');
                  }}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Gravity (sv_gravity)
                  </label>
                  <span className="font-mono text-xs text-amber-400 font-bold">{settings.gravity} u/s²</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="1100"
                  step="25"
                  value={settings.gravity}
                  onChange={e => {
                    update('gravity', parseInt(e.target.value));
                    update('physicsPreset', 'custom');
                  }}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs text-slate-200 font-semibold block">Ramp-Stick Assist</span>
                    <span className="text-[11px] text-slate-400">
                      Gently prevents slipping off steep ramp curves on touchscreen
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.rampStickAssist}
                    onChange={e => update('rampStickAssist', e.target.checked)}
                    className="rounded accent-amber-500 w-4 h-4 ml-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs text-slate-200 font-semibold block">Auto-Bhop</span>
                    <span className="text-[11px] text-slate-400">
                      Hold Jump to continuously bunny-hop upon landing without speed loss
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoBhop}
                    onChange={e => update('autoBhop', e.target.checked)}
                    className="rounded accent-amber-500 w-4 h-4 ml-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs text-slate-200 font-semibold block">128-Tick Sub-Step Simulation</span>
                    <span className="text-[11px] text-slate-400">
                      Guarantees deterministic physics precision on 60Hz and 120Hz screens
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.subTickSmooth}
                    onChange={e => update('subTickSmooth', e.target.checked)}
                    className="rounded accent-amber-500 w-4 h-4 ml-4"
                  />
                </label>
              </div>
            </div>
          )}

          {/* ----------------- TAB: VISUALS & AUDIO ----------------- */}
          {activeTab === 'visuals' && (
            <div className="space-y-6">
              {/* Sound Controls */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" /> Sound Volume
                  </label>
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    {Math.round(settings.volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={settings.volume}
                  onChange={e => update('volume', parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* FOV Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Field of View (FOV)
                  </label>
                  <span className="font-mono text-xs text-amber-400 font-bold">{settings.fov}°</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="115"
                  step="1"
                  value={settings.fov}
                  onChange={e => update('fov', parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Visual Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-200 font-medium">Sound Effects</span>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={e => update('soundEnabled', e.target.checked)}
                    className="rounded accent-amber-500 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-200 font-medium">Karambit Knife Viewmodel</span>
                  <input
                    type="checkbox"
                    checked={settings.knifeModel}
                    onChange={e => update('knifeModel', e.target.checked)}
                    className="rounded accent-amber-500 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-200 font-medium">Speed Particle Lines</span>
                  <input
                    type="checkbox"
                    checked={settings.speedLines}
                    onChange={e => update('speedLines', e.target.checked)}
                    className="rounded accent-amber-500 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-200 font-medium">Speedometer (u/s)</span>
                  <input
                    type="checkbox"
                    checked={settings.showSpeedo}
                    onChange={e => update('showSpeedo', e.target.checked)}
                    className="rounded accent-amber-500 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-200 font-medium">Keypress Visualizer</span>
                  <input
                    type="checkbox"
                    checked={settings.showKeypressHUD}
                    onChange={e => update('showKeypressHUD', e.target.checked)}
                    className="rounded accent-amber-500 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-200 font-medium">Crosshair</span>
                  <input
                    type="checkbox"
                    checked={settings.showCrosshair}
                    onChange={e => update('showCrosshair', e.target.checked)}
                    className="rounded accent-amber-500 w-4 h-4"
                  />
                </label>
              </div>
            </div>
          )}

          {/* ----------------- TAB: SCHOOL BYPASS & STEALTH ----------------- */}
          {activeTab === 'stealth' && (
            <div className="space-y-6">
              {/* Tab Cloaker Disguise */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                  Browser Tab Cloaking (Title & Favicon)
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  Changes what appears on your browser tab so teachers and screen monitors only see schoolwork.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'docs', label: 'Google Docs', desc: 'Untitled document - Google Docs' },
                    { id: 'canvas', label: 'Canvas LMS', desc: 'Dashboard - Canvas LMS' },
                    { id: 'desmos', label: 'Desmos Calculator', desc: 'Desmos | Graphing Calculator' },
                    { id: 'drive', label: 'Google Drive', desc: 'My Drive - Google Drive' },
                    { id: 'physics', label: 'Physics Lab', desc: 'Kinematic Vector Simulation' },
                    { id: 'default', label: 'Default Shell', desc: 'Physics Vector Lab' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleStealthChange(p.id as StealthPreset)}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        settings.stealthPreset === p.id
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-semibold text-xs text-amber-300 block">{p.label}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block truncate">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Emergency Panic Screen */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Emergency Panic Screen</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Press ` or ~
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instantly cuts game audio and brings up an interactive AP Physics worksheet and calculator with one keypress or tap.
                </p>
                {onTriggerPanic && (
                  <button
                    onClick={() => {
                      onClose();
                      onTriggerPanic();
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white flex items-center justify-center gap-2 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span>Test Panic Screen Now</span>
                  </button>
                )}
              </div>

              {/* Offline & Deployment Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {onOpenCloudflareDeploy && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCloudflareDeploy();
                    }}
                    className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-left hover:bg-orange-500/20 transition-colors flex items-center justify-between sm:col-span-2"
                  >
                    <div>
                      <span className="text-xs font-bold block flex items-center gap-1.5">
                        <span>Deploy to Cloudflare Pages</span>
                        <span className="text-[10px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-mono">Recommended</span>
                      </span>
                      <span className="text-[11px] text-orange-200/70">Automatic Vite build on push · *.pages.dev (unblocked)</span>
                    </div>
                    <Cloud className="w-5 h-5 text-orange-400 shrink-0 ml-2" />
                  </button>
                )}

                {onOpenPWAInstall && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPWAInstall();
                    }}
                    className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-left hover:bg-amber-500/20 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold block">Offline PWA on iPad</span>
                      <span className="text-[11px] text-amber-200/70">Play with zero Wi-Fi firewall requests</span>
                    </div>
                    <Download className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
                  </button>
                )}

                {onOpenGitHubDeploy && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenGitHubDeploy();
                    }}
                    className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-left hover:bg-blue-500/20 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold block">Deploy to GitHub.io</span>
                      <span className="text-[11px] text-blue-200/70">Host on unblocked github.io domain</span>
                    </div>
                    <Github className="w-4 h-4 text-blue-400 shrink-0 ml-2" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
