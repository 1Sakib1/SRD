const projectId = "qqxftmbuosckaqpmetcc";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxeGZ0bWJ1b3Nja2FxcG1ldGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTAwMzAsImV4cCI6MjA4NzY4NjAzMH0.LV2mhCzzTO1O4CA7wrUcRr7VURiKWbNalF-Hux5Dq08";

async function run() {
  try {
    const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3e3b490b/reports/list`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    const data = await res.json();
    const reports = data.reports;
    
    if (!reports || reports.length === 0) {
      console.log('No reports found in KV.');
      return;
    }
    
    let sql = 'INSERT INTO public.reports (id, user_id, type, description, photo, location_lat, location_lng, location_address, status, created_at, updated_at) VALUES\n';
    
    const values = reports.map(r => {
      // Avoid quoting issues
      const type = (r.type || 'Rubbish').replace(/'/g, "''");
      const desc = (r.description || '').replace(/'/g, "''");
      const addr = (r.location?.address || '').replace(/'/g, "''");
      const status = (r.status || 'pending').replace(/'/g, "''");
      
      const lat = r.location?.lat || 0;
      const lng = r.location?.lng || 0;
      
      // We must use a valid UUID. The admin UUID I used before is '04ecb874-e192-4c85-bdcd-ef0d150a4957'
      return `(uuid_generate_v4(), '04ecb874-e192-4c85-bdcd-ef0d150a4957', '${type}', '${desc}', null, ${lat}, ${lng}, '${addr}', '${status}', now(), now())`;
    });
    
    sql += values.join(',\n') + ';';
    const fs = require('fs');
    fs.writeFileSync('insert_kv.sql', sql);
    console.log('Wrote insert_kv.sql with ' + reports.length + ' reports.');
  } catch(e) {
    console.error(e);
  }
}
run();
