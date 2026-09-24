const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const [target, replacement] of replacements) {
    content = content.split(target).join(replacement);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log("Updated colors in " + filePath);
  }
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

const colorReplacements = [
  ['text-green-600', 'text-[#00B150]'],
  ['bg-green-600', 'bg-[#00B150]'],
  ['border-green-600', 'border-[#00B150]'],
  ['hover:text-green-600', 'hover:text-[#00B150]'],
  ['hover:bg-green-600', 'hover:bg-[#00B150]'],
  ['text-gray-900', 'text-[#333333]'], // General headings
];

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    replaceInFile(filePath, colorReplacements);
  }
});
