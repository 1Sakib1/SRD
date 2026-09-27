import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import { supabase } from '../utils/supabase';
import { X, MapPin, AlertTriangle, Activity, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geoContains } from 'd3-geo';

interface ReportPoint {
  id: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  location_address: string;
  created_at: string;
}


const MAJOR_COUNTRIES = [
  { name: 'BANGLADESH', lat: 23.6850, lng: 90.3563 },
  { name: 'SPAIN', lat: 40.4637, lng: -3.7492 },
  { name: 'ITALY', lat: 41.8719, lng: 12.5674 },
  { name: 'UNITED STATES', lat: 39.8283, lng: -98.5795 },
  { name: 'CANADA', lat: 56.1304, lng: -106.3468 },
  { name: 'BRAZIL', lat: -14.2350, lng: -51.9253 },
  { name: 'UNITED KINGDOM', lat: 55.3781, lng: -3.4360 },
  { name: 'FRANCE', lat: 46.2276, lng: 2.2137 },
  { name: 'GERMANY', lat: 51.1657, lng: 10.4515 },
  { name: 'RUSSIA', lat: 61.5240, lng: 105.3188 },
  { name: 'CHINA', lat: 35.8617, lng: 104.1954 },
  { name: 'JAPAN', lat: 36.2048, lng: 138.2529 },
  { name: 'AUSTRALIA', lat: -25.2744, lng: 133.7751 },
  { name: 'INDIA', lat: 20.5937, lng: 78.9629 },
  { name: 'SOUTH AFRICA', lat: -30.5595, lng: 22.9375 },
  { name: 'ARGENTINA', lat: -38.4161, lng: -63.6167 },
  { name: 'MEXICO', lat: 23.6345, lng: -102.5528 },
  { name: 'INDONESIA', lat: -0.7893, lng: 113.9213 },
  { name: 'SAUDI ARABIA', lat: 23.8859, lng: 45.0792 },
  { name: 'NIGERIA', lat: 9.0820, lng: 8.6753 }
];

const MAJOR_CITIES = [
  { name: 'Dhaka', lat: 23.8103, lng: 90.4125, country: 'Bangladesh' },
  { name: 'Madrid', lat: 40.4168, lng: -3.7038, country: 'Spain' },
  { name: 'New York', lat: 40.7128, lng: -74.0060, country: 'USA' },
  { name: 'London', lat: 51.5074, lng: -0.1278, country: 'UK' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, country: 'France' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, country: 'UAE' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, country: 'Singapore' },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, country: 'China' },
  { name: 'Toronto', lat: 43.6510, lng: -79.3470, country: 'Canada' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'Australia' },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333, country: 'Brazil' },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357, country: 'Egypt' },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, country: 'India' },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173, country: 'Russia' },
  { name: 'Beijing', lat: 39.9042, lng: 116.4074, country: 'China' },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, country: 'USA' },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241, country: 'South Africa' },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050, country: 'Germany' },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, country: 'Argentina' },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332, country: 'Mexico' },
  { name: 'Seoul', lat: 37.5665, lng: 126.9780, country: 'South Korea' },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456, country: 'Indonesia' },
  { name: 'Rome', lat: 41.9028, lng: 12.4964, country: 'Italy' },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792, country: 'Nigeria' },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784, country: 'Turkey' }
];

