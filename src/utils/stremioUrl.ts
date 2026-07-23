import { FusionConfig, SourceAddon } from '../types';

/**
 * Converts stremio:// protocol URLs to https:// protocol URLs
 */
export function normalizeStremioUrl(url: string): string {
  let cleaned = url.trim();
  if (cleaned.startsWith('stremio://')) {
    cleaned = 'https://' + cleaned.slice(10);
  }
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }

  // Auto-rewrite dead Brazuca domain to active mirror
  if (cleaned.includes('brazucatorrents.baby-beamup.club')) {
    cleaned = cleaned.replace('brazucatorrents.baby-beamup.club', '94c8cb9f702d-brazuca-torrents.baby-beamup.club');
  }

  // Ensure manifest.json is at the end if it's missing manifest
  if (!cleaned.endsWith('/manifest.json') && !cleaned.includes('manifest.json')) {
    cleaned = cleaned.replace(/\/$/, '') + '/manifest.json';
  }
  return cleaned;
}

/**
 * Serializes FusionConfig into a compact, URL-safe base64 token
 */
export function encodeFusionConfig(config: FusionConfig): string {
  try {
    // Minify source manifest URLs by removing common prefixes/suffixes
    const minifiedSources = config.sources.map(src => {
      let url = src.manifestUrl || '';
      // Compress common host patterns if possible
      url = url.replace(/^https?:\/\//, '');
      if (url.endsWith('/manifest.json')) {
        url = url.slice(0, -14);
      }

      return {
        i: src.id,
        n: src.name,
        u: url,
        e: src.enabled ? 1 : 0,
        p: src.prefixTag || '',
        o: src.priority,
        t: src.timeoutMs || 8000
      };
    });

    const compact = {
      n: config.name || 'Plugins BR',
      d: config.description || 'Unificador de Addons do Stremio',
      s: minifiedSources,
      db: config.debrid?.service && config.debrid.service !== 'none' ? {
        s: config.debrid.service,
        k: config.debrid.apiKey || '',
        u: config.debrid.autoUnrestrict ? 1 : 0
      } : undefined,
      st: {
        p: config.settings.prioritizePortuguese ? 1 : 0,
        d: config.settings.removeDuplicates ? 1 : 0,
        t: config.settings.tagSourceNames ? 1 : 0,
        m: config.settings.maxTimeoutMs === 8000 ? undefined : config.settings.maxTimeoutMs,
        s: config.settings.sortOrder === 'source_priority' ? undefined : config.settings.sortOrder,
        g: config.settings.groupStreamsBySource ? 1 : 0,
        f: config.settings.showLanguageFlags === false ? 0 : 1,
        r: config.settings.showResolutionBadges === false ? 0 : 1,
        mr: config.settings.minResolution || 'all',
        fc: config.settings.filterCamScr ? 1 : 0,
        pl: config.settings.preferredLanguages && config.settings.preferredLanguages.length > 0 ? config.settings.preferredLanguages : undefined
      }
    };

    const jsonStr = JSON.stringify(compact);
    let base64 = '';
    if (typeof Buffer !== 'undefined') {
      base64 = Buffer.from(jsonStr, 'utf-8').toString('base64');
    } else {
      const codeUnits = new Uint8Array(new TextEncoder().encode(jsonStr));
      let bin = '';
      for (let i = 0; i < codeUnits.length; i++) {
        bin += String.fromCharCode(codeUnits[i]);
      }
      base64 = btoa(bin);
    }
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (err) {
    console.error('Failed to encode FusionConfig', err);
    return '';
  }
}

/**
 * Decodes base64 token back into FusionConfig
 */
export function decodeFusionConfig(token?: string): FusionConfig {
  const defaultConfig: FusionConfig = {
    name: 'Plugins BR',
    description: 'Unificador de Addons do Stremio: junta mídias brasileiras (Brazuca) e globais (Torrentio) em uma lista única sem filtros.',
    sources: [
      {
        id: 'src_brazuca_default',
        name: 'Brazuca Torrents',
        manifestUrl: 'https://94c8cb9f702d-brazuca-torrents.baby-beamup.club/manifest.json',
        enabled: true,
        prefixTag: '🇧🇷 Brazuca',
        priority: 1,
        timeoutMs: 8000
      },
      {
        id: 'src_torrentio_global_default',
        name: 'Torrentio / TPB Global',
        manifestUrl: 'https://stremio-tpb.vercel.app/manifest.json',
        enabled: true,
        prefixTag: '⚡ Torrentio Global',
        priority: 2,
        timeoutMs: 8000
      },
      {
        id: 'src_torrentio_default',
        name: 'Torrentio (Direto)',
        manifestUrl: 'https://torrentio.strem.fun/manifest.json',
        enabled: true,
        prefixTag: '⚡ Torrentio',
        priority: 3,
        timeoutMs: 8000
      }
    ],
    settings: {
      prioritizePortuguese: false,
      removeDuplicates: true,
      tagSourceNames: true,
      maxTimeoutMs: 8000,
      sortOrder: 'source_priority',
      groupStreamsBySource: false,
      showLanguageFlags: true,
      showResolutionBadges: true,
      minResolution: 'all',
      filterCamScr: false,
      preferredLanguages: ['PT-BR', 'EN']
    },
    debrid: {
      service: 'none',
      apiKey: '',
      autoUnrestrict: true
    }
  };

  if (!token || token.trim() === '' || token === 'default' || token === 'v1') {
    return defaultConfig;
  }

  try {
    let base64 = token.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    let compact: any = null;

    // Strategy 1: Buffer / TextDecoder
    try {
      let jsonStr = '';
      if (typeof Buffer !== 'undefined') {
        jsonStr = Buffer.from(base64, 'base64').toString('utf-8');
      } else {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        jsonStr = new TextDecoder('utf-8').decode(bytes);
      }
      compact = JSON.parse(jsonStr);
    } catch (e1) {
      // Strategy 2: Legacy unescape / escape atob
      try {
        const binary = typeof Buffer !== 'undefined' ? Buffer.from(base64, 'base64').toString('binary') : atob(base64);
        const jsonStr = decodeURIComponent(escape(binary));
        compact = JSON.parse(jsonStr);
      } catch (e2) {
        // Strategy 3: Raw atob
        try {
          const binary = typeof Buffer !== 'undefined' ? Buffer.from(base64, 'base64').toString('utf-8') : atob(base64);
          compact = JSON.parse(binary);
        } catch (e3) {
          compact = null;
        }
      }
    }

    if (!compact || typeof compact !== 'object') return defaultConfig;

    const decodedName = compact.n || defaultConfig.name;

    return {
      name: decodedName,
      description: compact.d || defaultConfig.description,
      sources: Array.isArray(compact.s)
        ? compact.s.map((src: any, idx: number) => {
            let rawUrl = src.u || '';
            if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
              rawUrl = 'https://' + rawUrl;
            }
            if (rawUrl && !rawUrl.endsWith('/manifest.json') && !rawUrl.includes('manifest.json')) {
              rawUrl = rawUrl.replace(/\/$/, '') + '/manifest.json';
            }

            return {
              id: src.i || `src_${idx}`,
              name: src.n || 'Addon',
              manifestUrl: rawUrl,
              enabled: src.e !== 0,
              prefixTag: src.p || '',
              priority: src.o ?? (idx + 1),
              timeoutMs: src.t || 8000
            };
          })
        : defaultConfig.sources,
      debrid: compact.db ? {
        service: compact.db.s || 'none',
        apiKey: compact.db.k || '',
        autoUnrestrict: compact.db.u !== 0
      } : defaultConfig.debrid,
      settings: {
        prioritizePortuguese: compact.st?.p !== 0,
        removeDuplicates: compact.st?.d !== 0,
        tagSourceNames: compact.st?.t !== 0,
        maxTimeoutMs: compact.st?.m || 8000,
        sortOrder: compact.st?.s || 'source_priority',
        groupStreamsBySource: compact.st?.g === 1,
        showLanguageFlags: compact.st?.f !== 0,
        showResolutionBadges: compact.st?.r !== 0,
        minResolution: compact.st?.mr || 'all',
        filterCamScr: compact.st?.fc === 1,
        preferredLanguages: Array.isArray(compact.st?.pl) ? compact.st.pl : ['PT-BR', 'EN']
      }
    };
  } catch (err) {
    console.warn('[Fusion] Failed to decode token, falling back to default configuration:', err);
    return defaultConfig;
  }
}

/**
 * Generates install links for Stremio with ultra-clean, short URL support
 */
export function getStremioInstallUrls(token: string, originUrl?: string) {
  let origin = originUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  // CRITICAL: Convert dev URL (ais-dev-) to public preview URL (ais-pre-)
  // External apps like Stremio on PC/Mobile/TV cannot authenticate with dev workspace cookies,
  // so they must connect to the public ais-pre- endpoint.
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  }

  // Clean, short direct URL without path bloat
  const cleanManifestPath = `/manifest.json`;
  const cleanHttpsUrl = `${origin}${cleanManifestPath}`;
  const cleanStremioUrl = cleanHttpsUrl.replace(/^https?:\/\//, 'stremio://');

  // Custom parameterized URL using path token /:token/manifest.json (preserves path on Stremio sub-requests)
  const customManifestPath = token ? `/${token}/manifest.json` : `/manifest.json`;
  const httpsUrl = `${origin}${customManifestPath}`;
  const stremioUrl = httpsUrl.replace(/^https?:\/\//, 'stremio://');

  return {
    cleanHttpsUrl,
    cleanStremioUrl,
    httpsUrl,
    stremioUrl,
    webStremioUrl: `https://web.stremio.com/#/addons?addon=${encodeURIComponent(httpsUrl)}`,
    cleanWebStremioUrl: `https://web.stremio.com/#/addons?addon=${encodeURIComponent(cleanHttpsUrl)}`
  };
}
