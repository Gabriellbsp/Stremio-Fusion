import React from 'react';
import { FusionConfig } from '../types';
import { Settings, ShieldCheck, Filter, Clock, Languages, SlidersHorizontal } from 'lucide-react';

interface FusionSettingsProps {
  config: FusionConfig;
  onChangeConfig: (newConfig: FusionConfig) => void;
}

export const FusionSettings: React.FC<FusionSettingsProps> = ({ config, onChangeConfig }) => {
  const updateSetting = <K extends keyof FusionConfig['settings']>(key: K, value: FusionConfig['settings'][K]) => {
    onChangeConfig({
      ...config,
      settings: {
        ...config.settings,
        [key]: value
      }
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            Configurações de Regras & Filtros
          </h3>
          <p className="text-xs text-slate-400">
            Todos os torrents (Inglês, Português, Espanhol, Russo, etc.) são mantidos sem remoção de links.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name & Description */}
        <div className="space-y-3 md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nome do Seu Addon Unificado
            </label>
            <input
              type="text"
              value={config.name}
              onChange={e => onChangeConfig({ ...config, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              placeholder="Ex: Fusion Streams (Brazuca + Torrentio)"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Descrição do Addon
            </label>
            <input
              type="text"
              value={config.description}
              onChange={e => onChangeConfig({ ...config, description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              placeholder="Ex: Addon unificado com streams dublados e legendados em 1 só lugar."
            />
          </div>
        </div>

        {/* Prioritize PT-BR / Brazuca */}
        <div
          onClick={() => updateSetting('prioritizePortuguese', !config.settings.prioritizePortuguese)}
          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
            config.settings.prioritizePortuguese
              ? 'bg-purple-950/20 border-purple-500/40 text-white'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              config.settings.prioritizePortuguese ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'
            }`}
          >
            <Languages className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Priorizar Conteúdo em Português (PT-BR)</span>
              <input
                type="checkbox"
                checked={config.settings.prioritizePortuguese}
                onChange={() => {}}
                className="w-4 h-4 accent-purple-600 rounded"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Coloca torrents PT-BR / Dublado no topo se encontrados, mas NENHUM torrent de outro idioma é ocultado. Se desativado, mantém a ordem original bruta de todas as fontes.
            </p>
          </div>
        </div>

        {/* Remove Duplicates */}
        <div
          onClick={() => updateSetting('removeDuplicates', !config.settings.removeDuplicates)}
          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
            config.settings.removeDuplicates
              ? 'bg-purple-950/20 border-purple-500/40 text-white'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              config.settings.removeDuplicates ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'
            }`}
          >
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Remover Torrents Duplicados</span>
              <input
                type="checkbox"
                checked={config.settings.removeDuplicates}
                onChange={() => {}}
                className="w-4 h-4 accent-purple-600 rounded"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Filtra hashes de torrent repetidos entre o Brazuca, Torrentio e outros addons para manter a lista limpa.
            </p>
          </div>
        </div>

        {/* Timeout Slider */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">Tempo Limite por Addon (Timeout)</span>
            </div>
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              {config.settings.maxTimeoutMs / 1000}s
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Se o Brazuca ou outro Addon demorar mais que esse tempo para responder, o Fusion ignora esse addon e retorna os demais sem travar o Stremio!
          </p>
          <input
            type="range"
            min={3000}
            max={15000}
            step={1000}
            value={config.settings.maxTimeoutMs}
            onChange={e => updateSetting('maxTimeoutMs', Number(e.target.value))}
            className="w-full accent-purple-600 bg-slate-800 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>3s (Ultra Rápido)</span>
            <span>8s (Recomendado)</span>
            <span>15s (Máxima Busca)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
