const fs = require('fs');
let content = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');

const target = /<strong>Research Disclaimer:<\/strong> This application is for demonstration and research purposes only\.\s*The map data, machine learning classifications, and eco-points are experimental and may not reflect real-world action by municipal authorities\./;

const replacement = `This uploaded data might be used for research purposes later on for ML prediction.`;

if (content.match(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/app/pages/ReportRubbish.tsx', content);
    console.log('Patched disclaimer text');
} else {
    console.error('Target not found!');
}
