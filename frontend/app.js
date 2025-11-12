//line 317 for new code
// // API Configuration
// const API_BASE_URL = 'http://localhost:3000/api';

// // YouTube Player
// let player;
// let currentTabData = null;
// let updateInterval = null;

// // YouTube IFrame API Ready
// function onYouTubeIframeAPIReady() {
//     console.log('YouTube API Ready');
// }

// // Generate Tabs
// async function generateTabs() {
//     const urlInput = document.getElementById('youtubeUrl');
//     const youtubeUrl = urlInput.value.trim();

//     if (!youtubeUrl) {
//         showError('Please enter a YouTube URL');
//         return;
//     }

//     // Validate YouTube URL
//     if (!isValidYouTubeUrl(youtubeUrl)) {
//         showError('Please enter a valid YouTube URL');
//         return;
//     }

//     // Show loading state
//     showLoading();
//     hideError();
//     hideResults();

//     try {
//         // Call API
//         const response = await fetch(`${API_BASE_URL}/tabs/generate`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ youtubeUrl }),
//         });

//         if (!response.ok) {
//             throw new Error('Failed to generate tabs');
//         }

//         const data = await response.json();

//         // Display results directly
//         displayResults(data);
//     } catch (error) {
//         console.error('Error:', error);
//         showError('Failed to generate tabs. Please try again.');
//         hideLoading();
//     }
// }

// // Poll for processing results
// async function pollForResults(videoId) {
//     const maxAttempts = 30;
//     let attempts = 0;

//     const poll = setInterval(async () => {
//         attempts++;

//         try {
//             const response = await fetch(`${API_BASE_URL}/tabs/status/${videoId}`);
//             const data = await response.json();

//             if (data.status === 'complete') {
//                 clearInterval(poll);
//                 displayResults(data.data);
//             } else if (attempts >= maxAttempts) {
//                 clearInterval(poll);
//                 showError('Processing timeout. Please try again.');
//                 hideLoading();
//             }
//         } catch (error) {
//             clearInterval(poll);
//             showError('Failed to check status. Please try again.');
//             hideLoading();
//         }
//     }, 2000);
// }

// // Display Results
// function displayResults(data) {
//     hideLoading();
//     showResults();

//     currentTabData = data;

//     // Video Info
//     document.getElementById('songTitle').textContent = data.title;
//     document.getElementById('artistName').textContent = data.author;
//     document.getElementById('thumbnail').src = data.thumbnail;

//     // Song Info
//     document.getElementById('songKey').textContent = data.key || 'Unknown';
//     document.getElementById('tuning').textContent = data.tuning || 'Standard';
//     document.getElementById('bpm').textContent = data.bpm || '-';
//     document.getElementById('difficulty').textContent = data.difficulty || 'Unknown';

//     // Strumming Pattern
//     document.getElementById('strummingPattern').textContent = data.strummingPattern || 'D-DU-UDU';

//     // Initialize YouTube Player
//     initializePlayer(data.videoId);

//     // Display Chord Diagrams
//     displayChordDiagrams(data.tabs);

//     // Display Tabs
//     displayTabs(data.sections);
// }

// // Initialize YouTube Player
// function initializePlayer(videoId) {
//     const playerDiv = document.getElementById('youtubePlayer');
//     playerDiv.innerHTML = '';

//     player = new YT.Player('youtubePlayer', {
//         height: '100%',
//         width: '100%',
//         videoId: videoId,
//         playerVars: {
//             autoplay: 0,
//             controls: 1,
//         },
//         events: {
//             onReady: onPlayerReady,
//             onStateChange: onPlayerStateChange,
//         },
//     });
// }

// function onPlayerReady(event) {
//     console.log('Player ready');
// }

// function onPlayerStateChange(event) {
//     if (event.data === YT.PlayerState.PLAYING) {
//         startChordHighlighting();
//     } else {
//         stopChordHighlighting();
//     }
// }

// // Chord Highlighting
// function startChordHighlighting() {
//     if (!currentTabData || !currentTabData.sections) return;

//     stopChordHighlighting();

