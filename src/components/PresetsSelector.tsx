import React from 'react';
import { POPULAR_PRESETS } from '../data/presets';
import { AddonPreset, SourceAddon } from '../types';
import { Plus, Check, ExternalLink, Sparkles } from 'lucide-react';

interface PresetsSelectorProps {
  existingSources: SourceAddon[];
  onAddPreset: (preset: AddonPreset) => void;
}

export const PresetsSelector: React.FC<PresetsSelectorProps> = ({ existingSources, onAddPreset }) => {
  const isAdded = (url: string) => {
    return existingSources.some(s => s.manifestUrl.toLowerCase() === url.toLowerCase());
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Addons Recomendados (1-Clique)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Adicione Addons populares pré-configurados como Brazuca Torrents e Torrentio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {POPULAR_PRESETS.map((preset) => {
          const added = isAdded(preset.manifestUrl);
          return (
            <div
              key={preset.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                added
                  ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                  : 'bg-slate-800/40 border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-800/80 text-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-slate-100">{preset.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {preset.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {preset.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {preset.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700/40">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded">
                  Tag: {preset.recommendedPrefix}
                </span>

                <button
                  onClick={() => !added && onAddPreset(preset)}
                  disabled={added}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    added
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 active:scale-95'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Adicionado
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
