import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { decodeFusionConfig, normalizeStremioUrl } from './src/utils/stremioUrl';
import { FusionConfig, SourceAddon, StremioManifest, StremioStream } from './src/types';

const app = express();
const PORT = 3000;

app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});
app.use(express.json());

// In-memory manifest cache to avoid re-fetching manifests on every stream request
const manifestCache = new Map<string, { manifest: StremioManifest; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Safely fetches an addon manifest with timeout
 */
async function fetchSourceManifest(url: string, timeoutMs: number = 6000): Promise<StremioManifest | null> {
  const normalized = normalizeStremioUrl(url);
  const cached = manifestCache.get(normalized);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.manifest;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(normalized, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Stremio-Addon-Fusion/1.0.0 (compatible; Stremio)',
        'Accept': 'application/json'
      }
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[Fusion Server] Addon returned status ${res.status}: ${normalized}`);
      return null;
    }

    const data = (await res.json()) as StremioManifest;
    if (data && data.id && data.resources) {
      manifestCache.set(normalized, { manifest: data, timestamp: Date.now() });
      return data;
    }
    return null;
  } catch (err: any) {
    clearTimeout(timer);
    console.error(`[Fusion Server] Failed fetching manifest ${normalized}:`, err?.message || err);
    return null;
  }
}

/**
 * Safely fetches streams from an individual addon source with error boundary & fallbacks
 */
async function fetchStreamsFromSource(
  source: SourceAddon,
  type: string,
  id: string,
  timeoutMs: number
): Promise<{ source: SourceAddon; streams: StremioStream[]; timeMs: number; error?: string }> {
  const startTime = Date.now();
  
  // Format ID for Stremio protocol: preserve raw colons for series/anime (e.g., tt0944947:1:1)
  let rawId = decodeURIComponent(id);
  if (rawId.endsWith('.json')) {
    rawId = rawId.slice(0, -5);
  }
  const formattedId = rawId.split(':').map(part => encodeURIComponent(part)).join(':');

  // Candidate URLs for source (with automatic fallback working mirrors for Brazuca / Torrentio / Elfhosted)
  const candidates: string[] = [];
  const primaryUrl = normalizeStremioUrl(source.manifestUrl);
  candidates.push(primaryUrl);

  const lowerPrimary = primaryUrl.toLowerCase();

  if (lowerPrimary.includes('brazuca')) {
    candidates.push('https://94c8cb9f702d-brazuca-torrents.baby-beamup.club/manifest.json');
    candidates.push('https://brazucatorrents.baby-beamup.club/manifest.json');
    candidates.push('https://brazuca.stremio.app/manifest.json');
  }
  
  if (lowerPrimary.includes('torrentio') || lowerPrimary.includes('knightcrawler') || lowerPrimary.includes('tpb') || lowerPrimary.includes('pirate')) {
    candidates.push('https://stremio-tpb.vercel.app/manifest.json');
    candidates.push('https://jackettio.elfhosted.com/manifest.json');
    candidates.push('https://torrentio.strem.fun/manifest.json');
  }

  if (lowerPrimary.includes('comet')) {
    candidates.push('https://comet.elfhosted.com/manifest.json');
    candidates.push('https://comet.strem.fun/manifest.json');
  }

  // Deduplicate candidates
  const uniqueCandidates = Array.from(new Set(candidates));

  let lastError = '';
  // Ensure timeout respects user's maxTimeoutMs setting properly
  const effectiveTimeout = Math.max(timeoutMs || 8000, source.timeoutMs || 8000);

  for (const candidateManifestUrl of uniqueCandidates) {
    const baseUrl = candidateManifestUrl.replace(/\/manifest\.json$/, '');
    const rawStreamUrl = `${baseUrl}/stream/${type}/${formattedId}.json`;
    // CRITICAL: Encode pipes | as %7C to prevent Node fetch Invalid URL throw
    const streamUrl = rawStreamUrl.replaceAll('|', '%7C');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), effectiveTimeout);

    try {
      const res = await fetch(streamUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Stremio/4.4.168',
          'Accept': 'application/json, text/plain, */*'
        }
      });
      clearTimeout(timer);

      const duration = Date.now() - startTime;

      if (!res.ok) {
        lastError = `HTTP ${res.status}: ${res.statusText}`;
        continue;
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('json') && !contentType.includes('text/')) {
        lastError = `Resposta não-JSON (${contentType})`;
        continue;
      }

      const textBody = await res.text();
      let body: any;
      try {
        body = JSON.parse(textBody);
      } catch (parseErr) {
        lastError = 'Resposta inválida do addon';
        continue;
      }

      const rawStreams: StremioStream[] = Array.isArray(body?.streams) ? body.streams : [];

      if (rawStreams.length === 0 && candidateManifestUrl !== uniqueCandidates[uniqueCandidates.length - 1]) {
        // Try next candidate mirror if empty
        continue;
      }

      // Format & enrich streams with prefixTag or source name
      const processedStreams = rawStreams.map((s, idx) => {
        const copy = { ...s };
        const tag = source.prefixTag || `[${source.name}]`;

        if (!copy.name || copy.name.trim() === '') {
          copy.name = tag;
        } else if (!copy.name.includes(tag)) {
          copy.name = `${tag} | ${copy.name}`.trim();
        }

        if (!copy.title && copy.description) {
          copy.title = copy.description;
        }

        (copy as any)._fusionSource = source.name;
        (copy as any)._fusionIdx = idx;

        return copy;
      });

      return {
        source,
        streams: processedStreams,
        timeMs: duration
      };
    } catch (err: any) {
      clearTimeout(timer);
      const isTimeout = err.name === 'AbortError';
      lastError = isTimeout ? `Timeout (${effectiveTimeout}ms)` : (err?.message || 'Falha na conexão');
    }
  }

  return {
    source,
    streams: [],
    timeMs: Date.now() - startTime,
    error: lastError || 'Nenhum stream retornado'
  };
}

/**
 * Helper to check if stream is an unconfigured notice or error placeholder
 */
function isNoticeOrInvalidStream(st: StremioStream): boolean {
  const text = `${st.name || ''} ${st.title || ''} ${st.description || ''}`.toLowerCase();
  if (
    text.includes('kindly configure') ||
    text.includes('configure this addon') ||
    text.includes('unconfigured') ||
    text.includes('configure addon') ||
    text.includes('install manually') ||
    text.includes('invalid api key') ||
    text.includes('please set api') ||
    text.includes('no debrid key')
  ) {
    return true;
  }
  // Streams must have at least url, infoHash, externalUrl, ytId or behaviorHints.externalUrl
  if (!st.url && !st.infoHash && !st.externalUrl && !st.ytId && !st.behaviorHints?.externalUrl) {
    return true;
  }
  return false;
}

/**
 * Extracts resolution rank from text
 */
function getResolutionRank(text: string): { rank: number; label: string; badge: string } {
  const lower = text.toLowerCase();
  if (/2160p|4k|uhd|ultra hd/i.test(lower)) {
    return { rank: 4, label: '4k', badge: '✨ 4K' };
  }
  if (/1080p|full hd|fhd/i.test(lower)) {
    return { rank: 3, label: '1080p', badge: '📺 1080p' };
  }
  if (/720p|hd/i.test(lower)) {
    return { rank: 2, label: '720p', badge: '📹 720p' };
  }
  if (/480p|360p|sd/i.test(lower)) {
    return { rank: 1, label: '480p', badge: '📱 480p' };
  }
  return { rank: 0, label: 'outros', badge: '' };
}

/**
 * Helper to detect languages and assign country flag emojis
 */
function getLanguageFlag(text: string): string {
  const lower = text.toLowerCase();
  if (/dublado|pt-br|nacional|português|portugues|brazuca|brazil|br\b/i.test(lower)) {
    return '🇧🇷';
  }
  if (/pt-pt|portugal/i.test(lower)) {
    return '🇵🇹';
  }
  if (/legendado|eng|english|inglês|ingles|subbed|dual|multi|us\b/i.test(lower)) {
    return '🇺🇸';
  }
  if (/esp|spanish|espanhol|latino/i.test(lower)) {
    return '🇪🇸';
  }
  if (/fra|french|francês/i.test(lower)) {
    return '🇫🇷';
  }
  if (/jp|japanese|japonês|anime/i.test(lower)) {
    return '🇯🇵';
  }
  return '';
}

/**
 * Process, filter, decorate with flags/badges and sort streams according to FusionConfig
 */
function processAndFilterStreams(rawStreams: StremioStream[], config: FusionConfig): StremioStream[] {
  const settings: Partial<FusionConfig['settings']> = config.settings || {};
  let streams = rawStreams.filter(st => !isNoticeOrInvalidStream(st));

  // 1. Filter out CAM / TS / Screener if filterCamScr is true
  if (settings.filterCamScr) {
    streams = streams.filter(st => {
      const text = `${st.name || ''} ${st.title || ''} ${st.description || ''}`.toLowerCase();
      return !/cam\b|hdcam|ts\b|hdts|screener|scr\b|telecine|tc\b/i.test(text);
    });
  }

  // 2. Filter by minimum resolution
  if (settings.minResolution && settings.minResolution !== 'all') {
    const minRank = settings.minResolution === '4k' ? 4 : settings.minResolution === '1080p' ? 3 : 2; // 720p
    streams = streams.filter(st => {
      const text = `${st.name || ''} ${st.title || ''} ${st.description || ''}`;
      const { rank } = getResolutionRank(text);
      return rank >= minRank || rank === 0; // Keep unspecified if no resolution tag
    });
  }

  // 3. Decorate with Flags, Resolution Badges & Debrid Badge
  streams = streams.map(st => {
    const copy = { ...st };
    const fullText = `${copy.name || ''} ${copy.title || ''} ${copy.description || ''}`;
    const flag = settings.showLanguageFlags !== false ? getLanguageFlag(fullText) : '';
    const res = settings.showResolutionBadges !== false ? getResolutionRank(fullText) : { badge: '' };

    let debridBadge = '';
    if (config.debrid?.service === 'torbox' && config.debrid.apiKey) {
      debridBadge = '⚡ TorBox';
    } else if (config.debrid?.service === 'realdebrid' && config.debrid.apiKey) {
      debridBadge = '⚡ RD';
    }

    // Decorate stream name
    const badges = [debridBadge, flag, res.badge].filter(Boolean).join(' ');
    if (badges) {
      if (copy.name && !copy.name.includes(badges)) {
        copy.name = `${copy.name} ${badges}`.trim();
      }
    }

    return copy;
  });

  // 4. Deduplication by InfoHash / URL
  if (settings.removeDuplicates) {
    const seenHashes = new Set<string>();
    const seenUrls = new Set<string>();

    streams = streams.filter(st => {
      if (st.infoHash) {
        const hash = st.infoHash.toLowerCase();
        if (seenHashes.has(hash)) return false;
        seenHashes.add(hash);
      } else if (st.url) {
        if (seenUrls.has(st.url)) return false;
        seenUrls.add(st.url);
      }
      return true;
    });
  }

  // 5. Sorting
  const sortOrder = settings.sortOrder || (settings.prioritizePortuguese ? 'language_pt' : 'source_priority');

  streams.sort((a, b) => {
    const aText = `${a.name || ''} ${a.title || ''} ${a.description || ''}`;
    const bText = `${b.name || ''} ${b.title || ''} ${b.description || ''}`;

    if (sortOrder === 'language_pt' || settings.prioritizePortuguese) {
      const aIsPT = /dublado|pt-br|pt-pt|português|portugues|brazuca|brazil|br|pt\b/i.test(aText);
      const bIsPT = /dublado|pt-br|pt-pt|português|portugues|brazuca|brazil|br|pt\b/i.test(bText);
      if (aIsPT && !bIsPT) return -1;
      if (!aIsPT && bIsPT) return 1;
    }

    if (sortOrder === 'quality' || sortOrder === 'language_pt') {
      const aRes = getResolutionRank(aText).rank;
      const bRes = getResolutionRank(bText).rank;
      if (aRes !== bRes) return bRes - aRes; // Higher resolution first
    }

    if (sortOrder === 'seeders') {
      const aSeedMatch = aText.match(/👤\s*(\d+)|seeders:\s*(\d+)|s:\s*(\d+)/i);
      const bSeedMatch = bText.match(/👤\s*(\d+)|seeders:\s*(\d+)|s:\s*(\d+)/i);
      const aSeeds = aSeedMatch ? parseInt(aSeedMatch[1] || aSeedMatch[2] || aSeedMatch[3] || '0', 10) : 0;
      const bSeeds = bSeedMatch ? parseInt(bSeedMatch[1] || bSeedMatch[2] || bSeedMatch[3] || '0', 10) : 0;
      if (aSeeds !== bSeeds) return bSeeds - aSeeds;
    }

    return 0;
  });

  return streams;
}

// Check individual manifest endpoint
app.post('/api/check-addon', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ success: false, error: 'URL do addon é obrigatória' });
    return;
  }

  const startTime = Date.now();
  const manifest = await fetchSourceManifest(url, 7000);
  const responseTimeMs = Date.now() - startTime;

  if (manifest) {
    res.json({
      success: true,
      responseTimeMs,
      manifest
    });
  } else {
    res.json({
      success: false,
      responseTimeMs,
      error: 'Não foi possível carregar o manifest. Verifique o link e se o servidor do addon está online.'
    });
  }
});

// Check Debrid API Key endpoint
app.post('/api/check-debrid', async (req: Request, res: Response) => {
  const { service, apiKey } = req.body;
  if (!service || service === 'none' || !apiKey) {
    res.status(400).json({ success: false, error: 'Chave de API do Debrid não informada' });
    return;
  }

  try {
    if (service === 'torbox') {
      const resp = await fetch('https://api.torbox.app/v1/api/user/me', {
        headers: { 'Authorization': `Bearer ${apiKey.trim()}` }
      });
      const data = await resp.json();
      if (resp.ok && (data.success || data.data)) {
        const userInfo = data.data || {};
        res.json({
          success: true,
          service: 'TorBox',
          email: userInfo.email || 'Conta TorBox Ativa',
          plan: userInfo.plan === 1 ? 'TorBox Pro' : 'Ativo',
          expires: userInfo.premium_expires_at || 'Ativo',
          message: 'Conexão com TorBox estabelecida com sucesso! ⚡'
        });
      } else {
        res.json({ success: false, error: data.error || data.detail || 'Chave do TorBox inválida ou expirada.' });
      }
    } else if (service === 'realdebrid') {
      const resp = await fetch('https://api.real-debrid.com/rest/1.0/user', {
        headers: { 'Authorization': `Bearer ${apiKey.trim()}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        res.json({
          success: true,
          service: 'RealDebrid',
          email: data.email || data.username,
          plan: data.type === 'premium' ? 'Premium RD' : 'Ativo',
          expires: data.expiration || 'Ativo',
          message: 'Conexão com RealDebrid estabelecida com sucesso! ⚡'
        });
      } else {
        res.json({ success: false, error: 'Chave do RealDebrid inválida ou expirada.' });
      }
    } else {
      res.json({ success: true, service, message: `Configuração de ${service} salva.` });
    }
  } catch (err: any) {
    res.json({ success: false, error: err?.message || 'Falha ao conectar ao serviço Debrid.' });
  }
});

