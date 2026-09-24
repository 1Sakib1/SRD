const fs = require('fs');
let content = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');

const target = /const supabaseLocations: LocationPoint\[\] = data\s*\.filter\(r => r\.location_lat && r\.location_lng\)\s*\.map\(r => \(\{\s*id: r\.id,\s*lat: r\.location_lat,\s*lng: r\.location_lng,\s*address: r\.type \|\| 'Rubbish Report',\s*reports: 1,\s*intensity: r\.status === 'resolved' \? 0\.2 : \(r\.status === 'pending' \? 0\.8 : 0\.5\)\s*\}\)\);\s*setMapLocations\(supabaseLocations\);/;

const replacement = `// Group reports by approximate location to create density hotspots (like the dashboard)
          const locationGroups: { [key: string]: any[] } = {};
          
          data.forEach(r => {
            if (!r.location_lat || !r.location_lng) return;
            const lat = parseFloat(r.location_lat.toFixed(3));
            const lng = parseFloat(r.location_lng.toFixed(3));
            const key = \`\${lat},\${lng}\`;
            if (!locationGroups[key]) locationGroups[key] = [];
            locationGroups[key].push(r);
          });
          
          const groupedLocations: LocationPoint[] = Object.entries(locationGroups).map(([key, group]) => {
            const [lat, lng] = key.split(',').map(Number);
            return {
              id: \`grouped-\${key}\`,
              lat,
              lng,
              address: group[0].type || 'Rubbish Report',
              reports: group.length,
              intensity: Math.max(0.3, Math.min(group.length / 10, 1))
            };
          });
          
          setMapLocations(groupedLocations);`;

if (content.match(target)) {
    content = content.replace(target, replacement);
    
    // Also add the missing subtitle to match Dashboard
    content = content.replace(
      '<h2 className="text-xl font-semibold text-gray-900 mb-4">Live Rubbish Heat Map</h2>',
      '<h2 className="text-xl font-semibold text-gray-900 mb-4">Live Rubbish Heat Map</h2>\n              <p className="text-sm text-gray-600 mb-4">Live community reports showing rubbish density hotspots</p>'
    );
    
    fs.writeFileSync('src/app/pages/ReportRubbish.tsx', content);
    console.log('Patched ReportRubbish to use grouped heatmap data and subtitle');
} else {
    console.error('Target not found!');
}
