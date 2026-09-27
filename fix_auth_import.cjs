const fs = require('fs');

const path = 'src/app/utils/authFix.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("from '/utils/supabase/info'", "from '../../../utils/supabase/info'");

fs.writeFileSync(path, content);
console.log('Fixed import path');
