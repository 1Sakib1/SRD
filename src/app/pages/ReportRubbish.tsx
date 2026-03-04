import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { HeatMap } from '../components/HeatMap';
import { useAuth } from '../context/AuthContext';
import { SYDNEY_LOCATIONS, RUBBISH_TYPES, LocationPoint } from '../utils/mockData';
import { getCurrentLocation, reverseGeocode } from '../utils/geocoding';
import { MapPin, Navigation, Camera, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface Report {
  id: string;
  userId: string;
  type: string;
  description: string;
  photo?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export const ReportRubbish = () => {
  const { user, refreshUser, isGuest } = useAuth();
  const navigate = useNavigate();
  
  const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
  const [isDetecting, setIsDetecting] = useState(false);
  
  // Form fields
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [guestEmail, setGuestEmail] = useState(''); // Email for guest users
  
  // Map data
  const [mapLocations, setMapLocations] = useState<LocationPoint[]>(SYDNEY_LOCATIONS);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-33.8688, 151.2093]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  
  // Convert reports to location points for heat map
  const convertReportsToLocations = (reports: Report[]): LocationPoint[] => {
    // Group reports by approximate location (within ~100m)
    const locationGroups: { [key: string]: Report[] } = {};
    
    reports.forEach(report => {
      // Validate location data exists and is valid
      if (!report.location || 
          typeof report.location.lat !== 'number' || 
          typeof report.location.lng !== 'number' ||
          isNaN(report.location.lat) || 
          isNaN(report.location.lng)) {
        console.warn('Skipping report with invalid location:', report.id);
        return;
      }
      
      // Validate coordinates are within valid range
      if (report.location.lat < -90 || report.location.lat > 90 ||
          report.location.lng < -180 || report.location.lng > 180) {
        console.warn('Skipping report with out-of-range coordinates:', report.id);
        return;
      }
      
      // Round to 3 decimal places (~111m precision)
      const latKey = report.location.lat.toFixed(3);
      const lngKey = report.location.lng.toFixed(3);
      const key = `${latKey},${lngKey}`;
      
      if (!locationGroups[key]) {
        locationGroups[key] = [];
      }
      locationGroups[key].push(report);
    });
    
    // Convert groups to LocationPoint objects
    return Object.entries(locationGroups).map(([key, groupReports]) => {
      const [lat, lng] = key.split(',').map(Number);
      
      // Double-check the parsed values are valid
      if (isNaN(lat) || isNaN(lng)) {
        console.warn('Skipping invalid location group:', key);
        return null;
      }
      
      const reportCount = groupReports.length;
      
      // Calculate intensity based on report count (normalize to 0-1 range)
      // More than 10 reports = max intensity
      const intensity = Math.min(reportCount / 10, 1);
      
      return {
        id: `user-report-${key}`,
        lat,
        lng,
        address: groupReports[0].location.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        reports: reportCount,
        intensity,
      };
    }).filter((loc): loc is LocationPoint => loc !== null); // Filter out any null entries
  };
  
  // Load existing reports from server on mount and combine with demo data
  useEffect(() => {
    const loadReports = async () => {
      try {
        console.log('🗺️ Loading reports for heat map...');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3e3b490b/reports/list`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const { reports } = await response.json();
          console.log('✅ Loaded reports:', reports?.length || 0);
          
          if (reports && reports.length > 0) {
            // Convert real reports to location points
            const realLocations = convertReportsToLocations(reports);
            console.log('📍 Generated location points:', realLocations.length);
            
            // Combine demo locations with real user reports
            const combinedLocations = [...SYDNEY_LOCATIONS, ...realLocations];
            setMapLocations(combinedLocations);
            
            toast.success(`Heat map updated with ${reports.length} real reports`, {
              duration: 3000,
            });
          } else {
            // No real reports yet, use demo data
            setMapLocations(SYDNEY_LOCATIONS);
          }
        } else {
          console.error('Failed to load reports:', response.statusText);
          setMapLocations(SYDNEY_LOCATIONS);
        }
      } catch (error) {
        console.error('Error loading reports:', error);
        // Keep showing demo locations if loading fails
        setMapLocations(SYDNEY_LOCATIONS);
      }
    };

    loadReports();
    
    // Refresh heat map every 30 seconds to show new reports
    const interval = setInterval(loadReports, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const position = await getCurrentLocation();
      setLatitude(position.lat.toFixed(6));
      setLongitude(position.lng.toFixed(6));
      setMapCenter([position.lat, position.lng]);
      
      // Reverse geocode to get address
      const addressText = await reverseGeocode(position.lat, position.lng);
      setAddress(addressText);
      
      toast.success('Location detected successfully!');
    } catch (error) {
      toast.error((error as Error).message, {
        duration: 5000,
        description: 'Please check your browser location permissions in the address bar.'
      });
    } finally {
      setIsDetecting(false);
    }
  };
  
  const handleManualLocation = async () => {
    if (!latitude || !longitude) {
      toast.error('Please enter both latitude and longitude');
      return;
    }
    
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Invalid coordinates');
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Coordinates out of range');
      return;
    }
    
    setMapCenter([lat, lng]);
    
    // Reverse geocode
    const addressText = await reverseGeocode(lat, lng);
    setAddress(addressText);
    
    toast.success('Location pinpointed!');
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!type || !description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!latitude || !longitude) {
      toast.error('Please set a location first');
      return;
    }
    
    // If guest mode, require email
    if (isGuest && !guestEmail) {
      toast.error('Please provide your email address');
      return;
    }
    
    // Validate guest email format
    if (isGuest && guestEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        toast.error('Please provide a valid email address');
        return;
      }
    }
    
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (!user) {
      toast.error('You must be logged in to submit a report');
      return;
    }
    
    try {
      // Submit report to server
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3e3b490b/reports/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user ? user.id : 'guest',
            type,
            description,
            photo,
            location: {
              lat,
              lng,
              address,
            },
            guestEmail: isGuest ? guestEmail : undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit report');
      }

      const { report } = await response.json();
      
      // Add new location to map
      const newLocation: LocationPoint = {
        id: report.id,
        lat,
        lng,
        address,
        reports: 1,
        intensity: 0.3,
      };
      
      setMapLocations([...mapLocations, newLocation]);
      
      toast.success('Report submitted successfully! +10 eco-points', {
        description: 'Thank you for helping keep Sydney clean!',
      });
      
      // Reset form
      setType('');
      setDescription('');
      setPhoto('');
      setLatitude('');
      setLongitude('');
      setAddress('');
      setSelectedLocation(null);
      
      // Navigate to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Submit report error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit report');
    }
  };
  
  const handleMapClick = async (lat: number, lng: number) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    setMapCenter([lat, lng]);
    setSelectedLocation([lat, lng]);
    
    // Reverse geocode to get address
    const addressText = await reverseGeocode(lat, lng);
    setAddress(addressText);
    
    toast.success('Location selected on map!', {
      description: 'You can now submit your report',
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Report Rubbish</h1>
          <p className="text-sm sm:text-base text-gray-600">Help us keep Sydney clean by reporting rubbish in your area</p>
        </div>
        
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column: Report Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Report Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Rubbish Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rubbish Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[48px]"
                  required
                >
                  <option value="">Select type...</option>
                  {RUBBISH_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the rubbish and any relevant details..."
                  rows={4}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  required
                />
              </div>
              
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors active:scale-98 min-h-[56px]"
                  >
                    <Camera className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm sm:text-base text-gray-600">
                      {photo ? 'Photo uploaded ✓' : 'Take or upload photo'}
                    </span>
                  </label>
                </div>
                {photo && (
                  <div className="mt-3">
                    <img src={photo} alt="Preview" className="w-full h-48 sm:h-40 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              
              {/* Guest Email - Only show for guest users */}
              {isGuest && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email Address <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-600 mb-3">
                    We'll use this to notify you about the status of your report
                  </p>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    required={isGuest}
                  />
                </div>
              )}
              
              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Location <span className="text-red-500">*</span>
                </label>
                
                {/* Location Mode Tabs */}
                <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setLocationMode('auto')}
                    className={`flex-1 py-3 px-3 rounded-lg font-medium transition-all min-h-[48px] ${
                      locationMode === 'auto'
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Navigation className="w-4 h-4" />
                      <span className="text-sm sm:text-base">Auto Detect</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMode('manual')}
                    className={`flex-1 py-3 px-3 rounded-lg font-medium transition-all min-h-[48px] ${
                      locationMode === 'manual'
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm sm:text-base">Pinpoint</span>
                    </div>
                  </button>
                </div>
                
                {locationMode === 'auto' ? (
                  <div>
                    <button
                      type="button"
                      onClick={handleAutoDetect}
                      disabled={isDetecting}
                      className="w-full py-4 bg-green-600 text-white rounded-lg text-base font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-98 min-h-[52px]"
                    >
                      {isDetecting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Detecting...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-5 h-5" />
                          <span>Detect My Location</span>
                        </>
                      )}
                    </button>
                    {address && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-900">Detected Location:</p>
                        <p className="text-sm text-green-700 mt-1 break-words">{address}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="Latitude (e.g., -33.8688)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="Longitude (e.g., 151.2093)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleManualLocation}
                      className="w-full py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-all flex items-center justify-center space-x-2"
                    >
                      <MapPin className="w-5 h-5" />
                      <span>Set Location</span>
                    </button>
                    {address && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">Pinned Location:</p>
                        <p className="text-sm text-gray-700 mt-1 break-words">{address}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Submit Report</span>
              </button>
            </form>
          </div>
          
          {/* Right Column: Interactive Heat Map */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sydney Heat Map</h2>
              <p className="text-sm text-gray-600 mb-2">
                View rubbish reports across Sydney. Green = low density, Red = high density.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800 font-medium">💡 Click anywhere on the map to select a location!</p>
              </div>
              <HeatMap 
                locations={mapLocations} 
                center={mapCenter} 
                height="550px" 
                onMapClick={handleMapClick}
                selectedLocation={selectedLocation}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};