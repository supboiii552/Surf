/**
 * CS2 Surf Overlay HUD
 * Displays authentic Source speedometer, stage timer, keypress visualizer, and top bar contract.
 */

import React from 'react';
import { GameSettings, MapDefinition, InputState } from '../types';
import { Settings as SettingsIcon, MapPin, HelpCircle, Trophy, Zap, CheckCircle2, EyeOff, Download } from 'lucide-react';

interface SurfHUDProps {
  map: MapDefinition;
  settings: GameSettings;
  speed: number;
  stage: number;
  timerMs: number;
  personalBestMs: number | null;
  maxSpeedRecord: number;
  isOnRamp: boolean;
  inputs: InputState;
  finishedTimeMs: number | null;
  onOpenSettings: () => void;
  onOpenMapSelector: () => void;
  onOpenTutorial: () => void;
  onRestart: () => void;
  onNextMap?: () => void;
  onTriggerPanic?: () => void;
  onOpenPWAInstall?: () => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor(ms % 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

export const SurfHUD: React.FC<SurfHUDProps> = ({
  map,
  settings,
  speed,
  stage,
  timerMs,
  personalBestMs,
  maxSpeedRecord,
  isOnRamp,
  inputs,
  finishedTimeMs,
  onOpenSettings,
  onOpenMapSelector,
  onOpenTutorial,
  onRestart,
  onNextMap,
  onTriggerPanic,
  onOpenPWAInstall,
}) => {
  // Speed color gradient
  const getSpeedColor = (spd: number) => {
    if (spd > 3200) return 'text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]';
    if (spd > 2200) return 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]';
    if (spd > 1200) return 'text-emerald-400';
    return 'text-white';
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 z-20">
      {/* ---------------------------------------------------------------- */}
      {/* TOP BAR CONTRACT: Single text Brand | Info links | Primary Actions */}
      {/* ---------------------------------------------------------------- */}
      <header className="flex items-center justify-between px-5 py-3 rounded-2xl bg-slate-950/70 backdrop-blur-md border border-slate-800 pointer-events-auto">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold tracking-tight text-lg text-amber-400">CS2 SURF</span>
          <span className="text-slate-500 hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-xs font-mono text-slate-300 hidden sm:inline">{map.name}</span>
        </div>

        {/* Zone 2: Clean unboxed metadata with separators */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>Tier {map.tier}</span>
          <span aria-hidden="true">·</span>
          <span>Stage {stage}/{map.stages}</span>
          {isOnRamp && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> SURFING
              </span>
            </>
          )}
        </div>

        {/* Zone 3: Functional action buttons */}
        <div className="flex items-center gap-2">
          {onTriggerPanic && (
            <button
              onClick={onTriggerPanic}
              aria-label="Emergency Stealth Panic Screen"
              title="Disguise as Physics Notes (Hotkey: `)"
              className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-rose-400 hover:text-white hover:bg-rose-950/80 transition-colors"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          )}

          {onOpenPWAInstall && (
            <button
              onClick={onOpenPWAInstall}
              aria-label="Offline PWA Install"
              title="Install for Offline Play on iPad"
              className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-amber-400 hover:text-white hover:bg-amber-950/80 transition-colors hidden sm:flex"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenTutorial}
            aria-label="How to Surf Tutorial"
            className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenMapSelector}
            aria-label="Change Map"
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Maps</span>
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* CENTER CROSSHAIR */}
      {/* ---------------------------------------------------------------- */}
      {settings.showCrosshair && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            {/* Center dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_#22d3ee]" />
            {/* Reticle ticks */}
            <div className="absolute w-4 h-0.5 bg-cyan-400/80 -left-5" />
            <div className="absolute w-4 h-0.5 bg-cyan-400/80 -right-5" />
            <div className="absolute h-4 w-0.5 bg-cyan-400/80 -top-5" />
            <div className="absolute h-4 w-0.5 bg-cyan-400/80 -bottom-5" />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* BOTTOM HUD: SPEEDOMETER, TIMER, KEYPRESS VISUALIZER */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col items-center gap-3 mb-24 md:mb-8">
        {/* Speedometer */}
        {settings.showSpeedo && (
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl md:text-5xl font-mono font-bold tabular-nums tracking-tighter ${getSpeedColor(speed)}`}>
                {speed}
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold">u/s</span>
            </div>

            {/* Speed bar meter */}
            <div className="w-48 md:w-64 h-1.5 bg-slate-900/80 rounded-full overflow-hidden border border-slate-800 mt-1">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-cyan-400 transition-all duration-75"
                style={{ width: `${Math.min(100, (speed / 3500) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Real-time Timer & Personal Best */}
        <div className="flex items-center gap-4 px-4 py-1.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800/80 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Time:</span>
            <span className="font-bold tabular-nums text-white">{formatTime(timerMs)}</span>
          </div>

          <span className="text-slate-600" aria-hidden="true">|</span>

          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">PB:</span>
            <span className="font-bold tabular-nums text-amber-300">
              {personalBestMs ? formatTime(personalBestMs) : '--:--.---'}
            </span>
          </div>

          {maxSpeedRecord > 0 && (
            <>
              <span className="text-slate-600" aria-hidden="true">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Peak:</span>
                <span className="font-bold tabular-nums text-cyan-300">{maxSpeedRecord}</span>
              </div>
            </>
          )}
        </div>

        {/* Live Keypress Overlay (W A S D Space) */}
        {settings.showKeypressHUD && (
          <div className="flex flex-col items-center gap-1 bg-slate-950/60 backdrop-blur-sm p-2 rounded-xl border border-slate-800/60 font-mono text-[11px]">
            {/* W key */}
            <div
              className={`w-7 h-7 rounded flex items-center justify-center font-bold transition-all ${
                inputs.forward ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-900/90 text-slate-400 border border-slate-800'
              }`}
            >
              W
            </div>
            {/* A S D Space keys */}
            <div className="flex items-center gap-1">
              <div
                className={`w-7 h-7 rounded flex items-center justify-center font-bold transition-all ${
                  inputs.strafeLeft ? 'bg-cyan-400 text-slate-950 shadow-md' : 'bg-slate-900/90 text-slate-400 border border-slate-800'
                }`}
              >
                A
              </div>
              <div
                className={`w-7 h-7 rounded flex items-center justify-center font-bold transition-all ${
                  inputs.backward ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-900/90 text-slate-400 border border-slate-800'
                }`}
              >
                S
              </div>
              <div
                className={`w-7 h-7 rounded flex items-center justify-center font-bold transition-all ${
                  inputs.strafeRight ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-900/90 text-slate-400 border border-slate-800'
                }`}
              >
                D
              </div>
              <div
                className={`px-2 h-7 rounded flex items-center justify-center font-bold transition-all ${
                  inputs.jump ? 'bg-emerald-400 text-slate-950 shadow-md' : 'bg-slate-900/90 text-slate-400 border border-slate-800'
                }`}
              >
                JUMP
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* COURSE VICTORY MODAL */}
      {/* ---------------------------------------------------------------- */}
      {finishedTimeMs !== null && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 z-50 pointer-events-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Course Completed!</h2>
            <p className="text-sm text-slate-400 mb-6">
              You cleared <span className="text-amber-300 font-medium">{map.title}</span>
            </p>

            <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 mb-6 grid grid-cols-2 gap-4 text-left font-mono">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Your Time</span>
                <span className="text-xl font-bold text-emerald-400 tabular-nums">{formatTime(finishedTimeMs)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Max Speed</span>
                <span className="text-xl font-bold text-cyan-400 tabular-nums">{maxSpeedRecord} u/s</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={onRestart}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
              >
                Surf Again
              </button>
              {onNextMap && (
                <button
                  onClick={onNextMap}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
                >
                  Next Map
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