export const InteractiveGlobe = ({ focusLocation }: { focusLocation?: { lat: number, lng: number } | null }) => {
  const globeEl = useRef<any>();
  const [reports, setReports] = useState<ReportPoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<ReportPoint | null>(null);
  const [countries, setCountries] = useState({ features: [] });
  const [highlightedCountry, setHighlightedCountry] = useState<string | null>(null);

    const resolveCountryName = (lat: number, lng: number) => {
    if (!countries.features || countries.features.length === 0) return null;
    const found = (countries.features as any[]).find((f: any) => {
      try {
        return geoContains(f, [lng, lat]);
      } catch (e) {
        return false;
      }
    });
    return found ? found.properties.ADMIN : null;
  };


  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries)
      .catch(err => console.error("Could not load countries geojson", err));
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('id, location_lat, location_lng, type, description, location_address, created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          const formatted = data
            .filter((r: any) => r.location_lat && r.location_lng)
            .map((r: any) => ({
              id: r.id,
              lat: Number(r.location_lat),
              lng: Number(r.location_lng),
              type: r.type || 'Unknown',
              description: r.description || 'No description',
              location_address: r.location_address || 'Unknown location',
              created_at: r.created_at
            }));
          setReports(formatted);
        }
      } catch (err) {
        console.error('Error fetching reports for globe:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();

    const channel = supabase.channel('globe_reports')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, (payload) => {
        const r = payload.new as any;
        if (r.location_lat && r.location_lng) {
          const newReport = {
            id: r.id,
            lat: Number(r.location_lat),
            lng: Number(r.location_lng),
            type: r.type || 'Unknown',
            description: r.description || 'No description',
            location_address: r.location_address || 'Unknown location',
            created_at: r.created_at || new Date().toISOString()
          };
          
          setReports(prev => [newReport, ...prev]);
          
          if (globeEl.current) {
            globeEl.current.pointOfView({ lat: newReport.lat, lng: newReport.lng, altitude: 1.5 }, 1500);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 1.2;
      
      // Limit zoom so the high-res texture doesn't get pixelated
      
       
      
      globeEl.current.pointOfView({ lat: -25.2744, lng: 133.7751, altitude: 0.4 }, 0);
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, [loading]);

  
  useEffect(() => {
    if (focusLocation && globeEl.current) {
      globeEl.current.controls().autoRotate = false;
      globeEl.current.pointOfView({ lat: focusLocation.lat, lng: focusLocation.lng, altitude: 1.2 }, 1500);
    }
  }, [focusLocation]);

  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (globeEl.current) {
          globeEl.current.controls().autoRotate = true;
          // Optionally return to default orbit
          globeEl.current.pointOfView({ lat: -25.2744, lng: 133.7751, altitude: 0.4 }, 1500);
        }
        setSelectedPoint(null);
          setHighlightedCountry(null);
                setHighlightedCountry(null);
          setHighlightedCountry(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInteract = () => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = false;
    }
  };

  const getHexColor = (weight: number) => {
    if (weight < 2) return 'rgba(0, 177, 80, 0.7)'; // Primary Green
    if (weight < 5) return 'rgba(132, 204, 22, 0.8)'; // Lime
    if (weight < 10) return 'rgba(234, 179, 8, 0.9)'; // Yellow
    return 'rgba(239, 68, 68, 0.9)'; // Red
  };

    const [tickerItems, setTickerItems] = useState<ReportPoint[]>([]);

  useEffect(() => {
    setTickerItems(reports.slice(0, 10));
  }, [reports]);

  useEffect(() => {
    if (tickerItems.length <= 1) return;
    const timer = setInterval(() => {
      setTickerItems(prev => {
        if (prev.length <= 1) return prev;
        const next = [...prev];
        const first = next.shift();
        if (first) next.push(first);
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [tickerItems.length]);

  const recentReports = tickerItems.slice(0, 3);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-[4/3] sm:aspect-square md:aspect-[4/3] rounded-2xl shadow-2xl border-4 border-white/20 bg-[#0a1118] overflow-hidden"
      onPointerDown={handleInteract}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a1118]/80 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B150]"></div>
        </div>
      )}
      
      {dimensions.width > 0 && (
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_4096.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          
          // Flat colored heatmap layer!
          hexBinPointsData={reports}
          hexBinPointWeight={() => 1}
          hexBinResolution={4}
          hexMargin={0.2}
          hexTopColor={d => getHexColor(d.sumWeight)}
          hexSideColor={d => getHexColor(d.sumWeight)}
          hexAltitude={d => Math.min(d.sumWeight * 0.08, 0.6)} // 3D Bar effect based on report count
          hexBinMerge={false}
          hexTransitionDuration={1000}
          
          // Keep the radar rings for that live tech aesthetic
          ringsData={reports}
          ringColor={() => (t: number) => `rgba(0, 177, 80, ${1 - t})`}
          ringMaxRadius={2}
          ringPropagationSpeed={1.5}
          ringRepeatPeriod={1500}
          
          // Country Borders
            polygonsData={countries.features}
            polygonAltitude={(d: any) => d.properties.ADMIN === highlightedCountry ? 0.05 : 0.005}
            polygonCapColor={(d: any) => d.properties.ADMIN === highlightedCountry ? 'rgba(0, 255, 115, 0.6)' : 'rgba(0, 0, 0, 0)'}
            polygonSideColor={(d: any) => d.properties.ADMIN === highlightedCountry ? 'rgba(0, 255, 115, 0.4)' : 'rgba(0, 0, 0, 0)'}
            polygonStrokeColor={(d: any) => d.properties.ADMIN === highlightedCountry ? 'rgba(0, 255, 115, 1)' : 'rgba(255, 255, 255, 0.2)'}
            polygonsTransitionDuration={500}

            // Combine Countries and Cities into HTML elements for professional map styling
            htmlElementsData={[
              ...MAJOR_COUNTRIES.map(c => ({ ...c, type: 'country' })),
              ...MAJOR_CITIES.map(c => ({ ...c, type: 'city' }))
            ]}
            htmlElement={(d: any) => {
              const el = document.createElement('div');
              if (d.type === 'country') {
                el.innerHTML = `<div style="color: rgba(255, 255, 255, 0.4); font-family: monospace; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; text-align: center; text-shadow: 0px 0px 4px rgba(0,0,0,0.8); pointer-events: none; transform: translate(-50%, -50%);">${d.name}</div>`;
              } else {
                el.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, 0); pointer-events: none;">
                  <div style="width: 4px; height: 4px; background: rgba(255,255,255,0.8); border-radius: 50%; box-shadow: 0 0 4px rgba(255,255,255,0.5);"></div>
                  <div style="color: rgba(255,255,255,0.8); font-family: sans-serif; font-size: 8px; font-weight: 600; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.9); text-align: center;">${d.name}</div>
                </div>`;
              }
              return el;
            }}
            htmlLat={(d: any) => d.lat}
            htmlLng={(d: any) => d.lng}
            htmlAltitude={0.02}

            // Interactivity via invisible points
            pointsData={reports}
            pointLat={(d: any) => d.lat}
            pointLng={(d: any) => d.lng}
            pointRadius={(d: any) => d.id === selectedPoint?.id ? 0.8 : 0.4}
            pointColor={(d: any) => d.id === selectedPoint?.id ? 'rgba(0,255,115,1)' : 'rgba(0,177,80,0.5)'}
            onPointClick={(d) => {
              const point = d as ReportPoint;
              handleInteract();
              if (globeEl.current) {
                globeEl.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 0.4 }, 1200);
              }
              setSelectedPoint(point);
              setHighlightedCountry(resolveCountryName(point.lat, point.lng));
            }}
            onPointHover={(d) => {
              if (containerRef.current) {
                  containerRef.current.style.cursor = d ? 'pointer' : 'grab';
              }
            }}
          />
      )}

      <div className="absolute top-4 left-4 flex flex-col gap-2 max-w-[130px] sm:max-w-[150px] pointer-events-none">
        
        <div className="bg-white/5 backdrop-blur-xl rounded-lg p-2.5 border border-white/10 text-white shadow-2xl">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1.5 h-1.5 bg-[#00B150] rounded-full animate-pulse" />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-300">Live Network</span>
          </div>
          <motion.div 
            key={reports.length}
            initial={{ scale: 1.5, color: '#00B150' }}
            animate={{ scale: 1, color: '#ffffff' }}
            className="text-2xl font-black text-white leading-none mb-1"
          >
            {reports.length}
          </motion.div>
          <div className="text-[9px] text-gray-400 leading-tight">Total Active Reports</div>
        </div>

        </div>

      
      

      
      {/* Technical Event Log Overlay */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1 sm:gap-1.5 pointer-events-none w-[160px] sm:w-[220px] z-10">
        <div className="text-[#00B150] font-mono text-[9px] uppercase tracking-widest mb-1 flex items-center gap-1.5 opacity-80">
          <Activity size={10} />
          <span>Recent Activity</span>
        </div>
        <div className="flex flex-col gap-1.5 relative h-[70px] sm:h-[120px] overflow-hidden pointer-events-auto">
          <AnimatePresence initial={false}>
              {recentReports.map((report, idx) => (
                <motion.div
                  layout
                  key={report.id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ 
                    opacity: 1 - (idx * 0.25), 
                    y: 0, 
                    scale: 1 - (idx * 0.03)
                  }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  onClick={() => {
                    handleInteract();
                    if (globeEl.current) {
                      globeEl.current.pointOfView({ lat: report.lat, lng: report.lng, altitude: 0.4 }, 1200);
                    }
                    setSelectedPoint(report);
                    setHighlightedCountry(resolveCountryName(report.lat, report.lng));
                  }}
                  className="bg-black/40 backdrop-blur-md border-l-2 border-[#00B150] p-1.5 sm:p-2 rounded-r-md w-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] origin-left shrink-0 cursor-pointer hover:bg-black/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1 sm:gap-2 mb-0.5">
                    <span className="text-[#00B150] font-mono text-[8px] sm:text-[9px] font-bold uppercase truncate">
                      &gt; {report.type}
                    </span>
                    <span className="text-gray-500 font-mono text-[7px] sm:text-[8px] shrink-0">
                      ID:{report.id.substring(0, 4)}
                    </span>
                  </div>
                  <div className="text-gray-300 font-mono text-[7px] sm:text-[8px] truncate opacity-80">
                    {report.location_address}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
        </div>
      </div>


            {/* Heat Gradient Legend */}
      <div className="absolute bottom-4 right-4 sm:right-6 flex flex-col gap-1 sm:gap-1.5 bg-[#0a1118]/80 backdrop-blur-md p-2 sm:p-3 rounded-lg sm:rounded-xl border border-white/10 pointer-events-none shadow-2xl z-10">
        <span className="text-[9px] font-semibold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Activity size={10} className="text-[#00B150]" />
          Area Density
        </span>
        <div className="flex items-center gap-2">
          <div className="w-20 sm:w-32 h-1.5 sm:h-2 rounded-full bg-gradient-to-r from-[#00B150] via-[#84cc16] via-[#eab308] to-[#ef4444]"></div>
        </div>
        <div className="flex justify-between w-20 sm:w-32 text-[7px] sm:text-[8px] text-gray-400 font-mono">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {selectedPoint && (
        <div className="absolute bottom-24 right-4 max-w-[280px] w-full bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-4 border border-white z-20 animate-in fade-in slide-in-from-bottom-8 duration-300 pointer-events-auto">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-[#00B150]" />
              Report Details
            </h3>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPoint(null);
          setHighlightedCountry(null);
              }}
              className="text-gray-400 hover:text-gray-900 transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              <p className="font-semibold text-gray-800 text-xs flex items-center gap-1.5 mb-1">
                <AlertTriangle size={12} className="text-amber-500" />
                {selectedPoint.type}
              </p>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {selectedPoint.description}
              </p>
            </div>
            
            <div className="text-[10px] text-gray-500">
              <span className="font-medium text-gray-700">Location:</span> {selectedPoint.location_address}
            </div>
            <div className="text-[9px] text-gray-400 font-mono">
              ID: {selectedPoint.id.split('-')[0].toUpperCase()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
