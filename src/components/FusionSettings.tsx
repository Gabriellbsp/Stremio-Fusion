import React from 'react';
import { FusionConfig } from '../types';
import { Settings, ShieldCheck, Filter, Clock, Languages, SlidersHorizontal, Flag, Tv, ArrowUpDown, EyeOff } from 'lucide-react';

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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            Personalização, Aparência e Filtros
          </h3>
          <p className="text-xs text-slate-400">
            Ajuste bandeiras de idioma, resoluções, ordenação e opções avançadas para o Stremio.
          </p>
        </div>
      </div>

      {/* SECTION 1: NAME & DESCRIPTION */}
      <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Nome do Seu Addon Unificado
          </label>
          <input
            type="text"
            value={config.name}
            onChange={e => onChangeConfig({ ...config, name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-medium"
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
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500 text-xs"
            placeholder="Ex: Unificador de streams dublados e legendados em 1 só lugar."
          />
        </div>
      </div>

      {/* SECTION 2: FLAGS & RESOLUTION BADGES */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <Flag className="w-3.5 h-3.5" /> Exibição Visual (Bandeiras & Badges)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Show Language Flags */}
          <div
            onClick={() => updateSetting('showLanguageFlags', !config.settings.showLanguageFlags)}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              config.settings.showLanguageFlags !== false
                ? 'bg-purple-950/20 border-purple-500/40 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                config.settings.showLanguageFlags !== false ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Flag className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Exibir Bandeiras nos Títulos</span>
                <input
                  type="checkbox"
                  checked={config.settings.showLanguageFlags !== false}
                  onChange={() => {}}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Adiciona emojis de bandeira aos links: 🇧🇷 (Dublado/PT-BR), 🇵🇹 (PT-PT), 🇺🇸 (EN), 🇪🇸 (ES), 🇯🇵 (JP).
              </p>
            </div>
          </div>

          {/* Show Resolution Badges */}
          <div
            onClick={() => updateSetting('showResolutionBadges', !config.settings.showResolutionBadges)}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              config.settings.showResolutionBadges !== false
                ? 'bg-purple-950/20 border-purple-500/40 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                config.settings.showResolutionBadges !== false ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Tv className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Exibir Badges de Resolução</span>
                <input
                  type="checkbox"
                  checked={config.settings.showResolutionBadges !== false}
                  onChange={() => {}}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Identifica a qualidade do vídeo com emblemas visuais limpos: ✨ 4K, 📺 1080p, 📹 720p, 📱 480p.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: SORTING & FILTERING */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5" /> Ordenação e Filtros de Qualidade
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sort Order Selector */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
              Critério Principal de Ordenação
            </label>
            <select
              value={config.settings.sortOrder || 'source_priority'}
              onChange={e => updateSetting('sortOrder', e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="quality">✨ Qualidade Primeiro (4K {'>'} 1080p {'>'} 720p)</option>
              <option value="language_pt">🇧🇷 Português / Dublado Primeiro</option>
              <option value="seeders">👥 Maior Número de Sementes (Seeders)</option>
              <option value="source_priority">📋 Prioridade das Fontes (Sua Ordem)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-2">
              Define qual critério vem no topo da lista de reprodução do Stremio.
            </p>
          </div>

          {/* Minimum Resolution Selector */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-purple-400" />
              Filtro de Resolução Mínima
            </label>
            <select
              value={config.settings.minResolution || 'all'}
              onChange={e => updateSetting('minResolution', e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">Todas as Resoluções (Sem filtro)</option>
              <option value="720p">📹 720p ou superior</option>
              <option value="1080p">📺 1080p ou superior (Full HD)</option>
              <option value="4k">✨ Apenas 4K UHD</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-2">
              Oculta torrents de baixíssima resolução abaixo do limite escolhido.
            </p>
          </div>

          {/* Filter CAM / TS / Screener */}
          <div
            onClick={() => updateSetting('filterCamScr', !config.settings.filterCamScr)}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              config.settings.filterCamScr
                ? 'bg-purple-950/20 border-purple-500/40 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                config.settings.filterCamScr ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'
              }`}
            >
              <EyeOff className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Ocultar Gravações de Cinema (CAM / TS)</span>
                <input
                  type="checkbox"
                  checked={!!config.settings.filterCamScr}
                  onChange={() => {}}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Filtra automaticamente versões gravadas de tela de cinema (CAM, HDCAM, TS, Screener).
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
            <div className="flex-1">
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
                Filtra torrents com o mesmo hash para evitar repetições idênticas na lista.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: TIMEOUT SLIDER */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
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
          Se um addon demorar mais que este tempo para responder, o Fusion ignora esse addon lento e entrega o restante sem travar o Stremio!
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
  );
};
