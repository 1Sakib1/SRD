const fs = require('fs');

let content = fs.readFileSync('src/app/pages/Dashboard.tsx', 'utf8');

// 1. Add imports
const importTarget = "import { LocationPoint } from '../utils/mockData';";
const importReplacement = "import { LocationPoint } from '../utils/mockData';\nimport { getCurrentLocation, getUserCityName } from '../utils/geocoding';";
if (content.includes(importTarget)) {
    content = content.replace(importTarget, importReplacement);
}

// 2. Add state
const stateTarget = "const [mapLocations, setMapLocations] = useState<LocationPoint[]>([]);";
const stateReplacement = "const [mapLocations, setMapLocations] = useState<LocationPoint[]>([]);\n  const [cityName, setCityName] = useState<string>('Sydney');";
if (content.includes(stateTarget)) {
    content = content.replace(stateTarget, stateReplacement);
}

// 3. Add to useEffect
const effectTarget = "const loadData = async () => {";
const effectReplacement = `// Fetch user's city for personalized subtitle
    getCurrentLocation().then(async (pos) => {
      const city = await getUserCityName(pos.lat, pos.lng);
      setCityName(city);
    }).catch(e => console.log('Location not granted for subtitle'));

    const loadData = async () => {`;
if (content.includes(effectTarget) && !content.includes('getUserCityName(pos.lat')) {
    content = content.replace(effectTarget, effectReplacement);
}

// 4. Update the subtitle text
const subtitleTarget = `<p className="text-sm sm:text-base text-gray-600">Here's your impact on Sydney's cleanliness</p>`;
const subtitleReplacement = `<p className="text-sm sm:text-base text-gray-600">Here's your impact on {cityName}'s cleanliness</p>`;
if (content.includes(subtitleTarget)) {
    content = content.replace(subtitleTarget, subtitleReplacement);
}

fs.writeFileSync('src/app/pages/Dashboard.tsx', content);
console.log('Dashboard updated with dynamic city name');
