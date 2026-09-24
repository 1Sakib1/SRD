const fs = require('fs');
let content = fs.readFileSync('supabase/functions/server/index.tsx', 'utf8');

const target = /const reportKey = `report:\$\{reportId\}`;[\s\S]*?await kv\.set\(reportKey, report\);/;

const replacement = `const reportKey = \`report:\${reportId}\`;
      await kv.set(reportKey, report);

      // Save report to Postgres
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
        
        if (supabaseUrl && supabaseKey) {
          const { createClient } = await import("npm:@supabase/supabase-js");
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          const { error: pgError } = await supabase.from('reports').insert([{
            user_id: userId,
            type: type,
            description: description,
            photo: photo || null,
            location_lat: location.lat,
            location_lng: location.lng,
            location_address: location.address || '',
            status: 'pending',
            created_at: now,
            updated_at: now
          }]);
          
          if (pgError) {
            console.error('Error saving to Postgres reports table:', pgError);
          } else {
            console.log('Successfully saved to Postgres reports table');
          }
        } else {
          console.error('Missing Supabase env vars, cannot save to Postgres');
        }
      } catch (pgInsertError) {
        console.error('Exception saving to Postgres:', pgInsertError);
      }`;

if (content.match(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('supabase/functions/server/index.tsx', content);
    console.log('Patched index.tsx');
} else {
    console.error('Target not found!');
}
