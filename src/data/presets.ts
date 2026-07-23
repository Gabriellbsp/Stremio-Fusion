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
    id: 'comando-torrents',
    name: 'Comando Torrents / PT-BR',
    description: 'Indexador focado no catálogo do Comando Torrents e lançamentos dublados PT-BR.',
    category: 'PT-BR',
    manifestUrl: 'https://comando-torrents.baby-beamup.club/manifest.json',
    recommendedPrefix: '🏴‍☠️ Comando BR',
    tags: ['PT-BR', 'Dublado', 'Comando', 'Lançamentos']
  },
  {
    id: 'mico-leao-dublado',
    name: 'Míco Leão Dublado',
    description: 'Especializado em filmes e animações dublados em Português do Brasil.',
    category: 'PT-BR',
    manifestUrl: 'https://micoleao.baby-beamup.club/manifest.json',
    recommendedPrefix: '🦁 MícoLeão',
    tags: ['PT-BR', 'Dublado', 'Desenhos', 'Filmes']
  },
  {
    id: 'torrentio-ptbr',
    name: 'Torrentio (Filtro PT-BR)',
    description: 'Versão do Torrentio otimizada com foco em rastreadores que contêm áudio em Português.',
    category: 'PT-BR',
    manifestUrl: 'https://torrentio.strem.fun/sort=quality|qualityfilter=scr,cam|language=portuguese/manifest.json',
    recommendedPrefix: '⚡ Torrentio BR',
    tags: ['PT-BR', 'Dublado', 'Multi-Áudio', 'Torrent']
  },
  {
    id: 'torrentio-global',
    name: 'Torrentio (Padrão Global)',
    description: 'Provedor global de streams torrents com suporte a múltiplos rastreadores e Debrid.',
    category: 'Global',
    manifestUrl: 'https://torrentio.strem.fun/manifest.json',
    recommendedPrefix: '⚡ Torrentio',
    tags: ['Global', '4K', 'Multi-Legendas', 'Torrent']
  },
  {
    id: 'knightcrawler',
    name: 'KnightCrawler Global',
    description: 'Rastreador alternativo de torrents de alta resiliência e grande acervo.',
    category: 'Global',
    manifestUrl: 'https://knightcrawler.elfhosted.com/manifest.json',
    recommendedPrefix: '⚔️ KnightCrawler',
    tags: ['Global', 'Torrent', 'Multi-Áudio']
  },
  {
    id: 'jackettio',
    name: 'Jackettio Global',
    description: 'Indexador global de torrents com alta cobertura de fontes internacionais.',
    category: 'Global',
    manifestUrl: 'https://jackettio.elfhosted.com/manifest.json',
    recommendedPrefix: '🛡️ Jackettio',
    tags: ['Global', 'Indexador', 'Internacional']
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
