const fs = require('fs');

let code = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');

// Fix model
code = code.replace('model: "gemini-1.5-flash"', 'model: "gemini-3.5-flash-lite"');

fs.writeFileSync('src/app/pages/ReportRubbish.tsx', code);
