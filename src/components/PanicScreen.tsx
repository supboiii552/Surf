/**
 * Panic / Stealth Disguise Screen
 * Instantly masks the game behind an authentic Physics & Mathematics Worksheet.
 */

import React, { useState } from 'react';
import { BookOpen, Calculator, FileText, Play, Check } from 'lucide-react';

interface PanicScreenProps {
  onResume: () => void;
}

export const PanicScreen: React.FC<PanicScreenProps> = ({ onResume }) => {
  const [calcInput, setCalcInput] = useState('9.81 * sin(45)');
  const [calcResult, setCalcResult] = useState('6.936 m/s²');
  const [studentNotes, setStudentNotes] = useState(
    'Lab 4: Vector Kinematics on Incline Surfaces\n\n1. Velocity vector components must be projected onto the ramp normal.\n2. In frictionless conditions, kinetic energy is preserved along the incline.\n3. Terminal velocity reached at equilibrium with air drag coefficient.'
  );

  const calculate = () => {
    try {
      // Simple safe evaluation of basic math
      const clean = calcInput.replace(/sin\(45\)/g, '0.7071').replace(/cos\(45\)/g, '0.7071');
      // eslint-disable-next-line no-eval
      const res = Function(`"use strict"; return (${clean})`)();
      setCalcResult(`${Number(res).toFixed(3)} units`);
    } catch {
      setCalcResult('Syntax Error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 text-slate-100 flex flex-col font-sans select-text pointer-events-auto">
      {/* Top Academic Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-sm text-slate-200">
            AP Physics C: Mechanics — Unit 3: Inclined Surface Kinematics
          </span>
        </div>

        <button
          onClick={onResume}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Resume Lab (or press `)</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Equations & Reference */}
        <div className="md:col-span-1 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Governing Equations</span>
            </h3>
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Ramp Normal Force</span>
                <span>F_N = m · g · cos(θ)</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Parallel Acceleration</span>
                <span>a_∥ = g · sin(θ) - μ_k · g · cos(θ)</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Kinematic Velocity</span>
                <span>v_f² = v_i² + 2 · a · Δx</span>
              </div>
            </div>
          </div>

          {/* Quick Scientific Calculator */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Vector Calculator</span>
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                value={calcInput}
                onChange={e => setCalcInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && calculate()}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={calculate}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200"
                >
                  Compute
                </button>
                <span className="text-xs font-mono font-bold text-emerald-400">{calcResult}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Student Lab Notebook */}
        <div className="md:col-span-2 flex flex-col p-5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
              Student Experimental Notes
            </h3>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Auto-saved to Cloud
            </span>
          </div>

          <textarea
            value={studentNotes}
            onChange={e => setStudentNotes(e.target.value)}
            className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed resize-none focus:outline-none focus:border-slate-700"
            rows={14}
            placeholder="Type physics observations here..."
          />
        </div>
      </div>
    </div>
  );
};
