const fs = require('fs');
let code = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');

// 1. Add scanProgress state
code = code.replace(
  "const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);",
  "const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);\n  const [scanProgress, setScanProgress] = useState(0);"
);

// 2. Add useEffect for scanning animation right before loadReports
const useEffectCode = `
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAIAnalyzing) {
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 95) return 95; // Hold at 95% until AI finishes
          return prev + Math.floor(Math.random() * 8) + 2; // Jump 2-10% randomly
        });
      }, 200);
    } else {
      if (scanProgress > 0) {
        setScanProgress(100);
        setTimeout(() => setScanProgress(0), 500); // Reset after a short delay
      }
    }
    return () => clearInterval(interval);
  }, [isAIAnalyzing]);
`;
code = code.replace("  /**\n   * Heatmap data processing\n   */", useEffectCode + "\n  /**\n   * Heatmap data processing\n   */");

// 3. Replace the photo-upload UI
const oldUI = `                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo Evidence</label>
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                    <label htmlFor="photo-upload" className={\`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all \${photo ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-500'}\`}>
                      {isAIAnalyzing ? (
                        <div className="flex flex-col items-center py-6 relative overflow-hidden w-full">
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/20 to-transparent animate-pulse blur-md" style={{ backgroundSize: '100% 200%' }}></div>
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
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-gray-600">{photo ? 'Change Photo' : 'Take or upload photo'}</span>
                        </>
                      )}
                    </label>
                  </div>
                  {photo && !isAIAnalyzing && <img src={photo} alt="Preview" className="mt-3 w-full h-48 object-cover rounded-lg" />}
                </div>`;

const newUI = `                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo Evidence</label>
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" disabled={isAIAnalyzing} />
                    
                    {/* If there is a photo (either analyzing or done) */}
                    {photo ? (
                      <div className="relative w-full h-56 rounded-lg overflow-hidden border-2 border-green-500 shadow-inner group">
                        {/* Background Image */}
                        <img src={photo} alt="Upload Preview" className={\`w-full h-full object-cover transition-opacity duration-300 \${isAIAnalyzing ? 'opacity-50' : 'opacity-100'}\`} />
                        
                        {/* AI Scanning Overlay */}
                        {isAIAnalyzing && (
                          <>
                            {/* Scanning Laser Line */}
                            <div 
                              className="absolute left-0 right-0 h-1 bg-green-400 shadow-[0_0_15px_3px_rgba(74,222,128,0.8)] z-20"
                              style={{ 
                                top: \`\${scanProgress}%\`, 
                                transition: 'top 0.2s linear' 
                              }}
                            />
                            
                            {/* Tint above the laser */}
                            <div 
                              className="absolute top-0 left-0 right-0 bg-green-500/20 backdrop-blur-[1px] z-10"
                              style={{ 
                                height: \`\${scanProgress}%\`,
                                transition: 'height 0.2s linear'
                              }}
                            />
                            
                            {/* Centered Processing UI */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                              <div className="bg-black/70 backdrop-blur-md px-6 py-4 rounded-xl border border-green-500/30 flex flex-col items-center shadow-2xl">
                                <Sparkles className="w-8 h-8 text-green-400 animate-pulse mb-3" />
                                <div className="text-white font-mono font-bold tracking-widest uppercase text-sm mb-2 flex items-center gap-2">
                                  <span>AI Analyzing</span>
                                  <span className="text-green-400">{scanProgress}%</span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                                  <div 
                                    className="h-full bg-gradient-to-r from-green-600 to-green-400 relative"
                                    style={{ 
                                      width: \`\${scanProgress}%\`,
                                      transition: 'width 0.2s linear'
                                    }}
                                  >
                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite] w-full h-full" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                                  </div>
                                </div>
                                <p className="text-gray-400 text-xs mt-3 animate-pulse">Detecting rubbish type...</p>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {/* Change Photo Button (Hidden during analysis) */}
                        {!isAIAnalyzing && (
                          <label htmlFor="photo-upload" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                            <Camera className="w-10 h-10 text-white mb-2" />
                            <span className="text-white font-medium">Change Photo</span>
                          </label>
                        )}
                      </div>
                    ) : (
                      <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all border-gray-300 hover:border-green-500 hover:bg-green-50/50 bg-gray-50 group">
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Camera className="w-8 h-8 text-gray-400 group-hover:text-green-500 transition-colors" />
                        </div>
                        <span className="text-gray-700 font-medium text-lg">Take or upload photo</span>
                        <span className="text-gray-400 text-sm mt-1">Our AI will automatically categorize it!</span>
                      </label>
                    )}
                  </div>
                </div>`;

code = code.replace(oldUI, newUI);
fs.writeFileSync('src/app/pages/ReportRubbish.tsx', code);
