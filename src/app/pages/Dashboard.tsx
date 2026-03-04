import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Header } from '../components/Header';
import { HeatMap } from '../components/HeatMap';
import { useAuth } from '../context/AuthContext';
import { getReports, Report } from '../utils/storage';
import { SYDNEY_LOCATIONS, LocationPoint } from '../utils/mockData';
import { Award, FileText, MapPin, TrendingUp, Plus, Calendar, Leaf, DollarSign, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export const Dashboard = () => {
  console.log('🏠 Dashboard: Component rendering');
  
  const { user, refreshUser } = useAuth();
  console.log('👤 Dashboard: Current user', user);
  
  const [reports, setReports] = useState<Report[]>([]);
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLocations, setMapLocations] = useState<LocationPoint[]>(SYDNEY_LOCATIONS);
  
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
  
  useEffect(() => {
    console.log('🔄 Dashboard: useEffect - loading reports');
    if (user) {
      loadReportsAndUserData();
    }
  }, [user?.id]);
  
  const loadReportsAndUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch user's reports from server
      const userReportsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3e3b490b/reports/user/${user.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (userReportsResponse.ok) {
        const { reports: serverReports } = await userReportsResponse.json();
        console.log('📋 Dashboard: Loaded user reports from server', serverReports.length);
        setUserReports(serverReports || []);
      } else {
        console.error('Failed to load user reports from server');
      }
      
      // Fetch ALL reports for heat map
      const allReportsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3e3b490b/reports/list`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (allReportsResponse.ok) {
        const { reports: allReports } = await allReportsResponse.json();
        console.log('🗺️ Dashboard: Loaded all reports for heat map', allReports?.length || 0);
        
        if (allReports && allReports.length > 0) {
          // Convert real reports to location points
          const realLocations = convertReportsToLocations(allReports);
          
          // Combine demo locations with real user reports
          const combinedLocations = [...SYDNEY_LOCATIONS, ...realLocations];
          setMapLocations(combinedLocations);
        }
      } else {
        console.error('Failed to load all reports for heat map');
      }

      // Refresh user data from server to get updated eco points
      await refreshUser();
    } catch (error) {
      console.error('❌ Dashboard: Error loading data', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Here's your impact on Sydney's cleanliness</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{user?.ecoPoints || 0}</div>
            <div className="text-xs sm:text-sm text-gray-600">Eco-Points</div>
            <div className="mt-2 text-xs text-green-600">
              {100 - ((user?.ecoPoints || 0) % 100)} pts to $1
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">${user?.credits || 0}</div>
            <div className="text-xs sm:text-sm text-gray-600">AUD Credits</div>
            <div className="mt-2 text-xs text-emerald-600">
              From {Math.floor((user?.ecoPoints || 0) / 100) * 100} pts
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{userReports.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Reports</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {userReports.filter(r => r.status === 'resolved').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Resolved</div>
          </div>
        </div>
        
        {/* Rewards Info Card */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Earn Real Rewards for Your Impact!
              </h3>
              <p className="text-sm sm:text-base text-gray-700 mb-3">
                Every <span className="font-semibold text-green-700">100 eco-points</span> you earn automatically converts to <span className="font-semibold text-emerald-700">$1 AUD credit</span>. Your credits can be redeemed for vouchers, discounts at local eco-friendly businesses, or donated to environmental causes.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-emerald-200">
                  <Leaf className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-700">10 points per report</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-emerald-200">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-gray-700">100 points = $1 AUD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8">
          <Link
            to="/report"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Report New Rubbish
          </Link>
        </div>
        
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Recent Reports</h2>
            
            {userReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No reports yet</p>
                <Link
                  to="/report"
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                >
                  Submit your first report
                  <Plus className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userReports.slice(0, 5).map((report) => (
                  <div
                    key={report.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{report.type}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{report.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="line-clamp-1">{report.location.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{format(new Date(report.timestamp), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Heat Map */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sydney Overview</h2>
            <p className="text-sm text-gray-600 mb-4">
              Community reports across Sydney showing rubbish density hotspots
            </p>
            <HeatMap locations={mapLocations} height="400px" />
          </div>
        </div>
        
        {/* Leaderboard Teaser */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Keep Up the Great Work!</h2>
              <p className="text-green-100 mb-4">
                You're making a real difference in Sydney. Every report helps create a cleaner city.
              </p>
              <div className="flex items-center space-x-6">
                <div>
                  <div className="text-3xl font-bold">{user?.ecoPoints || 0}</div>
                  <div className="text-sm text-green-100">Your Points</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{userReports.length}</div>
                  <div className="text-sm text-green-100">Reports Submitted</div>
                </div>
              </div>
            </div>
            <Award className="w-24 h-24 text-green-300 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
};