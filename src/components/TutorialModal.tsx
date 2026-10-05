/**
 * CS2 Surf Tutorial & Mechanics Guide
 * Explains Source engine ramp physics, A/D strafing, and iPad touch tips.
 */

import React from 'react';
import { X, HelpCircle, ArrowRight, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 pointer-events-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">How to Surf in CS2</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Guide"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
          {/* Rule #1 Banner */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-rose-300 text-sm mb-1">The Golden Rule: Never Hold W on Ramps!</h3>
              <p className="text-xs text-rose-200/80 leading-relaxed">
                In Source engine surfing, holding W pushes your character straight down into the ramp slope, causing you to slide off and lose all momentum. Only use A and D while surfing!
              </p>
            </div>
          </div>

          {/* Core mechanics */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">1. Mounting the Ramp</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">Right Side of Ramp:</span>
                <p className="text-xs text-slate-400">
                  Hold <span className="font-mono font-bold text-white">A (Strafe Left)</span> to push your body against the slope. Smoothly guide your camera along the ramp curve.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">Left Side of Ramp:</span>
                <p className="text-xs text-slate-400">
                  Hold <span className="font-mono font-bold text-white">D (Strafe Right)</span> to push your body against the slope. Smoothly guide your camera along the ramp curve.
                </p>
              </div>
            </div>
          </div>

          {/* Gaining Speed & Air Strafing */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>2. Air Strafing in Midair</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When launching off a ramp into the air, synchronize your strafe key with your camera:
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Hold <span className="text-white font-mono font-bold">A</span> while turning camera <span className="text-cyan-300 font-semibold">Left</span> to curve left and gain speed.</li>
              <li>Hold <span className="text-white font-mono font-bold">D</span> while turning camera <span className="text-amber-300 font-semibold">Right</span> to curve right and gain speed.</li>
            </ul>
          </div>

          {/* iPad / Touchscreen Tips */}
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-cyan-300 text-sm mb-1">iPad & Touch Controls</h3>
              <p className="text-xs text-cyan-200/80 leading-relaxed mb-2">
                Use your left thumb to hold the dedicated <span className="font-bold text-cyan-300">A</span> or <span className="font-bold text-amber-300">D</span> triggers. Drag anywhere on the right half of the screen with your right thumb to steer effortlessly.
              </p>
              <p className="text-xs text-slate-400">
                You can toggle Joystick mode, resize buttons, or adjust sensitivity anytime in <span className="text-white font-medium">Settings</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
          >
            Got It, Let&apos;s Surf!
          </button>
        </div>
      </div>
    </div>
  );
};
