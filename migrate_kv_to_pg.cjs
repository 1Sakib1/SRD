const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const projectId = "qqxftmbuosckaqpmetcc";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxeGZ0bWJ1b3Nja2FxcG1ldGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTAwMzAsImV4cCI6MjA4NzY4NjAzMH0.LV2mhCzzTO1O4CA7wrUcRr7VURiKWbNalF-Hux5Dq08";
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function run() {
  try {
    const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3e3b490b/reports/list`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    const data = await res.json();
    const reports = data.reports;
    
    if (!reports || reports.length === 0) return;
    
    const mapped = reports.map(r => ({
      user_id: '04ecb874-e192-4c85-bdcd-ef0d150a4957',
      type: r.type || 'Rubbish',
      description: r.description || '',
      photo: null,
      location_lat: r.location?.lat || 0,
      location_lng: r.location?.lng || 0,
      location_address: r.location?.address || '',
      status: r.status || 'pending',
    })).filter(r => r.location_lat !== 0 && r.location_lng !== 0);
    
    // Insert in batches of 50
    for(let i=0; i<mapped.length; i+=50) {
      const batch = mapped.slice(i, i+50);
      const { error } = await supabase.from('reports').insert(batch);
      if (error) {
        console.error('Batch error:', error);
      } else {
        console.log(`Inserted batch ${i} to ${i+batch.length}`);
      }
    }
    console.log('Finished inserting.');
  } catch(e) {
    console.error(e);
  }
}
run();
