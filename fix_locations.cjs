const fs = require('fs');

function updateDashboard(filename) {
  let content = fs.readFileSync(filename, 'utf8');
  const oldReturn = `      return {
        id: \`user-report-\${key}\`,
        lat,
        lng,
        address: groupReports[0].location.address || \`\${lat.toFixed(4)}, \${lng.toFixed(4)}\`,
        reports: reportCount,
        intensity,
      };`;
      
  const newReturn = `      return {
        id: \`user-report-\${key}\`,
        lat,
        lng,
        address: groupReports[0].location.address || \`\${lat.toFixed(4)}, \${lng.toFixed(4)}\`,
        reports: reportCount,
        intensity,
        photo: groupReports[0].photo,
        type: groupReports[0].type,
        date: groupReports[0].createdAt || groupReports[0].timestamp,
      };`;
      
  content = content.replace(oldReturn, newReturn);
  fs.writeFileSync(filename, content);
}

function updateReportRubbish() {
  let content = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');
  const oldReturn = `              return {
                id: \`grouped-\${key}\`,
                lat,
                lng,
                address: group[0].type || 'Rubbish Report',
                reports: group.length,
                intensity: Math.max(0.3, Math.min(group.length / 10, 1))
              };`;
              
  const newReturn = `              return {
                id: \`grouped-\${key}\`,
                lat,
                lng,
                address: group[0].address || group[0].type || 'Rubbish Report',
                reports: group.length,
                intensity: Math.max(0.3, Math.min(group.length / 10, 1)),
                photo: group[0].image_url || group[0].photo,
                type: group[0].type,
                date: group[0].created_at || group[0].createdAt || new Date().toISOString()
              };`;
              
  content = content.replace(oldReturn, newReturn);
  fs.writeFileSync('src/app/pages/ReportRubbish.tsx', content);
}

updateDashboard('src/app/pages/Dashboard.tsx');
updateDashboard('src/app/pages/AdminDashboard.tsx');
updateReportRubbish();

console.log('done');
