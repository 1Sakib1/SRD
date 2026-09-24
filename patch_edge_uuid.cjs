const fs = require('fs');
let content = fs.readFileSync('supabase/functions/server/index.ts', 'utf8');

const target = /const \{ error: pgError \} = await supabase\.from\('reports'\)\.insert\(\[\{\s*user_id: userId,\s*type: type,\s*description: description,\s*photo: photo \|\| null,\s*location_lat: location\.lat,\s*location_lng: location\.lng,\s*location_address: location\.address \|\| '',\s*status: 'pending',\s*created_at: now,\s*updated_at: now\s*\}\]\);/;

const replacement = `// Ensure user_id is a valid UUID to satisfy foreign key constraints.
            // If the KV store userId is used (e.g. 'user-1234...'), we fall back to a known admin UUID.
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const validUserId = uuidRegex.test(userId) ? userId : '04ecb874-e192-4c85-bdcd-ef0d150a4957';
            
            const { error: pgError } = await supabase.from('reports').insert([{
              user_id: validUserId,
              type: type,
              description: description,
              photo: photo || null,
              location_lat: location.lat,
              location_lng: location.lng,
              location_address: location.address || '',
              status: 'pending',
              created_at: now,
              updated_at: now
            }]);`;

if (content.match(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('supabase/functions/server/index.ts', content);
    console.log('Patched index.ts');
} else {
    console.error('Target not found!');
}
