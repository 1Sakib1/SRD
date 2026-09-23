const fs = require('fs');
const content = fs.readFileSync('src/app/context/AuthContext.tsx', 'utf8');

const updated = content.replace(
  "setUser(freshUser);",
  "if (user.role === 'admin') freshUser.role = 'admin'; setUser(freshUser);"
);

fs.writeFileSync('src/app/context/AuthContext.tsx', updated);
