const fs = require('fs');

const path = 'src/app/components/InteractiveGlobe.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove the ticker style block
content = content.replace(/<style dangerouslySetInnerHTML=[\s\S]*?\/>/, '');

// 2. Replace the bottom ticker HTML
const tickerRegex = /{\/\* Bottom Scrolling Ticker \*\/}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newTechLog = `
      {/* Technical Event Log Overlay */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 pointer-events-none w-[220px]">
        <div className="text-[#00B150] font-mono text-[9px] uppercase tracking-widest mb-1 flex items-center gap-1.5 opacity-80">
          <Activity size={10} />
          <span>System Event Log</span>
        </div>
        <div className="flex flex-col gap-1.5 relative h-[120px] overflow-hidden">
          <AnimatePresence>
            {recentReports.slice(0, 3).map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ 
                  opacity: 1 - (idx * 0.25), 
                  x: 0, 
                  height: 'auto',
                  scale: 1 - (idx * 0.05)
                }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
                className="bg-black/40 backdrop-blur-md border-l-2 border-[#00B150] p-2 rounded-r-md w-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] origin-left"
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[#00B150] font-mono text-[9px] font-bold uppercase truncate">
                    > {report.type}
                  </span>
                  <span className="text-gray-500 font-mono text-[8px] shrink-0">
                    ID:{report.id.substring(0, 4)}
                  </span>
                </div>
                <div className="text-gray-300 font-mono text-[8px] truncate opacity-80">
                  {report.location_address}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
`;

content = content.replace(tickerRegex, newTechLog);

fs.writeFileSync(path, content);
console.log("Replaced ticker with technical event log");
