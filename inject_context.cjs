const fs = require('fs');

const path = 'src/app/pages/Landing.tsx';
let content = fs.readFileSync(path, 'utf8');

// Import it
if (!content.includes('ContextualInfo')) {
  content = "import { ContextualInfo } from '../components/ContextualInfo';\n" + content;
}

// Target to replace
const targetStart = '<div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-8">';
const targetEnd = '</motion.div>\n            </div>';

const startIdx = content.indexOf(targetStart);
// find endIdx
const endIdx = content.indexOf('</div>', content.indexOf('</motion.div>', content.indexOf('</motion.div>', startIdx + 1) + 1) + 1) + 6;

if (startIdx !== -1) {
    // wait, regex is safer.
    const regex = /<div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-8">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/;
    
    // Actually, I can just replace everything inside the container.
    // The container is: <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    // Inside it is the grid.
    const fullTarget = /<div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-8">[\s\S]*?<\/motion\.div>\s*<\/div>/;
    content = content.replace(fullTarget, '<ContextualInfo />');
    
    fs.writeFileSync(path, content);
    console.log("Injected ContextualInfo");
} else {
    console.log("Could not find grid");
}
