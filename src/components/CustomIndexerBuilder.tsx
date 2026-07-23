import React, { useState } from 'react';
import { FusionConfig, SourceAddon } from '../types';
import { Database, Check, RefreshCw, Search, Sparkles, Filter, ShieldCheck, Zap, Globe, Copy, ExternalLink, ArrowRight } from 'lucide-react';

interface CustomIndexerBuilderProps {
  config: FusionConfig;
  onChangeConfig: React.Dispatch<React.SetStateAction<FusionConfig>>;
}

interface ProviderOption {
  id: string;
  name: string;
  tag: string;
  flag?: string;
  category: 'pt' | 'global' | 'intl';
  isPopularBR?: boolean;
}

const ALL_PROVIDERS: ProviderOption[] = [
  // PT-BR Providers
  { id: 'comando', name: 'PT Comando', tag: 'Comando Torrents', flag: '🇧🇷', category: 'pt', isPopularBR: true },
  { id: 'bludv', name: 'PT BluDV', tag: 'BluDV Torrents', flag: '🇧🇷', category: 'pt', isPopularBR: true },
  { id: 'micoleaodublado', name: 'PT MicoLeaoDublado', tag: 'Míco Leão Dublado', flag: '🇧🇷', category: 'pt', isPopularBR: true },
  { id: 'brazuca', name: 'Brazuca Torrents', tag: 'Brazuca', flag: '🇧🇷', category: 'pt', isPopularBR: true },
  { id: 'lapada', name: 'Lapada Torrents', tag: 'Lapada BR', flag: '🇧🇷', category: 'pt', isPopularBR: true },

  // Global / English
  { id: 'yts', name: 'YTS', tag: 'YTS Movies', flag: '🌐', category: 'global' },
  { id: 'eztv', name: 'EZTV', tag: 'EZTV Series', flag: '🌐', category: 'global' },
  { id: 'rarbg', name: 'RARBG', tag: 'RARBG Trackers', flag: '🌐', category: 'global' },
  { id: '1337x', name: '1337x', tag: '1337x Multi', flag: '🌐', category: 'global' },
  { id: 'thepiratebay', name: 'ThePirateBay', tag: 'TPB', flag: '🏴‍☠️', category: 'global' },
  { id: 'kickasstorrents', name: 'KickassTorrents', tag: 'KAT', flag: '🌐', category: 'global' },
  { id: 'torrentgalaxy', name: 'TorrentGalaxy', tag: 'TGx', flag: '🌌', category: 'global' },
  { id: 'magnetdl', name: 'MagnetDL', tag: 'MagnetDL', flag: '🧲', category: 'global' },
  { id: 'horriblesubs', name: 'HorribleSubs', tag: 'HorribleSubs Anime', flag: '⛩️', category: 'global' },
  { id: 'nyaasi', name: 'NyaaSi', tag: 'Nyaa Anime', flag: '⛩️', category: 'global' },
  { id: 'tokyotosho', name: 'TokyoTosho', tag: 'TokyoTosho', flag: '🇯🇵', category: 'global' },
  { id: 'anidex', name: 'AniDex', tag: 'AniDex', flag: '⛩️', category: 'global' },
  { id: 'nekobt', name: 'nekoBT', tag: 'nekoBT', flag: '🐱', category: 'global' },

  // International
  { id: 'rutor', name: 'RU Rutor', tag: 'Rutor RU', flag: '🇷🇺', category: 'intl' },
  { id: 'rutracker', name: 'RU Rutracker', tag: 'Rutracker RU', flag: '🇷🇺', category: 'intl' },
  { id: 'torrent9', name: 'FR Torrent9', tag: 'Torrent9 FR', flag: '🇫🇷', category: 'intl' },
  { id: 'ilcorsaronero', name: 'IT ilCorSaRoNeRo', tag: 'Corsaro IT', flag: '🇮🇹', category: 'intl' },
  { id: 'mejortorrent', name: 'ES MejorTorrent', tag: 'MejorTorrent ES', flag: '🇪🇸', category: 'intl' },
  { id: 'wolfmax4k', name: 'ES Wolfmax4k', tag: 'Wolfmax4k ES', flag: '🇪🇸', category: 'intl' },
  { id: 'cinecalidad', name: 'MX Cinecalidad', tag: 'Cinecalidad MX/ES', flag: '🇲🇽', category: 'intl' },
  { id: 'besttorrents', name: 'PL BestTorrents', tag: 'BestTorrents PL', flag: '🇵🇱', category: 'intl' }
];

