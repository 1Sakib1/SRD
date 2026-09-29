import re

with open('src/app/pages/ReportRubbish.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix model
code = code.replace('model: "gemini-3.6-flash"', 'model: "gemini-1.5-flash"')

# Fix UI
ui_start = code.find('<label className="block text-sm font-medium text-gray-700 mb-2">Photo Evidence</label>')
ui_end = code.find('<label className="block text-sm font-medium text-gray-700 mb-2">Rubbish Type</label>')

if ui_start != -1 and ui_end != -1:
    new_ui = """<label className="block text-sm font-medium text-gray-700 mb-2">Photo Evidence</label>
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" disabled={isAIAnalyzing} />
                    
                    {photo ? (
                      <div className="relative w-full h-56 rounded-lg overflow-hidden border-2 border-green-500 shadow-inner group">
                        <img src={photo} alt="Upload Preview" className={`w-full h-full object-cover transition-opacity duration-300 ${isAIAnalyzing ? 'opacity-50' : 'opacity-100'}`} />
                        
                        {isAIAnalyzing && (
                          <>
                            <div 
                              className="absolute left-0 right-0 h-1 bg-green-400 shadow-[0_0_15px_3px_rgba(74,222,128,0.8)] z-20"
                              style={{ top: `${scanProgress}%`, transition: 'top 0.2s linear' }}
                            />
                            <div 
                              className="absolute top-0 left-0 right-0 bg-green-500/20 backdrop-blur-[1px] z-10"
                              style={{ height: `${scanProgress}%`, transition: 'height 0.2s linear' }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                              <div className="bg-black/70 backdrop-blur-md px-6 py-4 rounded-xl border border-green-500/30 flex flex-col items-center shadow-2xl">
                                <Sparkles className="w-8 h-8 text-green-400 animate-pulse mb-3" />
                                <div className="text-white font-mono font-bold tracking-widest uppercase text-sm mb-2 flex items-center gap-2">
                                  <span>AI Analyzing</span>
                                  <span className="text-green-400">{scanProgress}%</span>
                                </div>
                                <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                                  <div 
                                    className="h-full bg-gradient-to-r from-green-600 to-green-400 relative"
                                    style={{ width: `${scanProgress}%`, transition: 'width 0.2s linear' }}
                                  ></div>
                                </div>
                                <p className="text-gray-400 text-xs mt-3 animate-pulse">Categorizing image...</p>
                              </div>
                            </div>
                          </>
                        )}
                        
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
                </div>

                <div>
                  """
    
    # We replace from the start of the first label to the start of the second label
    code = code[:ui_start] + new_ui + code[ui_end + len('<label className="block text-sm font-medium text-gray-700 mb-2">Rubbish Type</label>'):]

with open('src/app/pages/ReportRubbish.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Patch applied successfully.")
