const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');

// GET /api/tmdb/configuration
router.get('/configuration', async (req, res, next) => {
  try {
    const data = await tmdbService.getConfiguration();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/tmdb/genre/:mediaType/list or /genres/:mediaType
router.get(['/genre/:mediaType/list', '/genres/:mediaType'], async (req, res, next) => {
  try {
    const { mediaType } = req.params;
    const data = await tmdbService.getGenres(mediaType);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/tmdb/discover/:mediaType
router.get('/discover/:mediaType', async (req, res, next) => {
  try {
    const { mediaType } = req.params;
    const { with_genres, page } = req.query;
    const data = await tmdbService.discoverByGenre(mediaType, with_genres, page || 1);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/tmdb/trending/:mediaType/:timeWindow
router.get('/trending/:mediaType/:timeWindow', async (req, res, next) => {
  try {
    const { mediaType, timeWindow } = req.params;
    const data = await tmdbService.getTrending(mediaType, timeWindow);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/tmdb/search/multi or /search
router.get(['/search/multi', '/search'], async (req, res, next) => {
  try {
    const query = req.query.query || '';
    const page = req.query.page || 1;
    if (!query.trim()) {
      return res.json({ page: 1, results: [], total_pages: 0, total_results: 0 });
    }
    const data = await tmdbService.search(query, page);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/tmdb/:mediaType/:id/similar
router.get('/:mediaType/:id/similar', async (req, res, next) => {
  try {
    const { mediaType, id } = req.params;
    const page = req.query.page || 1;
    const data = await tmdbService.getSimilar(mediaType, id, page);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/tmdb/:mediaType/:id (Details) OR /:mediaType/:apiString (e.g. popular, top_rated)
router.get('/:mediaType/:identifier', async (req, res, next) => {
  try {
    const { mediaType, identifier } = req.params;
    // Check if identifier is numeric (Movie/TV ID) or string (e.g. 'popular', 'top_rated', 'now_playing', 'upcoming')
    const isId = /^\d+$/.test(identifier);
    if (isId) {
      const append = req.query.append_to_response || 'videos';
      const data = await tmdbService.getDetails(mediaType, identifier, append);
      return res.json(data);
    } else {
      const page = req.query.page || 1;
      const data = await tmdbService.getByCustomGenre(mediaType, identifier, page);
      return res.json(data);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