// Test streams endpoint for UI Stream Tester
app.post('/api/test-stream', async (req: Request, res: Response) => {
  const { config, type, id } = req.body;
  if (!config || !type || !id) {
    res.status(400).json({ error: 'Parâmetros ausentes' });
    return;
  }

  const fusionConfig = typeof config === 'string' ? decodeFusionConfig(config) : (config as FusionConfig);
  if (!fusionConfig || !fusionConfig.sources) {
    res.status(400).json({ error: 'Configuração inválida' });
    return;
  }

  const enabledSources = fusionConfig.sources.filter(s => s.enabled);
  const startTime = Date.now();

  const results = await Promise.all(
    enabledSources.map(source => fetchStreamsFromSource(source, type, id, fusionConfig.settings.maxTimeoutMs || 8000))
  );

  const totalTimeMs = Date.now() - startTime;
  let allStreams: StremioStream[] = [];

  const addonResults = results.map(r => {
    allStreams.push(...r.streams);
    return {
      addonId: r.source.id,
      addonName: r.source.name,
      success: !r.error && r.streams.length > 0,
      streamCount: r.streams.length,
      responseTimeMs: r.timeMs,
      error: r.error
    };
  });

  const processedStreams = processAndFilterStreams(allStreams, fusionConfig);

  res.json({
    totalStreams: processedStreams.length,
    latencyMs: totalTimeMs,
    addonResults,
    streams: processedStreams
  });
});

