const fs = require('fs');

const headerPath = 'src/app/components/Header.tsx';
let headerContent = fs.readFileSync(headerPath, 'utf8');

// Add import
if (!headerContent.includes('LitterPinLogo')) {
  headerContent = "import { LitterPinLogo } from './LitterPinLogo';\n" + headerContent;
}

// Replace img tags
const imgTag = '<img src="/litterpin-logo.png" alt="LitterPin Logo" className="w-8 h-8 object-contain" />';
headerContent = headerContent.split(imgTag).join('<LitterPinLogo className="w-10 h-10 drop-shadow-md" />'); // upscaled!

fs.writeFileSync(headerPath, headerContent);
console.log("Updated Header.tsx");

const landingPath = 'src/app/pages/Landing.tsx';
let landingContent = fs.readFileSync(landingPath, 'utf8');

if (!landingContent.includes('LitterPinLogo')) {
  landingContent = "import { LitterPinLogo } from '../components/LitterPinLogo';\n" + landingContent;
}

landingContent = landingContent.split(imgTag).join('<LitterPinLogo className="w-10 h-10 drop-shadow-md" />'); // upscaled!
fs.writeFileSync(landingPath, landingContent);
console.log("Updated Landing.tsx");

