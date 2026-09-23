const fs = require('fs');
const content = fs.readFileSync('src/app/pages/Auth.tsx', 'utf8');

const updated = content.replace(
  "role: userData.role,",
  "role: ADMIN_EMAILS.includes(email.toLowerCase().trim()) ? 'admin' : userData.role,"
);

fs.writeFileSync('src/app/pages/Auth.tsx', updated);
