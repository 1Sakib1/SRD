const fs = require('fs');

// --- UPDATE Landing.tsx ---
const landingPath = 'src/app/pages/Landing.tsx';
let landingContent = fs.readFileSync(landingPath, 'utf8');

// 1. Add focusLocation state
if (!landingContent.includes('const [focusLocation')) {
  landingContent = landingContent.replace(
    'const stats = getUserStats();',
    'const stats = getUserStats();\n    const [focusLocation, setFocusLocation] = React.useState<{lat: number, lng: number} | null>(null);'
  );
  if (!landingContent.includes('import React')) {
      landingContent = "import React from 'react';\n" + landingContent;
  }
}

// 2. Pass focusLocation to InteractiveGlobe
landingContent = landingContent.replace(
  '<InteractiveGlobe />',
  '<InteractiveGlobe focusLocation={focusLocation} />'
);

// 3. Add coords to cities
const citiesRegex = /const globalCities = \[[\s\S]*?\}\n    \];/;
const newCities = `const globalCities = [
      {
        name: 'New York City',
        country: 'USA',
        image: 'https://images.unsplash.com/photo-1500632907344-a073709b2448?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwQ2l0eSUyMHNreWxpbmUlMjBuaWdodxlbnwxfHx8fDE3NzI1NjkxNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        lat: 40.7128,
        lng: -74.0060
      },
      {
        name: 'London',
        country: 'United Kingdom',
        image: 'https://images.unsplash.com/photo-1672243681582-cebc8c8466e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMb25kb24lMjBCaWclMjBCZW4lMjBjaXR5c2NhcGV8ZW58MXx8fHwxNzcyNjI1NDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        lat: 51.5074,
        lng: -0.1278
      },
      {
        name: 'Tokyo',
        country: 'Japan',
        image: 'https://images.unsplash.com/photo-1657728509574-c14afd8a9ab3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMEphcGFuJTIwc2t5bGluZSUyMG5pZ2h0fGVufDF8fHx8MTc3MjYyNTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        lat: 35.6762,
        lng: 139.6503
      },
      {
        name: 'Paris',
        country: 'France',
        image: 'https://images.unsplash.com/photo-1659003505996-d5d7ca66bb25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQYXJpcyUyMEVpZmZlbCUyMFRvd2VyJTIwY2l0eXNjYXBlfGVufDF8fHx8MTc3MjYyNTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        lat: 48.8566,
        lng: 2.3522
      },
      {
        name: 'Sydney',
        country: 'Australia',
        image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop',
        lat: -33.8688,
        lng: 151.2093
      }
    ];`;
landingContent = landingContent.replace(citiesRegex, newCities);

// 4. Add onClick to city cards
landingContent = landingContent.replace(
  /<div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl[\s\S]*?transition-all duration-300">/g,
  `<div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={() => {
    setFocusLocation({ lat: city.lat, lng: city.lng });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }}>`
);
fs.writeFileSync(landingPath, landingContent);
console.log("Updated Landing.tsx");

// --- UPDATE InteractiveGlobe.tsx ---
const globePath = 'src/app/components/InteractiveGlobe.tsx';
let globeContent = fs.readFileSync(globePath, 'utf8');

// 1. Props
globeContent = globeContent.replace('export const InteractiveGlobe = () => {', 'export const InteractiveGlobe = ({ focusLocation }: { focusLocation?: { lat: number, lng: number } | null }) => {');

// 2. Add focusLocation useEffect
const focusEffect = `
  useEffect(() => {
    if (focusLocation && globeEl.current) {
      globeEl.current.controls().autoRotate = false;
      globeEl.current.pointOfView({ lat: focusLocation.lat, lng: focusLocation.lng, altitude: 0.6 }, 1500);
    }
  }, [focusLocation]);
`;
globeContent = globeContent.replace('const handleInteract = () => {', focusEffect + '\n  const handleInteract = () => {');

// 3. Click outside listener
const clickOutsideEffect = `
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (globeEl.current) {
          globeEl.current.controls().autoRotate = true;
          // Optionally return to default orbit
          globeEl.current.pointOfView({ lat: -25.2744, lng: 133.7751, altitude: 2.2 }, 1500);
        }
        setSelectedPoint(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
`;
globeContent = globeContent.replace('const handleInteract = () => {', clickOutsideEffect + '\n  const handleInteract = () => {');


// 4. Live network indicator 
globeContent = globeContent.replace(
  '<Activity size={12} className="text-[#00B150]" />',
  '<div className="w-1.5 h-1.5 bg-[#00B150] rounded-full animate-pulse" />'
);

// 5. Rolling animation for top 10 recent reports
const styleBlockTarget = /<style dangerouslySetInnerHTML=[\s\S]*? \/>/;
const newStyleBlock = `<style dangerouslySetInnerHTML={{ __html: \`
  @keyframes vertical-roll {
    0% { transform: translateY(0); }
    100% { transform: translateY(-50%); }
  }
  .animate-vertical-roll {
    animation: vertical-roll 30s linear infinite;
  }
  .animate-vertical-roll:hover {
    animation-play-state: paused;
  }
\` }} />`;
globeContent = globeContent.replace(styleBlockTarget, newStyleBlock);

const oldLogRegex = new RegExp('\\{\\/\\* Technical Event Log Overlay \\*\\/\\}[\\\\s\\\\S]*?<\\/AnimatePresence>\\\\s*<\\/div>\\\\s*<\\/div>');

const newLog = `
      {/* Technical Event Log Overlay */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 pointer-events-auto w-[220px]">
        <div className="text-[#00B150] font-mono text-[9px] uppercase tracking-widest mb-1 flex items-center gap-1.5 opacity-80">
          <Activity size={10} />
          <span>Live Feed (Top 10)</span>
        </div>
        <div className="flex flex-col gap-1.5 relative h-[140px] overflow-hidden mask-image-fade">
          {/* Continuous scrolling container. We duplicate the list to make the loop seamless */}
          <div className="animate-vertical-roll flex flex-col gap-1.5">
            {[...reports.slice(0, 10), ...reports.slice(0, 10)].map((report, idx) => (
              <div
                key={report.id + '-' + idx}
                className="bg-black/40 backdrop-blur-md border-l-2 border-[#00B150] p-2 rounded-r-md w-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] shrink-0 cursor-pointer hover:bg-black/60 transition-colors"
                onClick={() => {
                  handleInteract();
                  if (globeEl.current) {
                    globeEl.current.pointOfView({ lat: report.lat, lng: report.lng, altitude: 0.8 }, 1000);
                  }
                  setSelectedPoint(report);
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[#00B150] font-mono text-[9px] font-bold uppercase truncate">
                    &gt; {report.type}
                  </span>
                  <span className="text-gray-500 font-mono text-[8px] shrink-0">
                    ID:{report.id.substring(0, 4)}
                  </span>
                </div>
                <div className="text-gray-300 font-mono text-[8px] truncate opacity-80">
                  {report.location_address}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: \`
        .mask-image-fade {
          -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
          mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
        }
      \` }} />
`;
globeContent = globeContent.replace(oldLogRegex, newLog);

fs.writeFileSync(globePath, globeContent);
console.log("Updated InteractiveGlobe.tsx");
