import React, { useEffect } from 'react';
import { Header } from '../components/Header';
import { Heart, Globe, Shield, Coffee, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';

export const Donate = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-white" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-green-100/50 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-6"
            >
              <Heart className="w-10 h-10 text-[#00B150]" fill="currentColor" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#333333] mb-6 leading-tight"
            >
              Support Our <span className="text-[#00B150]">Non-Profit</span> Mission
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-600 mb-10 leading-relaxed"
            >
              LitterPin is a registered non-profit organization. We rely entirely on community donations to keep our servers running, fund our AI technology, and provide Eco-Points rewards to dedicated volunteers.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Donation Tiers */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Tier 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-shadow flex flex-col"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Coffee className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#333333] mb-2">Supporter</h3>
              <div className="text-4xl font-bold text-[#333333] mb-6">$10 <span className="text-lg text-gray-400 font-normal">/month</span></div>
              <p className="text-gray-600 mb-8 flex-grow">
                Buy a coffee for the servers! Your contribution helps us cover basic cloud hosting and database costs.
              </p>
              <button onClick={() => alert('Donation gateway coming soon!')} className="w-full py-3 px-4 rounded-xl border-2 border-[#00B150] text-[#00B150] font-bold hover:bg-green-50 transition-colors flex items-center justify-center group">
                Donate Now
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Tier 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl border-2 border-[#00B150] p-8 relative flex flex-col transform md:-translate-y-4"
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-[#00B150] text-white text-sm font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-md">Most Popular</span>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-[#00B150]" />
              </div>
              <h3 className="text-2xl font-bold text-[#333333] mb-2">Eco Champion</h3>
              <div className="text-4xl font-bold text-[#333333] mb-6">$25 <span className="text-lg text-gray-400 font-normal">/month</span></div>
              <p className="text-gray-600 mb-8 flex-grow">
                Directly fund our AI models and help us reward volunteers. Every dollar translates to cleaner communities.
              </p>
              <button onClick={() => alert('Donation gateway coming soon!')} className="w-full py-3 px-4 rounded-xl bg-[#00B150] text-white font-bold hover:bg-[#009b45] shadow-lg shadow-green-500/30 transition-all flex items-center justify-center group">
                Donate Now
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Tier 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-shadow flex flex-col"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#333333] mb-2">Global Guardian</h3>
              <div className="text-4xl font-bold text-[#333333] mb-6">$100 <span className="text-lg text-gray-400 font-normal">/month</span></div>
              <p className="text-gray-600 mb-8 flex-grow">
                Become a core sponsor. Your generous support allows us to scale our infrastructure globally and launch new features.
              </p>
              <button onClick={() => alert('Donation gateway coming soon!')} className="w-full py-3 px-4 rounded-xl border-2 border-[#00B150] text-[#00B150] font-bold hover:bg-green-50 transition-colors flex items-center justify-center group">
                Donate Now
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Trust & Transparency */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="w-12 h-12 text-[#00B150] mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-[#333333] mb-6">100% Transparency Guarantee</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              As a registered non-profit, we believe in complete financial transparency. We commit that 100% of your donations go directly into:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="text-2xl font-bold text-[#00B150] mb-2">40%</div>
                <h4 className="font-semibold text-[#333333] mb-2">Cloud & AI Servers</h4>
                <p className="text-sm text-gray-500">Powering the Gemini AI scanners, database, and real-time mapping.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="text-2xl font-bold text-[#00B150] mb-2">45%</div>
                <h4 className="font-semibold text-[#333333] mb-2">Eco-Points Rewards</h4>
                <p className="text-sm text-gray-500">Subsidizing the financial rewards for our top volunteers and community cleaners.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="text-2xl font-bold text-[#00B150] mb-2">15%</div>
                <h4 className="font-semibold text-[#333333] mb-2">Awareness & Outreach</h4>
                <p className="text-sm text-gray-500">Educational campaigns and onboarding more schools and local councils.</p>
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-green-50 rounded-2xl border border-green-100 text-center">
              <p className="text-gray-700">Want to make a one-time donation or sponsor us as an enterprise?</p>
              <Link to="/about-us#get-in-touch" className="inline-block mt-4 text-[#00B150] font-bold hover:underline">Contact our partnership team</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
