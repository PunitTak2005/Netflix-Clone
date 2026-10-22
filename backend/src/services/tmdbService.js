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

/**
 * Validates TMDB API credentials configuration
 */
function validateCredentials() {
  const apiKey = process.env.TMDB_API_KEY || process.env.VITE_APP_TMDB_V3_API_KEY;
  const accessToken = process.env.TMDB_ACCESS_TOKEN;
  if (!apiKey && !accessToken) {
    return {
      valid: false,
      message: 'TMDB credentials are not configured. Set TMDB_API_KEY or TMDB_ACCESS_TOKEN in backend/.env'
    };
  }
  return { valid: true, apiKey, accessToken };
}

/**
 * Centralized HTTP request helper for TMDB API
 * @param {string} endpoint - Path relative to base URL, e.g. '/movie/popular'
 * @param {object} params - Query parameters
 * @returns {Promise<any>}
 */
function fetchFromTMDB(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const creds = validateCredentials();
    if (!creds.valid) {
      const err = new Error(creds.message);
      err.status = 500;
      return reject(err);
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${TMDB_BASE_URL}${cleanEndpoint}`);

    // If using Bearer Access Token vs v3 API Key query parameter
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

    // Attach additional query parameters (e.g. page, with_genres, append_to_response, query)
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        url.searchParams.set(key, params[key]);
      }
    });

    const requestOptions = {
      hostname: url.hostname,
      port: 443,
      path: `${url.pathname}${url.search}`,
      method: 'GET',
      headers,
      agent: tmdbHttpsAgent,
      timeout: 10000
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            const errorMsg = parsed.status_message || `TMDB API error with status code ${res.statusCode}`;
            const err = new Error(errorMsg);
            err.status = res.statusCode;
            err.tmdbCode = parsed.status_code;
            reject(err);
          }
        } catch (e) {
          const err = new Error(`Failed to parse TMDB response: ${e.message}`);
          err.status = 500;
          reject(err);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const err = new Error('TMDB API request timed out');
      err.status = 504;
      reject(err);
    });

    req.on('error', (err) => {
      const error = new Error(`TMDB connection failed: ${err.message}`);
      error.status = 502;
      reject(error);
    });

    req.end();
  });
}

const tmdbService = {
  validateCredentials,
  fetchFromTMDB,
  getConfiguration: () => fetchFromTMDB('/configuration'),
  getGenres: (mediaType = 'movie') => fetchFromTMDB(`/genre/${mediaType}/list`),
  getPopular: (mediaType = 'movie', page = 1) => fetchFromTMDB(`/${mediaType}/popular`, { page }),
  getTopRated: (mediaType = 'movie', page = 1) => fetchFromTMDB(`/${mediaType}/top_rated`, { page }),
  getNowPlaying: (page = 1) => fetchFromTMDB('/movie/now_playing', { page }),
  getUpcoming: (page = 1) => fetchFromTMDB('/movie/upcoming', { page }),
  getTrending: (mediaType = 'all', timeWindow = 'day') => fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`),
  discoverByGenre: (mediaType = 'movie', genreId, page = 1) => fetchFromTMDB(`/discover/${mediaType}`, { with_genres: genreId, page }),
  getByCustomGenre: (mediaType = 'movie', apiString = 'popular', page = 1) => fetchFromTMDB(`/${mediaType}/${apiString}`, { page }),
  getDetails: (mediaType = 'movie', id, append = 'videos') => fetchFromTMDB(`/${mediaType}/${id}`, { append_to_response: append }),
  getSimilar: (mediaType = 'movie', id, page = 1) => fetchFromTMDB(`/${mediaType}/${id}/similar`, { page }),
  search: (query, page = 1) => fetchFromTMDB('/search/multi', { query: encodeURIComponent(query).replace(/%20/g, '+'), page })
};

module.exports = tmdbService;
