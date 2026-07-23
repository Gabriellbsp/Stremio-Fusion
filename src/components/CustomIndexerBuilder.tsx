import React, { useState } from 'react';
import { FusionConfig, SourceAddon } from '../types';
import { Database, Plus, Check, Trash2, Zap, ShieldCheck, Globe, Search, ArrowUp, ArrowDown, ExternalLink, RefreshCw, Layers } from 'lucide-react';

interface CustomIndexerBuilderProps {
  config: FusionConfig;
  onChangeConfig: React.Dispatch<React.SetStateAction<FusionConfig>>;
}

interface PopularIndexer {
  id: string;
  name: string;
  description: string;
  manifestUrl: string;
  tag: string;
  category: string;
}

const POPULAR_BR_INDEXERS: PopularIndexer[] = [
  {
    id: 'comando-torrents',
    name: 'Comando Torrents',
    description: 'Catálogo do Comando Torrents focado em filmes e séries com dublagem PT-BR.',
    manifestUrl: 'https://comando-torrents.baby-beamup.club/manifest.json',
    tag: '🏴‍☠️ Comando BR',
    category: 'Indexador BR'
  },
  {
    id: 'mico-leao',
    name: 'Míco Leão Dublado',
    description: 'Especializado em desenhos, animações e filmes dublados em Português.',
    manifestUrl: 'https://micoleao.baby-beamup.club/manifest.json',
    tag: '🦁 MícoLeão',
    category: 'Indexador BR'
  },
  {
    id: 'bluedev-br',
    name: 'BlueDev BR',
    description: 'Indexador com acervo nacional e episódios de séries brasileiras.',
    manifestUrl: 'https://bluedev-stremio.vercel.app/manifest.json',
    tag: '🔵 BlueDev',
    category: 'Indexador BR'
  },
  {
    id: 'brazuca-torrents',
    name: 'Brazuca Torrents',
    description: 'Rastreador consolidado para conteúdos dublados, legendados e nacionais PT-BR.',
    manifestUrl: 'https://brazucatorrents.baby-beamup.club/manifest.json',
    tag: '🇧🇷 Brazuca',
    category: 'Indexador BR'
  },
  {
    id: 'torrentio-br',
    name: 'Torrentio (Filtro Áudio PT-BR)',
    description: 'Versão do Torrentio configurada especificamente com filtro para áudio em Português.',
    manifestUrl: 'https://torrentio.strem.fun/sort=quality|qualityfilter=scr,cam|language=portuguese/manifest.json',
    tag: '⚡ Torrentio BR',
    category: 'Indexador Global/BR'
  },
  {
    id: 'lapada-torrents',
    name: 'Lapada Torrents',
    description: 'Provedor de torrents nacionais e lançamentos dublados.',
    manifestUrl: 'https://lapadatorrents.baby-beamup.club/manifest.json',
    tag: '🔥 Lapada',
    category: 'Indexador BR'
  }
];

