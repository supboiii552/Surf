/**
 * CS2 Surf Map Selector Modal
 * Displays available maps with difficulty tiers, stage counts, and personal best records.
 */

import React from 'react';
import { MapDefinition, MapRecord } from '../types';
import { ALL_MAPS } from '../maps/mapData';
import { X, Trophy, Compass, Check } from 'lucide-react';

interface MapSelectorModalProps {
  currentMapId: string;
  records: Record<string, MapRecord>;
  onSelectMap: (mapId: string) => void;
  onClose: () => void;
}

function formatTime(ms: number | null): string {
  if (!ms) return '--:--.---';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor(ms % 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

export const MapSelectorModal: React.FC<MapSelectorModalProps> = ({
  currentMapId,
  records,
  onSelectMap,
  onClose,
}) => {
  const mapList = Object.values(ALL_MAPS);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 pointer-events-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Select Surf Map</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Map Selector"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {mapList.map((map: MapDefinition) => {
            const isSelected = map.id === currentMapId;
            const record = records[map.id] || { bestTime: null, maxSpeed: 0, completions: 0 };

            return (
              <div
                key={map.id}
                onClick={() => {
                  onSelectMap(map.id);
                  onClose();
                }}
                className={`group relative p-5 rounded-2xl border cursor-pointer transition-all duration-200 text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90'
                }`}
              >
                <div>
                  {/* Top line: Map name & Tier */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="font-bold text-base text-white tracking-tight group-hover:text-amber-300 transition-colors">
                      {map.title}
                    </h3>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-amber-500 text-slate-950">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Clean unboxed metadata with separators */}
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2.5">
                    <span>{map.name}</span>
                    <span aria-hidden="true">·</span>
                    <span>Tier {map.tier}</span>
                    <span aria-hidden="true">·</span>
                    <span>{map.stages} Stages</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {map.description}
                  </p>
                </div>

                {/* Personal best records */}
                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-slate-500">PB:</span>
                    <span className="font-bold text-amber-300 tabular-nums">
                      {formatTime(record.bestTime)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-300 justify-end">
                    <span className="text-slate-500">Peak:</span>
                    <span className="font-bold text-cyan-400 tabular-nums">
                      {record.maxSpeed > 0 ? `${record.maxSpeed} u/s` : '--'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
