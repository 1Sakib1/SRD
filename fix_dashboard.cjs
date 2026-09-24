const fs = require('fs');
let content = fs.readFileSync('src/app/pages/Dashboard.tsx', 'utf8');

const target1 = `        setUserReports(serverReports || []);`;
const replacement1 = `        const deletedIds = JSON.parse(localStorage.getItem('deletedUserReports') || '[]');
        const filteredReports = (serverReports || []).filter((r: any) => !deletedIds.includes(r.id));
        setUserReports(filteredReports);`;
content = content.replace(target1, replacement1);

const target2 = `<ReportCard key={report.id} report={report} getStatusColor={getStatusColor} />`;
const replacement2 = `<ReportCard key={report.id} report={report} getStatusColor={getStatusColor} onDelete={handleDeleteReport} />`;
content = content.replace(target2, replacement2);

const target3 = `  const getStatusColor = (status: Report['status']) => {`;
const replacement3 = `  const handleDeleteReport = (id: string) => {
    const deletedIds = JSON.parse(localStorage.getItem('deletedUserReports') || '[]');
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem('deletedUserReports', JSON.stringify(deletedIds));
    }
    setUserReports(prev => prev.filter(r => r.id !== id));
  };

  const getStatusColor = (status: Report['status']) => {`;
content = content.replace(target3, replacement3);

fs.writeFileSync('src/app/pages/Dashboard.tsx', content);
console.log('Patched Dashboard.tsx for Delete');
