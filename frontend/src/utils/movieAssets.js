// Movie metadata, verified authentic poster imagery, and Cineplex thematic assets

export const MOVIE_ASSETS = {
  'Iron Man': {
    poster: 'https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBYI0dWDJa.jpg',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1280&auto=format&fit=crop',
    tagline: 'Heroes aren’t born. They’re built.',
    phase: 'Phase 1',
    format: 'IMAX Remastered',
    accent: '#e23636',
    rating: 'PG-13',
  },
  'Captain America: The First Avenger': {
    poster: 'https://image.tmdb.org/t/p/w500/vSNxAJTlD0r02V9sPYpOjqDZXUK.jpg',
    backdrop: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1280&auto=format&fit=crop',
    tagline: 'When patriots become heroes.',
    phase: 'Phase 1',
    format: 'Dolby Cinema',
    accent: '#3b82f6',
    rating: 'PG-13',
  },
  'The Avengers': {
    poster: 'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg',
    tagline: 'Some assembly required.',
    phase: 'Phase 1 • Climax',
    format: 'IMAX 3D',
    accent: '#06b6d4',
    rating: 'PG-13',
  },
  'Captain America: Civil War': {
    poster: 'https://m.media-amazon.com/images/M/MV5BMjQ0MTgyNjAxMV5BMl5BanBnXkFtZTgwNjUzMDkyODE@._V1_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1280&auto=format&fit=crop',
    tagline: 'Divided we fall.',
    phase: 'Phase 3',
    format: 'IMAX Laser',
    accent: '#ef4444',
    rating: 'PG-13',
  },
  'Thor: Ragnarok': {
    poster: 'https://image.tmdb.org/t/p/w500/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1280&auto=format&fit=crop',
    tagline: 'No hammer. No problem.',
    phase: 'Phase 3',
    format: 'Dolby Atmos',
    accent: '#06b6d4',
    rating: 'PG-13',
  },
  'Avengers: Infinity War': {
    poster: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    backdrop: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=1280&auto=format&fit=crop',
    tagline: 'An entire universe. Once and for all.',
    phase: 'Phase 3',
    format: 'IMAX 70MM',
    accent: '#8b5cf6',
    rating: 'PG-13',
  },
  'Avengers: Endgame': {
    poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    tagline: 'Part of the journey is the end.',
    phase: 'Phase 3 • Finale',
    format: 'IMAX Exclusive',
    accent: '#f59e0b',
    rating: 'PG-13',
  },
  'Avengers: Doomsday': {
    poster: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1280&auto=format&fit=crop',
    tagline: 'The battle for the Multiverse has arrived.',
    phase: 'Phase 6 • Premiere',
    format: 'IMAX 70MM Dual Laser',
    accent: '#10b981',
    rating: 'Expect PG-13',
  },
};

export function getMovieAsset(title) {
  if (!title) return getDefaultAsset();
  const found = Object.keys(MOVIE_ASSETS).find(
    k => title.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(title.toLowerCase())
  );
  if (found) return MOVIE_ASSETS[found];
  return getDefaultAsset(title);
}

function getDefaultAsset(title = 'MCU Film') {
  return {
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1280&auto=format&fit=crop',
    tagline: 'Marvel Cinematic Universe Entry',
    phase: 'Marvel Feature',
    format: 'Dolby Cinema',
    accent: '#e23636',
    rating: 'PG-13',
  };
}

// Generate an SVG data URI poster if network ever fails
export function getFallbackPoster(title, year = '') {
  const safeTitle = (title || 'MCU Film').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141424"/>
        <stop offset="50%" stop-color="#0c0c16"/>
        <stop offset="100%" stop-color="#1e0c14"/>
      </linearGradient>
      <linearGradient id="redGlow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#e23636" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#7a0a0a" stop-opacity="0.2"/>
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#bg)"/>
    <circle cx="200" cy="220" r="120" fill="url(#redGlow)" opacity="0.15"/>
    <rect x="20" y="20" width="360" height="560" rx="16" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2"/>
    <text x="200" y="60" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="900" letter-spacing="4" fill="#e23636">MARVEL STUDIOS</text>
    <g transform="translate(160, 180) scale(1.6)">
      <polygon points="25,5 45,45 5,45" fill="none" stroke="#e23636" stroke-width="3"/>
      <circle cx="25" cy="28" r="12" fill="none" stroke="#f0b429" stroke-width="2"/>
    </g>
    <text x="200" y="380" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">${safeTitle}</text>
    <text x="200" y="415" text-anchor="middle" font-family="monospace" font-size="14" font-weight="600" fill="#f0b429">${year ? `PREMIERE • ${year}` : 'CINEMA RELEASE'}</text>
    <rect x="140" y="445" width="120" height="28" rx="6" fill="#e23636" fill-opacity="0.2" stroke="#e23636" stroke-opacity="0.4"/>
    <text x="200" y="464" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" letter-spacing="2">IMAX 70MM</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
