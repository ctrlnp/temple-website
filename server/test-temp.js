const path = require('path');
const fs = require('fs');

const tempDir = path.join(__dirname, 'temp');
console.log('Temp directory path:', tempDir);
console.log('Temp directory exists:', fs.existsSync(tempDir));

if (!fs.existsSync(tempDir)) {
  console.log('Creating temp directory...');
  fs.mkdirSync(tempDir, { recursive: true });
  console.log('Temp directory created');
} else {
  console.log('Temp directory already exists');
}

// List contents of temp directory
try {
  const contents = fs.readdirSync(tempDir);
  console.log('Temp directory contents:', contents.length, 'files');
} catch (error) {
  console.log('Error reading temp directory:', error.message);
}

console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
