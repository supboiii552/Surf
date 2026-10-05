/**
 * CS2 Surf Clone - Main Application Root
 * Features surf_utopia_njv, companion maps, Source physics, iPad controls,
 * and school blocker stealth cloaking & offline PWA capabilities.
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameSettings, InputState, MapRecord } from './types';
import { ALL_MAPS } from './maps/mapData';
import { SurfCanvas } from './components/SurfCanvas';
import { SurfHUD } from './components/SurfHUD';
import { TouchControls } from './components/TouchControls';
import { SettingsModal } from './components/SettingsModal';
import { MapSelectorModal } from './components/MapSelectorModal';
import { TutorialModal } from './components/TutorialModal';
import { PanicScreen } from './components/PanicScreen';
import { PWAInstallModal } from './components/PWAInstallModal';
import { GitHubDeployModal } from './components/GitHubDeployModal';
import { CloudflareDeployModal } from './components/CloudflareDeployModal';
import { surfAudio } from './audio/surfAudio';
import { applyStealthPreset, getSavedStealthPreset } from './utils/stealth';

const DEFAULT_SETTINGS: GameSettings = {
  // Controls
  touchLayout: 'strafe-buttons',
  touchButtonSize: 'medium',
  touchOpacity: 0.85,
  swapTouchHands: false,
  touchSensitivity: 1.2,
  mouseSensitivity: 1.5,
  invertY: false,

  // Physics
  physicsPreset: 'cs2-authentic',
  airAccelerate: 150,
  maxAirSpeed: 30,
  gravity: 800,
  rampStickAssist: false,
  autoBhop: true,
  subTickSmooth: true,

  // Display & Audio
  fov: 90,
  showSpeedo: true,
  showKeypressHUD: true,
  showCrosshair: true,
  knifeModel: true,
  speedLines: true,
  soundEnabled: true,
  volume: 0.5,
  stealthPreset: 'default',
};

export default function App() {
  // Active map
  const [activeMapId, setActiveMapId] = useState<string>('surf_utopia_njv');
  const activeMap = ALL_MAPS[activeMapId] || ALL_MAPS.surf_utopia_njv;

  // Settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('cs2_surf_settings');
      const initial = saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
      initial.stealthPreset = getSavedStealthPreset();
      return initial;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Records
  const [records, setRecords] = useState<Record<string, MapRecord>>(() => {
    try {
      const saved = localStorage.getItem('cs2_surf_records');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Live HUD telemetry
  const [speed, setSpeed] = useState(0);
  const [stage, setStage] = useState(1);
  const [timerMs, setTimerMs] = useState(0);
  const [isOnRamp, setIsOnRamp] = useState(false);
  const [finishedTimeMs, setFinishedTimeMs] = useState<number | null>(null);
  const [maxSpeedSession, setMaxSpeedSession] = useState(0);
  const [restartTrigger, setRestartTrigger] = useState(0);

  // Modals & Evasive Features
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMapSelectorOpen, setIsMapSelectorOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);
  const [isGitHubDeployOpen, setIsGitHubDeployOpen] = useState(false);
  const [isCloudflareDeployOpen, setIsCloudflareDeployOpen] = useState(false);

  // Input state shared ref (polled by simulation loop)
  const inputsRef = useRef<InputState>({
    forward: false,
    backward: false,
    strafeLeft: false,
    strafeRight: false,
    jump: false,
    crouch: false,
    lookDeltaX: 0,
    lookDeltaY: 0,
  });

  // Copy for React HUD keypress rendering
  const [hudInputs, setHudInputs] = useState<InputState>({ ...inputsRef.current });

  // Initialize stealth cloaking on mount
  useEffect(() => {
    applyStealthPreset(settings.stealthPreset);
  }, [settings.stealthPreset]);

  // Handle audio mute on panic
  useEffect(() => {
    if (isPanicActive) {
      surfAudio.setVolume(0, false);
    } else {
      surfAudio.setVolume(settings.volume, settings.soundEnabled);
    }
  }, [isPanicActive, settings.volume, settings.soundEnabled]);

  // Save settings on update
  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('cs2_surf_settings', JSON.stringify(newSettings));
    } catch {}
  };

  // Keyboard controls listener (WASD, Space, R, ~, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Panic button: Grave / Tilde key (`)
      if (e.code === 'Backquote') {
        e.preventDefault();
        setIsPanicActive(prev => !prev);
        return;
      }

      if (isPanicActive) return;

      surfAudio.resume();

      if (e.code === 'KeyW' || e.code === 'ArrowUp') inputsRef.current.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') inputsRef.current.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') inputsRef.current.strafeLeft = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') inputsRef.current.strafeRight = true;
      if (e.code === 'Space') {
        inputsRef.current.jump = true;
        if (!settings.autoBhop) surfAudio.playJump();
      }
      if (e.code === 'ControlLeft' || e.code === 'KeyC') inputsRef.current.crouch = true;

      // Quick restart with 'R'
      if (e.code === 'KeyR' && !e.metaKey && !e.ctrlKey) {
        handleRestart();
      }

      // Escape to open/close settings
      if (e.code === 'Escape') {
        setIsSettingsOpen(prev => !prev);
      }

      setHudInputs({ ...inputsRef.current });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isPanicActive) return;

      if (e.code === 'KeyW' || e.code === 'ArrowUp') inputsRef.current.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') inputsRef.current.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') inputsRef.current.strafeLeft = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') inputsRef.current.strafeRight = false;
      if (e.code === 'Space') inputsRef.current.jump = false;
      if (e.code === 'ControlLeft' || e.code === 'KeyC') inputsRef.current.crouch = false;

      setHudInputs({ ...inputsRef.current });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [settings.autoBhop, isPanicActive]);

  // Restart handler
  const handleRestart = () => {
    setFinishedTimeMs(null);
    setTimerMs(0);
    setStage(1);
    setRestartTrigger(prev => prev + 1);
  };

  // Course Finish handler
  const handleFinishCourse = (timeMs: number, maxSpeed: number) => {
    setFinishedTimeMs(timeMs);
    setMaxSpeedSession(maxSpeed);

    // Update records
    const currentRec = records[activeMapId] || { bestTime: null, maxSpeed: 0, completions: 0 };
    const newBest = currentRec.bestTime === null ? timeMs : Math.min(currentRec.bestTime, timeMs);
    const newMaxSpeed = Math.max(currentRec.maxSpeed, maxSpeed);

    const updatedRecords = {
      ...records,
      [activeMapId]: {
        bestTime: newBest,
        maxSpeed: newMaxSpeed,
        completions: currentRec.completions + 1,
      },
    };
    setRecords(updatedRecords);
    try {
      localStorage.setItem('cs2_surf_records', JSON.stringify(updatedRecords));
    } catch {}
  };

  // Switch to next map in rotation
  const handleNextMap = () => {
    const mapKeys = Object.keys(ALL_MAPS);
    const currIdx = mapKeys.indexOf(activeMapId);
    const nextIdx = (currIdx + 1) % mapKeys.length;
    setActiveMapId(mapKeys[nextIdx]);
    handleRestart();
  };

  const currentPB = records[activeMapId]?.bestTime ?? null;
  const currentMaxSpeed = records[activeMapId]?.maxSpeed ?? 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none touch-none">
      {/* 3D WebGL Canvas */}
      <SurfCanvas
        map={activeMap}
        settings={settings}
        inputsRef={inputsRef}
        onSpeedChange={setSpeed}
        onStageChange={setStage}
        onTimerChange={setTimerMs}
        onFinishCourse={handleFinishCourse}
        onRampStatusChange={setIsOnRamp}
        restartTrigger={restartTrigger}
      />

      {/* CS2 Surf Overlay HUD */}
      <SurfHUD
        map={activeMap}
        settings={settings}
        speed={speed}
        stage={stage}
        timerMs={timerMs}
        personalBestMs={currentPB}
        maxSpeedRecord={currentMaxSpeed}
        isOnRamp={isOnRamp}
        inputs={hudInputs}
        finishedTimeMs={finishedTimeMs}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMapSelector={() => setIsMapSelectorOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onRestart={handleRestart}
        onNextMap={handleNextMap}
        onTriggerPanic={() => setIsPanicActive(true)}
        onOpenPWAInstall={() => setIsPWAInstallOpen(true)}
      />

      {/* iPad & Touchscreen Ergonomic Controls */}
      <TouchControls
        settings={settings}
        inputsRef={inputsRef}
        onRestart={handleRestart}
      />

      {/* Emergency Stealth Panic Screen */}
      {isPanicActive && (
        <PanicScreen onResume={() => setIsPanicActive(false)} />
      )}

      {/* Modals & Drawers */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
          onOpenPWAInstall={() => setIsPWAInstallOpen(true)}
          onOpenGitHubDeploy={() => setIsGitHubDeployOpen(true)}
          onOpenCloudflareDeploy={() => setIsCloudflareDeployOpen(true)}
          onTriggerPanic={() => setIsPanicActive(true)}
        />
      )}

      {isMapSelectorOpen && (
        <MapSelectorModal
          currentMapId={activeMapId}
          records={records}
          onSelectMap={id => {
            setActiveMapId(id);
            handleRestart();
          }}
          onClose={() => setIsMapSelectorOpen(false)}
        />
      )}

      {isTutorialOpen && (
        <TutorialModal onClose={() => setIsTutorialOpen(false)} />
      )}

      {isPWAInstallOpen && (
        <PWAInstallModal onClose={() => setIsPWAInstallOpen(false)} />
      )}

      {isGitHubDeployOpen && (
        <GitHubDeployModal onClose={() => setIsGitHubDeployOpen(false)} />
      )}

      {isCloudflareDeployOpen && (
        <CloudflareDeployModal onClose={() => setIsCloudflareDeployOpen(false)} />
      )}
    </div>
  );
}
