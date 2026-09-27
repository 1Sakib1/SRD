const fs = require('fs');

const cssPath = 'src/styles/index.css';
let content = fs.readFileSync(cssPath, 'utf8');

const hoverEffect = `
/* Global Hover Effects for Interactive Icons */
button svg, 
a svg {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

button:hover svg, 
a:hover svg {
  transform: scale(1.15);
}
`;

if (!content.includes('Global Hover Effects')) {
    fs.appendFileSync(cssPath, hoverEffect);
    console.log("Added global hover effect to index.css");
} else {
    console.log("Effect already exists");
}
