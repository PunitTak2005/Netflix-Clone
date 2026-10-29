const https = require('https');
const dns = require('dns');

// Configure public DNS resolvers to prevent ISP DNS sinkholing (e.g. JioFiber in India)
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Official AWS CloudFront edge IP fallbacks for api.themoviedb.org
const CLOUDFRONT_IPS = ['65.9.130.24', '65.9.130.126', '65.9.130.53', '65.9.130.129'];
let ipIndex = 0;

// Custom HTTPS Agent that ensures reliable DNS resolution for api.themoviedb.org
const tmdbHttpsAgent = new https.Agent({
  keepAlive: true,
  lookup: (hostname, options, cb) => {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    if (hostname === 'api.themoviedb.org') {
      dns.resolve4(hostname, (err, addrs) => {
        const addresses = (addrs && addrs.length > 0) ? addrs : CLOUDFRONT_IPS;
        if (options && options.all) {
          cb(null, addresses.map(addr => ({ address: addr, family: 4 })));
        } else {
          cb(null, addresses[ipIndex++ % addresses.length], 4);
        }
      });
    } else {
      dns.lookup(hostname, options, cb);
    }
  }
});

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

// In-memory cache for static and semi-static TMDB responses
const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCached(key, data, ttlSeconds) {
  cache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

/**
 * Validates TMDB API credentials configuration
 */
function validateCredentials() {
  const apiKey = process.env.TMDB_API_KEY;
  const accessToken = process.env.TMDB_ACCESS_TOKEN;
  if (!apiKey && !accessToken) {
    return {
      valid: false,
      message: 'TMDB credentials are not configured on server. Please configure TMDB_API_KEY in server environment.'
    };
  }
  return { valid: true, apiKey, accessToken };
}

/**
 * Centralized HTTP request helper for TMDB API with server-side caching and security
 * @param {string} endpoint - Path relative to base URL, e.g. '/movie/popular'
 * @param {object} params - Query parameters
 * @param {number} [cacheTtl] - Cache duration in seconds (optional)
 * @returns {Promise<any>}
 */
function fetchFromTMDB(endpoint, params = {}, cacheTtl = 0) {
  const cacheKey = `${endpoint}?${JSON.stringify(params)}`;
  if (cacheTtl > 0) {
    const cached = getCached(cacheKey);
    if (cached) {
      return Promise.resolve(cached);
    }
  }

  return new Promise((resolve, reject) => {
    const creds = validateCredentials();
    if (!creds.valid) {
      const err = new Error(creds.message);
      err.code = 'TMDB_CREDENTIALS_MISSING';
      err.status = 500;
      return reject(err);
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${TMDB_BASE_URL}${cleanEndpoint}`);

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Netflix-Clone-Backend/1.0'
    };

    if (creds.accessToken) {
      headers['Authorization'] = `Bearer ${creds.accessToken}`;
    } else {
      url.searchParams.set('api_key', creds.apiKey);
    }

    // Attach additional safe query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        url.searchParams.set(key, String(params[key]));
      }
    });

    const requestOptions = {
      hostname: url.hostname,
      port: 443,
      path: `${url.pathname}${url.search}`,
      method: 'GET',
      headers,
      agent: tmdbHttpsAgent,
      timeout: 15000 // 15s server-side timeout
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            if (cacheTtl > 0) {
              setCached(cacheKey, parsed, cacheTtl);
            }
            resolve(parsed);
          } else {
            const errorMsg = parsed.status_message || `TMDB API returned HTTP ${res.statusCode}`;
            const err = new Error(errorMsg);
            err.code = res.statusCode === 401 ? 'TMDB_UNAUTHORIZED' : (res.statusCode === 404 ? 'TMDB_NOT_FOUND' : 'TMDB_ERROR');
            err.status = res.statusCode;
            reject(err);
          }
        } catch (e) {
          const err = new Error('Movie data is temporarily unavailable.');
          err.code = 'TMDB_UNAVAILABLE';
          err.status = 502;
          reject(err);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const err = new Error('Movie data is temporarily unavailable.');
      err.code = 'TMDB_UNAVAILABLE';
      err.status = 504;
      reject(err);
    });

    req.on('error', () => {
      const err = new Error('Movie data is temporarily unavailable.');
      err.code = 'TMDB_UNAVAILABLE';
      err.status = 503;
      reject(err);
    });

    req.end();
  });
}

const tmdbService = {
  validateCredentials,
  fetchFromTMDB,
  // Static metadata: Cache configuration for 24h, genres for 12h
  getConfiguration: () => fetchFromTMDB('/configuration', {}, 86400),
  getGenres: (mediaType = 'movie') => fetchFromTMDB(`/genre/${mediaType}/list`, {}, 43200),
  // Feed data: Cache for 5 minutes (300s)
  getPopular: (mediaType = 'movie', page = 1) => fetchFromTMDB(`/${mediaType}/popular`, { page }, 300),
  getTopRated: (mediaType = 'movie', page = 1) => fetchFromTMDB(`/${mediaType}/top_rated`, { page }, 300),
  getNowPlaying: (page = 1) => fetchFromTMDB('/movie/now_playing', { page }, 300),
  getUpcoming: (page = 1) => fetchFromTMDB('/movie/upcoming', { page }, 300),
  getTrending: (mediaType = 'all', timeWindow = 'day') => fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`, {}, 300),
  discoverByGenre: (mediaType = 'movie', genreId, page = 1) => fetchFromTMDB(`/discover/${mediaType}`, { with_genres: genreId, page }, 300),
  getByCustomGenre: (mediaType = 'movie', apiString = 'popular', page = 1) => fetchFromTMDB(`/${mediaType}/${apiString}`, { page }, 300),
  getDetails: (mediaType = 'movie', id, append = 'videos') => fetchFromTMDB(`/${mediaType}/${id}`, { append_to_response: append }, 300),
  getSimilar: (mediaType = 'movie', id, page = 1) => fetchFromTMDB(`/${mediaType}/${id}/similar`, { page }, 300),
  search: (query, page = 1) => fetchFromTMDB('/search/multi', { query, page }, 60)
};

module.exports = tmdbService;
