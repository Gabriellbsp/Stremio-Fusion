import { AddonPreset } from '../types';

export const POPULAR_PRESETS: AddonPreset[] = [
  {
    id: 'brazuca-torrents',
    name: 'Brazuca Torrents',
    description: 'Focado em conteúdos dublados e legendados em Português do Brasil (PT-BR), filmes e séries nacionais.',
    category: 'PT-BR',
    manifestUrl: 'https://brazucatorrents.baby-beamup.club/manifest.json',
    recommendedPrefix: '🇧🇷 Brazuca',
    tags: ['PT-BR', 'Dublado', 'Nacional', 'Torrent']
  },
  {
    id: 'torrentio',
    name: 'Torrentio (Padrão)',
    description: 'Provedor global de streams torrents com suporte a múltiplos rastreadores e Debrid.',
    category: 'Global',
    manifestUrl: 'https://torrentio.strem.fun/manifest.json',
    recommendedPrefix: '⚡ Torrentio',
    tags: ['Global', '4K', 'Multi-Legendas', 'Torrent']
  },
  {
    id: 'torrentio-elfhosted',
    name: 'Torrentio (Elfhosted Mirror)',
    description: 'Espelho alternativo do Torrentio hospedado na Elfhosted para maior estabilidade.',
    category: 'Global',
    manifestUrl: 'https://torrentio.elfhosted.com/manifest.json',
    recommendedPrefix: '⚡ Torrentio Alt',
    tags: ['Global', 'Mirror', 'Estável']
  },
  {
    id: 'knightcrawler',
    name: 'KnightCrawler',
    description: 'Rastreador de torrents de alta velocidade baseado no indexador Torrentio.',
    category: 'Global',
    manifestUrl: 'https://knightcrawler.elfhosted.com/manifest.json',
    recommendedPrefix: '🗡️ KnightCrawler',
    tags: ['Global', 'Torrents', 'Fast']
  },
  {
    id: 'comet',
    name: 'Comet Stremio Addon',
    description: 'Addon de alta velocidade com suporte a torrents e debrid com buscas em tempo real.',
    category: 'Global',
    manifestUrl: 'https://comet.elfhosted.com/manifest.json',
    recommendedPrefix: '☄️ Comet',
    tags: ['Global', 'High Speed', 'Debrid']
  },
  {
    id: 'cyberflix-catalog',
    name: 'CyberFlix Catalog',
    description: 'Catálogo de filmes e séries por plataformas de streaming (Netflix, Prime, Disney+, HBO Max, etc).',
    category: 'Catalogs',
    manifestUrl: 'https://cyberflix.kodi.al/manifest.json',
    recommendedPrefix: '🎬 CyberFlix',
    tags: ['Catálogo', 'Plataformas', 'Organização']
  }
];
