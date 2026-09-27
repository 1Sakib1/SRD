const fs = require('fs');

const filePath = 'src/app/pages/ReportRubbish.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("from: 'Smart Rubbish Detection <onboarding@resend.dev>'", "from: 'LitterPin <noreply@litterpin.org>'");
content = content.replace("from: 'LitterPin <onboarding@resend.dev>'", "from: 'LitterPin <noreply@litterpin.org>'");

fs.writeFileSync(filePath, content);
console.log("Updated from address");
