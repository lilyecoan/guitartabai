const Anthropic = require('@anthropic-ai/sdk');

class ChordDetector {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async analyzeAndGenerateTabs(songTitle, duration, audioFeatures = {}) {
    try {
      console.log('Analyzing song with Claude AI...');
      
      const prompt = `You are a professional musician and guitar instructor. Analyze the song "${songTitle}" and provide detailed guitar tablature information.

Song Duration: ${duration} seconds

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

Provide realistic and accurate information based on the actual song.`;

      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const responseText = message.content[0].text;
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      const tabData = JSON.parse(jsonMatch[0]);
      
      console.log('Chord analysis complete');
      return tabData;
    } catch (error) {
      console.error('Chord detection error:', error);
      // Return fallback data if AI fails
      return this.getFallbackTabs(songTitle, duration);
    }
  }

  getFallbackTabs(songTitle, duration) {
    // Provide basic fallback structure
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

  // Helper to format chord names
  formatChordName(chord) {
    return chord.replace(/\s+/g, '').trim();
  }
}

module.exports = new ChordDetector();