/**
 * iPad & Touchscreen Controller for CS2 Surfing
 * Engineered specifically for tablet ergonomics with multi-touch pointer pooling.
 */

import React, { useRef, useState } from 'react';
import { GameSettings, InputState } from '../types';
import { RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import { surfAudio } from '../audio/surfAudio';

interface TouchControlsProps {
  settings: GameSettings;
  inputsRef: React.MutableRefObject<InputState>;
  onRestart: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  settings,
  inputsRef,
  onRestart,
}) => {
  const lookTouchIdRef = useRef<number | null>(null);
  const lookLastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Joystick state
  const joystickTouchIdRef = useRef<number | null>(null);
  const joystickOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [joystickThumb, setJoystickThumb] = useState<{ x: number; y: number } | null>(null);

  // Active key state for visual feedback
  const [activeKeys, setActiveKeys] = useState<{
    left: boolean;
    right: boolean;
    forward: boolean;
    backward: boolean;
    jump: boolean;
  }>({
    left: false,
    right: false,
    forward: false,
    backward: false,
    jump: false,
  });

  // Size classes
  const sizeConfig = {
    small: {
      btn: 'w-14 h-14 text-xs',
      strafe: 'w-20 h-18 text-xs',
      jump: 'w-16 h-16 text-xs',
    },
    medium: {
      btn: 'w-16 h-16 text-sm',
      strafe: 'w-24 h-22 text-sm',
      jump: 'w-20 h-20 text-sm',
    },
    large: {
      btn: 'w-20 h-20 text-base',
      strafe: 'w-28 h-26 text-base',
      jump: 'w-24 h-24 text-base',
    },
  }[settings.touchButtonSize];

  const opacityStyle = { opacity: settings.touchOpacity };

  // --- Right Screen Camera Drag Surface ---
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    surfAudio.resume();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      // If touch is on right half (or left half if swapped) and look touch not active
      const isLookZone = settings.swapTouchHands
        ? touch.clientX < window.innerWidth * 0.55
        : touch.clientX > window.innerWidth * 0.45;

      if (isLookZone && lookTouchIdRef.current === null) {
        lookTouchIdRef.current = touch.identifier;
        lookLastPosRef.current = { x: touch.clientX, y: touch.clientY };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        const dx = touch.clientX - lookLastPosRef.current.x;
        const dy = touch.clientY - lookLastPosRef.current.y;
        lookLastPosRef.current = { x: touch.clientX, y: touch.clientY };

        inputsRef.current.lookDeltaX += dx;
        inputsRef.current.lookDeltaY += dy;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
      }
    }
  };

  // Joystick touch handlers
  const handleJoystickStart = (e: React.TouchEvent<HTMLDivElement>) => {
    surfAudio.resume();
    e.stopPropagation();
    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;
    const rect = e.currentTarget.getBoundingClientRect();
    const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    joystickOriginRef.current = origin;
    setJoystickThumb({ x: 0, y: 0 });
  };

  const handleJoystickMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        const dx = touch.clientX - joystickOriginRef.current.x;
        const dy = touch.clientY - joystickOriginRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxRadius = 45;
        const clampedDist = Math.min(maxRadius, dist);
        const angle = Math.atan2(dy, dx);

        const thumbX = Math.cos(angle) * clampedDist;
        const thumbY = Math.sin(angle) * clampedDist;
        setJoystickThumb({ x: thumbX, y: thumbY });

        // Map thumb offsets to input
        const deadzone = 12;
        inputsRef.current.strafeLeft = thumbX < -deadzone;
        inputsRef.current.strafeRight = thumbX > deadzone;
        inputsRef.current.forward = thumbY < -deadzone;
        inputsRef.current.backward = thumbY > deadzone;

        setActiveKeys(prev => ({
          ...prev,
          left: thumbX < -deadzone,
          right: thumbX > deadzone,
          forward: thumbY < -deadzone,
          backward: thumbY > deadzone,
        }));
      }
    }
  };

  const handleJoystickEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setJoystickThumb(null);
        inputsRef.current.strafeLeft = false;
        inputsRef.current.strafeRight = false;
        inputsRef.current.forward = false;
        inputsRef.current.backward = false;
        setActiveKeys(prev => ({ ...prev, left: false, right: false, forward: false, backward: false }));
      }
    }
  };

  type BooleanInputKey = 'forward' | 'backward' | 'strafeLeft' | 'strafeRight' | 'jump' | 'crouch';

  // Helper for Strafe / Move Button press
  const bindTouchKey = (key: BooleanInputKey, activeKeyName: keyof typeof activeKeys) => {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        surfAudio.resume();
        e.stopPropagation();
        inputsRef.current[key] = true;
        setActiveKeys(prev => ({ ...prev, [activeKeyName]: true }));
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.stopPropagation();
        inputsRef.current[key] = false;
        setActiveKeys(prev => ({ ...prev, [activeKeyName]: false }));
      },
      onTouchCancel: (e: React.TouchEvent) => {
        e.stopPropagation();
        inputsRef.current[key] = false;
        setActiveKeys(prev => ({ ...prev, [activeKeyName]: false }));
      },
    };
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Invisible Look Drag Area for Tablet Right Thumb */}
      <div
        className={`absolute top-0 bottom-0 pointer-events-auto ${
          settings.swapTouchHands ? 'left-0 w-[55%]' : 'right-0 w-[55%]'
        }`}
      />

      {/* ---------------------------------------------------- */}
      {/* 1. LAYOUT: DEDICATED STRAFE THUMB BUTTONS (DEFAULT) */}
      {/* ---------------------------------------------------- */}
      {settings.touchLayout === 'strafe-buttons' && (
        <div
          className={`absolute bottom-6 pointer-events-auto flex flex-col gap-3 transition-opacity ${
            settings.swapTouchHands ? 'right-6 items-end' : 'left-6 items-start'
          }`}
          style={opacityStyle}
        >
          {/* Secondary Forward / Backward Walk */}
          <div className="flex items-center gap-2 mb-1">
            <button
              {...bindTouchKey('forward', 'forward')}
              aria-label="Walk Forward"
              className={`${sizeConfig.btn} rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-white font-mono flex flex-col items-center justify-center transition-all ${
                activeKeys.forward ? 'bg-amber-500/80 scale-95 border-amber-400' : 'active:bg-slate-800'
              }`}
            >
              <ArrowUp className="w-5 h-5 text-amber-400 mb-0.5" />
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider">FWD</span>
            </button>
            <button
              {...bindTouchKey('backward', 'backward')}
              aria-label="Walk Back"
              className={`${sizeConfig.btn} rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-white font-mono flex flex-col items-center justify-center transition-all ${
                activeKeys.backward ? 'bg-amber-500/80 scale-95 border-amber-400' : 'active:bg-slate-800'
              }`}
            >
              <ArrowDown className="w-5 h-5 text-slate-300 mb-0.5" />
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider">BACK</span>
            </button>
          </div>

          {/* Primary Big Strafe Thumb Triggers */}
          <div className="flex items-center gap-3">
            <button
              {...bindTouchKey('strafeLeft', 'left')}
              aria-label="Strafe Left A"
              className={`${sizeConfig.strafe} rounded-2xl border-2 font-mono flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 ${
                activeKeys.left
                  ? 'bg-cyan-500/90 border-cyan-300 text-white shadow-cyan-500/30'
                  : 'bg-slate-900/85 backdrop-blur-md border-cyan-500/50 text-cyan-300'
              }`}
            >
              <div className="flex items-center gap-1">
                <ArrowLeft className="w-5 h-5 text-cyan-300" />
                <span className="font-bold text-lg">A</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-cyan-200/90 font-medium">Strafe L</span>
            </button>

            <button
              {...bindTouchKey('strafeRight', 'right')}
              aria-label="Strafe Right D"
              className={`${sizeConfig.strafe} rounded-2xl border-2 font-mono flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 ${
                activeKeys.right
                  ? 'bg-amber-500/90 border-amber-300 text-white shadow-amber-500/30'
                  : 'bg-slate-900/85 backdrop-blur-md border-amber-500/50 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="font-bold text-lg">D</span>
                <ArrowRight className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-amber-200/90 font-medium">Strafe R</span>
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. LAYOUT: FLOATING ANALOG JOYSTICK */}
      {/* ---------------------------------------------------- */}
      {settings.touchLayout === 'joystick' && (
        <div
          className={`absolute bottom-8 pointer-events-auto transition-opacity ${
            settings.swapTouchHands ? 'right-10' : 'left-10'
          }`}
          style={opacityStyle}
        >
          <div
            className="w-32 h-32 rounded-full bg-slate-900/80 backdrop-blur-md border-2 border-slate-700/80 relative flex items-center justify-center touch-none"
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
            onTouchCancel={handleJoystickEnd}
          >
            {/* Center Thumb Indicator */}
            <div
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-amber-500 border border-white/60 shadow-lg flex items-center justify-center text-white"
              style={{
                transform: joystickThumb
                  ? `translate(${joystickThumb.x}px, ${joystickThumb.y}px)`
                  : 'translate(0px, 0px)',
                transition: joystickThumb ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              <Compass className="w-6 h-6 opacity-80" />
            </div>
            {/* Direction labels */}
            <span className="absolute top-1 text-[10px] text-slate-400 font-mono">W</span>
            <span className="absolute bottom-1 text-[10px] text-slate-400 font-mono">S</span>
            <span className="absolute left-2 text-[10px] text-cyan-400 font-mono">A</span>
            <span className="absolute right-2 text-[10px] text-amber-400 font-mono">D</span>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. LAYOUT: SPLIT-SCREEN TOUCH ZONES */}
      {/* ---------------------------------------------------- */}
      {settings.touchLayout === 'split-screen' && (
        <div className="absolute inset-0 pointer-events-auto flex">
          <div
            {...bindTouchKey('strafeLeft', 'left')}
            className={`w-1/2 h-full flex items-end p-8 border-r border-white/5 transition-colors ${
              activeKeys.left ? 'bg-cyan-500/10' : 'bg-transparent'
            }`}
          >
            <div className="p-3 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-cyan-500/30 text-cyan-300 font-mono text-sm">
              Tap / Hold: Strafe Left (A)
            </div>
          </div>
          <div
            {...bindTouchKey('strafeRight', 'right')}
            className={`w-1/2 h-full flex items-end justify-end p-8 transition-colors ${
              activeKeys.right ? 'bg-amber-500/10' : 'bg-transparent'
            }`}
          >
            <div className="p-3 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-amber-500/30 text-amber-300 font-mono text-sm">
              Tap / Hold: Strafe Right (D)
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* RIGHT SIDE ACTIONS: JUMP (BHOP) & QUICK RESTART (!r) */}
      {/* ---------------------------------------------------- */}
      <div
        className={`absolute bottom-6 pointer-events-auto flex flex-col items-center gap-3 transition-opacity ${
          settings.swapTouchHands ? 'left-6' : 'right-6'
        }`}
        style={opacityStyle}
      >
        {/* Quick Restart !r */}
        <button
          onClick={() => {
            surfAudio.resume();
            onRestart();
          }}
          aria-label="Restart Run"
          className="w-12 h-12 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-slate-300 flex items-center justify-center active:scale-90 active:bg-rose-950 transition-transform"
        >
          <RotateCcw className="w-5 h-5 text-rose-400" />
        </button>

        {/* Big Jump / Bhop Trigger */}
        <button
          {...bindTouchKey('jump', 'jump')}
          aria-label="Jump / Bhop"
          className={`${sizeConfig.jump} rounded-2xl border-2 font-mono flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 ${
            activeKeys.jump
              ? 'bg-emerald-500/90 border-emerald-300 text-white shadow-emerald-500/30'
              : 'bg-slate-900/85 backdrop-blur-md border-emerald-500/50 text-emerald-300'
          }`}
        >
          <span className="font-bold text-base">JUMP</span>
          <span className="text-[10px] uppercase text-emerald-200/90 font-medium">Bhop</span>
        </button>
      </div>
    </div>
  );
};
