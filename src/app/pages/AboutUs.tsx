import { useEffect } from 'react';
import { Header } from '../components/Header';
import { Users, Mail, Award, Target, Heart, Code, Terminal, GitBranch, Coffee, Database, Zap, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

// Team member placeholder avatars (using UI Avatars service)
const nazmusAvatar = 'https://ui-avatars.com/api/?name=Nazmus+Sakib&background=22c55e&color=fff&size=200';
const niloyAvatar = 'https://ui-avatars.com/api/?name=Md+Niloy&background=3b82f6&color=fff&size=200';
const suvekshyaAvatar = 'https://ui-avatars.com/api/?name=Suvekshya+Shrestha&background=8b5cf6&color=fff&size=200';
const bisestaAvatar = 'https://ui-avatars.com/api/?name=Bisesta+Shah&background=ef4444&color=fff&size=200';

const teamMembers = [
  {
    name: 'Nazmus Sakib',
    email: 's8116515@live.vu.edu.au',
    role: 'Project Leader',
    github: 'https://github.com/1Sakib1',
    avatar: nazmusAvatar,
  },
  {
    name: 'Md Abudozana Niloy',
    email: 's8138202@live.vu.edu.au',
    role: 'Full Stack Developer',
    github: null,
    avatar: niloyAvatar,
  },
  {
    name: 'Suvekshya Shrestha',
    email: 's8103527@live.vu.edu.au',
    role: 'UI/UX Designer & Developer',
    github: null,
    avatar: suvekshyaAvatar,
  },
  {
    name: 'Bisesta Shah',
    email: 's8103504@live.vu.edu.au',
    role: 'Backend Developer',
    github: null,
    avatar: bisestaAvatar,
  },
];

const techStack = [
  { 
    name: 'React', 
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    bgColor: 'bg-slate-800',
    borderColor: 'border-cyan-500/30',
    hoverBorder: 'hover:border-cyan-400',
    url: 'https://react.dev/'
  },
  { 
    name: 'TypeScript', 
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    bgColor: 'bg-slate-800',
    borderColor: 'border-blue-600/30',
    hoverBorder: 'hover:border-blue-500',
    url: 'https://www.typescriptlang.org/'
  },
  { 
    name: 'Tailwind CSS', 
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
    bgColor: 'bg-slate-800',
    borderColor: 'border-cyan-400/30',
    hoverBorder: 'hover:border-cyan-300',
    url: 'https://tailwindcss.com/'
  },
  { 
    name: 'Leaflet', 
    logo: 'https://leafletjs.com/docs/images/logo.png',
    bgColor: 'bg-slate-800',
    borderColor: 'border-green-600/30',
    hoverBorder: 'hover:border-green-500',
    url: 'https://leafletjs.com/'
  },
  { 
    name: 'Supabase', 
    logo: 'https://avatars.githubusercontent.com/u/54469796?s=200&v=4',
    bgColor: 'bg-slate-800',
    borderColor: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-400',
    url: 'https://supabase.com/'
  },
  { 
    name: 'Motion', 
    logo: 'https://user-images.githubusercontent.com/36073/197568178-b718714c-887b-490c-87b4-6c32c5da3d22.png',
    bgColor: 'bg-slate-800',
    borderColor: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-400',
    url: 'https://motion.dev/'
  },
  { 
    name: 'GitHub', 
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original-wordmark.svg',
    bgColor: 'bg-slate-800',
    borderColor: 'border-gray-400/30',
    hoverBorder: 'hover:border-gray-300',
    url: 'https://github.com/'
  },
  { 
    name: 'Vercel', 
    logo: 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png',
    bgColor: 'bg-slate-800',
    borderColor: 'border-slate-400/30',
    hoverBorder: 'hover:border-slate-300',
    url: 'https://vercel.com/'
  },
];

export const AboutUs = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // If there's a hash in the URL, scroll to that section after a brief delay
    if (window.location.hash) {
      setTimeout(() => {
        const element = document.querySelector(window.location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <Header variant="landing" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section with Terminal Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 sm:mb-16"
        >
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
            {/* Terminal Header */}
            <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-slate-400 text-sm font-mono">~/smart-rubbish-detection</span>
              </div>
            </div>
            
            {/* Terminal Content */}
            <div className="p-6 sm:p-8 lg:p-12 font-mono text-sm sm:text-base">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-400">$</span>
                  <span className="text-slate-300">cat README.md</span>
                </div>
                <div className="mt-4 space-y-4 text-slate-300 pl-4">
                  <div className="flex items-center gap-3">
                    <Code className="w-8 h-8 sm:w-12 sm:h-12 text-green-400" />
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                        About Our Development Team
                      </h1>
                      <p className="text-sm sm:text-base text-green-400">
                        # Victoria University Sydney - IT Capstone Project 2026
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4 py-2 bg-slate-800/50 rounded-r">
                    <p className="text-slate-300 leading-relaxed">
                      Building a next-generation global Smart Rubbish Detection System for major cities worldwide with passion, 
                      innovation, and cutting-edge web technologies. This project is developed as part of 
                      our IT Capstone Project at <span className="text-green-400 font-semibold">Victoria University Sydney</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mission Cards - Dark Theme */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 sm:mb-16"
        >
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-lg rounded-xl border border-blue-700/50 p-6 sm:p-8 hover:border-blue-500/50 transition-all group">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/20 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Our Mission</h3>
              <p className="text-sm sm:text-base text-slate-300">
                To create cleaner, more sustainable cities worldwide through community engagement and innovative technology
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-lg rounded-xl border border-purple-700/50 p-6 sm:p-8 hover:border-purple-500/50 transition-all group">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/20 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Our Values</h3>
              <p className="text-sm sm:text-base text-slate-300">
                Community-first approach, transparency, and environmental stewardship guide everything we do
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-lg rounded-xl border border-green-700/50 p-6 sm:p-8 hover:border-green-500/50 transition-all group">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-green-500/20 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-green-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Our Impact</h3>
              <p className="text-sm sm:text-base text-slate-300">
                Empowering global citizens to make a real difference in keeping our cities beautiful for future generations
              </p>
            </div>
          </div>
        </motion.section>

        {/* Tech Stack Showcase */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 sm:mb-16"
        >
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Terminal className="w-8 h-8 text-green-400" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Tech Stack</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {techStack.map((tech, index) => (
                <motion.a
                  key={tech.name}
                  href={tech.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`${tech.bgColor} p-5 rounded-xl text-center hover:scale-105 transition-all cursor-pointer shadow-lg border-2 ${tech.borderColor} ${tech.hoverBorder} group block`}
                >
                  <div className="flex items-center justify-center mb-3 h-16">
                    <img 
                      src={tech.logo} 
                      alt={tech.name} 
                      className="w-14 h-14 object-contain group-hover:scale-110 transition-transform" 
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className={`font-semibold text-sm ${tech.bgColor === 'bg-white' ? 'text-slate-800' : 'text-white'}`}>
                    {tech.name}
                  </div>
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 mx-auto text-slate-400" />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Team Members - Developer Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 sm:mb-16"
        >
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-10 h-10 text-green-400" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Meet Our Dev Team
              </h2>
            </div>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-mono">
              // Victoria University Sydney Students
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.email}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6 hover:border-green-500/50 transition-all group relative overflow-hidden"
              >
                {/* Glowing Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Avatar with Code Icon */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform border-4 border-green-500/50"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-900 border-2 border-green-500 rounded-full flex items-center justify-center">
                    <GitBranch className="w-4 h-4 text-green-400" />
                  </div>
                </div>

                {/* Info */}
                <div className="text-center relative">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-mono">
                    {member.name}
                  </h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full text-xs sm:text-sm font-medium mb-3">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {member.role}
                  </div>
                  
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-green-400 transition-colors break-all active:scale-95 min-h-[44px] px-2 mb-2"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="break-words text-xs">{member.email}</span>
                  </a>
                  
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-green-500/30 hover:border-green-400 text-green-400 rounded-lg text-xs font-medium transition-all active:scale-95 mt-2"
                    >
                      <GitBranch className="w-4 h-4" />
                      <span>View GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Project Info - Code Style */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 sm:mb-16"
        >
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 overflow-hidden">
            {/* Code Editor Header */}
            <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-sm font-mono">project-info.md</span>
            </div>
            
            <div className="p-6 sm:p-8 lg:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Database className="w-8 h-8 text-green-400" />
                About This Project
              </h2>
              <div className="space-y-4 sm:space-y-6 text-sm sm:text-base text-slate-300 font-mono leading-relaxed">
                <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-green-400 mb-2">// Academic Information</p>
                  <p className="text-white font-semibold mb-1">
                    📚 Victoria University Sydney - IT Capstone Project
                  </p>
                  <p className="text-slate-400 text-sm">
                    Group Project | 2026 | Information Technology
                  </p>
                </div>

                <p>
                  The <span className="text-green-400 font-semibold">Smart Rubbish Detection System</span> is a comprehensive 
                  web application designed to empower urban citizens worldwide to actively participate in keeping their cities clean. 
                  Through innovative technology and community engagement, we're building a transparent and efficient platform 
                  for reporting and managing rubbish issues across major cities globally.
                </p>
                
                <p>
                  Our system features <span className="text-blue-400">real-time GPS detection</span>, 
                  <span className="text-purple-400"> interactive heat maps</span> showcasing rubbish hotspots in urban areas, 
                  and a rewarding <span className="text-yellow-400">eco-points system</span> that converts 
                  community efforts into real-world credits. With dual authentication for both community members and 
                  administrators, we ensure accountability and transparency at every step.
                </p>
                
                <p>
                  Built with modern web technologies including <span className="text-cyan-400">React</span>, 
                  <span className="text-blue-400"> TypeScript</span>, and <span className="text-green-400">Supabase</span>, 
                  this platform demonstrates our commitment to creating sustainable, user-friendly solutions that make a 
                  real difference in communities worldwide.
                </p>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mt-6">
                  <p className="text-slate-400 mb-2">
                    <span className="text-green-400">const</span> technologies = [
                  </p>
                  <div className="pl-4 space-y-1 text-sm">
                    <p className="text-slate-300">'React', 'TypeScript', 'Tailwind CSS',</p>
                    <p className="text-slate-300">'Leaflet Maps', 'Supabase KV Store',</p>
                    <p className="text-slate-300">'Motion (Framer Motion)', 'React Router'</p>
                  </div>
                  <p className="text-slate-400">];</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Contact Section - Dark Theme */}
        <motion.section
          id="get-in-touch"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-green-900/40 via-emerald-900/40 to-green-900/40 backdrop-blur-lg border-2 border-green-500/30 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Get In Touch
              </h2>
            </div>
            <p className="text-base sm:text-lg text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Have questions or feedback about our platform? We'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <a
                href="mailto:nazmus.sakib@live.vu.edu.au"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg hover:shadow-green-500/50 active:scale-95 min-h-[48px] border border-green-400/30"
              >
                <Mail className="w-5 h-5" />
                <span className="text-sm sm:text-base">Contact Team</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-400 font-mono">
              nazmus.sakib@live.vu.edu.au
            </p>
          </div>
        </motion.section>

        {/* Footer Attribution */}
        <div className="mt-12 text-center text-slate-500 text-sm font-mono border-t border-slate-800 pt-8">
          <p>Built with 💚 by Victoria University Sydney Students</p>
          <p className="mt-2 text-slate-600">IT Capstone Project 2026</p>
        </div>
      </div>
    </div>
  );
};