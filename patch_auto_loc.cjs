const fs = require('fs');
let content = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');

const target = `  useEffect(() => {
    loadReports();`;

const replacement = `  useEffect(() => {
    // Automatically detect user's location on page load
    getCurrentLocation().then(position => {
      setMapCenter([position.lat, position.lng]);
    }).catch(err => {
      console.log('Auto location on mount failed', err);
    });

    loadReports();`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/app/pages/ReportRubbish.tsx', content);
    console.log('Patched ReportRubbish for auto-location');
} else {
    console.error('Target not found!');
}
