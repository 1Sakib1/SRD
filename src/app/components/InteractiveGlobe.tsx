import React, { useState, useEffect, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { supabase } from '../utils/supabase';
import { X, MapPin, AlertTriangle } from 'lucide-react';
import * as THREE from 'three'; // Needed for Globe setup? Globe exports it implicitly, but react-globe.gl handles it.

interface ReportPoint {
  id: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  location_address: string;
}

export const InteractiveGlobe = () => {
  const globeEl = useRef<any>();
  const [reports, setReports] = useState<ReportPoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dimensions for responsive globe
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Selected Zone state
  const [selectedZone, setSelectedZone] = useState<{ points: ReportPoint[], lat: number, lng: number } | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('id, location_lat, location_lng, type, description, location_address')
          .not('location_lat', 'is', null)
          .not('location_lng', 'is', null);

        if (error) throw error;
        
        if (data) {
          const formatted = data.map((r: any) => ({
            id: r.id,
            lat: Number(r.location_lat),
            lng: Number(r.location_lng),
            type: r.type || 'Unknown',
            description: r.description || 'No description',
            location_address: r.location_address || 'Unknown location'
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

    // Setup Realtime Subscription
    const channel = supabase.channel('globe_reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const r = payload.new as any;
          if (r.location_lat && r.location_lng) {
            setReports(prev => [...prev, {
              id: r.id,
              lat: Number(r.location_lat),
              lng: Number(r.location_lng),
              type: r.type || 'Unknown',
              description: r.description || 'No description',
              location_address: r.location_address || 'Unknown location'
            }]);
          }
        }
        // Handle UPDATE/DELETE if needed, but INSERT is the main realtime driver
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Handle resize
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
    
    // Auto-rotate setup
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 1.0;
      
      // Focus on Sydney initially (mostly ocean otherwise)
      globeEl.current.pointOfView({ lat: -25.2744, lng: 133.7751, altitude: 2.5 }, 0);
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, [loading]); // Re-run when loading finishes and globe mounts

  // Stop rotation on interaction
  const handleInteract = () => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = false;
    }
  };

  // Color scale mapping for Hex density (Green -> Yellow -> Red)
  const getHexColor = (weight: number) => {
    if (weight < 2) return '#00B150'; // Primary Green
    if (weight < 5) return '#84cc16'; // Lime/Yellow-green
    if (weight < 10) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-[4/3] sm:aspect-square md:aspect-[4/3] rounded-2xl shadow-2xl border-4 border-white/20 bg-slate-900 overflow-hidden"
      onPointerDown={handleInteract}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
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
          
          // Heatmap configuration via HexBins
          hexBinPointsData={reports}
          hexBinPointWeight={d => 1}
          hexBinResolution={4} // Higher is smaller hexes (4 is good for country/city level)
          hexMargin={0.2}
          hexTopColor={d => getHexColor(d.sumWeight)}
          hexSideColor={d => getHexColor(d.sumWeight)}
          hexBinMerge={true}
          hexTransitionDuration={1000}
          
          onHexClick={(hex) => {
            handleInteract();
            
            // Calculate cluster center
            const points = hex.points as ReportPoint[];
            const centerLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
            const centerLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
            
            // Point of view zoom to cluster
            if (globeEl.current) {
              globeEl.current.pointOfView({ lat: centerLat, lng: centerLng, altitude: 0.5 }, 1000);
            }
            setSelectedZone({
              points: points,
              lat: centerLat,
              lng: centerLng
            });
          }}
          onHexHover={(hex) => {
            if (containerRef.current) {
                containerRef.current.style.cursor = hex ? 'pointer' : 'grab';
            }
          }}
        />
      )}

      {/* Realistic Overlay Controls & Compass */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none opacity-80">
        <div className="bg-black/50 backdrop-blur-md rounded-md p-2 text-xs text-white/90 border border-white/10 font-mono flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00B150] animate-pulse" />
          Live Earth View
        </div>
      </div>

      {/* Details Modal on Hex Click */}
      {selectedZone && (
        <div className="absolute top-4 right-4 max-w-xs w-full bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-5 border border-white z-20 animate-in fade-in slide-in-from-right-8 duration-300">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={18} className="text-[#00B150]" />
              Zone Details
            </h3>
            <button 
              onClick={() => setSelectedZone(null)}
              className="text-gray-400 hover:text-gray-900 transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <p className="text-sm text-green-800 font-medium">
                Active Cluster: {selectedZone.points.length} Reports
              </p>
              <p className="text-xs text-green-600 mt-1">
                Lat: {selectedZone.lat.toFixed(4)}, Lng: {selectedZone.lng.toFixed(4)}
              </p>
            </div>
            
            <div className="max-h-48 overflow-y-auto pr-2 space-y-3">
              {selectedZone.points.slice(0, 5).map(point => (
                <div key={point.id} className="text-xs border-l-2 border-[#00B150] pl-3 py-1">
                  <p className="font-semibold text-gray-800 flex items-center gap-1">
                    <AlertTriangle size={12} className="text-amber-500" />
                    {point.type}
                  </p>
                  <p className="text-gray-500 truncate">{point.location_address}</p>
                  <p className="text-gray-400 font-mono text-[10px] mt-1">ID: {point.id.split('-')[0].toUpperCase()}</p>
                </div>
              ))}
              {selectedZone.points.length > 5 && (
                <p className="text-xs text-gray-500 text-center italic pt-2">
                  + {selectedZone.points.length - 5} more reports in this zone
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
