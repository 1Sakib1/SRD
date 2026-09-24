const fs = require('fs');
let content = fs.readFileSync('src/app/pages/Dashboard.tsx', 'utf8');

const oldReportCard = \const ReportCard = ({ report, getStatusColor }: { report: any; getStatusColor: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-all flex flex-col mb-3">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={14} />
            <span>{report.created_at ? format(new Date(report.created_at), 'MMM dd, yyyy') : report.date ? format(new Date(report.date), 'MMM dd, yyyy') : 'Unknown Date'}</span>
          </div>
          <div className="flex items-center gap-2 font-medium text-gray-900">
            <MapPin size={16} className="text-green-600"/>
            <span className="truncate max-w-[200px] sm:max-w-xs">{report.location?.address || report.location_address || report.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={\px-2 py-1 rounded-full text-xs font-semibold \\}>
            {report.status.toUpperCase()}
          </span>
          {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-sm text-gray-700 mb-4 bg-white p-3 rounded border border-gray-100">
            {report.description || "No description provided."}
          </p>
          {report.photo && !imageFailed ? (
            <img 
              src={report.photo} 
              alt="Rubbish" 
              className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-sm"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
              <FileText className="w-8 h-8 text-gray-400 mb-2" />
              <span>No Image Available</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};\;

const newReportCard = \const ReportCard = ({ report, getStatusColor, onDelete }: { report: any; getStatusColor: any; onDelete: (id: string) => void }) => {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow bg-white flex flex-col mb-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <MapPin size={16} className="text-green-600"/>
            {report.type || 'Rubbish Report'}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{report.description || "No description provided."}</p>
        </div>
        <span className={\px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap \\}>
          {report.status ? report.status.toUpperCase() : 'UNKNOWN'}
        </span>
      </div>
      
      {report.photo && !imageFailed ? (
        <img
          src={report.photo}
          alt="Report"
          className="w-full h-48 object-cover rounded-lg mb-4 shadow-sm"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 text-sm mb-4">
          <FileText className="w-8 h-8 mb-2 opacity-50" />
          <span>No Image Available</span>
        </div>
      )}
      
      <div className="text-sm text-gray-600 space-y-1 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
        <p className="flex items-start gap-2">
          <strong className="min-w-[80px]">Location:</strong> 
          <span className="flex-1">{report.location?.address || report.location_address || 'Unknown'}</span>
        </p>
        {(report.location?.lat && report.location?.lng) && (
          <p className="flex items-start gap-2">
            <strong className="min-w-[80px]">Coords:</strong> 
            <span className="flex-1">{report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}</span>
          </p>
        )}
        <p className="flex items-center gap-2">
          <strong className="min-w-[80px]">Submitted:</strong> 
          <span className="flex items-center gap-1">
            <Calendar size={14} className="text-gray-400" />
            {report.created_at ? format(new Date(report.created_at), 'MMM d, yyyy h:mm a') : report.date ? format(new Date(report.date), 'MMM d, yyyy h:mm a') : report.timestamp ? format(new Date(report.timestamp), 'MMM d, yyyy h:mm a') : 'Unknown Date'}
          </span>
        </p>
      </div>
      
      <div className="flex justify-end mt-auto pt-3 border-t border-gray-100">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
              onDelete(report.id);
            }
          }}
          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Delete Report
        </button>
      </div>
    </div>
  );
};\;

content = content.replace(oldReportCard, newReportCard);

fs.writeFileSync('src/app/pages/Dashboard.tsx', content);
console.log('Replaced ReportCard');
