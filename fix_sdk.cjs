const fs = require('fs');

const path = 'src/app/pages/ReportRubbish.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldRegex = /const interaction = await ai\.interactions\.create\(\{[\s\S]*?\}\);\s*const responseText = interaction\.output_text \|\| "";/;

const newCode = `const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [
            prompt,
            {
              inlineData: {
                data: base64Photo.split(',')[1],
                mimeType: "image/jpeg"
              }
            }
          ]
        });
        
        const responseText = response.text || "";`;

content = content.replace(oldRegex, newCode);

fs.writeFileSync(path, content);
console.log('Fixed SDK method calls');
