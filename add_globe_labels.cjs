const fs = require('fs');
const path = 'src/app/components/InteractiveGlobe.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add majorCities array outside the component
const citiesArray = `
const MAJOR_CITIES = [
  { name: 'New York', lat: 40.7128, lng: -74.0060, country: 'USA' },
  { name: 'London', lat: 51.5074, lng: -0.1278, country: 'UK' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, country: 'France' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, country: 'UAE' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, country: 'Singapore' },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, country: 'China' },
  { name: 'Toronto', lat: 43.6510, lng: -79.3470, country: 'Canada' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'Australia' },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333, country: 'Brazil' },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357, country: 'Egypt' },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, country: 'India' },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173, country: 'Russia' },
  { name: 'Beijing', lat: 39.9042, lng: 116.4074, country: 'China' },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, country: 'USA' },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241, country: 'South Africa' },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050, country: 'Germany' },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, country: 'Argentina' },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332, country: 'Mexico' },
  { name: 'Seoul', lat: 37.5665, lng: 126.9780, country: 'South Korea' },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456, country: 'Indonesia' },
  { name: 'Rome', lat: 41.9028, lng: 12.4964, country: 'Italy' },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792, country: 'Nigeria' },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784, country: 'Turkey' }
];
`;

if (!content.includes('MAJOR_CITIES')) {
  content = content.replace('export const InteractiveGlobe =', citiesArray + '\nexport const InteractiveGlobe =');
}

// 2. Add htmlElementsData props to Globe
const htmlProps = `
        htmlElementsData={MAJOR_CITIES}
        htmlElement={(d: any) => {
          const el = document.createElement('div');
          el.innerHTML = \`
            <div style="color: rgba(255,255,255,0.9); font-family: monospace; font-size: 11px; font-weight: 600; text-shadow: 0 0 6px rgba(0,0,0,1), 0 0 2px rgba(0,0,0,1); display: flex; flex-direction: column; align-items: center; pointer-events: none; transform: translate(-50%, -50%); letter-spacing: 0.5px;">
              <div style="width: 4px; height: 4px; background: rgba(255,255,255,0.7); border-radius: 50%; margin-bottom: 2px; box-shadow: 0 0 5px rgba(255,255,255,0.5);"></div>
              \${d.name}
              <span style="font-size: 8px; color: rgba(200,200,200,0.8); font-weight: 400; text-transform: uppercase;">\${d.country}</span>
            </div>
          \`;
          return el;
        }}
`;

if (!content.includes('htmlElementsData={MAJOR_CITIES}')) {
  content = content.replace('hexBinPointsData={hexBinPointsData}', htmlProps + '\n        hexBinPointsData={hexBinPointsData}');
}

fs.writeFileSync(path, content);
console.log("Added major cities to globe");
