const fs = require('fs');

for (const file of ['src/app/pages/Dashboard.tsx', 'src/app/pages/AdminDashboard.tsx']) {
  let content = fs.readFileSync(file, 'utf8');
  
  const oldBlock = `        id: \`user-report-\${key}\`,
        lat,
        lng,
        address: groupReports[0].location.address || \`\${lat.toFixed(4)}, \${lng.toFixed(4)}\`,
        reports: reportCount,
        intensity,
      };`;
      
  const newBlock = `        id: \`user-report-\${key}\`,
        lat,
        lng,
        address: groupReports[0].location.address || \`\${lat.toFixed(4)}, \${lng.toFixed(4)}\`,
        reports: reportCount,
        intensity,
        photo: groupReports[0].photo || groupReports[0].image_url,
        type: groupReports[0].type,
        date: groupReports[0].createdAt || groupReports[0].created_at || groupReports[0].timestamp,
      };`;
      
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(file, content);
}
console.log('done');
