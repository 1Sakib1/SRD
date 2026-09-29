const fs = require('fs');
let code = fs.readFileSync('src/app/pages/Landing.tsx', 'utf8');

code = code.replace(
  '<li><Link to="/" className="hover:text-white">Privacy Policy</Link></li>',
  '<li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>'
);

code = code.replace(
  '<li><Link to="/" className="hover:text-white">Terms of Service</Link></li>',
  '<li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>'
);

code = code.replace(
  '<li><Link to="/" className="hover:text-white">Cookie Policy</Link></li>',
  '<li><Link to="/privacy" className="hover:text-white transition-colors">Cookie Policy</Link></li>'
);

fs.writeFileSync('src/app/pages/Landing.tsx', code);
