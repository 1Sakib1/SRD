const fs = require('fs');

function patchDisclaimer() {
  let content = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');
  
  const targetDisclaimer = 'This uploaded data might be used for research purposes later on for ML prediction.';
  const newDisclaimer = 'The data and images uploaded in this report may be used for future machine learning research purposes to help predict and categorize rubbish data more accurately.';
  
  if (content.includes(targetDisclaimer)) {
    content = content.replace(targetDisclaimer, newDisclaimer);
    console.log('Patched disclaimer in ReportRubbish.tsx');
  } else {
    console.log('Disclaimer target not found in ReportRubbish.tsx');
  }

  // Update heatmap title with pulse icon
  const targetTitle = '<h2 className="text-xl font-semibold text-gray-900 mb-4">Live Rubbish Heat Map</h2>';
  const newTitle = `<div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Live Rubbish Heat Map</h2>
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
              </div>`;
              
  if (content.includes(targetTitle)) {
    content = content.replace(targetTitle, newTitle);
    console.log('Patched title in ReportRubbish.tsx');
  }

  fs.writeFileSync('src/app/pages/ReportRubbish.tsx', content);
}

function patchDashboardTitle() {
  let content = fs.readFileSync('src/app/pages/Dashboard.tsx', 'utf8');
  const targetTitle = '<h2 className="text-xl font-semibold text-gray-900 mb-4">Live Rubbish Heat Map</h2>';
  const newTitle = `<div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Live Rubbish Heat Map</h2>
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
              </div>`;
              
  if (content.includes(targetTitle)) {
    content = content.replace(targetTitle, newTitle);
    console.log('Patched title in Dashboard.tsx');
    fs.writeFileSync('src/app/pages/Dashboard.tsx', content);
  }
}

function patchAdminDashboardTitle() {
  let content = fs.readFileSync('src/app/pages/AdminDashboard.tsx', 'utf8');
  const targetTitle = '<h2 className="text-xl font-semibold text-gray-900 mb-4">Live Rubbish Heat Map</h2>';
  const newTitle = `<div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Live Rubbish Heat Map</h2>
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
              </div>`;
              
  if (content.includes(targetTitle)) {
    content = content.replace(targetTitle, newTitle);
    console.log('Patched title in AdminDashboard.tsx');
    fs.writeFileSync('src/app/pages/AdminDashboard.tsx', content);
  }
}

patchDisclaimer();
patchDashboardTitle();
patchAdminDashboardTitle();
