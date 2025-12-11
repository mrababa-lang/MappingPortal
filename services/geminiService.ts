import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDescription = async (itemName: string, context: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a professional, concise (max 2 sentences) description for a vehicle ${context}: "${itemName}". Do not include quotes.`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate description at this time.";
  }
};

export const suggestModels = async (makeName: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `List 3 popular car model names for the manufacturer "${makeName}".`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};