import { GoogleGenAI } from "@google/genai";
import { LineItem } from '../types';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const checkDrugInteractions = async (items: LineItem[]): Promise<string> => {
  if (items.length < 2) {
    return "Add at least two medicines to check for interactions.";
  }

  const medicines = items.map(i => i.medicineName).join(', ');
  const prompt = `
    Analyze the following list of medicines for potential drug interactions or contraindications: ${medicines}.
    
    Return a concise summary (max 3 sentences) suitable for a pharmacist to review quickly. 
    If there are no major interactions, state that clearly.
    Focus on safety.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "No analysis returned.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to check interactions. Please verify API Key is configured.";
  }
};