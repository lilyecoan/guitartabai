const fs = require('fs');
const path = require('path');
const https = require('https');

class YouTubeHandler {
  constructor() {
    this.tempDir = path.join(__dirname, '../../temp');
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  extractVideoId(url) {
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    throw new Error('Invalid YouTube URL');
  }

  async getVideoInfo(url) {
    try {
      const videoId = this.extractVideoId(url);
      
      // Use YouTube's oEmbed API (no API key needed, public endpoint)
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      
      console.log('Fetching video info from YouTube oEmbed API...');
      
      const videoData = await this.fetchJSON(oembedUrl);
      
      // Extract estimated duration from title or use default
      // For now, we'll use a default since oEmbed doesn't provide duration
      const estimatedDuration = 180; // 3 minutes default
      
      return {
        videoId,
        title: videoData.title || 'Unknown Song',
        duration: estimatedDuration,
        author: videoData.author_name || 'Unknown Artist',
        thumbnail: videoData.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      };
    } catch (error) {
      console.error('Video info error:', error.message);
      // Return fallback info
      const videoId = this.extractVideoId(url);
      return this.getFallbackVideoInfo(videoId, url);
    }
  }

  async fetchJSON(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (e) {
            reject(new Error('Failed to parse JSON response'));
          }
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  getFallbackVideoInfo(videoId, url) {
    console.log('Using fallback video info for:', videoId);
    return {
      videoId,
      title: 'Song from YouTube',
      duration: 180, // Default 3 minutes
      author: 'Unknown Artist',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      note: 'Could not fetch complete video information. Tabs will still be generated.'
    };
  }

  async downloadAudio(url) {
    // Audio download not implemented in simplified version
    // This is optional for the MVP since we're using AI analysis
    console.log('Audio download skipped - using AI analysis only');
    return null;
  }

  cleanup(videoId) {
    const filePath = path.join(this.tempDir, `${videoId}.mp3`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Cleaned up temporary audio file');
    }
  }
}

module.exports = new YouTubeHandler();