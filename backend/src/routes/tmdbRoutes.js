const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');

const VALID_MEDIA_TYPES = new Set(['movie', 'tv', 'all']);

// GET /api/tmdb/configuration
router.get('/configuration', async (req, res, next) => {
  try {
    const data = await tmdbService.getConfiguration();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/tmdb/genres/:mediaType or /genre/:mediaType/list
router.get(['/genres/:mediaType', '/genre/:mediaType/list'], async (req, res, next) => {
  try {
    const mediaType = req.params.mediaType || 'movie';
    if (!VALID_MEDIA_TYPES.has(mediaType)) {
      return res.status(400).json({ success: false, error: 'INVALID_PARAMETER', message: 'Invalid mediaType parameter' });
    }
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
    if (!VALID_MEDIA_TYPES.has(mediaType)) {
      return res.status(400).json({ success: false, error: 'INVALID_PARAMETER', message: 'Invalid mediaType parameter' });
    }
    const { with_genres, page } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const data = await tmdbService.discoverByGenre(mediaType, with_genres, pageNum);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/tmdb/trending/:mediaType/:timeWindow
router.get('/trending/:mediaType/:timeWindow', async (req, res, next) => {
  try {
    const { mediaType, timeWindow } = req.params;
    const validWindows = new Set(['day', 'week']);
    if (!VALID_MEDIA_TYPES.has(mediaType) || !validWindows.has(timeWindow)) {
      return res.status(400).json({ success: false, error: 'INVALID_PARAMETER', message: 'Invalid trending parameters' });
    }
    const data = await tmdbService.getTrending(mediaType, timeWindow);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/tmdb/search/multi or /search
router.get(['/search/multi', '/search'], async (req, res, next) => {
  try {
    const query = (req.query.query || '').trim();
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    if (!query) {
      return res.json({ page: 1, results: [], total_pages: 0, total_results: 0 });
    }
    const data = await tmdbService.search(query, pageNum);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/tmdb/:mediaType/:id/similar
router.get('/:mediaType/:id/similar', async (req, res, next) => {
  try {
    const { mediaType, id } = req.params;
    if (!VALID_MEDIA_TYPES.has(mediaType)) {
      return res.status(400).json({ success: false, error: 'INVALID_PARAMETER', message: 'Invalid mediaType parameter' });
    }
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const data = await tmdbService.getSimilar(mediaType, id, pageNum);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/tmdb/:mediaType/:identifier (Details by numeric ID, or list by custom category e.g. popular, top_rated)
router.get('/:mediaType/:identifier', async (req, res, next) => {
  try {
    const { mediaType, identifier } = req.params;
    if (!VALID_MEDIA_TYPES.has(mediaType)) {
      return res.status(400).json({ success: false, error: 'INVALID_PARAMETER', message: 'Invalid mediaType parameter' });
    }

    const isNumericId = /^\d+$/.test(identifier);
    if (isNumericId) {
      const append = req.query.append_to_response || 'videos';
      const data = await tmdbService.getDetails(mediaType, identifier, append);
      return res.json(data);
    } else {
      const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
      const data = await tmdbService.getByCustomGenre(mediaType, identifier, pageNum);
      return res.json(data);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
