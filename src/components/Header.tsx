import React from 'react';
import { Layers, ShieldCheck, Sparkles, Tv } from 'lucide-react';

interface HeaderProps {
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeCount }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Stremio Fusion</h1>
              <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Unificador
              </span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                v2.2.0 (Atualizado!)
              </span>
            </div>
            <p className="text-xs text-slate-400">Mesclador de Addons Stremio (Brazuca + Torrents)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg">
            <Tv className="w-4 h-4 text-emerald-400" />
            <span>Addons Ativos:</span>
            <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {activeCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Tolerância a Falhas</span>
          </div>
        </div>
      </div>
    </header>
  );
};
