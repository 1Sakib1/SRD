const fs = require('fs');
let content = fs.readFileSync('src/app/pages/Auth.tsx', 'utf8');

content = content.replace("navigate('/admin');", "setTimeout(() => navigate('/admin'), 150);");
content = content.replace("navigate(redirect);", "setTimeout(() => navigate(redirect), 150);");

fs.writeFileSync('src/app/pages/Auth.tsx', content);
console.log('Replaced');
