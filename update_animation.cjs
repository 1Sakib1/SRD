const fs = require('fs');
let content = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');
content = content.replace(
  /{isAIAnalyzing \? \([\s\S]*?\) : \(/,
  `{isAIAnalyzing ? (
                      <div className="flex flex-col items-center py-6 relative overflow-hidden w-full">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/20 to-transparent animate-[scan_2s_ease-in-out_infinite] blur-md" style={{ backgroundSize: '100% 200%' }}></div>
                        <div className="relative flex items-center justify-center w-20 h-20 mb-4">
                          <div className="absolute inset-0 rounded-full border-4 border-green-200 opacity-20 animate-ping shadow-lg shadow-green-500/50"></div>
                          <div className="absolute inset-2 rounded-full border-4 border-green-300 opacity-40 animate-pulse"></div>
                          <div className="absolute inset-4 rounded-full border-2 border-green-400 opacity-60"></div>
                          <Sparkles className="w-8 h-8 text-[#00B150] animate-bounce relative z-10" />
                        </div>
                        <span className="text-green-700 font-bold tracking-widest uppercase text-sm animate-pulse relative z-10 bg-white/90 px-4 py-2 rounded-full shadow-sm border border-green-200">
                          AI Scanning Image...
                        </span>
                      </div>
                    ) : (`
);
fs.writeFileSync('src/app/pages/ReportRubbish.tsx', content);
console.log('done');
