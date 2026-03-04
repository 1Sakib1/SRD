import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { HeatMap } from '../components/HeatMap';
import { getReports, updateReportStatus, Report, getUserStats, getAllUsers, createNotification, sendEmailNotification } from '../utils/storage';
import { SYDNEY_LOCATIONS, LocationPoint } from '../utils/mockData';
import { Shield, FileText, Users, TrendingUp, CheckCircle, Clock, AlertCircle, Download, Calendar, Code } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { generateWeeklyReport, downloadWeeklyReportAsJSON, downloadWeeklyReportAsCSV, getNextSundayDate } from '../utils/reportGenerator';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { useNavigate } from 'react-router';

export const AdminDashboard = () => {
  console.log('🏠 AdminDashboard: Component rendering');
  
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | Report['status']>('all');
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
  
  let stats;
  try {
    stats = getUserStats();
    console.log('📊 AdminDashboard: Stats loaded', stats);
  } catch (error) {
    console.error('❌ AdminDashboard: Error loading stats', error);
    stats = {
      totalMembers: 0,
      totalReports: 0,
      satisfaction: 0,
    };
  }
  
  useEffect(() => {
    console.log('🔄 AdminDashboard: useEffect - loading reports');
    loadReports();
    
    // Refresh heat map every 30 seconds to show new reports
    const interval = setInterval(loadReports, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const loadReports = async () => {
    setIsLoading(true);
    try {
      // Fetch reports from server
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
        const { reports: serverReports } = await response.json();
        console.log('📋 AdminDashboard: Loaded reports from server', serverReports.length);
        setReports(serverReports || []);
        
        // Update heat map with real reports
        if (serverReports && serverReports.length > 0) {
          const realLocations = convertReportsToLocations(serverReports);
          const combinedLocations = [...SYDNEY_LOCATIONS, ...realLocations];
          setMapLocations(combinedLocations);
          console.log('🗺️ AdminDashboard: Heat map updated with', realLocations.length, 'real locations');
        }
      } else {
        console.error('Failed to load reports from server');
        toast.error('Failed to load reports');
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Error loading reports', error);
      toast.error('Error loading reports');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStatusChange = (reportId: string, newStatus: Report['status']) => {
    // Get the report details before updating
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    // Update the report status on server
    updateReportStatusOnServer(reportId, newStatus);
  };

  const updateReportStatusOnServer = async (reportId: string, newStatus: Report['status']) => {
    try {
      // Update via server API
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3e3b490b/reports/${reportId}/status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update report status');
      }

      // Show success message
      toast.success(`Report marked as ${newStatus}`);

      // Reload reports to reflect changes
      await loadReports();
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Failed to update report status');
    }
  };
  
  const handleGenerateCSVReport = () => {
    console.log('📥 Generating CSV report with', reports.length, 'reports');
    
    if (reports.length === 0) {
      toast.warning('No reports available', {
        description: 'Please submit some reports first before generating the weekly report.',
      });
      return;
    }
    
    const report = generateWeeklyReport(reports);
    
    // Show warning if no reports this week
    if (report.summary.totalReports === 0) {
      toast.warning('No reports this week', {
        description: `Found ${reports.length} total reports, but none were submitted during the current week (Monday-Sunday). Check the console for details.`,
        duration: 8000,
      });
    }
    
    downloadWeeklyReportAsCSV(report);
    toast.success('Weekly report generated!', {
      description: `CSV file with ${report.summary.totalReports} reports from this week downloaded successfully`,
    });
  };
  
  const handleGenerateJSONReport = () => {
    console.log('📥 Generating JSON report with', reports.length, 'reports');
    
    if (reports.length === 0) {
      toast.warning('No reports available', {
        description: 'Please submit some reports first before generating the weekly report.',
      });
      return;
    }
    
    const report = generateWeeklyReport(reports);
    
    // Show warning if no reports this week
    if (report.summary.totalReports === 0) {
      toast.warning('No reports this week', {
        description: `Found ${reports.length} total reports, but none were submitted during the current week (Monday-Sunday). Check the console for details.`,
        duration: 8000,
      });
    }
    
    downloadWeeklyReportAsJSON(report);
    toast.success('Weekly report generated!', {
      description: `JSON file with ${report.summary.totalReports} reports from this week downloaded successfully`,
    });
  };
  
  const filteredReports = selectedStatus === 'all'
    ? reports
    : reports.filter(r => r.status === selectedStatus);
  
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
  
  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const reviewedCount = reports.filter(r => r.status === 'reviewed').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage and monitor rubbish reports across Sydney</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{reports.length}</div>
            <div className="text-sm text-gray-600">Total Reports</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{pendingCount}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{reviewedCount}</div>
            <div className="text-sm text-gray-600">Reviewed</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{resolvedCount}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
        </div>
        
        {/* Community Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-8 h-8 text-green-100" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalMembers.toLocaleString()}</div>
            <div className="text-sm text-green-100">Community Members</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-8 h-8 text-blue-100" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalReports.toLocaleString()}</div>
            <div className="text-sm text-blue-100">All-Time Reports</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-purple-100" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.satisfaction}%</div>
            <div className="text-sm text-purple-100">Satisfaction Rate</div>
          </div>
        </div>
        
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Reports Management - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Manage Reports</h2>
              
              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedStatus === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedStatus('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setSelectedStatus('reviewed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedStatus === 'reviewed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Reviewed
                </button>
                <button
                  onClick={() => setSelectedStatus('resolved')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedStatus === 'resolved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredReports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No reports in this category</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{report.type}</h3>
                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    
                    {report.photo && (
                      <img
                        src={report.photo}
                        alt="Report"
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <p><strong>Location:</strong> {report.location.address}</p>
                      <p><strong>Coordinates:</strong> {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}</p>
                      <p><strong>Submitted:</strong> {format(new Date(report.timestamp), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(report.id, 'pending')}
                        disabled={report.status === 'pending'}
                        className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Mark Pending
                      </button>
                      <button
                        onClick={() => handleStatusChange(report.id, 'reviewed')}
                        disabled={report.status === 'reviewed'}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => handleStatusChange(report.id, 'resolved')}
                        disabled={report.status === 'resolved'}
                        className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Heat Map - Takes 1 column */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Heat Map</h2>
            <p className="text-sm text-gray-600 mb-4">
              Visual representation of report density across Sydney
            </p>
            <HeatMap locations={mapLocations} height="550px" />
          </div>
        </div>
        
        {/* Weekly Report Generation Section */}
        <div className="mt-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border-2 border-orange-200 p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Weekly Council Report</h2>
                  <p className="text-sm text-gray-600">Automated data export for City of Sydney Council</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Comprehensive weekly statistics and analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Reports by type, location, and contributor</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Exportable in CSV or JSON format</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 mb-6 border-2 border-orange-200">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Next Scheduled Report</p>
                    <p className="text-sm text-gray-600">{getNextSundayDate()}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateCSVReport}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all shadow-sm hover:shadow-md"
                >
                  <Download className="w-5 h-5" />
                  <span>Generate CSV Report</span>
                </button>
                <button
                  onClick={handleGenerateJSONReport}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
                >
                  <Download className="w-5 h-5" />
                  <span>Generate JSON Report</span>
                </button>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1742320263435-4d7fcb7031af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGNpdHklMjBwYXJrfGVufDF8fHx8MTc3MjA4MTU3NHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Sydney"
                className="w-64 h-64 object-cover rounded-lg shadow-lg border-4 border-white"
              />
            </div>
          </div>
        </div>
        
        {/* Developer Tools Section */}
        <div className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg border-2 border-gray-700 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Developer Tools</h2>
              <p className="text-sm text-gray-400">Advanced debugging and system monitoring</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">User Management System</h3>
              <p className="text-sm text-gray-400 mb-4">
                Comprehensive user administration panel. View all registered accounts, monitor eco points and credits, export user data, and track community growth with advanced search and filtering capabilities.
              </p>
              <button
                onClick={() => navigate('/debug-users')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
              >
                <Users className="w-5 h-5" />
                <span>Open User Management</span>
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">System Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Environment:</span>
                  <span className="text-green-400 font-mono">Production</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Backend:</span>
                  <span className="text-green-400 font-mono">Supabase Edge Functions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Database:</span>
                  <span className="text-green-400 font-mono">KV Store + Cloud</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email Service:</span>
                  <span className="text-green-400 font-mono">Resend API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};