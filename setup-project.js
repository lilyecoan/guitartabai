const fs = require('fs');
const path = require('path');

console.log('🎸 Setting up Guitar Tab AI project...\n');

// Create directories
const directories = [
  'backend/routes',
  'backend/services',
  'backend/utils',
  'frontend',
  'temp'
];

directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log('✓ Created directory: ' + dir);
  }
});

// YouTube Handler content
const youtubeHandlerContent = `const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

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
    const patterns = [
      /(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/|youtube\\.com\\/embed\\/)([^&\\n?#]+)/,
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
      const info = await ytdl.getInfo(videoId);
      
      return {
        videoId,
        title: info.videoDetails.title,
        duration: parseInt(info.videoDetails.lengthSeconds),
        author: info.videoDetails.author.name,
        thumbnail: info.videoDetails.thumbnails[0].url
      };
    } catch (error) {
      throw new Error(\`Failed to get video info: \${error.message}\`);
    }
  }

  async downloadAudio(url) {
    try {
      const videoId = this.extractVideoId(url);
      const outputPath = path.join(this.tempDir, \`\${videoId}.mp3\`);

      if (fs.existsSync(outputPath)) {
        console.log('Audio file already exists, using cached version');
        return outputPath;
      }

      return new Promise((resolve, reject) => {
        console.log('Downloading audio from YouTube...');
        
        const stream = ytdl(url, {
          quality: 'highestaudio',
          filter: 'audioonly'
        });

        const writeStream = fs.createWriteStream(outputPath);
        stream.pipe(writeStream);

        writeStream.on('finish', () => {
          console.log('Audio download complete');
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          reject(new Error(\`Download failed: \${error.message}\`));
        });

        writeStream.on('error', (error) => {
          reject(new Error(\`Write failed: \${error.message}\`));
        });
      });
    } catch (error) {
      throw new Error(\`Failed to download audio: \${error.message}\`);
    }
  }

  cleanup(videoId) {
    const filePath = path.join(this.tempDir, \`\${videoId}.mp3\`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Cleaned up temporary audio file');
    }
  }
}

module.exports = new YouTubeHandler();`;

// Chord Detector content
const chordDetectorContent = `const Anthropic = require('@anthropic-ai/sdk');

class ChordDetector {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async analyzeAndGenerateTabs(songTitle, duration, audioFeatures = {}) {
    try {
      console.log('Analyzing song with Claude AI...');
      
      const prompt = \`You are a professional musician and guitar instructor. Analyze the song "\${songTitle}" and provide detailed guitar tablature information.

Song Duration: \${duration} seconds

Please provide:
1. The song's key
2. Suggested guitar tuning (Standard, Drop D, etc.)
3. Tempo (BPM)
4. The main chord progression for verse and chorus
5. Guitar tabs with timing markers (in seconds)
6. Difficulty level (Beginner, Intermediate, Advanced)
7. Strumming pattern

Format your response as JSON with this structure:
{
  "key": "C Major",
  "tuning": "Standard (EADGBE)",
  "bpm": 120,
  "difficulty": "Intermediate",
  "strummingPattern": "D-DU-UDU",
  "sections": [
    {
      "name": "Intro",
      "startTime": 0,
      "endTime": 8,
      "chords": [
        {"chord": "C", "time": 0, "duration": 2},
        {"chord": "G", "time": 2, "duration": 2}
      ]
    }
  ],
  "tabs": {
    "C": {
      "strings": ["x", "3", "2", "0", "1", "0"],
      "fingers": [0, 3, 2, 0, 1, 0]
    }
  }
}

Provide realistic and accurate information based on the actual song.\`;

      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const responseText = message.content[0].text;
      
      const jsonMatch = responseText.match(/\\{[\\s\\S]*\\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      const tabData = JSON.parse(jsonMatch[0]);
      
      console.log('Chord analysis complete');
      return tabData;
    } catch (error) {
      console.error('Chord detection error:', error);
      return this.getFallbackTabs(songTitle, duration);
    }
  }

  getFallbackTabs(songTitle, duration) {
    return {
      key: "Unknown",
      tuning: "Standard (EADGBE)",
      bpm: 120,
      difficulty: "Intermediate",
      strummingPattern: "D-DU-UDU",
      sections: [
        {
          name: "Song",
          startTime: 0,
          endTime: duration,
          chords: [
            { chord: "C", time: 0, duration: 4 },
            { chord: "G", time: 4, duration: 4 },
            { chord: "Am", time: 8, duration: 4 },
            { chord: "F", time: 12, duration: 4 }
          ]
        }
      ],
      tabs: {
        "C": { strings: ["x", "3", "2", "0", "1", "0"], fingers: [0, 3, 2, 0, 1, 0] },
        "G": { strings: ["3", "2", "0", "0", "0", "3"], fingers: [2, 1, 0, 0, 0, 3] },
        "Am": { strings: ["x", "0", "2", "2", "1", "0"], fingers: [0, 0, 2, 3, 1, 0] },
        "F": { strings: ["1", "3", "3", "2", "1", "1"], fingers: [1, 3, 4, 2, 1, 1] }
      },
      note: "AI analysis unavailable. Showing common chord progression."
    };
  }

  formatChordName(chord) {
    return chord.replace(/\\s+/g, '').trim();
  }
}

module.exports = new ChordDetector();`;

// Create files
const files = {
  'backend/services/youtube-handler.js': youtubeHandlerContent,
  'backend/services/chord-detector.js': chordDetectorContent
};

Object.entries(files).forEach(([filepath, content]) => {
  const fullPath = path.join(__dirname, filepath);
  fs.writeFileSync(fullPath, content);
  console.log('✓ Created file: ' + filepath);
});

console.log('\n✅ All files created successfully!\n');
console.log('Next steps:');
console.log('1. Make sure .env file exists with ANTHROPIC_API_KEY');
console.log('2. Run: npm run dev');
console.log('3. Open http://localhost:3000 in your browser\n');