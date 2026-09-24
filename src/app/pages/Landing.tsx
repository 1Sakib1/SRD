import React from 'react';
import { ContextualInfo } from '../components/ContextualInfo';
import { InteractiveGlobe } from '../components/InteractiveGlobe';
import { LitterPinLogo } from '../components/LitterPinLogo';
import { Link } from 'react-router';
import { Header } from '../components/Header';
import { MapPin, Award, TrendingUp, Users, FileCheck, Zap, ArrowRight, Leaf, Recycle, DollarSign, Globe } from 'lucide-react';
import { getUserStats } from '../utils/storage';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { motion } from 'motion/react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Hero image - Add your image to /public/images/hero.jpg
const sydneyHeroImage = '/images/hero.jpg';
const heroImageFallback = 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop';

export const Landing = () => {
  const stats = getUserStats();
    const [focusLocation, setFocusLocation] = React.useState<{lat: number, lng: number} | null>(null);
  
  const globalCities = [
    {
      name: 'New York City', lat: 40.7128, lng: -74.006,
      country: 'USA',
      image: 'https://images.unsplash.com/photo-1500632907344-a073709b2448?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwQ2l0eSUyMHNreWxpbmUlMjBuaWdodxlbnwxfHx8fDE3NzI1NjkxNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'London', lat: 51.5074, lng: -0.1278,
      country: 'United Kingdom',
      image: 'https://images.unsplash.com/photo-1672243681582-cebc8c8466e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMb25kb24lMjBCaWclMjBCZW4lMjBjaXR5c2NhcGV8ZW58MXx8fHwxNzcyNjI1NDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Tokyo', lat: 35.6762, lng: 139.6503,
      country: 'Japan',
      image: 'https://images.unsplash.com/photo-1657728509574-c14afd8a9ab3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMEphcGFuJTIwc2t5bGluZSUyMG5pZ2h0fGVufDF8fHx8MTc3MjYyNTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Paris', lat: 48.8566, lng: 2.3522,
      country: 'France',
      image: 'https://images.unsplash.com/photo-1659003505996-d5d7ca66bb25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQYXJpcyUyMEVpZmZlbCUyMFRvd2VyJTIwY2l0eXNjYXBlfGVufDF8fHx8MTc3MjYyNTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Dubai', lat: 25.2048, lng: 55.2708,
      country: 'UAE',
      image: 'https://images.unsplash.com/photo-1651063820152-d3e7a27b4d2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMHNreWxpbmUlMjBCdXJqJTIwS2hhbGlmYXxlbnwxfHx8fDE3NzI2MDU2Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Singapore', lat: 1.3521, lng: 103.8198,
      country: 'Singapore',
      image: 'https://images.unsplash.com/photo-1526797433728-1b6d12a06ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTaW5nYXBvcmUlMjBNYXJpbmElMjBCYXklMjBjaXR5c2NhcGV8ZW58MXx8fHwxNzcyNjI1NDUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Hong Kong', lat: 22.3193, lng: 114.1694,
      country: 'China',
      image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxIb25nJTIwS29uZyUyMFZpY3RvcmlhJTIwSGFyYm9yJTIwbmlnaHR8ZW58MXx8fHwxNzcyNjI1NDUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Toronto', lat: 43.651, lng: -79.347,
      country: 'Canada',
      image: 'https://images.unsplash.com/photo-1668882698355-923d532fa985?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb3JvbnRvJTIwQ2FuYWRhJTIwc2t5bGluZXxlbnwxfHx8fDE3NzI2MjU0NTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Header variant="landing" />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full mb-4 sm:mb-6">
                <Leaf className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                <span className="text-white font-medium text-xs sm:text-sm lg:text-base">Global Urban Waste Management Solution</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Together We Keep{' '}
                <span className="text-green-200">Our Cities Clean</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-green-50 mb-6 sm:mb-8 leading-relaxed">
                Citizen-Led Urban Mapping & Community Rewards.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/report"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#00B150] rounded-lg text-base sm:text-lg font-medium hover:bg-green-50 transition-all hover:shadow-xl inline-flex items-center justify-center shadow-lg active:scale-95 min-h-[48px] w-full sm:w-auto"
                >
                  <span>Report Litter</span>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative order-first lg:order-last"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur-2xl opacity-30" />
              <InteractiveGlobe focusLocation={focusLocation} />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContextualInfo />
        </div>
      </section>
      
      {/* Global Cities Slideshow */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
              <Globe className="w-5 h-5 text-[#00B150]" />
              <span className="text-green-700 font-medium text-sm">Available Globally</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#333333] mb-4">
              Serving Major Cities Worldwide
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform is making an impact in urban centers across the globe
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="city-slider-container"
          >
            <Slider {...sliderSettings}>
              {globalCities.map((city, index) => (
                <div key={index} className="px-3">
                  <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={() => {
    setFocusLocation({ lat: city.lat, lng: city.lng });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }}>
                    <div className="aspect-[4/3] relative">
                      <img
                        src={city.image}
                        alt={`${city.name}, ${city.country}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                      
                      {/* City Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-2xl font-bold mb-1">{city.name}</h3>
                        <p className="text-green-300 font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {city.country}
                        </p>
                      </div>

                      {/* Hover Effect Badge */}
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        Active
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#333333] mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to make a real impact in your community
            </p>
          </div>
          
          
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
                  <Zap className="w-7 h-7 text-[#00B150] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="relative text-xl font-bold text-[#333333] mb-3 group-hover:text-[#00B150] transition-colors duration-300">Real-Time Analytics</h3>
                <p className="relative text-gray-600 leading-relaxed">
                  View heat maps and insights showing rubbish hotspots across your city in real-time.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#333333] mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-[#00B150] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-[#333333] mb-3">Sign Up</h3>
              <p className="text-gray-600">
                Create your free account in seconds and join our growing community of eco-warriors.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-[#00B150] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-[#333333] mb-3">Report Rubbish</h3>
              <p className="text-gray-600">
                Spot rubbish? Take a photo, add location details, and submit your report instantly.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-[#00B150] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-[#333333] mb-3">Earn Rewards</h3>
              <p className="text-gray-600">
                Collect eco-points, track your impact, and help make your city cleaner every day.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join thousands of urban citizens worldwide working together for cleaner, greener cities.
            </p>
            <Link
              to="/report"
              className="inline-flex items-center px-8 py-4 bg-white text-[#00B150] rounded-lg text-lg font-medium hover:bg-gray-50 transition-all shadow-lg"
            >
              Report Litter
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <LitterPinLogo className="w-10 h-10 drop-shadow-md" />
                <span className="font-semibold text-white">Litter<span className="text-[#00B150]">Pin</span></span>
              </div>
              <p className="text-sm">
                Making our cities cleaner, one report at a time.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth" className="hover:text-white">Features</Link></li>
                <li><Link to="/auth" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/auth" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/about-us#get-in-touch" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/awareness" className="hover:text-white transition-colors">Awareness</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/" className="hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 LitterPin.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};