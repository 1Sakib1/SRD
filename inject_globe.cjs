const fs = require('fs');

const landingPath = 'src/app/pages/Landing.tsx';
let landingContent = fs.readFileSync(landingPath, 'utf8');

// Add import
if (!landingContent.includes('InteractiveGlobe')) {
  landingContent = "import { InteractiveGlobe } from '../components/InteractiveGlobe';\n" + landingContent;
}

// Replace the hero image block with the new component.
// The block starts with <img src={sydneyHeroImage} and ends before the next div or just closing tag.
// Let's use a regex to replace the img tag.
// We know it looks like:
/*
<img
  src={sydneyHeroImage}
  alt="Sydney Harbour and Opera House"
  className="rounded-2xl shadow-2xl relative border-4 border-white/20 w-full h-auto"
  onError={(e) => {
    // Fallback to Unsplash if custom image not found
    e.currentTarget.src = heroImageFallback;
  }}
/>
*/
const pattern = /<img[\s\S]*?src=\{sydneyHeroImage\}[\s\S]*?\/>/;
const replacement = `<InteractiveGlobe />`;

landingContent = landingContent.replace(pattern, replacement);

fs.writeFileSync(landingPath, landingContent);
console.log("Updated Landing.tsx to use InteractiveGlobe");
