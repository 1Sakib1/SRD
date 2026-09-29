const fs = require('fs');
let code = fs.readFileSync('src/app/components/InteractiveGlobe.tsx', 'utf8');

// Use regex to completely delete that specific hook declaration
code = code.replace(/^[ \t]*const getHexColor = React\.useCallback\(\(\) => '#00ff73', \[\]\);[ \t]*\r?\n/m, '');

fs.writeFileSync('src/app/components/InteractiveGlobe.tsx', code);