// STREMIO ADDON PROTOCOL ENDPOINTS
// 1. MANIFEST HANDLER
const handleManifest = (req: Request, res: Response) => {
  const token = req.params.token || (req.query.config as string) || (req.query.c as string) || '';
  const config = decodeFusionConfig(token);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'max-age=3600, public');

  const addonIdPart = token ? token.slice(0, 12).replace(/[^a-zA-Z0-9]/g, '') : 'v2';

  // Create fast, non-blocking merged manifest
  const mergedManifest: StremioManifest = {
    id: `com.pluginsbr.stremio.${addonIdPart || 'v2'}`,
    version: '2.2.0',
    name: config.name || 'Plugins BR',
    description: config.description || 'Unificador de Addons do Stremio: junta mídias brasileiras (Brazuca) e globais (Torrentio) em uma lista única sem filtros.',
    resources: ['stream'],
    types: ['movie', 'series', 'anime', 'other'],
    idPrefixes: ['tt', 'kitsu', 'mal', 'tmdb', 'tvdb', 'stremio', 'anime', 'series', 'm'],
    catalogs: [],
    logo: 'https://cdn-icons-png.flaticon.com/512/3172/3172551.png',
    background: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200&q=80',
    behaviorHints: {
      configurable: true,
      configurationRequired: false
    }
  };

  res.json(mergedManifest);
};

