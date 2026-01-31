
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * MOCA AI Curator Service
 * Handles conversational queries about the museum.
 */
export const sendMessageToCurator = async (message: string, history: Array<{role: 'user' | 'model', text: string}>) => {
  // Ensure we have an API key. 
  const apiKey = (process.env as any).GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("AI Curator: API_KEY is missing from environment variables.");
    return "I apologize, but my connection to the museum's knowledge base hasn't been established yet (Missing API Key).";
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
      /**
       * OPTIMIZATION: Limit history to last 6 messages (3 exchanges) for faster processing
       * GEMINI API RULES:
       * 1. The 'contents' array must alternate between 'user' and 'model'.
       * 2. The first message in the array MUST be a 'user' message.
       */
      const recentHistory = history.slice(-6); // Only keep last 6 messages
      const formattedHistory = recentHistory
          .filter((msg, idx) => !(idx === 0 && msg.role === 'model'))
          .map(msg => ({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text }]
          }));

      // Use fastest Gemini model with optimized settings for speed
      const response = await Promise.race([
          ai.models.generateContent({
              model: 'gemini-1.5-flash', // Fastest model for quick responses
              contents: [
                  ...formattedHistory, 
                  { role: 'user', parts: [{ text: message }] }
              ],
              config: {
                  systemInstruction: SYSTEM_INSTRUCTION,
                  temperature: 0.3, // Lower temperature = faster, more deterministic
                  topP: 0.8, // Reduced for faster responses
                  topK: 20, // Reduced for faster responses
                  maxOutputTokens: 300, // Limit response length for speed
              }
          }),
          // Timeout after 10 seconds
          new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
      ]) as any;
      
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
      
      if (error.message?.includes("timeout")) {
          return "I'm taking longer than usual to respond. Please try asking your question again.";
      }
      
      return "I apologize, but I am experiencing a temporary connection issue with the museum archives. Please try asking me again in a moment.";
  }
};