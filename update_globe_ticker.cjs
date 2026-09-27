const fs = require('fs');

const path = 'src/app/components/InteractiveGlobe.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove zoom limits
content = content.replace('globeEl.current.controls().minDistance = 140; // Prevent zooming into blurry surface', '');
content = content.replace('globeEl.current.controls().maxDistance = 400;', '');

// 2. Remove the old Recent Feed panel
const oldFeedRegex = /<div className="bg-white\/5 backdrop-blur-xl rounded-lg p-2\.5 border border-white\/10 text-white shadow-2xl flex flex-col gap-2">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

// Replace it with just closing the top-left stats div
content = content.replace(oldFeedRegex, '</div>');

// 3. Add the ticker style to the return statement
const styleBlock = `
      <style>{` + `
        @keyframes ticker {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker {
          animation: ticker 25s linear infinite;
          display: inline-flex;
          white-space: nowrap;
        }
      ` + `}</style>
`;

// 4. Add the bottom ticker HTML
const tickerHTML = `
      {/* Bottom Scrolling Ticker */}
      <div className="absolute bottom-0 left-0 w-full bg-white/5 backdrop-blur-xl border-t border-white/10 py-1.5 overflow-hidden flex items-center pointer-events-none rounded-b-2xl">
        <div className="bg-[#0a1118]/90 px-4 py-1.5 absolute left-0 z-10 h-full flex items-center gap-2 border-r border-white/10 shadow-[15px_0_20px_rgba(0,0,0,0.8)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00B150] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-200">Latest</span>
        </div>
        
        <div className="w-full overflow-hidden flex items-center pl-24">
          <div className="animate-ticker flex items-center gap-8">
             {reports.slice(0, 15).map(report => (
               <div key={report.id} className="flex items-center gap-2 text-[10px]">
                 <span className="text-[#00B150] font-bold tracking-wide">{report.type}</span>
                 <span className="text-gray-500">•</span>
                 <span className="text-gray-300">{report.location_address}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
`;

// Inject style and ticker right before the closing </div> of the component (and before selectedPoint modal)
content = content.replace('{selectedPoint && (', styleBlock + tickerHTML + '\n      {selectedPoint && (');

// Fix an issue where `100vw` might be too wide if the globe container is smaller. 
// `translateX(1000px)` is safer if the container is max 1200px wide. 
// Let's replace `100vw` with `100%` (which relative to parent, wait no, 100% of its own width. 
// Actually, `transform: translateX(100vw)` is fine because it guarantees it starts off-screen right.

fs.writeFileSync(path, content);
console.log("Updated InteractiveGlobe with Ticker");
