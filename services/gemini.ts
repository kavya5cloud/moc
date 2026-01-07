
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * Standard Text-based Curator Service
 * Reverted to simple conversational model.
 */
export const sendMessageToCurator = async (message: string, history: Array<{role: 'user' | 'model', text: string}>) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
      const chatHistory = history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [...chatHistory, { role: 'user', parts: [{ text: message }] }],
          config: {
              systemInstruction: SYSTEM_INSTRUCTION
          }
      });
      
      return response.text;
  } catch (error) {
      console.error("AI Service Error:", error);
      return "I apologize, but I am experiencing a temporary connection issue with the museum archives.";
  }
};
