const fs = require('fs');
const content = fs.readFileSync('src/app/pages/Auth.tsx', 'utf8');

// We know the first login(user); is inside handleLogin, right after console.log
const firstLoginIndex = content.indexOf('login(user);');
if (firstLoginIndex !== -1) {
    const updated = content.substring(0, firstLoginIndex) + 
        "if (ADMIN_EMAILS && ADMIN_EMAILS.includes && typeof normalizedEmail !== 'undefined' && ADMIN_EMAILS.includes(normalizedEmail)) { user.role = 'admin'; }\n          login(user);" + 
        content.substring(firstLoginIndex + 12);
    fs.writeFileSync('src/app/pages/Auth.tsx', updated);
    console.log("Successfully replaced");
} else {
    console.log("Could not find login(user);");
}
