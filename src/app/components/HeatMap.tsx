import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap, useMapEvents, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationPoint } from '../utils/mockData';
import L from 'leaflet';
import { Leaf, MapPin, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
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

interface HeatMapProps {
  locations: LocationPoint[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
  onVote?: (locationId: string, originalReportId: string, voteType: 'still_there' | 'not_there' | 'cleaned') => void;
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
}) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
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
            width: 320px !important;
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
                    <div className="flex justify-between items-start mb-2">
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
                    
                    {(location.stillThere !== undefined) && (
                      <div className="flex justify-between text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-200">
                        <span>Still there: {location.stillThere || 0}</span>
                        <span>Gone: {location.gone || 0}</span>
                        <span>Cleaned: {location.cleaned || 0}</span>
                      </div>
                    )}
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
      </MapContainer>
      
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
