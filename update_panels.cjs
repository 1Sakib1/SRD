const fs = require('fs');

const path = 'src/app/components/InteractiveGlobe.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update slice to 3
content = content.replace('const recentReports = reports.slice(0, 4);', 'const recentReports = reports.slice(0, 3);');

// Replace the panel wrapper
content = content.replace(
  '<div className="absolute top-4 left-4 flex flex-col gap-3 max-w-[200px] sm:max-w-[250px] pointer-events-none">',
  '<div className="absolute top-4 left-4 flex flex-col gap-2 max-w-[150px] sm:max-w-[180px] pointer-events-none">'
);

// Replace Total Stat panel
const totalStatOld = `<div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={16} className="text-[#00B150]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">Live Network</span>
          </div>
          <div className="text-3xl font-black text-white">{reports.length}</div>
          <div className="text-[10px] text-gray-400">Total Active Reports</div>
        </div>`;

const totalStatNew = `<div className="bg-white/5 backdrop-blur-xl rounded-lg p-2.5 border border-white/10 text-white shadow-2xl">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Activity size={12} className="text-[#00B150]" />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-300">Live Network</span>
          </div>
          <div className="text-2xl font-black text-white leading-none mb-1">{reports.length}</div>
          <div className="text-[9px] text-gray-400 leading-tight">Total Active Reports</div>
        </div>`;
content = content.replace(totalStatOld, totalStatNew);

// Replace Recent Feed panel
const recentFeedOld = `<div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white shadow-xl flex flex-col gap-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-300 border-b border-white/10 pb-2 mb-1 flex items-center gap-2">
            <Clock size={14} className="text-[#00B150]" />
            Latest Activity
          </div>
          <div className="space-y-3">
            {recentReports.map(report => (
              <div key={report.id} className="flex flex-col gap-0.5 relative pl-3 border-l-2 border-[#00B150]/50">
                <div className="text-[11px] font-semibold text-gray-200 line-clamp-1">{report.type}</div>
                <div className="text-[10px] text-gray-400 line-clamp-1">{report.location_address}</div>
              </div>
            ))}
          </div>
        </div>`;

const recentFeedNew = `<div className="bg-white/5 backdrop-blur-xl rounded-lg p-2.5 border border-white/10 text-white shadow-2xl flex flex-col gap-2">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-gray-300 border-b border-white/10 pb-1.5 flex items-center gap-1.5">
            <Clock size={12} className="text-[#00B150]" />
            Latest Activity
          </div>
          <div className="space-y-2">
            {recentReports.map(report => (
              <div key={report.id} className="flex flex-col gap-0.5 relative pl-2 border-l-[1.5px] border-[#00B150]/60">
                <div className="text-[10px] font-semibold text-gray-200 line-clamp-1 leading-tight">{report.type}</div>
                <div className="text-[9px] text-gray-400 line-clamp-1 leading-tight">{report.location_address}</div>
              </div>
            ))}
          </div>
        </div>`;
content = content.replace(recentFeedOld, recentFeedNew);

fs.writeFileSync(path, content);
console.log("Updated glass panels");
