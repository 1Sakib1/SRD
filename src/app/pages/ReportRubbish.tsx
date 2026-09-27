import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Header } from '../components/Header';
import { HeatMap } from '../components/HeatMap';
import { useAuth } from '../context/AuthContext';
import { RUBBISH_TYPES, LocationPoint } from '../utils/mockData';
import { getCurrentLocation, reverseGeocode } from '../utils/geocoding';
import { MapPin, Navigation, Camera, Send, Loader2, Sparkles, XCircle, Map } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  const detectRubbishWithAI = async (base64Photo: string): Promise<boolean> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
    if (!apiKey) {
      toast.error("API Key missing", { description: "Please set VITE_GEMINI_API_KEY in your .env file or Vercel settings." });
      return false;
    }

    setIsAIAnalyzing(true);
    setType('');
    setDescription('');

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Analyze this image for public waste/rubbish.
      
      VALID CATEGORIES: ${RUBBISH_TYPES.join(', ')}.

      CRITICAL INSTRUCTIONS:
      1. If the image shows rubbish, assign the most appropriate VALID CATEGORY.
      2. Even if it is a bit ambiguous, categorize it into one of the valid categories. (e.g. boxes -> Paper & Cardboard; plastic bags -> Plastic Waste; garbage bags -> General Litter).
      3. Only return "None" if the image absolutely DOES NOT contain any rubbish at all.

      Respond STRICTLY in this exact JSON format, with no markdown, no backticks, and no extra text:
      {"type": "Category Name or 'None'", "description": "1-sentence description"}`;

      const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          config: {
            responseMimeType: "application/json"
          },
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    data: base64Photo.split(',')[1],
                    mimeType: "image/jpeg"
                  }
                }
              ]
            }
          ]
        });
        
        const responseText = response.text || "";
      
      let detectedTypeText = "";
      let descText = "";
      
      try {
        // Strip potential markdown wrappers just in case
        let cleanText = responseText.trim();
        if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
        if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
        if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);
        
        const parsed = JSON.parse(cleanText.trim());
        detectedTypeText = parsed.type || "";
        descText = parsed.description || "";
      } catch (e) {
        console.warn("Failed to parse JSON directly, attempting fallback regex.");
        let typeMatch = responseText.match(/"type"\s*:\s*"([^"]+)"/i);
        if (!typeMatch) typeMatch = responseText.match(/Type:\s*(.*)/i);
        
        let descMatch = responseText.match(/"description"\s*:\s*"([^"]+)"/i);
        if (!descMatch) descMatch = responseText.match(/Description:\s*(.*)/i);
        
        if (typeMatch) detectedTypeText = typeMatch[1].replace(/["']/g, '').trim();
        if (descMatch) descText = descMatch[1].replace(/["']/g, '').trim();
      }

      if (detectedTypeText.toLowerCase().includes("none") || !detectedTypeText) {
        setPhoto('');
        toast.error("No rubbish detected", {
          description: "Gemini couldn't identify valid waste in this photo. Please try a clearer shot.",
          icon: <XCircle className="text-red-500" />
        });
        return false;
      }

      const validatedType = RUBBISH_TYPES.find(t => 
        detectedTypeText.toLowerCase().includes(t.split(' ')[0].toLowerCase()) || 
        t.toLowerCase().includes(detectedTypeText.split(' ')[0].toLowerCase())
      );

      if (validatedType) {
        setType(validatedType);
        if (descText) {
          setDescription(descText);
        }
        toast.success("AI Analysis complete!", {
          description: "Rubbish identified and fields populated.",
        });
        return true;
      } else {
        toast.error("Invalid rubbish type", {
          description: "The detected items don't match our reporting categories."
        });
        return false;
      }

    } catch (error: any) {
      console.error("AI Error:", error);
      toast.error("AI Analysis failed", {
        description: error.message || "Please enter details manually."
      });
      return true;
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
        .select('id, location_lat, location_lng, location_address, type, status, photo, created_at, still_there_votes, not_there_votes');
        
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
      loadReports(); // reload to show new counts
    } catch (error) {
      console.error('Error recording vote:', error);
      toast.error('Failed to record vote');
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
            address: newReport.location_address || 'Sydney, NSW',
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
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
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
          resolve(canvas.toDataURL('image/jpeg', 0.6));
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
        
        // Let AI analyze the base64 version IMMEDIATELY (in parallel)
        setPhoto(compressedBase64);
          const isValid = await detectRubbishWithAI(compressedBase64);
          if (!isValid) { setPhoto(''); return; }
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
    if (isSubmitting) return;
    setIsSubmitting(true);
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
                from: 'LitterPin <noreply@admin.litterpin.org>',
                to: [user.email],
                subject: 'Report Submitted Successfully! - LitterPin',
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
          <h1 className="text-3xl font-bold text-[#333333]">Report Rubbish</h1>
          <p className="text-gray-600">Snap a photo for AI categorization.</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-[#333333] mb-6">Report Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo Evidence</label>
                <div className="relative">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                  <label htmlFor="photo-upload" className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${photo ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-500'}`}>
                    {isAIAnalyzing ? (
                      <div className="flex flex-col items-center py-6 relative overflow-hidden w-full">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/20 to-transparent animate-pulse blur-md" style={{ backgroundSize: '100% 200%' }}></div>
                        <div className="relative flex items-center justify-center w-20 h-20 mb-4">
                          <div className="absolute inset-0 rounded-full border-4 border-green-200 opacity-20 animate-ping shadow-lg shadow-green-500/50"></div>
                          <div className="absolute inset-2 rounded-full border-4 border-green-300 opacity-40 animate-pulse"></div>
                          <div className="absolute inset-4 rounded-full border-2 border-green-400 opacity-60"></div>
                          <Sparkles className="w-8 h-8 text-[#00B150] animate-bounce relative z-10" />
                        </div>
                        <span className="text-green-700 font-bold tracking-widest uppercase text-sm animate-pulse relative z-10 bg-white/90 px-4 py-2 rounded-full shadow-sm border border-green-200">
                          AI Scanning Image...
                        </span>
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
                  <button type="button" onClick={() => setLocationMode('auto')} className={`flex-1 py-2 rounded-md font-medium text-sm ${locationMode === 'auto' ? 'bg-white text-[#00B150] shadow-sm' : 'text-gray-600'}`}>Auto Detect</button>
                  <button type="button" onClick={() => setLocationMode('manual')} className={`flex-1 py-2 rounded-md font-medium text-sm ${locationMode === 'manual' ? 'bg-white text-[#00B150] shadow-sm' : 'text-gray-600'}`}>Manual Pin</button>
                </div>
                
                {locationMode === 'auto' ? (
                  <button type="button" onClick={handleAutoDetect} disabled={isDetecting} className="w-full py-3 bg-[#00B150] text-white rounded-lg flex justify-center items-center gap-2 hover:bg-green-700">
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

              <button type="submit" disabled={isSubmitting} className={`w-full py-4 bg-[#00B150] text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-700'}`}>
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold text-[#333333]">Live Rubbish Heat Map</h2>
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4"><p className="text-sm text-gray-600">Live community reports showing rubbish density hotspots</p><Link to="/map" className="inline-flex items-center justify-center bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-[#00B150] text-sm font-medium hover:bg-gray-100 transition-colors self-start sm:self-auto shadow-sm whitespace-nowrap"><Map className="w-5 h-5 mr-1.5" /> View Full Map</Link></div>
            <HeatMap locations={mapLocations} center={mapCenter} height="550px" onMapClick={handleMapClick} selectedLocation={selectedLocation} onVote={handleVote} />
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
