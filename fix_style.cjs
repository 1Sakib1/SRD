const fs = require('fs');

const path = 'src/app/components/InteractiveGlobe.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<style dangerouslySetInnerHTML=[\s\S]*?\/>/;
const newStyle = '<style dangerouslySetInnerHTML={{ __html: `\\n        @keyframes ticker {\\n          0% { transform: translateX(100vw); }\\n          100% { transform: translateX(-100%); }\\n        }\\n        .animate-ticker {\\n          animation: ticker 25s linear infinite;\\n          display: inline-flex;\\n          white-space: nowrap;\\n        }\\n      ` }} />';

content = content.replace(regex, newStyle);

fs.writeFileSync(path, content);
console.log("Fixed style block");
