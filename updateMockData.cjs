const fs = require('fs');

let content = fs.readFileSync('src/app/utils/mockData.ts', 'utf8');

const oldInterface = `export interface LocationPoint {
  id: string;
  lat: number;
  lng: number;
  address: string;
  reports: number;
  intensity: number; // 0-1 for heat map coloring
}`;

const newInterface = `export interface LocationPoint {
  id: string;
  lat: number;
  lng: number;
  address: string;
  reports: number;
  intensity: number; // 0-1 for heat map coloring
  photo?: string;
  type?: string;
  date?: string;
  stillThere?: number;
  gone?: number;
  cleaned?: number;
}`;

content = content.replace(oldInterface, newInterface);

// Add mock images and details to the first few locations
content = content.replace(`    reports: 45,
    intensity: 0.9,`, `    reports: 45,
    intensity: 0.9,
    photo: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'Plastic Waste',
    date: '2026-09-27T08:30:00Z',
    stillThere: 12,
    gone: 2,
    cleaned: 1,`);

content = content.replace(`    reports: 38,
    intensity: 0.75,`, `    reports: 38,
    intensity: 0.75,
    photo: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'General Litter',
    date: '2026-09-26T14:15:00Z',
    stillThere: 8,
    gone: 0,
    cleaned: 0,`);

content = content.replace(`    reports: 52,
    intensity: 1.0,`, `    reports: 52,
    intensity: 1.0,
    photo: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'Construction Debris',
    date: '2026-09-25T10:00:00Z',
    stillThere: 24,
    gone: 1,
    cleaned: 5,`);

fs.writeFileSync('src/app/utils/mockData.ts', content);
