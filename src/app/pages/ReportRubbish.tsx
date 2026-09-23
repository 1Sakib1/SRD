import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { HeatMap } from '../components/HeatMap';
import { useAuth } from '../context/AuthContext';
import { RUBBISH_TYPES, LocationPoint } from '../utils/mockData';
import { getCurrentLocation, reverseGeocode } from '../utils/geocoding';
import { MapPin, Navigation, Camera, Send, Loader2, Sparkles, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { supabase } from '../utils/supabase';
import { GoogleGenAI } from "@google/genai";

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
  const [mapLocations, setMapLocations] = useState<LocationPoint[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-33.8688, 151.2093]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  /**
   * AI Detection Logic with Rubbish Validation
   */
  const detectRubbishWithAI = async (base64Photo: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
    if (!apiKey) {
      toast.error("API Key missing", {
        description: "Please set VITE_GEMINI_API_KEY in your .env file or Vercel settings."
      });
      return;
    }

    setIsAIAnalyzing(true);
    setType('');
    setDescription('');

    try {
      const ai = new GoogleGenAI({ apiKey });
      
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

      const interaction = await ai.interactions.create({
        model: "gemini-3.5-flash-lite",
        input: [
          { type: "text", text: prompt },
          { type: "image", data: base64Photo.split(',')[1], mime_type: "image/jpeg" }
        ]
      });
      
      const responseText = interaction.output_text || "";
      
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

    } catch (error: any) {
      console.error("AI Error:", error);
      toast.error("AI Analysis failed", {
        description: error.message || "Please enter details manually."
      });
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  /**
   * Heatmap data processing
   */
  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('id, location_lat, location_lng, type, status');
        
      if (error) {
        console.error('Error fetching reports from Supabase:', error);
        return;
      }
      
      if (data) {
        // Map Supabase rows to LocationPoint format
        // Group reports by approximate location to create density hotspots (like the dashboard)
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
              lat,
              lng,
              address: group[0].type || 'Rubbish Report',
              reports: group.length,
              intensity: Math.max(0.3, Math.min(group.length / 10, 1))
            };
          });
          
          setMapLocations(groupedLocations);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  useEffect(() => {
    // Automatically detect user's location on page load
    getCurrentLocation().then(position => {
      setMapCenter([position.lat, position.lng]);
    }).catch(err => {
      console.log('Auto location on mount failed', err);
    });

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
            address: newReport.type || 'Rubbish Report',
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
        
        // Show uploading state
        const toastId = toast.loading('Uploading image to secure storage...');
        
        // Convert Base64 back to Blob for Supabase Storage
        const res = await fetch(compressedBase64);
        const blob = await res.blob();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        
        const { data, error } = await supabase.storage
          .from('report-images')
          .upload(fileName, blob, { contentType: 'image/jpeg' });
          
        if (error) {
          console.error('Storage upload error:', error);
          toast.error('Failed to upload image securely', { id: toastId });
          // Fallback to base64 if storage fails
          setPhoto(compressedBase64);
        } else {
          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('report-images')
            .getPublicUrl(fileName);
            
          toast.success('Image uploaded successfully!', { id: toastId });
          
          // Set the photo to the lightweight public URL
          setPhoto(urlData.publicUrl);
        }
        
        // Let AI analyze the base64 version
        detectRubbishWithAI(compressedBase64);
      } catch (err) {
        toast.error("Failed to process image");
        console.error(err);
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
        if (user && user.email) {
          toast.success(`Report submitted! A confirmation email is being sent to ${user.email}.`);
          try {
            fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'Smart Rubbish Detection <onboarding@resend.dev>',
                to: [user.email],
                subject: 'Report Submitted Successfully! - Smart Rubbish Detection',
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
                    <h2 style="color: #10b981;">Report Submitted Successfully! 🌍</h2>
                    <p>Hi ${user.name || 'there'},</p>
                    <p>Thank you for submitting a rubbish report! We have successfully received it and it's now marked as pending review.</p>
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin: 20px 0;">
                      <p style="margin: 0; color: #166534; font-weight: bold;">🎉 Reward Earned!</p>
                      <p style="margin: 5px 0 0 0; color: #15803d;">You have automatically earned <strong>10 eco-points ($0.10)</strong> for your contribution.</p>
                    </div>
                    <p>Keep up the great work keeping our environment clean!</p>
                  </div>
                `
              })
            });
          } catch (e) {
            console.error('Failed to send confirmation email', e);
          }
        } else {
          toast.success('Report submitted successfully!');
        }
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
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
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
            <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Live Rubbish Heat Map</h2>
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">Live community reports showing rubbish density hotspots</p>
            <HeatMap locations={mapLocations} center={mapCenter} height="550px" onMapClick={handleMapClick} selectedLocation={selectedLocation} />
          </div>
        </div>
        
        {/* Research Disclaimer */}
        <div className="mt-12 text-center text-sm text-gray-500 pb-8">
          <p>
            The data and images uploaded in this report may be used for future machine learning research purposes to help predict and categorize rubbish data more accurately.
          </p>
        </div>
      </div>
    </div>
  );
};
