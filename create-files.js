const fs = require('fs');
const path = require('path');

// Create directory structure
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
    console.log(`✓ Created: ${dir}`);
  } else {
    console.log(`✓ Exists: ${dir}`);
  }
});

console.log('\n✅ All directories created!');
console.log('\nNext steps:');
console.log('1. Copy youtube-handler.js to backend/services/');
console.log('2. Copy chord-detector.js to backend/services/');
console.log('3. Copy tab-generator.js to backend/routes/');
console.log('4. Copy server.js to backend/');
console.log('5. Run: npm install');
console.log('6. Create .env file with your ANTHROPIC_API_KEY');
console.log('7. Run: npm run dev');