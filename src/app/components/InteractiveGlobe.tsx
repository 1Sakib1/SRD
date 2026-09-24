import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import { supabase } from '../utils/supabase';
import { X, MapPin, AlertTriangle, Activity, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReportPoint {
  id: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  location_address: string;
  created_at: string;
}

export const InteractiveGlobe = () => {
  const globeEl = useRef<any>();
  const [reports, setReports] = useState<ReportPoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<ReportPoint | null>(null);

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
      
       
      
      globeEl.current.pointOfView({ lat: -25.2744, lng: 133.7751, altitude: 2.2 }, 0);
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, [loading]);

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

  const recentReports = reports.slice(0, 3);

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
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          
          // Flat colored heatmap layer!
          hexBinPointsData={reports}
          hexBinPointWeight={() => 1}
          hexBinResolution={4}
          hexMargin={0.2}
          hexTopColor={d => getHexColor(d.sumWeight)}
          hexSideColor={() => 'rgba(0,0,0,0)'}
          hexAltitude={0.005} // flat against surface
          hexBinMerge={false}
          hexTransitionDuration={1000}
          
          // Keep the radar rings for that live tech aesthetic
          ringsData={reports}
          ringColor={() => (t: number) => `rgba(0, 177, 80, ${1 - t})`}
          ringMaxRadius={2}
          ringPropagationSpeed={1.5}
          ringRepeatPeriod={1500}
          
          // Interactivity via invisible labels
          labelsData={reports}
          labelLat={d => (d as ReportPoint).lat}
          labelLng={d => (d as ReportPoint).lng}
          labelText={() => ''}
          labelSize={1.5}
          labelDotRadius={0.5}
          labelColor={() => 'rgba(255,255,255,0)'}
          labelResolution={2}
          onLabelClick={(d) => {
            const point = d as ReportPoint;
            handleInteract();
            if (globeEl.current) {
              globeEl.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 0.8 }, 1000);
            }
            setSelectedPoint(point);
          }}
          onLabelHover={(d) => {
            if (containerRef.current) {
                containerRef.current.style.cursor = d ? 'pointer' : 'grab';
            }
          }}
        />
      )}

      <div className="absolute top-4 left-4 flex flex-col gap-2 max-w-[130px] sm:max-w-[150px] pointer-events-none">
        
        <div className="bg-white/5 backdrop-blur-xl rounded-lg p-2.5 border border-white/10 text-white shadow-2xl">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Activity size={12} className="text-[#00B150]" />
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
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 pointer-events-none w-[220px]">
        <div className="text-[#00B150] font-mono text-[9px] uppercase tracking-widest mb-1 flex items-center gap-1.5 opacity-80">
          <Activity size={10} />
          <span>System Event Log</span>
        </div>
        <div className="flex flex-col gap-1.5 relative h-[120px] overflow-hidden">
          <AnimatePresence>
            {recentReports.slice(0, 3).map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ 
                  opacity: 1 - (idx * 0.25), 
                  x: 0, 
                  height: 'auto',
                  scale: 1 - (idx * 0.05)
                }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
                className="bg-black/40 backdrop-blur-md border-l-2 border-[#00B150] p-2 rounded-r-md w-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] origin-left"
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[#00B150] font-mono text-[9px] font-bold uppercase truncate">
                    &gt; {report.type}
                  </span>
                  <span className="text-gray-500 font-mono text-[8px] shrink-0">
                    ID:{report.id.substring(0, 4)}
                  </span>
                </div>
                <div className="text-gray-300 font-mono text-[8px] truncate opacity-80">
                  {report.location_address}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>


      {selectedPoint && (
        <div className="absolute bottom-4 right-4 max-w-[280px] w-full bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-4 border border-white z-20 animate-in fade-in slide-in-from-bottom-8 duration-300 pointer-events-auto">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-[#00B150]" />
              Report Details
            </h3>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPoint(null);
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
