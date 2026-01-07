
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * MOCA AI Curator Service
 * Handles conversational queries about the museum.
 */
export const sendMessageToCurator = async (message: string, history: Array<{role: 'user' | 'model', text: string}>) => {
  // Ensure we have an API key. 
  // In the studio environment, process.env.API_KEY is automatically injected.
  const apiKey = (process.env as any).API_KEY;
  
  if (!apiKey) {
    console.error("AI Curator: API_KEY is missing from environment variables.");
    return "I apologize, but my connection to the museum's knowledge base hasn't been established yet (Missing API Key).";
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
      /**
       * GEMINI API RULES:
       * 1. The 'contents' array must alternate between 'user' and 'model'.
       * 2. The first message in the array MUST be a 'user' message.
       * We filter out the initial greeting if it's the first item in the history.
       */
      const formattedHistory = history
          .filter((msg, idx) => !(idx === 0 && msg.role === 'model'))
          .map(msg => ({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text }]
          }));

      const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
              ...formattedHistory, 
              { role: 'user', parts: [{ text: message }] }
          ],
          config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.7,
              topP: 0.95,
              topK: 40
          }
      });
      
      if (!response.text) {
          throw new Error("Empty response from Gemini API");
      }
      
      return response.text;
  } catch (error: any) {
      console.error("AI Service Error:", error);
      
      // Provide more specific feedback if it's a known error type
      if (error.message?.includes("403")) {
          return "I'm having trouble accessing my systems. It seems my security credentials (API Key) might be restricted or invalid.";
      }
      
      return "I apologize, but I am experiencing a temporary connection issue with the museum archives. Please try asking me again in a moment.";
  }
};