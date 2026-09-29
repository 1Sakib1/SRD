const fs = require('fs');
let code = fs.readFileSync('src/app/routes.tsx', 'utf8');

// Add imports
const imports = `
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
`;

code = code.replace("import { InAppBrowserGuard } from './components/InAppBrowserGuard';", "import { InAppBrowserGuard } from './components/InAppBrowserGuard';" + imports);

// Add routes
const routes = `
      {
        path: '/privacy',
        element: <PrivacyPolicy />,
      },
      {
        path: '/terms',
        element: <TermsOfService />,
      },
`;

code = code.replace("      {", routes + "      {");

fs.writeFileSync('src/app/routes.tsx', code);
