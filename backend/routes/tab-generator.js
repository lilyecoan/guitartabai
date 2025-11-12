const express = require('express');
const router = express.Router();
const youtubeHandler = require('../services/youtube-handler');
const chordDetector = require('../services/chord-detector');

// Store processed songs in memory (use a database in production)
const songCache = new Map();

// Generate tabs from YouTube URL
router.post('/generate', async (req, res) => {
  try {
    const { youtubeUrl } = req.body;

    if (!youtubeUrl) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    console.log('Processing request for:', youtubeUrl);

    // Step 1: Extract video ID and check cache
    const videoId = youtubeHandler.extractVideoId(youtubeUrl);
    
    if (songCache.has(videoId)) {
      console.log('Returning cached result');
      return res.json(songCache.get(videoId));
    }

    // Step 2: Get video information
    const videoInfo = await youtubeHandler.getVideoInfo(youtubeUrl);
    
    // Step 3: Generate tabs using AI
    const tabData = await chordDetector.analyzeAndGenerateTabs(
      videoInfo.title,
      videoInfo.duration
    );

    // Combine all data
    const result = {
      videoId,
      ...videoInfo,
      ...tabData,
      generatedAt: new Date().toISOString()
    };

    // Cache the result
    songCache.set(videoId, result);

    // Return complete result
    res.json(result);

  } catch (error) {
    console.error('Tab generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate tabs', 
      message: error.message 
    });
  }
});

// Get cached tab data
router.get('/song/:videoId', (req, res) => {
  const { videoId } = req.params;
  
  if (songCache.has(videoId)) {
    res.json(songCache.get(videoId));
  } else {
    res.status(404).json({ error: 'Song not found in cache' });
  }
});

// Poll for processing status (for async processing)
router.get('/status/:videoId', async (req, res) => {
  const { videoId } = req.params;
  
  if (songCache.has(videoId)) {
    const data = songCache.get(videoId);
    res.json({ 
      status: 'complete', 
      data 
    });
  } else {
    res.json({ 
      status: 'processing',
      message: 'Still analyzing...' 
    });
  }
});

module.exports = router;