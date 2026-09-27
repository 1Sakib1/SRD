const fs = require('fs');

function applyTitleGlow(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    const target1 = '<span className="text-lg sm:text-xl font-semibold text-[#333333] hidden sm:inline">Litter<span className="text-[#00B150]">Pin</span></span>';
    const replace1 = '<div className="relative hidden sm:inline-block"><div className="absolute inset-0 bg-gradient-to-r from-green-300 to-[#00B150] blur-[10px] opacity-30 rounded-full"></div><span className="relative text-lg sm:text-xl font-semibold text-[#333333]">Litter<span className="text-[#00B150]">Pin</span></span></div>';
              
    const target2 = '<span className="text-lg font-semibold text-[#333333] sm:hidden">Litter<span className="text-[#00B150]">Pin</span></span>';
    const replace2 = '<div className="relative sm:hidden"><div className="absolute inset-0 bg-gradient-to-r from-green-300 to-[#00B150] blur-[10px] opacity-30 rounded-full"></div><span className="relative text-lg font-semibold text-[#333333]">Litter<span className="text-[#00B150]">Pin</span></span></div>';

    content = content.split(target1).join(replace1);
    content = content.split(target2).join(replace2);
    
    fs.writeFileSync(filePath, content);
    console.log("Updated title glow in " + filePath);
}

applyTitleGlow('src/app/components/Header.tsx');

function applyHeroGlow(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const target = '<span className="font-semibold text-white">LitterPin</span>';
    const replace = '<div className="relative inline-block"><div className="absolute inset-0 bg-gradient-to-r from-green-300 to-white blur-[10px] opacity-40 rounded-full"></div><span className="relative font-bold text-white">LitterPin</span></div>';
    content = content.split(target).join(replace);
    fs.writeFileSync(filePath, content);
}
applyHeroGlow('src/app/pages/Landing.tsx');
