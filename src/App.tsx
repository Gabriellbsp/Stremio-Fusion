import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PresetsSelector } from './components/PresetsSelector';
import { AddonManager } from './components/AddonManager';
import { FusionSettings } from './components/FusionSettings';
import { ExportInstallCard } from './components/ExportInstallCard';
import { StreamTester } from './components/StreamTester';
import { AddonPreset, FusionConfig, SourceAddon } from './types';
import { POPULAR_PRESETS } from './data/presets';
import { Layers, Sliders, Tv, Zap, HelpCircle, ChevronRight, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

const INITIAL_CONFIG: FusionConfig = {
  name: 'Fusion Stream (Brazuca + Torrentio)',
  description: 'Unificador de Addons do Stremio: mídias do Brazuca e Torrentio em um só lugar.',
  sources: [
    {
      id: 'src_brazuca_1',
      name: 'Brazuca Torrents',
      manifestUrl: 'https://brazucatorrents.baby-beamup.club/manifest.json',
      enabled: true,
      prefixTag: '🇧🇷 Brazuca',
      priority: 1,
      timeoutMs: 8000,
      lastHealthCheck: { status: 'ok', responseTimeMs: 340, checkedAt: 'Agora' }
    },
    {
      id: 'src_torrentio_2',
      name: 'Torrentio',
      manifestUrl: 'https://torrentio.strem.fun/manifest.json',
      enabled: true,
      prefixTag: '⚡ Torrentio',
      priority: 2,
      timeoutMs: 8000,
      lastHealthCheck: { status: 'ok', responseTimeMs: 280, checkedAt: 'Agora' }
    },
    {
      id: 'src_knightcrawler_3',
      name: 'KnightCrawler',
      manifestUrl: 'https://knightcrawler.elfhosted.com/manifest.json',
      enabled: true,
      prefixTag: '🗡️ KnightCrawler',
      priority: 3,
      timeoutMs: 8000,
      lastHealthCheck: { status: 'ok', responseTimeMs: 250, checkedAt: 'Agora' }
    }
  ],
  settings: {
    prioritizePortuguese: true,
    removeDuplicates: true,
    tagSourceNames: true,
    maxTimeoutMs: 8000,
    sortOrder: 'source_priority',
    groupStreamsBySource: false
  }
};

export default function App() {
  const [config, setConfig] = useState<FusionConfig>(() => {
    try {
      const saved = localStorage.getItem('stremio_fusion_config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to read from localStorage', e);
    }
    return INITIAL_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<'manager' | 'settings' | 'tester' | 'guide'>('manager');

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('stremio_fusion_config', JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [config]);

  const handleUpdateSources = (sources: SourceAddon[]) => {
    setConfig(prev => ({ ...prev, sources }));
  };

  const handleAddPreset = (preset: AddonPreset) => {
    const newAddon: SourceAddon = {
      id: `src_preset_${preset.id}_${Date.now()}`,
      name: preset.name,
      manifestUrl: preset.manifestUrl,
      enabled: true,
      prefixTag: preset.recommendedPrefix,
      priority: config.sources.length + 1,
      timeoutMs: 8000,
      lastHealthCheck: { status: 'ok', responseTimeMs: 300, checkedAt: 'Agora' }
    };

    setConfig(prev => ({
      ...prev,
      sources: [...prev.sources, newAddon]
    }));
  };

  const activeSourcesCount = config.sources.filter(s => s.enabled).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <Header activeCount={activeSourcesCount} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TOP INSTALLATION CARRIER CARD */}
        <ExportInstallCard config={config} />

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('manager')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'manager'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Gerenciar Addons ({config.sources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Regras & Filtros PT-BR</span>
          </button>

          <button
            onClick={() => setActiveTab('tester')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'tester'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Testador de Streams Live</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Como Funciona (Evitando Erros)</span>
          </button>
        </div>

        {/* TAB 1: ADDON MANAGER & PRESETS */}
        {activeTab === 'manager' && (
          <div className="space-y-8">
            <PresetsSelector existingSources={config.sources} onAddPreset={handleAddPreset} />
            <AddonManager sources={config.sources} onUpdateSources={handleUpdateSources} />
          </div>
        )}

        {/* TAB 2: SETTINGS & FILTERS */}
        {activeTab === 'settings' && (
          <FusionSettings config={config} onChangeConfig={setConfig} />
        )}

        {/* TAB 3: STREAM TESTER */}
        {activeTab === 'tester' && (
          <StreamTester config={config} />
        )}

        {/* TAB 4: HOW IT WORKS & GUIDANCE */}
        {activeTab === 'guide' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Por que o AiStream costuma dar erro no Brazuca?</h3>
                <p className="text-xs text-slate-400">Como o Stremio Fusion resolve esse problema de conexão:</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold">
                  <AlertTriangle className="w-4 h-4" /> Problemas comuns do AiStream / iostream
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Se um addon (como o Brazuca) demorar mais de 3 segundos, o AiStream falhava a requisição inteira.</li>
                  <li>Incompatibilidade de protocolo entre links `stremio://` e redirecionamentos `https://`.</li>
                  <li>Falta de timeout isolado por addon — um servidor fora do ar travava todos os outros torrents.</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Solução Implementada no Stremio Fusion
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li><strong>Busca Concorrente Isolada (`Promise.allSettled`):</strong> O Fusion chama o Brazuca e o Torrentio ao mesmo tempo. Se um falhar, os resultados do outro são entregues normalmente!</li>
                  <li><strong>Timeout Inteligente Configurável:</strong> Define um limite tolerante de até 8s para addons brasileiros responderem com calma.</li>
                  <li><strong>Deduplicação e Tags Personalizadas:</strong> Identifique os arquivos do Brazuca com o prefixo `[🇧🇷 Brazuca]` logo no topo da lista.</li>
                </ul>
              </div>
            </div>

            <div className="bg-purple-950/20 border border-purple-500/30 p-4 rounded-xl">
              <h4 className="text-sm font-bold text-white mb-2">Passo a Passo para Usar no Stremio:</h4>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                <li>No topo desta página, clique no botão <strong>"Instalar no Stremio"</strong> ou copie o link `stremio://...`.</li>
                <li>O aplicativo do Stremio abrirá mostrando a tela de instalação do seu Addon Unificado.</li>
                <li>Clique em <strong>"Instalar"</strong>.</li>
                <li>Pronto! Agora quando você pesquisar qualquer filme ou série no Stremio, todos os streams do Brazuca, Torrentio e de outros addons aparecerão juntos em uma única lista organizada!</li>
              </ol>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Stremio Addon Fusion © 2026 — Mesclador Inteligente de Fontes de Torrent</span>
          <span className="text-purple-400/80 font-mono">Brazuca + Torrentio + Provedores Customizados</span>
        </div>
      </footer>
    </div>
  );
}
