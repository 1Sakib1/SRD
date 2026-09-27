const fs = require('fs');
const path = 'src/app/pages/Landing.tsx';
let content = fs.readFileSync(path, 'utf8');

const cities = [
  { name: 'New York City', lat: 40.7128, lng: -74.0060 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { name: 'Toronto', lat: 43.6510, lng: -79.3470 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 }
];

for (const city of cities) {
  const target = `name: '${city.name}',`;
  const replacement = `name: '${city.name}', lat: ${city.lat}, lng: ${city.lng},`;
  if (!content.includes(replacement)) {
    content = content.replace(target, replacement);
  }
}

// 2. We also need to fix `InteractiveGlobe.tsx` title text from "Live Feed (Top 10)" to "Recent Activities"
const globePath = 'src/app/components/InteractiveGlobe.tsx';
let globeContent = fs.readFileSync(globePath, 'utf8');
globeContent = globeContent.replace('<span>Live Feed (Top 10)</span>', '<span>Recent Activities</span>');

// 3. Make sure the globe pointOfView works correctly even if the user zooms very far in.
// If altitude is 0.8, it's safe.
// Wait, when they click on a city, altitude is 0.6. Let's change it to 0.8 in InteractiveGlobe.tsx
globeContent = globeContent.replace('altitude: 0.6 }, 1500);', 'altitude: 1.2 }, 1500);');

fs.writeFileSync(path, content);
fs.writeFileSync(globePath, globeContent);

console.log("Fixed cities and globe wording");
