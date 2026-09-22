import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { HeatMap } from '../components/HeatMap';
import { useAuth } from '../context/AuthContext';
import { SYDNEY_LOCATIONS, RUBBISH_TYPES, LocationPoint } from '../utils/mockData';
import { getCurrentLocation, reverseGeocode } from '../utils/geocoding';
import { MapPin, Navigation, Camera, Send, Loader2, Sparkles, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const ReportRubbish = () => {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  
  const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  
  // Form fields
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  
  // Map data
  const [mapLocations, setMapLocations] = useState<LocationPoint[]>(SYDNEY_LOCATIONS);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-33.8688, 151.2093]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  /**
   * AI Detection Logic with Rubbish Validation
   */
  const detectRubbishWithAI = async (base64Photo: string) => {
    const apiKey = "AIzaSyDs3o3r7ImTLajwi5uwI-h7q68la6kDsKI"; 
    if (!apiKey) {
      toast.error("API Key missing");
      return;
    }

    setIsAIAnalyzing(true);
    setType('');
    setDescription('');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Analyze this image for public waste/rubbish.
        
        VALID CATEGORIES: ${RUBBISH_TYPES.join(', ')}.

        CRITICAL INSTRUCTIONS:
        1. If the image clearly shows one of the categories above, return the Type and a 1-sentence Description.
        2. If the image DOES NOT contain rubbish, or the rubbish doesn't fit the categories, or the image is blurry/unclear, you MUST return:
           Type: None
           Description: No valid rubbish detected.

        STRICT RETURN FORMAT:
        Type: [Category Name or "None"]
        Description: [Your description]`;

      const result = await model.generateContent([
        prompt,
        { 
          inlineData: { 
            data: base64Photo.split(',')[1], 
            mimeType: "image/jpeg" 
          } 
        }
      ]);
      
      const response = await result.response;
      const responseText = response.text();
      
      const typeMatch = responseText.match(/Type:\s*(.*)/i);
      const descMatch = responseText.match(/Description:\s*(.*)/i);

      const detectedTypeText = typeMatch ? typeMatch[1].trim() : "";

      if (detectedTypeText.toLowerCase().includes("none") || !detectedTypeText) {
        setPhoto(''); // Clear the photo if invalid
        toast.error("No rubbish detected", {
          description: "Gemini couldn't identify valid waste in this photo. Please try a clearer shot.",
          icon: <XCircle className="text-red-500" />
        });
        return;
      }

      const validatedType = RUBBISH_TYPES.find(t => 
        detectedTypeText.toLowerCase().includes(t.toLowerCase())
      );

      if (validatedType) {
        setType(validatedType);
        if (descMatch && descMatch[1]) {
          setDescription(descMatch[1].trim());
        }
        toast.success("AI Analysis complete!", {
          description: "Rubbish identified and fields populated.",
        });
      } else {
        toast.error("Invalid rubbish type", {
          description: "The detected items don't match our reporting categories."
        });
      }

    } catch (error) {
      console.error("AI Error:", error);
      toast.error("AI Analysis failed. Please enter details manually.");
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  /**
   * Heatmap data processing
   */
  const convertReportsToLocations = (reports: Report[]): LocationPoint[] => {
    const locationGroups: { [key: string]: Report[] } = {};
    reports.forEach(report => {
      if (!report.location?.lat || !report.location?.lng) return;
      const key = `${report.location.lat.toFixed(3)},${report.location.lng.toFixed(3)}`;
      if (!locationGroups[key]) locationGroups[key] = [];
      locationGroups[key].push(report);
    });
    
    return Object.entries(locationGroups).map(([key, groupReports]) => {
      const [lat, lng] = key.split(',').map(Number);
      return {
        id: `user-report-${key}`,
        lat,
        lng,
        address: groupReports[0].location.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        reports: groupReports.length,
        intensity: Math.min(groupReports.length / 10, 1),
      };
    });
  };

  const loadReports = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3e3b490b/reports/list?timestamp=${Date.now()}`,
        {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${publicAnonKey}`,
            'Cache-Control': 'no-cache'
          },
        }
      );
      if (response.ok) {
        const { reports } = await response.json();
        if (reports && reports.length > 0) {
          const realLocations = convertReportsToLocations(reports);
          setMapLocations([...SYDNEY_LOCATIONS, ...realLocations]);
        }
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pendingDataStr = sessionStorage.getItem('pendingReportData');
    if (pendingDataStr) {
      try {
        const pendingData = JSON.parse(pendingDataStr);
        if (pendingData.type) setType(pendingData.type);
        if (pendingData.description) setDescription(pendingData.description);
        if (pendingData.photo) setPhoto(pendingData.photo);
        if (pendingData.latitude) setLatitude(pendingData.latitude);
        if (pendingData.longitude) setLongitude(pendingData.longitude);
        if (pendingData.address) setAddress(pendingData.address);
        if (pendingData.locationMode) setLocationMode(pendingData.locationMode);
        
        if (pendingData.latitude && pendingData.longitude) {
           const lat = parseFloat(pendingData.latitude);
           const lng = parseFloat(pendingData.longitude);
           setMapCenter([lat, lng]);
           setSelectedLocation([lat, lng]);
        }
        
        sessionStorage.removeItem('pendingReportData');
        toast.info('Report data recovered. Please submit again.');
      } catch (err) {
        console.error('Error parsing pending report data:', err);
      }
    }
  }, []);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const position = await getCurrentLocation();
      setLatitude(position.lat.toFixed(6));
      setLongitude(position.lng.toFixed(6));
      setMapCenter([position.lat, position.lng]);
      setAddress(await reverseGeocode(position.lat, position.lng));
      toast.success('Location detected!');
    } catch (error) {
      toast.error("Could not detect location.");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleManualLocation = async () => {
    if (!latitude || !longitude) return;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    setMapCenter([lat, lng]);
    setAddress(await reverseGeocode(lat, lng));
    toast.success('Location pinned!');
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setPhoto(compressedBase64);
        detectRubbishWithAI(compressedBase64);
      } catch (err) {
        toast.error("Failed to process image");
      }
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setLocationMode('manual');
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    setMapCenter([lat, lng]);
    setSelectedLocation([lat, lng]);
    setAddress(await reverseGeocode(lat, lng));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !description || !latitude) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) {
      const formData = {
        type,
        description,
        photo,
        latitude,
        longitude,
        address,
        locationMode
      };
      sessionStorage.setItem('pendingReportData', JSON.stringify(formData));
      toast.info('Please log in to submit your report');
      navigate('/auth?redirect=/report');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3e3b490b/reports/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            type,
            description,
            photo,
            location: { lat: parseFloat(latitude), lng: parseFloat(longitude), address },
            guestEmail: isGuest ? guestEmail : undefined,
          }),
        }
      );
      if (response.ok) {
        await loadReports();
        toast.success('Report submitted successfully!');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant={user ? 'authenticated' : 'landing'} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report Rubbish</h1>
          <p className="text-gray-600">Snap a photo for AI categorization.</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Report Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo Evidence</label>
                <div className="relative">
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                  <label htmlFor="photo-upload" className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${photo ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-500'}`}>
                    {isAIAnalyzing ? (
                      <div className="flex flex-col items-center py-2">
                        <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-2" />
                        <span className="text-green-700 font-semibold animate-pulse">Analyzing...</span>
                      </div>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-gray-600">{photo ? 'Change Photo' : 'Take or upload photo'}</span>
                      </>
                    )}
                  </label>
                </div>
                {photo && !isAIAnalyzing && <img src={photo} alt="Preview" className="mt-3 w-full h-48 object-cover rounded-lg" />}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rubbish Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required>
                  <option value="">Select type...</option>
                  {RUBBISH_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Awaiting AI analysis..." rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button type="button" onClick={() => setLocationMode('auto')} className={`flex-1 py-2 rounded-md font-medium text-sm ${locationMode === 'auto' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'}`}>Auto Detect</button>
                  <button type="button" onClick={() => setLocationMode('manual')} className={`flex-1 py-2 rounded-md font-medium text-sm ${locationMode === 'manual' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'}`}>Manual Pin</button>
                </div>
                
                {locationMode === 'auto' ? (
                  <button type="button" onClick={handleAutoDetect} disabled={isDetecting} className="w-full py-3 bg-green-600 text-white rounded-lg flex justify-center items-center gap-2 hover:bg-green-700">
                    {isDetecting ? <Loader2 className="animate-spin" /> : <Navigation size={18} />}
                    {isDetecting ? 'Detecting...' : 'Get Current Location'}
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="Lat" className="border p-2 rounded-lg text-sm" />
                    <input value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="Lng" className="border p-2 rounded-lg text-sm" />
                    <button type="button" onClick={handleManualLocation} className="col-span-2 py-2 bg-gray-700 text-white rounded-lg text-sm">Update Pin</button>
                  </div>
                )}
                {address && <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded border">{address}</p>}
              </div>

              <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg">
                <Send size={18} /> Submit Report
              </button>
            </form>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sydney Heat Map</h2>
            <HeatMap locations={mapLocations} center={mapCenter} height="550px" onMapClick={handleMapClick} selectedLocation={selectedLocation} />
          </div>
        </div>
      </div>
    </div>
  );
};