const fs = require('fs');
let code = fs.readFileSync('src/app/components/InteractiveGlobe.tsx', 'utf8');

// The hooks to extract:
const hookCodeStart = "  const globeHtmlElements = React.useMemo(() => {";
const hookCodeEnd = "  const getPointColor = React.useCallback((d: any) => d.id === selectedPoint?.id ? 'rgba(0,255,115,1)' : 'rgba(0,177,80,0.5)', [selectedPoint]);";

const startIndex = code.indexOf(hookCodeStart);
const endIndex = code.indexOf(hookCodeEnd) + hookCodeEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  const extractedHooks = code.slice(startIndex, endIndex);
  
  // Remove them
  code = code.slice(0, startIndex) + code.slice(endIndex);

  // Insert them correctly after the states
  const insertTarget = "  const [highlightedCountry, setHighlightedCountry] = useState<string | null>(null);";
  if (code.indexOf(insertTarget) !== -1) {
    code = code.replace(insertTarget, insertTarget + "\n\n" + extractedHooks + "\n\n");
    console.log("Hooks successfully moved out of useEffect!");
  } else {
    console.error("Could not find insertTarget");
  }
} else {
  console.error("Could not find extractedHooks");
}

fs.writeFileSync('src/app/components/InteractiveGlobe.tsx', code);
