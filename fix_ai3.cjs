const fs = require('fs');

let content = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');

const oldPromptBlock = `        const prompt = \`Analyze this image for public waste/rubbish.
          
          VALID CATEGORIES: \${RUBBISH_TYPES.join(', ')}.
  
          CRITICAL INSTRUCTIONS:
          1. If the image clearly shows one of the categories above, return the Type and a 1-sentence Description.
          2. If the image DOES NOT contain rubbish, or the rubbish doesn't fit the categories, or the image is blurry/unclear, you MUST return:
             Type: None
             Description: No valid rubbish detected.
  
          STRICT RETURN FORMAT:
          Type: [Category Name or "None"]
          Description: [Your description]\`;
  
        const interaction = await ai.interactions.create({
            model: "gemini-3.6-flash",
            input: [
              { type: "text", text: prompt },
              {
                type: "image",
                data: base64Photo.split(',')[1],
                mime_type: "image/jpeg"
              }
            ]
          });
          
          const responseText = (interaction.outputs || [])
            .filter((out: any) => out.type === 'text')
            .map((out: any) => out.text)
            .join('\\n');
        
        const typeMatch = responseText.match(/Type:\\s*(.*)/i);
        const descMatch = responseText.match(/Description:\\s*(.*)/i);
  
        const detectedTypeText = typeMatch ? typeMatch[1].trim() : "";
  
        if (detectedTypeText.toLowerCase().includes("none") || !detectedTypeText) {`;

const newPromptBlock = `        const prompt = \`Analyze this image for public waste/rubbish.
          
          VALID CATEGORIES: \${RUBBISH_TYPES.join(', ')}.
  
          CRITICAL INSTRUCTIONS:
          1. If the image shows rubbish, assign the most appropriate VALID CATEGORY.
          2. Even if it is a bit ambiguous, do your best to categorize it into one of the valid categories. (e.g. if you see boxes, choose Paper & Cardboard; if you see plastic bags, choose Plastic Waste).
          3. Only return "None" if the image absolutely DOES NOT contain any rubbish at all (e.g., a photo of a clear sky or an empty desk).
  
          Respond strictly with a raw JSON object with no markdown formatting:
          {"type": "Category Name or 'None'", "description": "1-sentence description"}\`;
  
        const interaction = await ai.interactions.create({
            model: "gemini-3.6-flash",
            input: [
              { type: "text", text: prompt },
              {
                type: "image",
                data: base64Photo.split(',')[1],
                mime_type: "image/jpeg"
              }
            ]
          });
          
          const responseText = (interaction.outputs || [])
            .filter((out: any) => out.type === 'text')
            .map((out: any) => out.text)
            .join('\\n');
        
        let detectedTypeText = "";
        let descText = "";
        
        try {
          const cleanedText = responseText.replace(/\`\`\`json|\\`\\`\\`/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          detectedTypeText = parsed.type || "";
          descText = parsed.description || "";
        } catch (e) {
          // Fallback if model doesn't return JSON
          const typeMatch = responseText.match(/type["\\s:]+([^",\\n]+)/i);
          const descMatch = responseText.match(/description["\\s:]+([^",\\n]+)/i);
          if (typeMatch) detectedTypeText = typeMatch[1].trim();
          if (descMatch) descText = descMatch[1].trim();
        }
  
        if (detectedTypeText.toLowerCase().includes("none") || !detectedTypeText) {`;

content = content.replace(oldPromptBlock, newPromptBlock);

const oldValidationBlock = `        const validatedType = RUBBISH_TYPES.find(t => 
          detectedTypeText.toLowerCase().includes(t.toLowerCase())
        );
  
        if (validatedType) {
          setType(validatedType);
          if (descMatch && descMatch[1]) {
            setDescription(descMatch[1].trim());
          }`;

const newValidationBlock = `        const validatedType = RUBBISH_TYPES.find(t => 
          detectedTypeText.toLowerCase().includes(t.split(' ')[0].toLowerCase()) || 
          t.toLowerCase().includes(detectedTypeText.split(' ')[0].toLowerCase())
        );
  
        if (validatedType) {
          setType(validatedType);
          if (descText) {
            setDescription(descText);
          }`;

content = content.replace(oldValidationBlock, newValidationBlock);

fs.writeFileSync('src/app/pages/ReportRubbish.tsx', content);
console.log('done');