//     updateInterval = setInterval(() => {
//         if (!player || typeof player.getCurrentTime !== 'function') return;

//         const currentTime = player.getCurrentTime();
//         highlightCurrentChord(currentTime);
//     }, 100);
// }

// function stopChordHighlighting() {
//     if (updateInterval) {
//         clearInterval(updateInterval);
//         updateInterval = null;
//     }
// }

// function highlightCurrentChord(currentTime) {
//     const allChordItems = document.querySelectorAll('.chord-item');
//     allChordItems.forEach(item => item.classList.remove('active'));

//     currentTabData.sections.forEach(section => {
//         if (currentTime >= section.startTime && currentTime <= section.endTime) {
//             section.chords.forEach((chordData, index) => {
//                 const chordStart = chordData.time;
//                 const chordEnd = section.chords[index + 1]?.time || section.endTime;

//                 if (currentTime >= chordStart && currentTime < chordEnd) {
//                     const chordElement = document.querySelector(
//                         `[data-section="${section.name}"][data-chord-index="${index}"]`
//                     );
//                     if (chordElement) {
//                         chordElement.classList.add('active');
//                     }
//                 }
//             });
//         }
//     });
// }

// // Display Chord Diagrams
// function displayChordDiagrams(tabs) {
//     const container = document.getElementById('chordDiagrams');
//     container.innerHTML = '';

//     for (const [chordName, chordData] of Object.entries(tabs)) {
//         const chordDiv = document.createElement('div');
//         chordDiv.className = 'chord-diagram';

//         const name = document.createElement('div');
//         name.className = 'chord-name';
//         name.textContent = chordName;

//         const visual = document.createElement('div');
//         visual.className = 'chord-visual';

//         const strings = document.createElement('div');
//         strings.className = 'chord-strings';
        
//         const stringNames = ['E', 'A', 'D', 'G', 'B', 'e'];
//         chordData.strings.forEach((fret, index) => {
//             const line = document.createElement('div');
//             line.textContent = `${stringNames[index]}: ${fret}`;
//             strings.appendChild(line);
//         });

//         visual.appendChild(strings);
//         chordDiv.appendChild(name);
//         chordDiv.appendChild(visual);
//         container.appendChild(chordDiv);
//     }
// }

// // Display Tabs
// function displayTabs(sections) {
//     const container = document.getElementById('tabDisplay');
//     container.innerHTML = '';

//     sections.forEach(section => {
//         const sectionDiv = document.createElement('div');
//         sectionDiv.className = 'section-block';

//         const header = document.createElement('div');
//         header.className = 'section-header';

//         const sectionName = document.createElement('div');
//         sectionName.className = 'section-name';
//         sectionName.textContent = section.name;

//         const sectionTime = document.createElement('div');
//         sectionTime.className = 'section-time';
//         sectionTime.textContent = `${formatTime(section.startTime)} - ${formatTime(section.endTime)}`;

//         header.appendChild(sectionName);
//         header.appendChild(sectionTime);

//         const progression = document.createElement('div');
//         progression.className = 'chord-progression';

//         section.chords.forEach((chordData, index) => {
//             const chordItem = document.createElement('div');
//             chordItem.className = 'chord-item';
//             chordItem.textContent = chordData.chord;
//             chordItem.setAttribute('data-section', section.name);
//             chordItem.setAttribute('data-chord-index', index);
//             chordItem.title = `${formatTime(chordData.time)} (${chordData.duration}s)`;
//             progression.appendChild(chordItem);
//         });

//         sectionDiv.appendChild(header);
//         sectionDiv.appendChild(progression);
//         container.appendChild(sectionDiv);
//     });
// }

// // Utility Functions
// function isValidYouTubeUrl(url) {
//     const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
//     return pattern.test(url);
// }

// function formatTime(seconds) {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
// }

// function showLoading() {
//     document.getElementById('loadingState').classList.remove('hidden');
//     document.getElementById('generateBtn').disabled = true;
// }

// function hideLoading() {
//     document.getElementById('loadingState').classList.add('hidden');
//     document.getElementById('generateBtn').disabled = false;
// }

