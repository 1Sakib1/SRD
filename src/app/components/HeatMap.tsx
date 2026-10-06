import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap, useMapEvents, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationPoint } from '../utils/mockData';
import L from 'leaflet';
import { Leaf, MapPin, ThumbsUp, ThumbsDown, Sparkles, Recycle, Clock, ExternalLink, Navigation } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom Div Icon for the Map
const createCustomIcon = (intensity: number, photoUrl?: string) => {
  const isHigh = intensity > 0.7;
  const color = isHigh ? '#ef4444' : '#00B150';
  
  const size = photoUrl ? 40 : 32;
  
  const iconHtml = renderToString(
    <div style={{
      backgroundColor: 'white',
      borderRadius: '50%',
      padding: photoUrl ? '2px' : '4px',
      border: `2px solid ${color}`,
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${size}px`,
      height: `${size}px`,
      overflow: 'hidden',
      backgroundImage: photoUrl ? `url(${photoUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {!photoUrl && <Leaf size={16} color={color} />}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

export interface ReturnPoint {
  id: string;
  name: string;
  kind: string;
  lat: number;
  lng: number;
  address: string | null;
  hours: string | null;
  operator: string | null;
  website: string | null;
}

// Return and Earn marker: deliberately distinct from the rubbish-report pins so
// the two layers are never confused.
const returnPointIcon = L.divIcon({
  className: '',
  html: `<div style="
      width:34px;height:34px;border-radius:50%;
      background:linear-gradient(135deg,#0ea5e9,#0284c7);
      border:3px solid #fff;box-shadow:0 2px 8px rgba(2,132,199,.45);
      display:flex;align-items:center;justify-content:center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
        fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/>
        <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/>
        <path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/>
        <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/>
        <path d="m13.378 9.633 4.096 1.098 1.097-4.096"/>
      </svg>
    </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

interface HeatMapProps {
  locations: LocationPoint[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
  onVote?: (locationId: string, originalReportId: string, voteType: 'still_there' | 'not_there' | 'cleaned') => void;
  /** Show Return and Earn recycling points as a separate, toggleable layer. */
  showReturnPoints?: boolean;
}

const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    try {
      if (map._loaded && map._container && !map._animatingZoom) {
        map.flyTo(center, map.getZoom(), { duration: 0.5, animate: true });
      }
    } catch (error) {
      console.debug('Map recenter skipped:', error);
    }
  }, [center[0], center[1], map]);
  return null;
};

const MapClickHandler: React.FC<{ onClick?: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      if (onClick) onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const HeatMap: React.FC<HeatMapProps> = (({
  locations,
  center = [-33.8688, 151.2093],
  zoom = 13,
  height = '600px',
  onMapClick,
  selectedLocation,
  onVote,
  showReturnPoints = true,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [returnPoints, setReturnPoints] = useState<ReturnPoint[]>([]);
  const [showRecycling, setShowRecycling] = useState(true);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Static dataset built from OpenStreetMap; see scripts/fetch-return-points.mjs.
  // A failure here must never take the map down, so it degrades to no layer.
  useEffect(() => {
    if (!showReturnPoints) return;
    let cancelled = false;
    fetch('/data/return-points-nsw.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => { if (!cancelled) setReturnPoints(Array.isArray(d?.points) ? d.points : []); })
      .catch((e) => console.warn('Return point layer unavailable:', e));
    return () => { cancelled = true; };
  }, [showReturnPoints]);
  
  const getColor = (intensity: number): string => {
    if (intensity >= 0.8) return '#ef4444'; // red-500
    if (intensity >= 0.6) return '#f97316'; // orange-500
    if (intensity >= 0.4) return '#f59e0b'; // amber-500
    if (intensity >= 0.2) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };
  
  const getRadius = (reports: number): number => {
    return Math.min(Math.max(reports * 10, 200), 800); // meters for Circle
  };
  
  if (!isClient) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100 flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#00B150] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm" style={{ height }}>
      <style>
        {`
          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            padding: 0;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          }
          .leaflet-popup-content {
            margin: 0;
            width: 100% !important;
            min-width: 250px;
            max-width: 320px !important;
          }
          @media (max-width: 640px) {
            .leaflet-popup-content {
              max-width: 280px !important;
            }
          }
          /* Make the default X close button bigger and more touch-friendly on mobile */
          .leaflet-popup-close-button {
            position: absolute !important;
            top: 10px !important;
            right: 10px !important;
            width: 32px !important;
            height: 32px !important;
            font-size: 20px !important;
            line-height: 20px !important;
            color: #4b5563 !important;
            background-color: #f3f4f6 !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            text-decoration: none !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
            z-index: 1000 !important;
          }
          .leaflet-popup-close-button:hover {
            background-color: #e5e7eb !important;
            color: #1f2937 !important;
          }
        `}
      </style>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RecenterMap center={center} />
        <MapClickHandler onClick={onMapClick} />
        
        {locations.map((location) => (
          <div key={location.id}>
            {/* Cluster Radius Circle */}
            <Circle
              center={[location.lat, location.lng]}
              radius={getRadius(location.reports)}
              pathOptions={{
                fillColor: getColor(location.intensity),
                color: getColor(location.intensity),
                weight: 1,
                fillOpacity: 0.15
              }}
            />
            
            {/* Custom Marker */}
            <Marker 
              position={[location.lat, location.lng]} 
              icon={createCustomIcon(location.intensity, location.photo)}
            >
              <Popup>
                <div className="flex flex-col bg-white">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-2 pr-10">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2">
                        {location.type || 'Litter'} report near {location.address.split(',')[0]}
                      </h3>
                      <span className="bg-green-100 text-green-800 text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap">
                        Active on map
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500 text-xs mb-1 mt-2">
                      <MapPin size={12} className="mr-1" />
                      <span>{location.address}</span>
                    </div>
                    {location.date && (
                      <p className="text-gray-400 text-[10px]">
                        {new Date(location.date).toLocaleString()} • {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                      </p>
                    )}
                  </div>
                  
                  {location.photo ? (
                    <img src={location.photo} alt="Report evidence" className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-gray-400 text-sm italic">
                      No photo available
                    </div>
                  )}
                  
                  <div className="p-4 bg-gray-50">
                    <p className="font-medium text-gray-900 text-sm mb-1">Is this still here?</p>
                    <p className="text-xs text-gray-500 mb-3">If you pass this spot again, help keep the map current.</p>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onVote && location.originalReportId && onVote(location.id, location.originalReportId, 'still_there')}
                        className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-2 rounded-md flex flex-col items-center justify-center gap-1 transition-colors text-xs font-medium shadow-sm"
                      >
                        <div className="flex items-center gap-1">
                          <ThumbsUp size={14} className="text-yellow-500" />
                          <span>Still there</span>
                        </div>
                        <span className="text-[10px] text-gray-400">({location.stillThere || 0})</span>
                      </button>
                      <button 
                        onClick={() => onVote && location.originalReportId && onVote(location.id, location.originalReportId, 'not_there')}
                        className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-2 rounded-md flex flex-col items-center justify-center gap-1 transition-colors text-xs font-medium shadow-sm"
                      >
                        <div className="flex items-center gap-1">
                          <ThumbsDown size={14} className="text-orange-500" />
                          <span>Gone</span>
                        </div>
                        <span className="text-[10px] text-gray-400">({location.gone || 0})</span>
                      </button>
                    </div>
                    
                    
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
        
        {selectedLocation && (
          <Marker 
            position={selectedLocation} 
            draggable={!!onMapClick}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                if (onMapClick) onMapClick(position.lat, position.lng);
              }
            }}
          />
        )}
        {showReturnPoints && showRecycling && returnPoints.map((rp) => (
          <Marker key={rp.id} position={[rp.lat, rp.lng]} icon={returnPointIcon}>
            <Popup>
              <div className="min-w-[210px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">
                    <Recycle className="w-3 h-3" /> Return &amp; Earn
                  </span>
                </div>
                <h4 className="font-bold text-[#333] text-sm leading-snug mb-0.5">{rp.name}</h4>
                <p className="text-[11px] text-gray-500 mb-1.5">{rp.kind}</p>
                {rp.address && (
                  <p className="text-xs text-gray-700 flex items-start gap-1 mb-1">
                    <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-gray-400" />{rp.address}
                  </p>
                )}
                {rp.hours && (
                  <p className="text-xs text-gray-700 flex items-start gap-1 mb-1">
                    <Clock className="w-3 h-3 mt-0.5 shrink-0 text-gray-400" />{rp.hours}
                  </p>
                )}
                <div className="flex flex-col gap-1 mt-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${rp.lat},${rp.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ color: '#ffffff' }}
                    className="inline-flex items-center justify-center gap-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded no-underline"
                  >
                    <Navigation className="w-3 h-3" /> Directions
                  </a>
                  <a
                    href="https://returnandearn.org.au/map" target="_blank" rel="noopener noreferrer"
                    style={{ color: '#0369a1' }}
                    className="inline-flex items-center justify-center gap-1 text-[11px] hover:underline"
                  >
                    Official Return and Earn finder <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Return and Earn layer toggle */}
      {showReturnPoints && (
        <div className="absolute top-4 right-4 z-[1000]">
          <button
            type="button"
            onClick={() => setShowRecycling((v) => !v)}
            aria-pressed={showRecycling}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-md border text-xs font-semibold transition-colors ${
              showRecycling
                ? 'bg-sky-600 text-white border-sky-700'
                : 'bg-white/90 backdrop-blur-sm text-gray-700 border-gray-200 hover:bg-white'
            }`}
          >
            <Recycle className="w-4 h-4" />
            Return &amp; Earn
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${showRecycling ? 'bg-sky-500/60' : 'bg-gray-100'}`}>
              {returnPoints.length}
            </span>
          </button>
          {showRecycling && returnPoints.length > 0 && (
            <p className="mt-1.5 max-w-[190px] text-[10px] leading-snug text-gray-600 bg-white/90 backdrop-blur-sm rounded px-2 py-1.5 border border-gray-200">
              Community-mapped from OpenStreetMap &mdash; not every NSW return point is listed.{' '}
              <a href="https://returnandearn.org.au/map" target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">
                See all
              </a>
            </p>
          )}
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-200 z-[1000]">
        <h4 className="text-xs font-semibold text-[#333333] mb-2">Report Density</h4>
        <div className="space-y-1.5">
          {[
            { label: 'High Priority (Active)', color: '#ef4444' },
            { label: 'Medium Priority', color: '#f59e0b' },
            { label: 'Low Priority / Emerging', color: '#00B150' },
          ].map((item) => (
            <div key={item.label} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full opacity-60"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
