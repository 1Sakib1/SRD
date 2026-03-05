import { Header } from '../components/Header';
import { Leaf, Recycle, ShieldAlert, Book, AlertTriangle, CheckCircle2, XCircle, Scale, FileText, Globe, MapPin, TrendingUp, Users, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

// Partner logos - Add your images to /public/images/partners/
const partnerLogos = {
  cityOfSydney: {
    src: '/images/partners/city-of-sydney.png',
    fallback: 'https://via.placeholder.com/200x80/0052CC/FFFFFF?text=City+of+Sydney',
  },
  nswEpa: {
    src: '/images/partners/nsw-epa.png',
    fallback: 'https://via.placeholder.com/200x80/2E7D32/FFFFFF?text=NSW+EPA',
  },
  planetArk: {
    src: '/images/partners/planet-ark.png',
    fallback: 'https://via.placeholder.com/200x80/4CAF50/FFFFFF?text=Planet+Ark',
  },
};

// Country-specific waste management data
const countryData = {
  australia: {
    name: 'Australia (Sydney)',
    flag: '🇦🇺',
    currency: 'AUD',
    bins: [
      {
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        boxColor: 'bg-red-600',
        name: 'Red Lid - General Waste',
        description: 'Non-recyclable items that can\'t be composted',
        items: ['Soft plastics & packaging', 'Polystyrene', 'Broken glass & ceramics', 'Disposable nappies']
      },
      {
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        boxColor: 'bg-yellow-400',
        name: 'Yellow Lid - Recycling',
        description: 'Clean and dry recyclable materials',
        items: ['Paper & cardboard', 'Glass bottles & jars', 'Plastic bottles & containers', 'Metal cans & tins']
      },
      {
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        boxColor: 'bg-green-600',
        name: 'Green Lid - Organics',
        description: 'Food scraps and garden waste',
        items: ['Fruit & vegetable scraps', 'Garden clippings & leaves', 'Coffee grounds & tea bags', 'Small amounts of paper towel']
      }
    ],
    laws: [
      {
        title: 'Illegal Dumping',
        description: 'Under the Protection of the Environment Operations Act 1997, illegal dumping is a serious offense.',
        penalties: ['Individuals: Up to $1 million fine and/or 7 years imprisonment', 'Corporations: Up to $5 million fine', 'On-the-spot fines: $4,000 for smaller offences'],
        color: 'red'
      },
      {
        title: 'Littering',
        description: 'Littering in NSW is covered by the Protection of the Environment Operations Act 1997.',
        penalties: ['On-the-spot fine: $500 for individuals', 'Court-imposed fine: Up to $2,000', 'Littering from vehicle: Owner liable even if not the driver'],
        color: 'orange'
      },
      {
        title: 'Cigarette Butt Disposal',
        description: 'Discarding cigarette butts is considered littering and is strictly prohibited.',
        penalties: ['On-the-spot fine: $500', 'Fire hazard violations: Additional penalties apply'],
        color: 'amber'
      }
    ],
    emergencyNumbers: [
      { name: 'EPA Environment Line', number: '131 555', description: '24/7 pollution incident reporting' },
      { name: 'City of Sydney Council', number: '02 9265 9333', description: 'General waste and recycling inquiries' }
    ],
    stats: {
      recyclingRate: 67,
      wasteGeneration: 540,
      diversion: 62
    }
  },
  usa: {
    name: 'United States (NYC)',
    flag: '🇺🇸',
    currency: 'USD',
    bins: [
      {
        color: 'black',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-300',
        boxColor: 'bg-gray-800',
        name: 'Black/Dark - General Trash',
        description: 'Non-recyclable waste',
        items: ['Food-soiled paper', 'Plastic bags', 'Styrofoam', 'Broken ceramics']
      },
      {
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        boxColor: 'bg-blue-600',
        name: 'Blue - Recycling',
        description: 'Mixed recyclables',
        items: ['Paper & cardboard', 'Metal cans', 'Glass bottles', 'Plastic containers #1-7']
      },
      {
        color: 'brown',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        boxColor: 'bg-amber-700',
        name: 'Brown - Organics (Select Areas)',
        description: 'Composting program',
        items: ['Food scraps', 'Yard waste', 'Soiled paper products', 'Natural materials']
      }
    ],
    laws: [
      {
        title: 'Illegal Dumping',
        description: 'Varies by state; in NYC governed by NYC Administrative Code.',
        penalties: ['Fines: $1,500 - $20,000', 'Up to 1 year imprisonment', 'Vehicle impoundment possible'],
        color: 'red'
      },
      {
        title: 'Littering Violations',
        description: 'NYC Department of Sanitation enforces anti-littering laws.',
        penalties: ['Fine: $50 - $300 for first offense', 'Community service may be required', 'Increased fines for repeat offenses'],
        color: 'orange'
      }
    ],
    emergencyNumbers: [
      { name: '311 NYC', number: '311', description: 'Report non-emergency issues' },
      { name: 'NYC Sanitation', number: '1-833-682-7273', description: 'Waste collection inquiries' }
    ],
    stats: {
      recyclingRate: 35,
      wasteGeneration: 730,
      diversion: 44
    }
  },
  uk: {
    name: 'United Kingdom (London)',
    flag: '🇬🇧',
    currency: 'GBP',
    bins: [
      {
        color: 'black',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-300',
        boxColor: 'bg-gray-800',
        name: 'Black Bin - General Waste',
        description: 'Non-recyclable household waste',
        items: ['Polystyrene', 'Crisp packets', 'Broken toys', 'Pet waste']
      },
      {
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        boxColor: 'bg-blue-600',
        name: 'Blue Bin - Recycling',
        description: 'Mixed dry recyclables',
        items: ['Cardboard', 'Paper', 'Plastic bottles', 'Cans']
      },
      {
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        boxColor: 'bg-green-600',
        name: 'Green/Brown - Garden Waste',
        description: 'Organic garden materials',
        items: ['Grass clippings', 'Leaves', 'Twigs & branches', 'Plant cuttings']
      },
      {
        color: 'burgundy',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-300',
        boxColor: 'bg-rose-900',
        name: 'Food Waste Caddy',
        description: 'Food scraps collection',
        items: ['All food waste', 'Meat & fish', 'Dairy products', 'Cooked food']
      }
    ],
    laws: [
      {
        title: 'Fly-Tipping (Illegal Dumping)',
        description: 'Under the Environmental Protection Act 1990.',
        penalties: ['Unlimited fine', 'Up to 5 years imprisonment', 'Fixed penalty notices: £400'],
        color: 'red'
      },
      {
        title: 'Littering',
        description: 'Covered by Environmental Protection Act 1990.',
        penalties: ['Fixed penalty: £75 - £150', 'Court fine: Up to £2,500', 'Community service orders'],
        color: 'orange'
      }
    ],
    emergencyNumbers: [
      { name: 'Report Fly-Tipping', number: '0300 123 5000', description: 'Environment Agency hotline' },
      { name: 'Local Council', number: 'Varies by borough', description: 'Check your council website' }
    ],
    stats: {
      recyclingRate: 45,
      wasteGeneration: 463,
      diversion: 46
    }
  },
  japan: {
    name: 'Japan (Tokyo)',
    flag: '🇯🇵',
    currency: 'JPY',
    bins: [
      {
        color: 'varies',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        boxColor: 'bg-orange-500',
        name: 'Burnable Waste (燃やすごみ)',
        description: 'Items that can be incinerated',
        items: ['Food waste', 'Paper waste', 'Wood products', 'Rubber & leather']
      },
      {
        color: 'varies',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        boxColor: 'bg-slate-600',
        name: 'Non-burnable Waste (燃やさないごみ)',
        description: 'Items that cannot be burned',
        items: ['Metal items', 'Glass', 'Ceramics', 'Small appliances']
      },
      {
        color: 'varies',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
        boxColor: 'bg-cyan-600',
        name: 'Recyclables (資源ごみ)',
        description: 'Separated by material type',
        items: ['Plastic bottles (PET)', 'Cans', 'Glass bottles', 'Newspapers & magazines']
      },
      {
        color: 'special',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        boxColor: 'bg-purple-600',
        name: 'Oversized Waste (粗大ごみ)',
        description: 'Large items requiring appointment',
        items: ['Furniture', 'Appliances', 'Bicycles', 'Large electronics']
      }
    ],
    laws: [
      {
        title: 'Improper Waste Disposal',
        description: 'Governed by Waste Management and Public Cleansing Law.',
        penalties: ['Fine: Up to ¥10 million (approx. $90,000 USD)', 'Imprisonment: Up to 5 years', 'Strict enforcement with surveillance cameras'],
        color: 'red'
      },
      {
        title: 'Littering',
        description: 'Local ordinances with strict penalties.',
        penalties: ['Fines vary by municipality', 'Social stigma is a strong deterrent', 'Community cleanup requirements'],
        color: 'orange'
      }
    ],
    emergencyNumbers: [
      { name: 'Ward Office', number: 'Varies by ward', description: 'Contact your local ward office' },
      { name: 'Tokyo Metropolitan Govt', number: '03-5388-1111', description: 'General inquiries' }
    ],
    stats: {
      recyclingRate: 84,
      wasteGeneration: 336,
      diversion: 82
    }
  },
  singapore: {
    name: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD',
    bins: [
      {
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        boxColor: 'bg-blue-600',
        name: 'Blue Bin - Recyclables',
        description: 'All recyclable materials',
        items: ['Paper & cardboard', 'Plastic containers', 'Glass bottles', 'Metal cans']
      },
      {
        color: 'green',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-300',
        boxColor: 'bg-gray-700',
        name: 'General Waste Chute',
        description: 'All other waste',
        items: ['Food waste', 'Non-recyclables', 'Soiled items', 'Mixed waste']
      }
    ],
    laws: [
      {
        title: 'Illegal Dumping',
        description: 'Under Environmental Public Health Act.',
        penalties: ['First offense: Up to SGD $50,000', 'Repeat offenders: Up to SGD $100,000', 'Corrective Work Order (CWO) may be issued'],
        color: 'red'
      },
      {
        title: 'Littering',
        description: 'Singapore has some of the world\'s strictest anti-littering laws.',
        penalties: ['First offense: Fine up to SGD $2,000', 'Second offense: Up to SGD $4,000', 'Third offense: Up to SGD $10,000 + Corrective Work Order'],
        color: 'orange'
      }
    ],
    emergencyNumbers: [
      { name: 'NEA Hotline', number: '1800-225-5632', description: 'National Environment Agency' },
      { name: 'Municipal Services', number: '1800-241-6141', description: 'Report environmental issues' }
    ],
    stats: {
      recyclingRate: 61,
      wasteGeneration: 423,
      diversion: 59
    }
  },
  germany: {
    name: 'Germany (Berlin)',
    flag: '🇩🇪',
    currency: 'EUR',
    bins: [
      {
        color: 'black',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-300',
        boxColor: 'bg-gray-800',
        name: 'Black/Grey - Residual Waste (Restmüll)',
        description: 'Non-recyclable waste',
        items: ['Hygiene products', 'Ash', 'Broken ceramics', 'Vacuum bags']
      },
      {
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        boxColor: 'bg-blue-600',
        name: 'Blue - Paper (Papiertonne)',
        description: 'Paper and cardboard only',
        items: ['Newspapers', 'Cardboard boxes', 'Writing paper', 'Magazines']
      },
      {
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        boxColor: 'bg-yellow-400',
        name: 'Yellow - Packaging (Gelber Sack)',
        description: 'Packaging materials with "Grüner Punkt"',
        items: ['Plastic packaging', 'Aluminum foil', 'Beverage cartons', 'Metal cans']
      },
      {
        color: 'brown',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        boxColor: 'bg-amber-700',
        name: 'Brown - Organic (Biotonne)',
        description: 'Organic waste',
        items: ['Food scraps', 'Garden waste', 'Coffee grounds', 'Egg shells']
      },
      {
        color: 'green',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        boxColor: 'bg-emerald-600',
        name: 'Glass Containers',
        description: 'Separated by color (white, green, brown)',
        items: ['Glass bottles', 'Glass jars', 'No ceramics', 'No light bulbs']
      }
    ],
    laws: [
      {
        title: 'Illegal Waste Disposal',
        description: 'Under Circular Economy Act (KrWG).',
        penalties: ['Fines: Up to €100,000', 'Imprisonment: Up to 5 years for serious offenses', 'Mandatory cleanup costs'],
        color: 'red'
      },
      {
        title: 'Improper Waste Separation',
        description: 'Germany requires strict waste separation.',
        penalties: ['Warning letters first', 'Fines: €35 - €2,500', 'Waste collection may be refused'],
        color: 'orange'
      }
    ],
    emergencyNumbers: [
      { name: 'BSR (Berlin)', number: '030 7592-4900', description: 'Waste management services' },
      { name: 'Environmental Office', number: 'Varies by city', description: 'Local environmental authority' }
    ],
    stats: {
      recyclingRate: 67,
      wasteGeneration: 483,
      diversion: 68
    }
  }
};

export const Awareness = () => {
  const [selectedCountry, setSelectedCountry] = useState<keyof typeof countryData>('australia');
  const data = countryData[selectedCountry];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="landing" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section with Country Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-4">
            <Globe className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Global Waste Management Awareness
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Learn about proper waste disposal, recycling guidelines, and environmental laws worldwide
          </p>

          {/* Country Selector */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Select Your Region</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(countryData).map(([key, country]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCountry(key as keyof typeof countryData)}
                    className={`p-4 rounded-xl border-2 transition-all font-medium text-sm ${
                      selectedCountry === key
                        ? 'bg-green-600 border-green-600 text-white shadow-lg scale-105'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-2xl mb-1">{country.flag}</div>
                    <div className="text-xs">{country.name.split('(')[0]}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          key={selectedCountry}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Recycle className="w-8 h-8" />
              <h3 className="text-lg font-semibold">Recycling Rate</h3>
            </div>
            <p className="text-4xl font-bold mb-1">{data.stats.recyclingRate}%</p>
            <p className="text-green-100 text-sm">Materials recycled annually</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8" />
              <h3 className="text-lg font-semibold">Waste Per Capita</h3>
            </div>
            <p className="text-4xl font-bold mb-1">{data.stats.wasteGeneration} kg</p>
            <p className="text-blue-100 text-sm">Per person per year</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8" />
              <h3 className="text-lg font-semibold">Diversion Rate</h3>
            </div>
            <p className="text-4xl font-bold mb-1">{data.stats.diversion}%</p>
            <p className="text-purple-100 text-sm">Diverted from landfills</p>
          </div>
        </motion.div>

        {/* Bin System Section */}
        <motion.section
          key={`bins-${selectedCountry}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Leaf className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">{data.name} - Bin System</h2>
          </div>
          
          <div className={`grid gap-6 ${data.bins.length === 2 ? 'md:grid-cols-2' : data.bins.length === 3 ? 'md:grid-cols-3' : data.bins.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {data.bins.map((bin, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className={`${bin.bgColor} border-2 ${bin.borderColor} rounded-lg p-6 hover:shadow-lg transition-shadow`}
              >
                <div className={`w-12 h-12 ${bin.boxColor} rounded-lg mb-4`} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{bin.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{bin.description}</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {bin.items.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Proper Waste Disposal Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Recycle className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Proper Waste Disposal</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                DO's
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                  <span className="text-gray-700">Separate recyclables according to local guidelines</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                  <span className="text-gray-700">Rinse containers before recycling to prevent contamination</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                  <span className="text-gray-700">Compost organic waste when facilities are available</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                  <span className="text-gray-700">Dispose of e-waste at designated collection points</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                  <span className="text-gray-700">Take hazardous waste to proper facilities</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                  <span className="text-gray-700">Break down cardboard boxes to save space</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                DON'Ts
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2" />
                  <span className="text-gray-700">Don't contaminate recycling with food waste</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2" />
                  <span className="text-gray-700">Don't mix different types of waste in the same bin</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2" />
                  <span className="text-gray-700">Don't dump waste in public spaces or on private property</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2" />
                  <span className="text-gray-700">Don't put batteries in regular bins (fire hazard)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2" />
                  <span className="text-gray-700">Don't leave furniture on the street without proper disposal</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2" />
                  <span className="text-gray-700">Don't put medical waste in household bins</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Environmental Laws Section */}
        <motion.section
          key={`laws-${selectedCountry}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Scale className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Environmental Laws & Penalties</h2>
          </div>
          
          <div className="space-y-6">
            {data.laws.map((law, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className={`border-l-4 ${
                  law.color === 'red' ? 'border-red-500' : 
                  law.color === 'orange' ? 'border-orange-500' : 
                  'border-amber-500'
                } pl-6 py-2`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{law.title}</h3>
                <p className="text-gray-700 mb-2">{law.description}</p>
                <div className={`${
                  law.color === 'red' ? 'bg-red-50' : 
                  law.color === 'orange' ? 'bg-orange-50' : 
                  'bg-amber-50'
                } p-4 rounded-lg`}>
                  <p className="text-sm text-gray-900 font-semibold mb-1">Penalties:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {law.penalties.map((penalty, i) => (
                      <li key={i}>• {penalty}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Emergency Contact Section */}
        <motion.section
          key={`contact-${selectedCountry}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Report Environmental Violations</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">When to Report:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <span className="text-gray-700">Illegal dumping of waste or hazardous materials</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <span className="text-gray-700">Abandoned vehicles or furniture on public land</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <span className="text-gray-700">Overflowing public bins or large litter accumulations</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <span className="text-gray-700">Construction debris left on streets</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information:</h3>
              <div className="space-y-4">
                {data.emergencyNumbers.map((contact, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">{contact.name}</p>
                    <p className="text-lg font-semibold text-green-600">{contact.number}</p>
                    <p className="text-xs text-gray-500">{contact.description}</p>
                  </div>
                ))}
                <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Online Reporting</p>
                  <p className="text-sm text-green-600 font-medium">Use this app's Report Rubbish feature!</p>
                  <p className="text-xs text-gray-500">Fast, easy, and trackable</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Additional Resources - Only show for Australia */}
        {selectedCountry === 'australia' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Additional Resources & Partners</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <a
                href="https://www.epa.nsw.gov.au/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:shadow-lg transition-all"
              >
                <div className="h-24 mb-4 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4">
                  <img
                    src={partnerLogos.nswEpa.src}
                    alt="NSW EPA"
                    className="h-full w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.src = partnerLogos.nswEpa.fallback;
                    }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors text-lg">NSW Environment Protection Authority</h3>
                <p className="text-sm text-gray-600 mb-3">Official government environmental agency</p>
                <p className="text-xs text-gray-500">Access environmental guidelines, regulations, and pollution reporting services</p>
              </a>
              
              <a
                href="https://www.cityofsydney.nsw.gov.au/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:shadow-lg transition-all"
              >
                <div className="h-24 mb-4 flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg p-4">
                  <img
                    src={partnerLogos.cityOfSydney.src}
                    alt="City of Sydney"
                    className="h-full w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.src = partnerLogos.cityOfSydney.fallback;
                    }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors text-lg">City of Sydney Council</h3>
                <p className="text-sm text-gray-600 mb-3">Local government services</p>
                <p className="text-xs text-gray-500">Council services, waste collection schedules, cleanup programs, and community initiatives</p>
              </a>
              
              <a
                href="https://www.recyclingnearyou.com.au/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:shadow-lg transition-all"
              >
                <div className="h-24 mb-4 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                  <img
                    src={partnerLogos.planetArk.src}
                    alt="Recycling Near You"
                    className="h-full w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.src = partnerLogos.planetArk.fallback;
                    }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors text-lg">Recycling Near You</h3>
                <p className="text-sm text-gray-600 mb-3">National recycling directory</p>
                <p className="text-xs text-gray-500">Find recycling locations, learn what can be recycled, and access recycling guides</p>
              </a>
            </div>
          </motion.section>
        )}

        {/* Global Impact Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gradient-to-br from-blue-600 to-green-600 rounded-xl p-8 text-white"
        >
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Join the Global Movement</h2>
          </div>
          
          <p className="text-lg mb-6 text-blue-50">
            Every action counts! By properly managing waste in your community, you're contributing to a cleaner, healthier planet for everyone.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-3xl font-bold mb-2">2.01B</h3>
              <p className="text-blue-100">Tonnes of waste generated globally per year</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-3xl font-bold mb-2">33%</h3>
              <p className="text-blue-100">Global average recycling rate</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-3xl font-bold mb-2">3.4B</h3>
              <p className="text-blue-100">Tonnes projected by 2050 without action</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};