// function showError(message) {
//     const errorState = document.getElementById('errorState');
//     const errorMessage = document.getElementById('errorMessage');
//     errorMessage.textContent = message;
//     errorState.classList.remove('hidden');
// }

// function hideError() {
//     document.getElementById('errorState').classList.add('hidden');
// }

// function showResults() {
//     document.getElementById('resultsSection').classList.remove('hidden');
// }

// function hideResults() {
//     document.getElementById('resultsSection').classList.add('hidden');
// }

// // Enter key support
// document.getElementById('youtubeUrl').addEventListener('keypress', (e) => {
//     if (e.key === 'Enter') {
//         generateTabs();
//     }
// });

// ✅ Auto-detect API base depending on environment
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "/api"; // Works automatically on Vercel

// YouTube Player
let player;
let currentTabData = null;
let updateInterval = null;

// YouTube IFrame API Ready
function onYouTubeIframeAPIReady() {
  console.log("YouTube API Ready");
}

// Generate Tabs
async function generateTabs() {
  const urlInput = document.getElementById("youtubeUrl");
  const youtubeUrl = urlInput.value.trim();

  if (!youtubeUrl) {
    showError("Please enter a YouTube URL");
    return;
  }

  // Validate YouTube URL
  if (!isValidYouTubeUrl(youtubeUrl)) {
    showError("Please enter a valid YouTube URL");
    return;
  }

  // Show loading state
  showLoading();
  hideError();
  hideResults();

  try {
    // ✅ Updated API route to match your /api/generate.js file
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: youtubeUrl }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate tabs");
    }

    const data = await response.json();

    // Display results directly
    displayResults(data);
  } catch (error) {
    console.error("Error:", error);
    showError("Failed to generate tabs. Please try again.");
    hideLoading();
  }
}

// Poll for processing results
async function pollForResults(videoId) {
  const maxAttempts = 30;
  let attempts = 0;

  const poll = setInterval(async () => {
    attempts++;

    try {
      const response = await fetch(`${API_BASE_URL}/tabs/status/${videoId}`);
      const data = await response.json();

      if (data.status === "complete") {
        clearInterval(poll);
        displayResults(data.data);
      } else if (attempts >= maxAttempts) {
        clearInterval(poll);
        showError("Processing timeout. Please try again.");
        hideLoading();
      }
    } catch (error) {
      clearInterval(poll);
      showError("Failed to check status. Please try again.");
      hideLoading();
    }
  }, 2000);
}

// Display Results
function displayResults(data) {
  hideLoading();
  showResults();

  currentTabData = data;

  // Video Info
  document.getElementById("songTitle").textContent = data.title || "Generated Song";
  document.getElementById("artistName").textContent = data.author || "Unknown Artist";
  document.getElementById("thumbnail").src = data.thumbnail || "";

  // Song Info
  document.getElementById("songKey").textContent = data.key || "Unknown";
  document.getElementById("tuning").textContent = data.tuning || "Standard";
  document.getElementById("bpm").textContent = data.bpm || "-";
  document.getElementById("difficulty").textContent = data.difficulty || "Unknown";

  // Strumming Pattern
  document.getElementById("strummingPattern").textContent =
    data.strummingPattern || "D-DU-UDU";

  // Initialize YouTube Player
  if (data.videoId) initializePlayer(data.videoId);

  // Display Chord Diagrams
  if (data.tabs) displayChordDiagrams(data.tabs);

  // Display Tabs
  if (data.sections) displayTabs(data.sections);
}

