const fs = require('fs');
const path = 'src/app/pages/Landing.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the features section grid
const regex = /<div className="grid md:grid-cols-3 gap-8">[\s\S]*?<\/section>/;

const newFeatures = `
            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {/* Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(0,177,80,0.2)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00B150] to-[#00d25e] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00B150] group-hover:scale-110 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,177,80,0.4)]">
                  <MapPin className="w-7 h-7 text-[#00B150] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="relative text-xl font-bold text-[#333333] mb-3 group-hover:text-[#00B150] transition-colors duration-300">GPS Tracking</h3>
                <p className="relative text-gray-600 leading-relaxed">
                  Automatically detect your location or manually pin exact coordinates for precise reporting.
                </p>
              </motion.div>
              
              {/* Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(0,177,80,0.2)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00B150] to-[#00d25e] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00B150] group-hover:scale-110 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,177,80,0.4)]">
                  <Award className="w-7 h-7 text-[#00B150] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="relative text-xl font-bold text-[#333333] mb-3 group-hover:text-[#00B150] transition-colors duration-300">Eco-Points Rewards</h3>
                <p className="relative text-gray-600 leading-relaxed">
                  Earn points for every report and convert them to real AUD credits! Every 100 eco-points = $1 AUD.
                </p>
              </motion.div>
              
              {/* Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(0,177,80,0.2)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00B150] to-[#00d25e] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00B150] group-hover:scale-110 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,177,80,0.4)]">
                  <Activity className="w-7 h-7 text-[#00B150] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="relative text-xl font-bold text-[#333333] mb-3 group-hover:text-[#00B150] transition-colors duration-300">Real-Time Analytics</h3>
                <p className="relative text-gray-600 leading-relaxed">
                  View heat maps and insights showing rubbish hotspots across your city in real-time.
                </p>
              </motion.div>
            </div>
          </div>
        </section>`;

content = content.replace(regex, newFeatures);
fs.writeFileSync(path, content);
console.log("Updated Powerful Features section");
