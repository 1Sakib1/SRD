const fs = require('fs');

function fixFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // 1. Replace the SVG block with the Image tag
    // We use a regex that matches the div and the svg inside it
    const patternSvg = /<div className="w-8 h-8 bg-\[#00B150\] rounded-lg flex items-center justify-center">[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?<\/div>/g;
    const imgTag = '<img src="/litterpin-logo.png" alt="LitterPin Logo" className="w-8 h-8 object-contain" />';
    
    content = content.replace(patternSvg, imgTag);

    // 2. Make the "Pin" green
    content = content.split('>LitterPin</span>').join('>Litter<span className="text-[#00B150]">Pin</span></span>');

    fs.writeFileSync(filepath, content);
    console.log("Fixed " + filepath);
}

fixFile('src/app/components/Header.tsx');
fixFile('src/app/pages/Landing.tsx');
