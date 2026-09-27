const fs = require('fs');

let content = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');

// Update detectRubbishWithAI signature
content = content.replace(
  `const detectRubbishWithAI = async (base64Photo: string) => {`,
  `const detectRubbishWithAI = async (base64Photo: string): Promise<boolean> => {`
);

// Update returns in detectRubbishWithAI
content = content.replace(
  `        return;
      }

      setIsAIAnalyzing`,
  `        return false;
      }

      setIsAIAnalyzing`
);

content = content.replace(
  `        toast.error("No rubbish detected", {
          description: "Gemini couldn't identify valid waste in this photo. Please try a clearer shot.",
          icon: <XCircle className="text-red-500" />
        });
        return;
      }`,
  `        toast.error("No rubbish detected", {
          description: "Gemini couldn't identify valid waste in this photo. Please try a clearer shot.",
          icon: <XCircle className="text-red-500" />
        });
        return false;
      }`
);

content = content.replace(
  `      } else {
        toast.error("Invalid rubbish type", {
          description: "The detected items don't match our reporting categories."
        });
      }

    } catch (error: any) {`,
  `      } else {
        toast.error("Invalid rubbish type", {
          description: "The detected items don't match our reporting categories."
        });
        return false;
      }
      return true;
    } catch (error: any) {`
);

content = content.replace(
  `      console.error("AI Error:", error);
      toast.error("AI Analysis failed", {
        description: error.message || "Please enter details manually."
      });
    } finally {`,
  `      console.error("AI Error:", error);
      toast.error("AI Analysis failed", {
        description: error.message || "Please enter details manually."
      });
      return true; // Return true to allow manual entry fallback
    } finally {`
);


// Update handlePhotoUpload logic
content = content.replace(
  `        try {
          const compressedBase64 = await compressImage(file);
          
          // Let AI analyze the base64 version IMMEDIATELY (in parallel)
          detectRubbishWithAI(compressedBase64);
          
          // Show uploading state
          const toastId = toast.loading('Uploading image to secure storage...');`,
  `        try {
          const compressedBase64 = await compressImage(file);
          
          // Wait for AI to validate BEFORE uploading
          const isValid = await detectRubbishWithAI(compressedBase64);
          
          if (!isValid) {
            setPhoto('');
            return;
          }
          
          // Show uploading state
          const toastId = toast.loading('Uploading image to secure storage...');`
);

fs.writeFileSync('src/app/pages/ReportRubbish.tsx', content);
console.log('done');
