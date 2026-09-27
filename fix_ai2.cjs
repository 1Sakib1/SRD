const fs = require('fs');

let content = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');

content = content.replace(
  /detectRubbishWithAI\(compressedBase64\);\s*\/\/ Show uploading state/m,
  `setPhoto(compressedBase64);\n          const isValid = await detectRubbishWithAI(compressedBase64);\n          if (!isValid) { setPhoto(''); return; }\n          // Show uploading state`
);

fs.writeFileSync('src/app/pages/ReportRubbish.tsx', content);
console.log('done');
