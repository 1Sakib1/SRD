const fs = require('fs');

const svgBlock = '<div className="w-8 h-8 bg-[#00B150] rounded-lg flex items-center justify-center">\n                <svg viewBox="0 0 100 120" className="w-5 h-5 text-white" fill="currentColor"><path d="M50,0 C22.4,0 0,22.4 0,50 C0,75 50,120 50,120 C50,120 100,75 100,50 C100,22.4 77.6,0 50,0 Z" fill="#00B150"/><circle cx="50" cy="45" r="25" fill="white"/><path d="M50,25 L58,45 L42,45 Z" fill="#00B150"/><path d="M35,35 L45,52 L28,48 Z" fill="#00B150"/><path d="M65,35 L72,48 L55,52 Z" fill="#00B150"/><path d="M35,55 L45,38 L28,42 Z" fill="#00B150"/><path d="M65,55 L72,42 L55,38 Z" fill="#00B150"/><path d="M50,65 L42,45 L58,45 Z" fill="#00B150"/></svg>\n              </div>';

const svgBlockLanding = '<div className="w-8 h-8 bg-[#00B150] rounded-lg flex items-center justify-center">\n                  <svg viewBox="0 0 100 120" className="w-5 h-5 text-white" fill="currentColor"><path d="M50,0 C22.4,0 0,22.4 0,50 C0,75 50,120 50,120 C50,120 100,75 100,50 C100,22.4 77.6,0 50,0 Z" fill="#00B150"/><circle cx="50" cy="45" r="25" fill="white"/><path d="M50,25 L58,45 L42,45 Z" fill="#00B150"/><path d="M35,35 L45,52 L28,48 Z" fill="#00B150"/><path d="M65,35 L72,48 L55,52 Z" fill="#00B150"/><path d="M35,55 L45,38 L28,42 Z" fill="#00B150"/><path d="M65,55 L72,42 L55,38 Z" fill="#00B150"/><path d="M50,65 L42,45 L58,45 Z" fill="#00B150"/></svg>\n                </div>';

const imgTag = '<img src="/litterpin-logo.png" alt="LitterPin Logo" className="w-8 h-8 object-contain" />';

let headerContent = fs.readFileSync('src/app/components/Header.tsx', 'utf8');
headerContent = headerContent.split(svgBlock).join(imgTag);
fs.writeFileSync('src/app/components/Header.tsx', headerContent);
console.log("Updated Header.tsx");

let landingContent = fs.readFileSync('src/app/pages/Landing.tsx', 'utf8');
landingContent = landingContent.split(svgBlockLanding).join(imgTag);
landingContent = landingContent.replace('<span className="font-semibold text-white">Smart Rubbish</span>', '<span className="font-semibold text-white">LitterPin</span>');
fs.writeFileSync('src/app/pages/Landing.tsx', landingContent);
console.log("Updated Landing.tsx");

let htmlContent = fs.readFileSync('index.html', 'utf8');
htmlContent = htmlContent.replace('<title>Smart Rubbish Detection System - Sydney</title>', '<title>LitterPin - Urban Mapping & Community Rewards</title>');
fs.writeFileSync('index.html', htmlContent);
console.log("Updated index.html title");
