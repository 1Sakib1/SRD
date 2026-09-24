const fs = require('fs');
let content = fs.readFileSync('src/app/utils/geocoding.ts', 'utf8');

const newFunction = `
export const getUserCityName = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      \`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}&addressdetails=1\`
    );
    if (!response.ok) return 'your area';
    const data = await response.json();
    const address = data.address;
    return address.city || address.town || address.suburb || address.county || address.state || 'your area';
  } catch (error) {
    return 'your area';
  }
};
`;

if (!content.includes('getUserCityName')) {
  fs.appendFileSync('src/app/utils/geocoding.ts', newFunction);
  console.log('Added getUserCityName');
}
