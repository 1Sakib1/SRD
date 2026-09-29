const fs = require('fs');
let code = fs.readFileSync('InteractiveGlobe_backup.tsx', 'utf8');

// I will restore from backup, and apply the hooks properly!

const hookStart = `  const globeHtmlElements = React.useMemo(() => {`;
const hookEnd = `  const getPointColor = React.useCallback((d: any) => d.id === selectedPoint?.id ? 'rgba(0,255,115,1)' : 'rgba(0,177,80,0.5)', [selectedPoint]);`;

const startIndex = code.indexOf(hookStart);
const endIndex = code.indexOf(hookEnd) + hookEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  const extractedHooks = code.slice(startIndex, endIndex);
  
  // Remove them from their current incorrect location
  code = code.slice(0, startIndex) + code.slice(endIndex);

  // Insert them right after the state declarations
  const insertTarget = `  const [highlightedCountry, setHighlightedCountry] = useState<string | null>(null);`;
    
  if (code.indexOf(insertTarget) !== -1) {
    code = code.replace(insertTarget, insertTarget + '\n\n' + extractedHooks + '\n\n');
  } else {
    console.error("Could not find insertTarget");
  }
} else {
  console.error("Could not find extractedHooks");
}

fs.writeFileSync('src/app/components/InteractiveGlobe.tsx', code);
