const fs = require('fs');
const content = fs.readFileSync('src/app/pages/Auth.tsx', 'utf8');

const updated = content.replace(
  "console.log('o. Login successful, user:', user);\n        login(user);",
  "if (ADMIN_EMAILS.includes(normalizedEmail)) { user.role = 'admin'; }\n        console.log('o. Login successful, user:', user);\n        login(user);"
);

fs.writeFileSync('src/app/pages/Auth.tsx', updated);
