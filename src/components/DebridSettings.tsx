import React, { useState } from 'react';
import { FusionConfig, DebridConfig } from '../types';
import { Zap, Key, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, ExternalLink, HardDrive } from 'lucide-react';

interface DebridSettingsProps {
  config: FusionConfig;
  onChangeConfig: (newConfig: FusionConfig) => void;
}

export const DebridSettings: React.FC<DebridSettingsProps> = ({ config, onChangeConfig }) => {
  const debrid = config.debrid || { service: 'none', apiKey: '', autoUnrestrict: true };
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; email?: string; plan?: string; expires?: string } | null>(null);

  const updateDebrid = (updates: Partial<DebridConfig>) => {
    onChangeConfig({
      ...config,
      debrid: {
        ...debrid,
        ...updates
      }
    });
  };

  const handleTestDebridKey = async () => {
    if (!debrid.apiKey || !debrid.apiKey.trim()) {
      setTestResult({ success: false, message: 'Digite sua chave de API para testar.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/check-debrid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: debrid.service,
          apiKey: debrid.apiKey.trim()
        })
      });
      const data = await res.json();

      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Chave validada com sucesso!',
          email: data.email,
          plan: data.plan,
          expires: data.expires
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Falha ao autenticar com a chave informada.'
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Erro ao conectar ao servidor de validação.'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Compatibilidade Debrid & TorBox
          </h3>
          <p className="text-xs text-slate-400">
            Conecte sua conta do TorBox ou RealDebrid para assistir torrents sem travamentos e com velocidade máxima de servidor.
          </p>
        </div>

        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
          <Zap className="w-3 h-3 fill-amber-400" /> Super Aceleração
        </span>
      </div>

      {/* SELECT DEBRID SERVICE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* TorBox */}
        <div
          onClick={() => updateDebrid({ service: 'torbox' })}
          className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
            debrid.service === 'torbox'
              ? 'bg-purple-950/30 border-purple-500 text-white shadow-lg shadow-purple-500/10'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-bold text-white">TorBox</span>
            </div>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 font-semibold px-2 py-0.5 rounded border border-purple-500/30">
              Destaque
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Integração nativa com TorBox.app para streaming instantâneo e sem buffer.
          </p>
        </div>

        {/* RealDebrid */}
        <div
          onClick={() => updateDebrid({ service: 'realdebrid' })}
          className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
            debrid.service === 'realdebrid'
              ? 'bg-purple-950/30 border-purple-500 text-white shadow-lg shadow-purple-500/10'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold text-white">RealDebrid</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Suporte a chaves de API do Real-Debrid.com para cache instantâneo.
          </p>
        </div>

        {/* None / Direct P2P */}
        <div
          onClick={() => updateDebrid({ service: 'none' })}
          className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
            debrid.service === 'none'
              ? 'bg-purple-950/30 border-purple-500 text-white shadow-lg shadow-purple-500/10'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-bold text-white">Nenhum (P2P Direto)</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Conecta diretamente aos pares de torrents sem usar serviço de Debrid pago.
          </p>
        </div>
      </div>

      {/* API KEY INPUT FORM IF DEBRID SELECTED */}
      {debrid.service !== 'none' && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                Chave de API do {debrid.service === 'torbox' ? 'TorBox' : 'RealDebrid'} *
              </label>

              <a
                href={debrid.service === 'torbox' ? 'https://torbox.app/settings' : 'https://real-debrid.com/apitoken'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 hover:underline"
              >
                Obter Chave <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="password"
                value={debrid.apiKey || ''}
                onChange={e => updateDebrid({ apiKey: e.target.value })}
                placeholder={debrid.service === 'torbox' ? 'Cole sua chave de API do TorBox aqui...' : 'Cole seu Token de API do RealDebrid...'}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />

              <button
                type="button"
                onClick={handleTestDebridKey}
                disabled={testing || !debrid.apiKey?.trim()}
                className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shrink-0 disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testando...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" /> Testar Conexão
                  </>
                )}
              </button>
            </div>
          </div>

          {/* TEST RESULT FEEDBACK */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs border flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">{testResult.message}</p>
                {testResult.email && (
                  <p className="text-[11px] opacity-80 font-mono">
                    Conta: {testResult.email} | Plano: {testResult.plan} ({testResult.expires})
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