app.get('/manifest.json', handleManifest);
app.get('/api/addon/manifest.json', handleManifest);
app.get('/api/addon/:token/manifest.json', handleManifest);
app.get('/:token/manifest.json', handleManifest);

// 2. STREAMS HANDLER
const handleStreams = async (req: Request, res: Response) => {
  const token = req.params.token || (req.query.config as string) || (req.query.c as string) || '';
  let { type, id } = req.params;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'max-age=300, public');

  if (id && id.endsWith('.json')) {
    id = id.slice(0, -5);
  }

  console.log(`[Stremio Stream Request] Type: ${type}, ID: ${id}, Token: ${token ? token.slice(0, 12) + '...' : 'default'}`);

  const config = decodeFusionConfig(token);
  const enabledSources = config.sources.filter(s => s.enabled);

  if (enabledSources.length === 0) {
    res.json({ streams: [] });
    return;
  }

  // Fetch streams concurrently with fail-safe timeout
  const timeout = config.settings.maxTimeoutMs || 8000;
  const fetchPromises = enabledSources.map(src => fetchStreamsFromSource(src, type, id, timeout));

  const results = await Promise.all(fetchPromises);
  let aggregatedStreams: StremioStream[] = [];

  results.forEach(res => {
    if (res.streams && res.streams.length > 0) {
      aggregatedStreams.push(...res.streams);
    }
  });

  const finalStreams = processAndFilterStreams(aggregatedStreams, config);

  console.log(`[Stremio Stream Response] Returning ${finalStreams.length} streams for ${type}/${id}`);

  res.json({ streams: finalStreams });
};

app.get('/stream/:type/:id', handleStreams);
app.get('/stream/:type/:id.json', handleStreams);
app.get('/api/addon/stream/:type/:id', handleStreams);
app.get('/api/addon/stream/:type/:id.json', handleStreams);
app.get('/api/addon/:token/stream/:type/:id', handleStreams);
app.get('/api/addon/:token/stream/:type/:id.json', handleStreams);
app.get('/:token/stream/:type/:id', handleStreams);
app.get('/:token/stream/:type/:id.json', handleStreams);

// 3. CATALOG QUERY
app.get('/catalog/:type/:id*.json', (req: Request, res: Response) => res.json({ metas: [] }));
app.get('/api/addon/catalog/:type/:id*.json', (req: Request, res: Response) => res.json({ metas: [] }));
app.get('/api/addon/:token/catalog/:type/:id*.json', (req: Request, res: Response) => res.json({ metas: [] }));

// START EXPRESS SERVER WITH VITE DEV MIDDLEWARE / STATIC PROD
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Stremio Addon Fusion Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
