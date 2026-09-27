const fs = require('fs');

const filePath = 'src/app/pages/ReportRubbish.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("from: 'LitterPin <noreply@litterpin.org>'", "from: 'LitterPin <noreply@admin.litterpin.org>'");

fs.writeFileSync(filePath, content);
console.log("Updated from address to match verified subdomain");