// Initialize YouTube Player
function initializePlayer(videoId) {
  const playerDiv = document.getElementById("youtubePlayer");
  playerDiv.innerHTML = "";

  player = new YT.Player("youtubePlayer", {
    height: "100%",
    width: "100%",
    videoId: videoId,
    playerVars: {
      autoplay: 0,
      controls: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReady(event) {
  console.log("Player ready");
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    startChordHighlighting();
  } else {
    stopChordHighlighting();
  }
}

// Chord Highlighting
function startChordHighlighting() {
  if (!currentTabData || !currentTabData.sections) return;

  stopChordHighlighting();

  updateInterval = setInterval(() => {
    if (!player || typeof player.getCurrentTime !== "function") return;

    const currentTime = player.getCurrentTime();
    highlightCurrentChord(currentTime);
  }, 100);
}

function stopChordHighlighting() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

function highlightCurrentChord(currentTime) {
  const allChordItems = document.querySelectorAll(".chord-item");
  allChordItems.forEach((item) => item.classList.remove("active"));

  currentTabData.sections.forEach((section) => {
    if (currentTime >= section.startTime && currentTime <= section.endTime) {
      section.chords.forEach((chordData, index) => {
        const chordStart = chordData.time;
        const chordEnd = section.chords[index + 1]?.time || section.endTime;

        if (currentTime >= chordStart && currentTime < chordEnd) {
          const chordElement = document.querySelector(
            `[data-section="${section.name}"][data-chord-index="${index}"]`
          );
          if (chordElement) {
            chordElement.classList.add("active");
          }
        }
      });
    }
  });
}

// Display Chord Diagrams
function displayChordDiagrams(tabs) {
  const container = document.getElementById("chordDiagrams");
  container.innerHTML = "";

  for (const [chordName, chordData] of Object.entries(tabs)) {
    const chordDiv = document.createElement("div");
    chordDiv.className = "chord-diagram";

    const name = document.createElement("div");
    name.className = "chord-name";
    name.textContent = chordName;

    const visual = document.createElement("div");
    visual.className = "chord-visual";

    const strings = document.createElement("div");
    strings.className = "chord-strings";

    const stringNames = ["E", "A", "D", "G", "B", "e"];
    chordData.strings.forEach((fret, index) => {
      const line = document.createElement("div");
      line.textContent = `${stringNames[index]}: ${fret}`;
      strings.appendChild(line);
    });

    visual.appendChild(strings);
    chordDiv.appendChild(name);
    chordDiv.appendChild(visual);
    container.appendChild(chordDiv);
  }
}

// Display Tabs
function displayTabs(sections) {
  const container = document.getElementById("tabDisplay");
  container.innerHTML = "";

  sections.forEach((section) => {
    const sectionDiv = document.createElement("div");
    sectionDiv.className = "section-block";

    const header = document.createElement("div");
    header.className = "section-header";

    const sectionName = document.createElement("div");
    sectionName.className = "section-name";
    sectionName.textContent = section.name;

    const sectionTime = document.createElement("div");
    sectionTime.className = "section-time";
    sectionTime.textContent = `${formatTime(section.startTime)} - ${formatTime(
      section.endTime
    )}`;

    header.appendChild(sectionName);
    header.appendChild(sectionTime);

    const progression = document.createElement("div");
    progression.className = "chord-progression";

    section.chords.forEach((chordData, index) => {
      const chordItem = document.createElement("div");
      chordItem.className = "chord-item";
      chordItem.textContent = chordData.chord;
      chordItem.setAttribute("data-section", section.name);
      chordItem.setAttribute("data-chord-index", index);
      chordItem.title = `${formatTime(chordData.time)} (${chordData.duration}s)`;
      progression.appendChild(chordItem);
    });

    sectionDiv.appendChild(header);
    sectionDiv.appendChild(progression);
    container.appendChild(sectionDiv);
  });
}

// Utility Functions
function isValidYouTubeUrl(url) {
  const pattern =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
  return pattern.test(url);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function showLoading() {
  document.getElementById("loadingState").classList.remove("hidden");
  document.getElementById("generateBtn").disabled = true;
}

function hideLoading() {
  document.getElementById("loadingState").classList.add("hidden");
  document.getElementById("generateBtn").disabled = false;
}

function showError(message) {
  const errorState = document.getElementById("errorState");
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.textContent = message;
  errorState.classList.remove("hidden");
}

function hideError() {
  document.getElementById("errorState").classList.add("hidden");
}

function showResults() {
  document.getElementById("resultsSection").classList.remove("hidden");
}

function hideResults() {
  document.getElementById("resultsSection").classList.add("hidden");
}

// Enter key support
document.getElementById("youtubeUrl").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    generateTabs();
  }
});
