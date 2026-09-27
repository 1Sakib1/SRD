const fs = require('fs');

const indexPath = 'index.html';
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Replace the OG image
indexContent = indexContent.replace(
  '<meta property="og:image" content="https://admin.litterpin.org/litterpin-logo-transparent.png" />',
  '<meta property="og:image" content="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200&h=630&fit=crop" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />'
);

// Replace the Twitter image
indexContent = indexContent.replace(
  '<meta property="twitter:image" content="https://admin.litterpin.org/litterpin-logo-transparent.png" />',
  '<meta property="twitter:image" content="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200&h=630&fit=crop" />'
);

fs.writeFileSync(indexPath, indexContent);
console.log('Fixed OG images');
