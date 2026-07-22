import React, { useState } from 'react';
import { SourceAddon } from '../types';
import { normalizeStremioUrl } from '../utils/stremioUrl';
import { Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, MoveUp, MoveDown, Tag, Link as LinkIcon, Power, ShieldAlert } from 'lucide-react';

interface AddonManagerProps {
  sources: SourceAddon[];
  onUpdateSources: (sources: SourceAddon[]) => void;
}

export const AddonManager: React.FC<AddonManagerProps> = ({ sources, onUpdateSources }) => {
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrefix, setNewPrefix] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleAddCustomAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setIsTesting(true);
    setTestResult(null);

    const normalizedUrl = normalizeStremioUrl(newUrl);

    try {
      const res = await fetch('/api/check-addon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl })
      });
      const data = await res.json();

      if (data.success) {
        const manifest = data.manifest;
        const addonName = newName.trim() || manifest.name || 'Novo Addon';
        const defaultPrefix = newPrefix.trim() || `[${addonName}]`;

        const newAddon: SourceAddon = {
          id: `src_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: addonName,
          manifestUrl: normalizedUrl,
          enabled: true,
          prefixTag: defaultPrefix,
          priority: sources.length + 1,
          timeoutMs: 8000,
          lastHealthCheck: {
            status: 'ok',
            responseTimeMs: data.responseTimeMs,
            checkedAt: new Date().toLocaleTimeString()
          }
        };

        onUpdateSources([...sources, newAddon]);
        setNewUrl('');
        setNewName('');
        setNewPrefix('');
        setTestResult({ success: true, message: `Addon "${addonName}" adicionado com sucesso! (${data.responseTimeMs}ms)` });
      } else {
        setTestResult({ success: false, message: data.error || 'Não foi possível validar este Addon manifest.' });
      }
    } catch (err) {
      setTestResult({ success: false, message: 'Erro ao conectar ao servidor para testar o Addon.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggle = (id: string) => {
    onUpdateSources(
      sources.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleDelete = (id: string) => {
    onUpdateSources(sources.filter(s => s.id !== id));
  };

  const handlePrefixChange = (id: string, prefixTag: string) => {
    onUpdateSources(
      sources.map(s => (s.id === id ? { ...s, prefixTag } : s))
    );
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sources.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newSources = [...sources];
    const temp = newSources[index];
    newSources[index] = newSources[targetIndex];
    newSources[targetIndex] = temp;

    // re-assign priority
    const reordered = newSources.map((s, idx) => ({ ...s, priority: idx + 1 }));
    onUpdateSources(reordered);
  };

  const handleHealthCheckAll = async () => {
    const updated = [...sources];
    for (let i = 0; i < updated.length; i++) {
      updated[i] = {
        ...updated[i],
        lastHealthCheck: { status: 'testing' }
      };
      onUpdateSources([...updated]);

      try {
        const res = await fetch('/api/check-addon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: updated[i].manifestUrl })
        });
        const data = await res.json();

        if (data.success) {
          updated[i].lastHealthCheck = {
            status: 'ok',
            responseTimeMs: data.responseTimeMs,
            checkedAt: new Date().toLocaleTimeString()
          };
        } else {
          updated[i].lastHealthCheck = {
            status: 'error',
            message: data.error || 'Falha na resposta',
            checkedAt: new Date().toLocaleTimeString()
          };
        }
      } catch (err) {
        updated[i].lastHealthCheck = {
          status: 'error',
          message: 'Erro de rede',
          checkedAt: new Date().toLocaleTimeString()
        };
      }
      onUpdateSources([...updated]);
    }
  };

  return (
    <div className="space-y-6">
      {/* ADD NEW CUSTOM ADDON FORM */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-purple-400" />
          Adicionar Addon por Manifest (Link do Brazuca / Torrent)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Cole o link `manifest.json` ou `stremio://` de qualquer Addon do Stremio (Brazuca, Torrentio, etc.)
        </p>

        <form onSubmit={handleAddCustomAddon} className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-6">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Link do Manifest / Addon URL *
              </label>
              <input
                type="text"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://brazucatorrents.com/manifest.json ou stremio://..."
                required
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome de Exibição (Opcional)
              </label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: Brazuca Oficial"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tag do Título (Ex: [Brazuca])
              </label>
              <input
                type="text"
                value={newPrefix}
                onChange={e => setNewPrefix(e.target.value)}
                placeholder="Ex: 🇧🇷 Brazuca"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {testResult && (
              <div
                className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
            {!testResult && <div />}

            <button
              type="submit"
              disabled={isTesting || !newUrl.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Testando & Validando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Validar & Adicionar Addon
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CONFIGURED ADDONS LIST */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Addons Configurados ({sources.length})</h3>
            <p className="text-xs text-slate-400">
              Gerencie a ordem de prioridade, tags de nome e status de cada fonte de stream.
            </p>
          </div>

          <button
            onClick={handleHealthCheckAll}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-400" /> Testar Status de Todos
          </button>
        </div>

        {sources.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
            <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">Nenhum Addon Adicionado</p>
            <p className="text-xs text-slate-500 mt-1">
              Adicione links de addons acima ou escolha nos Addons Recomendados.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sources.map((source, index) => (
              <div
                key={source.id}
                className={`p-4 rounded-xl border transition-all ${
                  source.enabled
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-slate-950/40 border-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left info */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(source.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        source.enabled
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                      title={source.enabled ? 'Desativar Addon' : 'Ativar Addon'}
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{source.name}</span>
                        {source.lastHealthCheck && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                              source.lastHealthCheck.status === 'ok'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : source.lastHealthCheck.status === 'error'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 animate-pulse'
                            }`}
                          >
                            {source.lastHealthCheck.status === 'ok' && (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Online ({source.lastHealthCheck.responseTimeMs}ms)
                              </>
                            )}
                            {source.lastHealthCheck.status === 'error' && (
                              <>
                                <AlertCircle className="w-3 h-3" /> Erro ({source.lastHealthCheck.message})
                              </>
                            )}
                            {source.lastHealthCheck.status === 'testing' && 'Testando...'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono truncate max-w-md mt-0.5">
                        {source.manifestUrl}
                      </p>
                    </div>
                  </div>

                  {/* Right actions & prefix input */}
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                      <Tag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <input
                        type="text"
                        value={source.prefixTag || ''}
                        onChange={e => handlePrefixChange(source.id, e.target.value)}
                        placeholder="Tag do Título"
                        className="w-24 bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 disabled:opacity-30"
                        title="Mover para cima (Maior prioridade)"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === sources.length - 1}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 disabled:opacity-30"
                        title="Mover para baixo"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(source.id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-colors"
                      title="Remover Addon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
