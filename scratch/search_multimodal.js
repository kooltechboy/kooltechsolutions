const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        searchDir(fullPath, pattern);
      } else if (file.endsWith('.js') || file.endsWith('.d.ts') || file.endsWith('.cjs') || file.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.toLowerCase().includes(pattern.toLowerCase())) {
          console.log(`Found "${pattern}" in: ${fullPath}`);
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }
}

console.log('Searching for "multimodal" inside node_modules/@livekit/agents-plugin-google...');
searchDir(path.join(__dirname, '../node_modules/@livekit/agents-plugin-google'), 'multimodal');
console.log('Search complete.');
