const fs = require('fs');
let content = fs.readFileSync('src/app/pages/Auth.tsx', 'utf8');

// Replace any console.log line that contains 'handleLogin called' and 'loginType'
const regex = /console\.log\(['"`][^'"]*handleLogin called[^'"]*['"`]\s*,\s*\{.*?loginType.*?\}\);/g;
content = content.replace(regex, "console.log('handleLogin called', { email });");

fs.writeFileSync('src/app/pages/Auth.tsx', content);
console.log('Fixed ReferenceError with regex');
