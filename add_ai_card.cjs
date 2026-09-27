const fs = require('fs');
const path = 'src/app/pages/Landing.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add Brain icon to lucide-react imports
if (content.includes('lucide-react') && !content.includes('Brain,')) {
  content = content.replace('import { MapPin,', 'import { MapPin, Brain,');
}

// Change grid-cols-3 to grid-cols-4 for lg screens, and grid-cols-2 for md
content = content.replace('grid md:grid-cols-3 gap-8 relative z-10', 'grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10');

// Inject the 4th card right after Real-Time Analytics
const fourthCard = `
              {/* Card 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(0,177,80,0.2)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00B150] to-[#00d25e] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00B150] group-hover:scale-110 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,177,80,0.4)]">
                  <Brain className="w-7 h-7 text-[#00B150] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="relative text-xl font-bold text-[#333333] mb-3 group-hover:text-[#00B150] transition-colors duration-300">AI Analyzer</h3>
                <p className="relative text-gray-600 leading-relaxed">
                  Instantly process reports using advanced computer vision to classify waste types and assess environmental priority levels.
                </p>
              </motion.div>
            </div>
          </div>
        </section>`;

// Replace the end of the section
const targetStr = '</div>\n          </div>\n        </section>';
content = content.replace(targetStr, fourthCard);

fs.writeFileSync(path, content);
console.log("Added AI Analyzer card");
