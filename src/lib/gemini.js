import { GoogleGenAI } from "@google/genai";

// Initialize the API with your Vite env variable
const genAI = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function detectRubbishInImage(base64Data, mimeType) {
  // Use gemini-1.5-flash for speed and cost-efficiency in detection tasks
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Identify any rubbish or waste in this image. List the items found and provide a brief suggestion for correct disposal (e.g., recycling, landfill, or green waste).";

  const imagePart = {
    inlineData: {
      data: base64Data, // Expecting just the base64 string, no prefix
      mimeType
    },
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Detection Error:", error);
    return "Failed to analyze image.";
  }
}