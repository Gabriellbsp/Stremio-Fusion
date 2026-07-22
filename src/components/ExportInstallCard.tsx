import React, { useState } from 'react';
import { FusionConfig } from '../types';
import { encodeFusionConfig, getStremioInstallUrls } from '../utils/stremioUrl';
import { Copy, Check, ExternalLink, Tv, Sparkles, Zap, Info } from 'lucide-react';

interface ExportInstallCardProps {
  config: FusionConfig;
}

export const ExportInstallCard: React.FC<ExportInstallCardProps> = ({ config }) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [useCustomToken, setUseCustomToken] = useState(false);

  const token = encodeFusionConfig(config);
  const urls = getStremioInstallUrls(token);

  const activeHttpsUrl = useCustomToken ? urls.httpsUrl : urls.cleanHttpsUrl;
  const activeStremioUrl = useCustomToken ? urls.stremioUrl : urls.cleanStremioUrl;
  const activeWebUrl = useCustomToken ? urls.webStremioUrl : urls.cleanWebStremioUrl;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const enabledCount = config.sources.filter(s => s.enabled).length;

  return (
    <div className="bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-tight">Seu Link de Addon Unificado</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Link otimizado para o Stremio (Windows, Mac, Android, Firestick e iOS).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={activeStremioUrl}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <Tv className="w-4 h-4" /> Instalar no Stremio
            </a>

            <a
              href={activeWebUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Abrir no Stremio Web"
            >
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" /> Stremio Web
            </a>
          </div>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center justify-between bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300">
              Modo de Link: <strong className="text-white">{useCustomToken ? 'Token Personalizado Minificado' : 'URL Curta Direta (Recomendado)'}</strong>
            </span>
          </div>

          <button
            onClick={() => setUseCustomToken(!useCustomToken)}
            className="px-3 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-semibold rounded-lg transition-colors"
          >
            {useCustomToken ? 'Alternar p/ Link Curto' : 'Alternar p/ Token Config'}
          </button>
        </div>

        {/* Info box for long URLs */}
        <div className="space-y-2">
          {!useCustomToken && (
            <div className="flex items-start gap-2 bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-[11px] text-emerald-300">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>
                <strong>O que mudou?</strong> A URL Curta Direta (<code className="text-white bg-slate-900 px-1 py-0.5 rounded">/manifest.json</code>) e a conexão pública (<code className="text-white bg-slate-900 px-1 py-0.5 rounded">ais-pre-</code>) resolvem o erro de <span className="text-amber-300 underline font-mono">Failed to fetch</span> ao instalar no Stremio!
              </span>
            </div>
          )}
        </div>

        {/* URLs inputs */}
        <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          {/* Stremio Protocol URL */}
          <div>
            <label className="block text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-1">
              Link Stremio (`stremio://`)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={activeStremioUrl}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono select-all focus:outline-none"
              />
              <button
                onClick={() => handleCopy('stremio', activeStremioUrl)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 font-medium flex items-center gap-1 shrink-0 transition-colors"
              >
                {copiedUrl === 'stremio' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl === 'stremio' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* HTTPS Manifest URL */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Link HTTPS Manifest (Cole no Stremio na aba "Adicionar Addon")
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={activeHttpsUrl}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono select-all focus:outline-none"
              />
              <button
                onClick={() => handleCopy('https', activeHttpsUrl)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 font-medium flex items-center gap-1 shrink-0 transition-colors"
              >
                {copiedUrl === 'https' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl === 'https' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Fonte de Streams: <strong className="text-white">{enabledCount} Addons Ativos</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span>Timeout: <strong className="text-white">{config.settings.maxTimeoutMs / 1000}s</strong></span>
          </div>

          <p className="text-[11px] text-slate-400">
            Pronto para usar!
          </p>
        </div>
      </div>
    </div>
  );
};
