export interface StremioManifest {
  id: string;
  version: string;
  name: string;
  description?: string;
  resources?: (string | { name: string; types: string[]; idPrefixes?: string[] })[];
  types?: string[];
  catalogs?: Array<{
    id: string;
    type: string;
    name: string;
    extra?: Array<{ name: string; isRequired?: boolean; options?: string[] }>;
  }>;
  background?: string;
  logo?: string;
  icon?: string;
  idPrefixes?: string[];
  behaviorHints?: {
    configurable?: boolean;
    configurationRequired?: boolean;
    adult?: boolean;
    p2p?: boolean;
  };
}

export interface StremioStream {
  name?: string;
  title?: string;
  description?: string;
  url?: string;
  infoHash?: string;
  fileIdx?: number;
  ytId?: string;
  externalUrl?: string;
  behaviorHints?: {
    countryWhitelist?: string[];
    notSupported?: boolean;
    proxyHeaders?: Record<string, string>;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface StremioMeta {
  id: string;
  type: string;
  name: string;
  poster?: string;
  background?: string;
  logo?: string;
  description?: string;
  releaseInfo?: string;
  imdbRating?: string;
  genres?: string[];
  cast?: string[];
  director?: string[];
  year?: number;
  [key: string]: any;
}

export interface SourceAddon {
  id: string;
  name: string;
  manifestUrl: string;
  enabled: boolean;
  prefixTag?: string; // e.g. "[Brazuca]", "[Torrentio]"
  priority: number; // lower number = higher priority
  timeoutMs?: number; // custom timeout per source
  lastHealthCheck?: {
    status: 'ok' | 'error' | 'testing';
    responseTimeMs?: number;
    message?: string;
    checkedAt?: string;
  };
}

export interface DebridConfig {
  service: 'none' | 'torbox' | 'realdebrid' | 'alldebrid' | 'premiumize';
  apiKey?: string;
  autoUnrestrict?: boolean;
}

export interface FusionConfig {
  name: string;
  description: string;
  sources: SourceAddon[];
  debrid?: DebridConfig;
  settings: {
    prioritizePortuguese: boolean;
    removeDuplicates: boolean;
    tagSourceNames: boolean;
    maxTimeoutMs: number;
    sortOrder: 'quality' | 'source_priority' | 'seeders' | 'language_pt';
    groupStreamsBySource: boolean;
    showLanguageFlags: boolean; // Add flags like 🇧🇷, 🇺🇸, 🇪🇸, 🇯🇵
    showResolutionBadges: boolean; // Add badges like ✨ 4K, 📺 1080p, 📹 720p
    minResolution: 'all' | '720p' | '1080p' | '4k';
    filterCamScr: boolean; // Hide CAM / TS / Screener low quality
    preferredLanguages: string[]; // e.g. ['PT-BR', 'EN', 'ES']
  };
}

export interface StreamTestResponse {
  totalStreams: number;
  latencyMs: number;
  addonResults: {
    addonId: string;
    addonName: string;
    success: boolean;
    streamCount: number;
    responseTimeMs: number;
    error?: string;
  }[];
  streams: StremioStream[];
}

export interface AddonPreset {
  id: string;
  name: string;
  description: string;
  category: 'PT-BR' | 'Global' | 'Catalogs' | 'Debrid';
  manifestUrl: string;
  logo?: string;
  recommendedPrefix: string;
  tags: string[];
}
