import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { X } from 'lucide-react';
import { Header } from '../components/Header';
import { HeatMap } from '../components/HeatMap';
import { LocationPoint } from '../utils/mockData';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner';

export const MapPage: React.FC = () => {
  const [mapLocations, setMapLocations] = useState<LocationPoint[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-33.8688, 151.2093]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('id, location_lat, location_lng, location_address, type, status, photo, created_at, still_there_votes, not_there_votes');
        
      if (error) {
        console.error('Error fetching reports from Supabase:', error);
        return;
      }
      
      if (data) {
        const locationGroups: { [key: string]: any[] } = {};
        
        data.forEach(r => {
          if (!r.location_lat || !r.location_lng) return;
          const lat = parseFloat(r.location_lat.toFixed(3));
          const lng = parseFloat(r.location_lng.toFixed(3));
          const key = `${lat},${lng}`;
          if (!locationGroups[key]) locationGroups[key] = [];
          locationGroups[key].push(r);
        });
        
        const groupedLocations: LocationPoint[] = Object.entries(locationGroups).map(([key, group]) => {
          const [lat, lng] = key.split(',').map(Number);
          return {
            id: `grouped-${key}`,
            originalReportId: group[0].id,
            lat,
            lng,
            address: group[0].location_address || 'Sydney, NSW',
            reports: group.length,
            intensity: Math.max(0.3, Math.min(group.length / 10, 1)),
            photo: group[0].photo || group[0].image_url,
            type: group[0].type,
            date: group[0].created_at,
            stillThere: group[0].still_there_votes || 0,
            gone: group[0].not_there_votes || 0
          };
        });
        
        setMapLocations(groupedLocations);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const handleVote = async (locationId: string, originalReportId: string, voteType: 'still_there' | 'not_there' | 'cleaned') => {
    try {
      const { error } = await supabase.rpc('vote_report', {
        p_report_id: originalReportId,
        p_vote_type: voteType
      });
      if (error) throw error;
      
      toast.success('Vote recorded!');
      loadReports(); 
    } catch (error) {
      console.error('Error recording vote:', error);
      toast.error('Failed to record vote');
    }
  };

  useEffect(() => {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setMapCenter([position.coords.latitude, position.coords.longitude]),
        (error) => console.log('Geolocation skipped or denied', error)
      );
    }
    loadReports();
    
    // Subscribe to real-time report inserts
    const channel = supabase
      .channel('public:reports')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, (payload) => {
        const newReport = payload.new;
        if (newReport.location_lat && newReport.location_lng) {
          const newLocationPoint: LocationPoint = {
            id: newReport.id,
            lat: newReport.location_lat,
            lng: newReport.location_lng,
            address: newReport.location_address || 'Rubbish Report',
            reports: 1,
            intensity: 0.8 // pending
          };
          setMapLocations(prev => [...prev, newLocationPoint]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col w-full h-[calc(100vh-73px)]">
        <div className="bg-white px-4 py-3 border-b border-gray-200 shadow-sm z-10 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-[#333333] flex items-center">
              Community Map
              <span className="ml-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">Live community reports showing rubbish density hotspots</p>
          </div>
          <Link 
            to="/report" 
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close Map</span>
          </Link>
        </div>
        <div className="flex-1 w-full relative">
          <HeatMap 
            locations={mapLocations} 
            center={mapCenter} 
            height="calc(100vh - 130px)" 
            selectedLocation={selectedLocation} 
            onVote={handleVote} 
          />
        </div>
      </main>
    </div>
  );
};
