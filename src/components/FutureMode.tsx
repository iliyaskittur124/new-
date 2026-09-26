"use client";

import { useState } from 'react';
import { runSimulation, clearSimulations } from '@/lib/api';
import { Activity, RefreshCw, Trash2, ArrowRight, ArrowDown } from 'lucide-react';

export default function FutureMode({ onUpdate }: { onUpdate: () => void }) {
  const [rainfall, setRainfall] = useState(100);
  const [temp, setTemp] = useState(35);
  const [loading, setLoading] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    await runSimulation(rainfall, temp);
    setHasSimulated(true);
    await onUpdate(); // Refresh global risks
    setLoading(false);
  };

  const handleClear = async () => {
    setLoading(true);
    await clearSimulations();
    setHasSimulated(false);
    setRainfall(100);
    setTemp(35);
    await onUpdate();
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity size={18} className="text-blue-400"/> 
          Future Mode (What-If Engine)
        </h3>
        {hasSimulated && (
          <button onClick={handleClear} disabled={loading} className="text-xs flex items-center gap-1 text-slate-300 hover:text-red-400">
            <Trash2 size={14} /> Clear
          </button>
        )}
      </div>
      
      <div className="p-5 flex-1 overflow-y-auto">
        <p className="text-sm text-slate-500 mb-6">
          Adjust environmental parameters to simulate possible cascading consequences across India using the Master AI logic. Scenarios are saved directly to the Supabase database.
        </p>

        {/* Inputs */}
        <div className="space-y-6 mb-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Rainfall Intensity (mm)</label>
              <span className="text-sm font-bold text-blue-600">{rainfall} mm</span>
            </div>
            <input 
              type="range" min="0" max="300" step="10" 
              value={rainfall} onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Peak Temperature (°C)</label>
              <span className="text-sm font-bold text-red-600">{temp} °C</span>
            </div>
            <input 
              type="range" min="20" max="50" step="1" 
              value={temp} onChange={(e) => setTemp(Number(e.target.value))}
              className="w-full accent-red-600"
            />
          </div>
        </div>

        <button 
          onClick={handleSimulate} 
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <Activity size={18} />}
          {loading ? 'Running AI Simulation...' : 'Simulate Future'}
        </button>

        {/* Risk Chain Explanation */}
        {hasSimulated && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">AI Risk Chain Analysis</h4>
            
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              {rainfall > 120 && (
                <div className="flex flex-col gap-2 mb-4">
                  <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded text-sm font-medium">Trigger: Heavy Rainfall ({rainfall}mm)</div>
                  <ArrowDown size={16} className="mx-auto text-slate-400" />
                  <div className="bg-cyan-100 text-cyan-800 px-3 py-2 rounded text-sm font-medium">Impact 1: Urban Drainage Failure</div>
                  <ArrowDown size={16} className="mx-auto text-slate-400" />
                  <div className="bg-red-100 text-red-800 px-3 py-2 rounded text-sm font-medium">Impact 2: Severe Traffic Gridlock</div>
                </div>
              )}

              {temp > 42 && (
                <div className="flex flex-col gap-2 mb-4">
                  <div className="bg-red-100 text-red-800 px-3 py-2 rounded text-sm font-medium">Trigger: Extreme Heat ({temp}°C)</div>
                  <ArrowDown size={16} className="mx-auto text-slate-400" />
                  <div className="bg-orange-100 text-orange-800 px-3 py-2 rounded text-sm font-medium">Impact 1: Peak Energy Demand</div>
                  <ArrowDown size={16} className="mx-auto text-slate-400" />
                  <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded text-sm font-medium">Impact 2: Power Grid Overload</div>
                </div>
              )}

              {(rainfall <= 120 && temp <= 42) && (
                <div className="text-sm text-emerald-600 font-medium text-center py-4">
                  Parameters within safe operational limits. No major cascading risks detected.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