export function CustomIndexerBuilder({ config, onChangeConfig }: CustomIndexerBuilderProps) {
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [testImdbId, setTestImdbId] = useState('tt1190634'); // The Boys
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const isAlreadyAdded = (url: string) => {
    return config.sources.some(s => s.manifestUrl.trim() === url.trim());
  };

  const handleAddIndexer = (name: string, url: string, tag: string) => {
    if (!name || !url) return;

    if (isAlreadyAdded(url)) {
      alert('Este indexador já está na sua lista de fontes do Plugins BR!');
      return;
    }

    const newIndexer: SourceAddon = {
      id: `src_idx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name,
      manifestUrl: url.trim(),
      enabled: true,
      prefixTag: tag || `🇧🇷 ${name}`,
      priority: config.sources.length + 1,
      timeoutMs: 8000,
      lastHealthCheck: { status: 'ok', responseTimeMs: 250, checkedAt: 'Agora' }
    };

    onChangeConfig(prev => ({
      ...prev,
      sources: [...prev.sources, newIndexer]
    }));

    setCustomName('');
    setCustomUrl('');
    setCustomTag('');
  };

  const handleToggleSource = (id: string) => {
    onChangeConfig(prev => ({
      ...prev,
      sources: prev.sources.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    }));
  };

  const handleDeleteSource = (id: string) => {
    onChangeConfig(prev => ({
      ...prev,
      sources: prev.sources.filter(s => s.id !== id)
    }));
  };

  const handleMovePriority = (index: number, direction: 'up' | 'down') => {
    const newSources = [...config.sources];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSources.length) return;

    const temp = newSources[index];
    newSources[index] = newSources[targetIndex];
    newSources[targetIndex] = temp;

    // Reassign priorities
    newSources.forEach((s, i) => {
      s.priority = i + 1;
    });

    onChangeConfig(prev => ({ ...prev, sources: newSources }));
  };

  const handleRunTestQuery = async () => {
    setIsTesting(true);
    setTestError(null);
    setTestResults(null);

    try {
      // Test fetching streams directly from our server endpoint
      const res = await fetch(`/stream/series/${testImdbId}:1:1.json`);
      if (!res.ok) {
        throw new Error(`Erro do servidor (${res.status})`);
      }
      const data = await res.json();
      setTestResults(data.streams || []);
    } catch (err: any) {
      setTestError(err.message || 'Falha ao buscar streams');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER CONCEPT CARD */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Indexadores & Criador de Provedor Torrent BR
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                Direto sem intermediários
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Gerencie os indexadores torrents e sites de busca dublada (Comando, Míco Leão, BlueDev, Brazuca, etc.) em uma única lista unificada.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-slate-300">
              <strong className="text-white block">Busca Direta Pararela:</strong>
              O Plugins BR consulta cada indexador selecionado ao mesmo tempo, sem que um trave o outro.
            </div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2 text-xs">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-slate-300">
              <strong className="text-white block">Sem Addon Aninhado:</strong>
              Elimina o problema de "addon dentro de addon" mantendo as requisições diretas e ultra-rápidas.
            </div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2 text-xs">
            <Globe className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-slate-300">
              <strong className="text-white block">Suporte a Qualquer Link:</strong>
              Adicione qualquer novo plugin/indexador de torrents apenas colando o link do manifest.
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ADD PRESET INDEXERS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Indexadores Populares PT-BR (Adicionar com 1-Clique)
            </h3>
            <p className="text-xs text-slate-400">
              Selecione os indexadores dublados e nacionais para compor seu buscador de torrents:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {POPULAR_BR_INDEXERS.map(idx => {
            const added = isAlreadyAdded(idx.manifestUrl);
            return (
              <div
                key={idx.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  added
                    ? 'bg-purple-950/20 border-purple-500/40 text-slate-200'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {idx.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                      {idx.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {idx.description}
                  </p>
                </div>

                <button
                  onClick={() => handleAddIndexer(idx.name, idx.manifestUrl, idx.tag)}
                  disabled={added}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    added
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Ativo no Plugins BR</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Indexador</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* FORM TO ADD CUSTOM INDEXER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-400" />
          Adicionar Novo Indexador / Plugin Customizado por Link
        </h3>
        <p className="text-xs text-slate-400">
          Encontrou outro indexador torrent (ex: BlueDev V2, Comando V3)? Cole o link do `manifest.json` abaixo:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nome do Indexador</label>
            <input
              type="text"
              placeholder="Ex: BlueDev PT-BR"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Link do Manifest (manifest.json)</label>
            <input
              type="url"
              placeholder="https://exemplo.com/manifest.json"
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tag/Prefixo Visual</label>
            <input
              type="text"
              placeholder="Ex: 🔵 BlueDev"
              value={customTag}
              onChange={e => setCustomTag(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <button
          onClick={() => handleAddIndexer(customName, customUrl, customTag)}
          disabled={!customName || !customUrl}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Indexador no Plugins BR</span>
        </button>
      </div>

      {/* CURRENT ACTIVE INDEXERS MANAGER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Indexadores Ativos no seu Engine ({config.sources.length})
            </h3>
            <p className="text-xs text-slate-400">
              Estes são todos os provedores torrents que serão consultados simultaneamente pelo Stremio:
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {config.sources.map((source, index) => (
            <div
              key={source.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                source.enabled
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Priority Controls */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMovePriority(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-white"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleMovePriority(index, 'down')}
                    disabled={index === config.sources.length - 1}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-white"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{source.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 font-mono border border-purple-500/30">
                      {source.prefixTag}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">#{index + 1}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-md">
                    {source.manifestUrl}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Toggle Button */}
                <button
                  onClick={() => handleToggleSource(source.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    source.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${source.enabled ? 'opacity-100' : 'opacity-0'}`} />
                  <span>{source.enabled ? 'Ativo' : 'Desativado'}</span>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteSource(source.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                  title="Remover indexador"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TESTER BOX FOR BR INDEXERS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-400" />
              Testar Resposta dos Indexadores Ativos no Servidor
            </h3>
            <p className="text-xs text-slate-400">
              Simule uma busca real no Stremio (ex: The Boys `tt1190634` ou Game of Thrones `tt0944947`) para verificar se os torrents dublados e globais aparecem:
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="ID do IMDb (ex: tt1190634)"
            value={testImdbId}
            onChange={e => setTestImdbId(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
          />
          <button
            onClick={handleRunTestQuery}
            disabled={isTesting || !testImdbId}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Buscando nos Indexadores...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Testar Busca em Tempo Real</span>
              </>
            )}
          </button>
        </div>

        {testError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
            {testError}
          </div>
        )}

        {testResults && (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>{testResults.length} resultados retornados do Engine:</span>
            </div>

            {testResults.length === 0 ? (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                Nenhum stream encontrado para o ID `{testImdbId}`.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {testResults.map((stream, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-400 font-mono">{stream.name}</span>
                      {stream.infoHash && (
                        <span className="text-[10px] text-slate-500 font-mono">Hash: {stream.infoHash.substring(0, 10)}...</span>
                      )}
                    </div>
                    <pre className="text-[11px] text-slate-300 whitespace-pre-wrap font-sans bg-slate-900/50 p-2 rounded border border-slate-800/50">
                      {stream.title}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
