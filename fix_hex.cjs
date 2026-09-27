const fs = require('fs');

const path = 'src/app/components/InteractiveGlobe.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `          onHexClick={(hex, event, coords) => {
            handleInteract();
            // Point of view zoom to cluster
            if (globeEl.current) {
              globeEl.current.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 0.5 }, 1000);
            }
            setSelectedZone({
              points: hex.points as ReportPoint[],
              lat: coords.lat,
              lng: coords.lng
            });
          }}`;

const replacement = `          onHexClick={(hex) => {
            handleInteract();
            
            // Calculate cluster center
            const points = hex.points as ReportPoint[];
            const centerLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
            const centerLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
            
            // Point of view zoom to cluster
            if (globeEl.current) {
              globeEl.current.pointOfView({ lat: centerLat, lng: centerLng, altitude: 0.5 }, 1000);
            }
            setSelectedZone({
              points: points,
              lat: centerLat,
              lng: centerLng
            });
          }}`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
console.log("Fixed onHexClick signature");
