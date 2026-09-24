const fs = require('fs');
let content = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');

// 1. Remove SYDNEY_LOCATIONS import
content = content.replace(
  "import { SYDNEY_LOCATIONS, RUBBISH_TYPES, LocationPoint } from '../utils/mockData';",
  "import { RUBBISH_TYPES, LocationPoint } from '../utils/mockData';"
);

// 2. Remove static demo data from state
content = content.replace(
  "const [mapLocations, setMapLocations] = useState<LocationPoint[]>(SYDNEY_LOCATIONS);",
  "const [mapLocations, setMapLocations] = useState<LocationPoint[]>([]);"
);

// 3. Update loadReports to use Supabase query for public.reports
const loadReportsFunc = `const loadReports = async () => {
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
        const supabaseLocations: LocationPoint[] = data
          .filter(r => r.location_lat && r.location_lng)
          .map(r => ({
            id: r.id,
            lat: r.location_lat,
            lng: r.location_lng,
            address: r.type || 'Rubbish Report',
            reports: 1,
            intensity: r.status === 'resolved' ? 0.2 : (r.status === 'pending' ? 0.8 : 0.5)
          }));
          
        setMapLocations(supabaseLocations);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };`;

// Replace the old loadReports and convertReportsToLocations
const oldLoadReportsRegion = /const convertReportsToLocations = [\s\S]*?const loadReports = [\s\S]*?catch \(error\) \{\s*console\.error\('Error loading reports:', error\);\s*\}\s*\};/m;
content = content.replace(oldLoadReportsRegion, loadReportsFunc);

// 4. Update real-time subscription to dynamically add the new report
const oldEffect = /useEffect\(\(\) => \{\s*loadReports\(\);\s*\/\/ Subscribe to real-time report inserts\s*const channel = supabase\s*\.channel\('public:reports'\)\s*\.on\('postgres_changes', \{ event: 'INSERT', schema: 'public', table: 'reports' \}, \(payload\) => \{\s*loadReports\(\);\s*\}\)\s*\.subscribe\(\);\s*return \(\) => \{\s*supabase\.removeChannel\(channel\);\s*\};\s*\}, \[\]\);/m;

const newEffect = `useEffect(() => {
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
  }, []);`;
content = content.replace(oldEffect, newEffect);

// 5. Add ML Disclaimer above submit button
const submitButton = `<button
                    type="submit"
                    disabled={isSubmitting || isAIAnalyzing}
                    className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >`;
const disclaimer = `<p className="text-xs text-gray-500 mt-4 mb-2 text-center">
                    Note: The data and images uploaded in this report may be used for future machine learning research purposes to help predict and categorize rubbish data more accurately.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting || isAIAnalyzing}
                    className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >`;
content = content.replace(submitButton, disclaimer);

fs.writeFileSync('src/app/pages/ReportRubbish.tsx', content);
console.log('Patched ReportRubbish.tsx');
