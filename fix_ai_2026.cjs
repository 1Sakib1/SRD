const fs = require('fs');

const path = 'src/app/pages/ReportRubbish.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldRegex = /const response = await ai\.models\.generateContent\(\{[\s\S]*?\}\);\s*const responseText = response\.text \|\| "";/;

const newCode = `const interaction = await ai.interactions.create({
          model: "gemini-3.8-flash",
          input: [
            { type: "text", text: prompt },
            {
              type: "image",
              data: base64Photo.split(',')[1],
              mime_type: "image/jpeg"
            }
          ]
        });
        
        const responseText = interaction.output_text || "";`;

content = content.replace(oldRegex, newCode);
fs.writeFileSync(path, content);
console.log('Fixed AI model and SDK usage');
