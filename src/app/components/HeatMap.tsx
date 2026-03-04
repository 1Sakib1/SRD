import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationPoint } from '../utils/mockData';
import L from 'leaflet';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface HeatMapProps {
  locations: LocationPoint[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
}

// Component to recenter map when center prop changes
const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    try {
      // Only recenter if map is fully loaded and not animating
      if (map._loaded && map._container && !map._animatingZoom) {
        // Use flyTo for smoother transition with error handling
        map.flyTo(center, map.getZoom(), {
          duration: 0.5,
          animate: true
        });
      }
    } catch (error) {
      // Silently handle any Leaflet internal errors
      console.debug('Map recenter skipped:', error);
    }
  }, [center[0], center[1], map]);
  
  return null;
};

// Component to handle map clicks
const MapClickHandler: React.FC<{ onClick?: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      if (onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  
  return null;
};

export const HeatMap: React.FC<HeatMapProps> = (({
  locations,
  center = [-33.8688, 151.2093], // Sydney CBD
  zoom = 13,
  height = '600px',
  onMapClick,
  selectedLocation,
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
    return Math.min(Math.max(reports / 2, 10), 30);
  };
  
  if (!isClient) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100 flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        whenReady={() => {
          // Map is ready
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RecenterMap center={center} />
        <MapClickHandler onClick={onMapClick} />
        
        {locations.map((location) => (
          <CircleMarker
            key={location.id}
            center={[location.lat, location.lng]}
            radius={getRadius(location.reports)}
            fillColor={getColor(location.intensity)}
            color="#ffffff"
            weight={2}
            opacity={0.8}
            fillOpacity={0.6}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900 mb-1">{location.address}</h3>
                <p className="text-sm text-gray-600">
                  <strong>{location.reports}</strong> reports
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getColor(location.intensity) }}
                  />
                  <span className="text-xs text-gray-500">
                    {(location.intensity * 100).toFixed(0)}% intensity
                  </span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        
        {selectedLocation && (
          <Marker position={selectedLocation} />
        )}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md border border-gray-200 z-[1000]">
        <h4 className="text-xs font-semibold text-gray-900 mb-2">Report Density</h4>
        <div className="space-y-1">
          {[
            { label: 'Very High', color: '#ef4444' },
            { label: 'High', color: '#f97316' },
            { label: 'Medium', color: '#f59e0b' },
            { label: 'Low', color: '#eab308' },
            { label: 'Very Low', color: '#22c55e' },
          ].map((item) => (
            <div key={item.label} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
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