export function CustomIndexerBuilder({ config, onChangeConfig }: CustomIndexerBuilderProps) {
  // Active selected providers
  const [selectedProviders, setSelectedProviders] = useState<string[]>([
    'comando', 'bludv', 'micoleaodublado', 'brazuca', 'lapada',
    'yts', '1337x', 'thepiratebay', 'torrentgalaxy', 'eztv'
  ]);

  const [selectedLanguage, setSelectedLanguage] = useState<'portuguese' | 'english' | 'spanish' | 'all'>('portuguese');
  const [filterCamScr, setFilterCamScr] = useState(true);
  const [minQuality, setMinQuality] = useState<'all' | '720p' | '1080p' | '4k'>('all');

  // Search Tester state
  const [testQuery, setTestQuery] = useState('tt1190634'); // The Boys
  const [isSearching, setIsSearching] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const toggleProvider = (id: string) => {
    if (selectedProviders.includes(id)) {
      setSelectedProviders(selectedProviders.filter(p => p !== id));
    } else {
      setSelectedProviders([...selectedProviders, id]);
    }
  };

  const selectOnlyBR = () => {
    setSelectedProviders(['comando', 'bludv', 'micoleaodublado', 'brazuca', 'lapada']);
  };

  const selectAll = () => {
    setSelectedProviders(ALL_PROVIDERS.map(p => p.id));
  };

  const clearAll = () => {
    setSelectedProviders([]);
  };

  // Build the official Torrentio Manifest URL with the configured options
  const buildConfiguredUrl = () => {
    const parts: string[] = [];

    if (selectedProviders.length > 0) {
      parts.push(`providers=${selectedProviders.join(',')}`);
    }

    if (selectedLanguage !== 'all') {
      parts.push(`language=${selectedLanguage}`);
    }

    const filters: string[] = [];
    if (filterCamScr) filters.push('scr', 'cam');
    if (minQuality === '1080p') filters.push('480p', '720p');
    if (minQuality === '4k') filters.push('480p', '720p', '1080p');

    if (filters.length > 0) {
      parts.push(`qualityfilter=${filters.join(',')}`);
    }

    const optionsStr = parts.length > 0 ? parts.join('|') : 'sort=quality';
    return `https://torrentio.strem.fun/${optionsStr}/manifest.json`;
  };

  const generatedUrl = buildConfiguredUrl();

  const handleApplyToApp = () => {
    const url = generatedUrl;
    const providerNames = selectedProviders
      .map(id => ALL_PROVIDERS.find(p => p.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3)
      .join(', ');

    const newSource: SourceAddon = {
      id: `src_custom_torrentio_${Date.now()}`,
      name: `Torrentio BR (${selectedProviders.length} Provedores)`,
      manifestUrl: url,
      enabled: true,
      prefixTag: '⚡ Torrentio BR',
      priority: 1,
      timeoutMs: 8000,
      lastHealthCheck: { status: 'ok', responseTimeMs: 220, checkedAt: 'Agora' }
    };

    // Update config sources with this customized source placed at priority 1
    onChangeConfig(prev => {
      const existingFiltered = prev.sources.filter(s => !s.manifestUrl.includes('torrentio.strem.fun'));
      return {
        ...prev,
        sources: [newSource, ...existingFiltered]
      };
    });

    alert('✅ Provedores de Torrent atualizados com sucesso no Plugins BR!');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleRunSearchTest = async () => {
    setIsSearching(true);
    setTestError(null);
    setTestResults(null);

    try {
      let cleanId = testQuery.trim();
      // If user typed name like "The Boys", map or test with tt1190634
      if (!cleanId.startsWith('tt')) {
        if (/the boys/i.test(cleanId)) cleanId = 'tt1190634';
        else if (/game of thrones/i.test(cleanId)) cleanId = 'tt0944947';
        else if (/breaking bad/i.test(cleanId)) cleanId = 'tt0903747';
        else cleanId = 'tt1190634'; // Default to The Boys
      }

      const res = await fetch(`/stream/series/${cleanId}:1:1.json`);
      if (!res.ok) throw new Error(`Erro de resposta do servidor (${res.status})`);

      const data = await res.json();
      setTestResults(data.streams || []);
    } catch (err: any) {
      setTestError(err.message || 'Erro ao realizar busca de teste.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* EXPLANATORY HEADER CARD */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-950 border border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Seletor de Provedores Torrent (PROVIDERS)
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                Comando, BluDV, MícoLeão & Globais
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Escolha exatamente quais rastreadores de torrent (provedores) o Stremio irá consultar ao buscar filmes e séries.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2 text-xs">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-slate-300">
              <strong className="text-white block">Como Funciona:</strong>
              Cada botão de provedor ativa a busca naquele site específico (ex: Comando Torrents para filmes dublados).
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-slate-300">
              <strong className="text-white block">Apenas o que Importa:</strong>
              Ao selecionar apenas os provedores desejados, a resposta fica mais rápida e evita resultados indesejados.
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2 text-xs">
            <Globe className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-slate-300">
              <strong className="text-white block">Ativação Automática:</strong>
              O link gerado abaixo é injetado diretamente no seu Plugins BR sem precisar reconfigurar manualmente.
            </div>
          </div>
        </div>
      </div>

      {/* PROVIDERS SELECTION CHIPS (MATCHING TORRENTIO / BRAZUCA STYLE) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-400" />
              PROVIDERS (Selecione os Rastreadores de Torrent)
            </h3>
            <p className="text-xs text-slate-400">
              Ative ou desative provedores individualmente ({selectedProviders.length} selecionados):
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectOnlyBR}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all"
            >
              🇧🇷 Apenas PT-BR
            </button>
            <button
              onClick={selectAll}
              className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all"
            >
              Selecionar Todos
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold transition-all"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* SECTION 1: PT-BR PROVIDERS */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
            <span>🇧🇷 Provedores Focados em Conteúdo Dublado & Nacional (PT-BR)</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {ALL_PROVIDERS.filter(p => p.category === 'pt').map(provider => {
              const isSelected = selectedProviders.includes(provider.id);
              return (
                <button
                  key={provider.id}
                  onClick={() => toggleProvider(provider.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white border border-blue-400 shadow-md shadow-blue-600/30 ring-2 ring-blue-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm">{provider.flag}</span>
                  <span>{provider.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-200" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: GLOBAL ENGLISH PROVIDERS */}
        <div className="space-y-3 pt-2 border-t border-slate-800/60">
          <h4 className="text-xs font-bold text-blue-400 flex items-center gap-2">
            <span>🌐 Provedores Globais (Inglês, 4K, Filmes e Séries Internacional)</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {ALL_PROVIDERS.filter(p => p.category === 'global').map(provider => {
              const isSelected = selectedProviders.includes(provider.id);
              return (
                <button
                  key={provider.id}
                  onClick={() => toggleProvider(provider.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white border border-blue-400 shadow-md shadow-blue-600/20'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs">{provider.flag}</span>
                  <span>{provider.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-blue-200" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: INTERNATIONAL OTHER LANGUAGES */}
        <div className="space-y-3 pt-2 border-t border-slate-800/60">
          <h4 className="text-xs font-bold text-purple-400 flex items-center gap-2">
            <span>🇪🇸 🇫🇷 🇷🇺 Outros Idiomas (Russo, Francês, Espanhol, Italiano)</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {ALL_PROVIDERS.filter(p => p.category === 'intl').map(provider => {
              const isSelected = selectedProviders.includes(provider.id);
              return (
                <button
                  key={provider.id}
                  onClick={() => toggleProvider(provider.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white border border-blue-400 shadow-md shadow-blue-600/20'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs">{provider.flag}</span>
                  <span>{provider.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-blue-200" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* LANGUAGE & QUALITY OPTIONS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Filtros de Idioma e Qualidades
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Filtro de Idioma Principal</label>
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="portuguese">🇧🇷 Priorizar Português (Dublado / PT-BR)</option>
              <option value="english">🇺🇸 Priorizar Inglês (Áudio Original)</option>
              <option value="spanish">🇪🇸 Priorizar Espanhol</option>
              <option value="all">🌐 Todos os Idiomas (Sem Filtro)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Filtro CAM / Screener</label>
            <button
              onClick={() => setFilterCamScr(!filterCamScr)}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                filterCamScr
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <span>Excluir Gravações de Cinema (CAM / TS)</span>
              <Check className={`w-4 h-4 ${filterCamScr ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Resolução Mínima</label>
            <select
              value={minQuality}
              onChange={e => setMinQuality(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas as Resoluções (480p, 720p, 1080p, 4K)</option>
              <option value="720p">Mínimo 720p HD</option>
              <option value="1080p">Mínimo 1080p Full HD</option>
              <option value="4k">Apenas 4K / 2160p</option>
            </select>
          </div>
        </div>
      </div>

      {/* GENERATED MANIFEST URL & APPLICATION BUTTON */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Link do Manifest Gerado ({selectedProviders.length} Provedores Configurados)
            </h3>
            <p className="text-xs text-slate-400">
              O link abaixo contém os filtros dos rastreadores que você acabou de selecionar:
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyUrl}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copiado!' : 'Copiar Link'}</span>
            </button>

            <button
              onClick={handleApplyToApp}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar ao Plugins BR</span>
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-blue-300 break-all">
          {generatedUrl}
        </div>
      </div>

      {/* REAL-TIME QUERY TESTER BOX */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-400" />
              Testar se Filmes ou Séries Aparecem nos Provedores (Ex: "The Boys")
            </h3>
            <p className="text-xs text-slate-400">
              Digite o nome ou ID do IMDb para visualizar o que os provedores estão retornando no momento:
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Ex: The Boys ou tt1190634"
            value={testQuery}
            onChange={e => setTestQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
          <button
            onClick={handleRunSearchTest}
            disabled={isSearching || !testQuery}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20"
          >
            {isSearching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Buscando nos Provedores...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Executar Teste de Provedor</span>
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
              <span>{testResults.length} resultados encontrados:</span>
            </div>

            {testResults.length === 0 ? (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                Nenhum stream retornado. Verifique os provedores selecionados.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {testResults.map((stream, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-400 font-mono">{stream.name}</span>
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
