import React, { useState } from 'react';
import { FusionConfig, StreamTestResponse } from '../types';
import { encodeFusionConfig } from '../utils/stremioUrl';
import { Search, Play, CheckCircle2, XCircle, Clock, Film, Tv, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface StreamTesterProps {
  config: FusionConfig;
}

const POPULAR_TEST_MEDIA = [
  { title: 'Um Sonho de Liberdade', type: 'movie', id: 'tt0111161', year: '1994' },
  { title: 'A Origem (Inception)', type: 'movie', id: 'tt1375666', year: '2010' },
  { title: 'Game of Thrones (S1E1)', type: 'series', id: 'tt0944947:1:1', year: '2011' },
  { title: 'Breaking Bad (S1E1)', type: 'series', id: 'tt0903747:1:1', year: '2008' },
  { title: 'Vingadores: Ultimato', type: 'movie', id: 'tt4154796', year: '2019' },
  { title: 'Stranger Things (S1E1)', type: 'series', id: 'tt4574334:1:1', year: '2016' }
];

export const StreamTester: React.FC<StreamTesterProps> = ({ config }) => {
  const [selectedMedia, setSelectedMedia] = useState(POPULAR_TEST_MEDIA[0]);
  const [customId, setCustomId] = useState('');
  const [customType, setCustomType] = useState<'movie' | 'series'>('movie');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<StreamTestResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'ptbr'>('all');

  const handleRunTest = async (type: string, id: string) => {
    setIsLoading(true);
    setTestResult(null);

    const startTime = Date.now();
    const addonResults: any[] = [];
    let combinedStreams: any[] = [];

    // Try server-side first
    try {
      const res = await fetch('/api/test-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, type, id })
      });
      const data = await res.json();

      // If server got 0 streams (often due to Cloudflare datacenter IP block on cloud server),
      // perform client-side fallback fetch directly from user browser!
      if (data && data.totalStreams > 0) {
        setTestResult(data);
        setIsLoading(false);
        return;
      }

      // If server returned 0 streams, let's also fetch client-side from user's browser IP
      const enabledSources = config.sources.filter(s => s.enabled);
      const clientPromises = enabledSources.map(async (source) => {
        const sourceStart = Date.now();
        try {
          const streamEndpoint = source.manifestUrl.replace(/manifest\.json$/, `stream/${type}/${id}.json`);
          const clientRes = await fetch(streamEndpoint, { mode: 'cors' });
          if (!clientRes.ok) {
            return {
              sourceId: source.id,
              addonName: source.name,
              responseTimeMs: Date.now() - sourceStart,
              streamCount: 0,
              success: false,
              error: `HTTP ${clientRes.status} (${clientRes.statusText || 'Bloqueado por CORS/Cloudflare'})`
            };
          }
          const clientData = await clientRes.json();
          const rawStreams = Array.isArray(clientData?.streams) ? clientData.streams : [];
          const taggedStreams = rawStreams.map((s: any) => ({
            ...s,
            name: source.prefixTag ? `${source.prefixTag} | ${s.name || 'Stream'}` : (s.name || source.name)
          }));

          return {
            sourceId: source.id,
            addonName: source.name,
            responseTimeMs: Date.now() - sourceStart,
            streamCount: taggedStreams.length,
            success: true,
            streams: taggedStreams
          };
        } catch (err: any) {
          return {
            sourceId: source.id,
            addonName: source.name,
            responseTimeMs: Date.now() - sourceStart,
            streamCount: 0,
            success: false,
            error: err.message || 'Falha na conexão do navegador'
          };
        }
      });

      const clientResults = await Promise.all(clientPromises);
      clientResults.forEach(r => {
        addonResults.push(r);
        if (r.streams) {
          combinedStreams = combinedStreams.concat(r.streams);
        }
      });

      if (combinedStreams.length > 0) {
        setTestResult({
          type,
          id,
          latencyMs: Date.now() - startTime,
          totalStreams: combinedStreams.length,
          addonResults,
          streams: combinedStreams
        });
      } else {
        // Return server result with helpful error message
        setTestResult({
          ...data,
          addonResults: data.addonResults.map((ar: any) => ({
            ...ar,
            error: ar.error || '0 streams retornados (Servidores de torrents bloqueiam IPs de Cloud Data Center via Cloudflare. Teste no app do Stremio no seu PC/Celular para usar seu IP residencial ou ative RealDebrid/Comet).'
          }))
        });
      }
    } catch (err) {
      console.error('Erro ao testar stream', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customId.trim()) return;
    handleRunTest(customType, customId.trim());
  };

  const filteredStreams = testResult?.streams.filter(st => {
    if (activeTab === 'ptbr') {
      return /dublado|pt-br|português|portugues|brazuca|brazil|br/i.test(`${st.name} ${st.title}`);
    }
    return true;
  }) || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Testador de Streams em Tempo Real
          </h3>
          <p className="text-xs text-slate-400">
            Simule uma busca no Stremio para ver a resposta combinada do Brazuca + Torrentio em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos os Streams ({testResult?.streams.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('ptbr')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'ptbr' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇧🇷 Apenas Dublado / PT-BR</span>
          </button>
        </div>
      </div>

      {/* Media Presets or Custom Input */}
      <div className="space-y-3">
        <label className="block text-xs font-medium text-slate-300">
          Selecione uma Mídia de Teste Rápida:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {POPULAR_TEST_MEDIA.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedMedia(item);
                handleRunTest(item.type, item.id);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedMedia.id === item.id
                  ? 'bg-purple-950/40 border-purple-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-1 text-[10px] text-purple-400 font-semibold mb-1">
                {item.type === 'movie' ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                <span>{item.year}</span>
              </div>
              <p className="text-xs font-medium line-clamp-1">{item.title}</p>
            </button>
          ))}
        </div>

        {/* Custom IMDB Form */}
        <form onSubmit={handleCustomSearch} className="flex flex-col sm:flex-row gap-2 pt-1">
          <select
            value={customType}
            onChange={e => setCustomType(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="movie">Filme (Movie)</option>
            <option value="series">Série (Series S:E)</option>
          </select>

          <div className="relative flex-1">
            <input
              type="text"
              value={customId}
              onChange={e => setCustomId(e.target.value)}
              placeholder="Digite o IMDB ID (Ex: tt0111161 ou tt0944947:1:1)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !customId.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" /> Buscar ID
          </button>
        </form>
      </div>

      {/* RUN TEST BUTTON */}
      <div className="pt-2">
        <button
          onClick={() => handleRunTest(selectedMedia.type, selectedMedia.id)}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Clock className="w-4 h-4 animate-spin text-amber-300" />
              <span>Consultando Brazuca + Torrentio em paralelo...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-emerald-300 fill-emerald-300" />
              <span>Executar Teste de Streams em Tempo Real</span>
            </>
          )}
        </button>
      </div>

      {/* RESULTS BREAKDOWN */}
      {testResult && (
        <div className="space-y-4 pt-2">
          {/* Performance Summary Banner */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Total de Streams Encontrados: <span className="text-emerald-400">{testResult.totalStreams}</span>
                </p>
                <p className="text-xs text-slate-400">
                  Tempo total de resposta combinada: <strong className="text-slate-200">{testResult.latencyMs}ms</strong>
                </p>
              </div>
            </div>

            {/* Per-Addon Health Cards */}
            <div className="flex flex-wrap items-center gap-2">
              {testResult.addonResults.map((r, i) => (
                <div
                  key={i}
                  className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${
                    r.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {r.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>{r.addonName}:</span>
                  <strong className="font-mono">{r.streamCount} streams ({r.responseTimeMs}ms)</strong>
                </div>
              ))}
            </div>
          </div>

          {/* STREAM LIST DISPLAY */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Lista Unificada de Streams Recebidos ({filteredStreams.length}):
            </h4>

            {filteredStreams.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
                Nenhum stream encontrado para o filtro selecionado.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {filteredStreams.map((stream, idx) => {
                  const isPT = /dublado|pt-br|português|portugues|brazuca|brazil|br/i.test(`${stream.name} ${stream.title}`);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        isPT
                          ? 'bg-purple-950/20 border-purple-500/30 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-500/30">
                            {stream.name || 'Stream'}
                          </span>
                          {isPT && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-medium">
                              🇧🇷 PT-BR / Dublado
                            </span>
                          )}
                          {stream.infoHash && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded">
                              Hash: {stream.infoHash.substring(0, 8)}...
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-slate-200 line-clamp-2">
                          {stream.title || stream.description || 'Stream sem título'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {stream.url && (
                          <a
                            href={stream.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-mono border border-slate-700 truncate max-w-[140px]"
                            title={stream.url}
                          >
                            Assistir Link 🔗
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
