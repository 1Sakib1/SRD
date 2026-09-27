const fs = require('fs');

let content = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');

const startIndex = content.indexOf('  const detectRubbishWithAI = async (base64Photo: string)');
const endIndex = content.indexOf('    } catch (error: any) {') + '    } catch (error: any) {\n      console.error("AI Error:", error);\n      toast.error("AI Analysis failed", {\n        description: error.message || "Please enter details manually."\n      });\n      return true;\n    } finally {\n      setIsAIAnalyzing(false);\n    }\n  };\n'.length;

// Wait, I will just use regex to replace the function entirely.

const newFunction = `  const detectRubbishWithAI = async (base64Photo: string): Promise<boolean> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
    if (!apiKey) {
      toast.error("API Key missing", { description: "Please set VITE_GEMINI_API_KEY in your .env file or Vercel settings." });
      return false;
    }

    setIsAIAnalyzing(true);
    setType('');
    setDescription('');

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = \`Analyze this image for public waste/rubbish.
      
      VALID CATEGORIES: \${RUBBISH_TYPES.join(', ')}.

      CRITICAL INSTRUCTIONS:
      1. If the image shows rubbish, assign the most appropriate VALID CATEGORY.
      2. Even if it is a bit ambiguous, categorize it into one of the valid categories. (e.g. boxes -> Paper & Cardboard; plastic bags -> Plastic Waste).
      3. Only return "None" if the image absolutely DOES NOT contain any rubbish at all.

      Respond strictly with a raw JSON object with no markdown formatting:
      {"type": "Category Name or 'None'", "description": "1-sentence description"}\`;

      const interaction = await ai.interactions.create({
          model: "gemini-3.6-flash",
          config: {
            responseMimeType: "application/json"
          },
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
        const parsed = JSON.parse(responseText.trim());
        detectedTypeText = parsed.type || "";
        descText = parsed.description || "";
      } catch (e) {
        console.warn("Failed to parse JSON directly, attempting fallback regex.");
        const typeMatch = responseText.match(/"type"\\s*:\\s*"([^"]+)"/i);
        const descMatch = responseText.match(/"description"\\s*:\\s*"([^"]+)"/i);
        if (typeMatch) detectedTypeText = typeMatch[1].trim();
        if (descMatch) descText = descMatch[1].trim();
      }

      if (detectedTypeText.toLowerCase().includes("none") || !detectedTypeText) {
        setPhoto('');
        toast.error("No rubbish detected", {
          description: "Gemini couldn't identify valid waste in this photo. Please try a clearer shot.",
          icon: <XCircle className="text-red-500" />
        });
        return false;
      }

      const validatedType = RUBBISH_TYPES.find(t => 
        detectedTypeText.toLowerCase().includes(t.split(' ')[0].toLowerCase()) || 
        t.toLowerCase().includes(detectedTypeText.split(' ')[0].toLowerCase())
      );

      if (validatedType) {
        setType(validatedType);
        if (descText) {
          setDescription(descText);
        }
        toast.success("AI Analysis complete!", {
          description: "Rubbish identified and fields populated.",
        });
        return true;
      } else {
        toast.error("Invalid rubbish type", {
          description: "The detected items don't match our reporting categories."
        });
        return false;
      }

    } catch (error: any) {
      console.error("AI Error:", error);
      toast.error("AI Analysis failed", {
        description: error.message || "Please enter details manually."
      });
      return true;
    } finally {
      setIsAIAnalyzing(false);
    }
  };`;

// Use substring to replace it perfectly
const pre = content.substring(0, startIndex);
let postIndex = content.indexOf('const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {');
if (postIndex === -1) postIndex = content.indexOf('  const handlePhotoUpload');
const post = content.substring(postIndex);

fs.writeFileSync('src/app/pages/ReportRubbish.tsx', pre + newFunction + '\n\n' + post);
console.log('done');
