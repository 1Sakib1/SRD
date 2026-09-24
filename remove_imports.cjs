const fs = require('fs');

['src/app/pages/Dashboard.tsx', 'src/app/pages/AdminDashboard.tsx'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        "import { SYDNEY_LOCATIONS, LocationPoint } from '../utils/mockData';",
        "import { LocationPoint } from '../utils/mockData';"
    );
    fs.writeFileSync(file, content);
});

console.log('Removed SYDNEY_LOCATIONS imports');
