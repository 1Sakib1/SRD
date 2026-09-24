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
    console.log("Updated " + filePath);
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

const textReplacements = [
  ['Smart Rubbish Detection System', 'LitterPin'],
  ['Smart Rubbish Detection', 'LitterPin'],
  ['<span className="text-lg font-semibold text-gray-900 sm:hidden">SRD</span>', '<span className="text-lg font-semibold text-gray-900 sm:hidden">LitterPin</span>'],
];

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.html')) {
    replaceInFile(filePath, textReplacements);
  }
});

replaceInFile('index.html', textReplacements);

replaceInFile('src/app/pages/Landing.tsx', [
  ['Join a global community reporting rubbish, earning rewards, and making a real difference in urban cleanliness across major cities worldwide.', 'Citizen-Led Urban Mapping & Community Rewards.'],
  ['&copy; 2026 LitterPin. All rights reserved.', '&copy; 2026 LitterPin.'],
]);

replaceInFile('src/app/pages/ReportRubbish.tsx', [
  ['You have automatically earned <strong>10 \\neco-points ($0.10)</strong> for your contribution.', '<strong>Earn 0.10 AUD for every verified report!</strong>']
]);

const logoSVG = '<svg viewBox="0 0 100 120" className="w-5 h-5 text-white" fill="currentColor"><path d="M50,0 C22.4,0 0,22.4 0,50 C0,75 50,120 50,120 C50,120 100,75 100,50 C100,22.4 77.6,0 50,0 Z" fill="#00B150"/><circle cx="50" cy="45" r="25" fill="white"/><path d="M50,25 L58,45 L42,45 Z" fill="#00B150"/><path d="M35,35 L45,52 L28,48 Z" fill="#00B150"/><path d="M65,35 L72,48 L55,52 Z" fill="#00B150"/><path d="M35,55 L45,38 L28,42 Z" fill="#00B150"/><path d="M65,55 L72,42 L55,38 Z" fill="#00B150"/><path d="M50,65 L42,45 L58,45 Z" fill="#00B150"/></svg>';

replaceInFile('src/app/components/Header.tsx', [
  ['<Recycle className="w-5 h-5 text-white" />', logoSVG],
  ['bg-green-600', 'bg-[#00B150]'], 
]);

replaceInFile('src/app/pages/Landing.tsx', [
  ['<Recycle className="w-5 h-5 text-white" />', logoSVG],
  ['bg-green-600', 'bg-[#00B150]'],
]);

console.log("Phase 2 text replacement complete.");
