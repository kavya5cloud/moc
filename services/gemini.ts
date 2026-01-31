
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * MOCA AI Curator Service
 * Handles conversational queries about the museum.
 */
export const sendMessageToCurator = async (message: string, history: Array<{role: 'user' | 'model', text: string}>) => {
  // Get API key from environment (works in both Vite and Vercel)
  const apiKey = (import.meta.env?.VITE_GEMINI_API_KEY || (process.env as any)?.GEMINI_API_KEY) as string | undefined;
  
  if (!apiKey) {
    console.error("AI Curator: GEMINI_API_KEY is missing from environment variables.");
    console.error("Available env vars:", {
      hasVite: !!import.meta.env?.VITE_GEMINI_API_KEY,
      hasProcess: !!(process.env as any)?.GEMINI_API_KEY
    });
    return "I apologize, but my connection to the museum's knowledge base hasn't been established yet (Missing API Key). Please contact the administrator.";
  }

  try {
      const ai = new GoogleGenAI({ apiKey });

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

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
      );

      // Use fastest Gemini model with optimized settings for speed
      const apiCall = ai.models.generateContent({
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
      });

      const response = await Promise.race([apiCall, timeoutPromise]);
      
      // Check if response has text property
      if (!response || typeof response !== 'object' || !('text' in response)) {
          console.error("Unexpected response format:", response);
          throw new Error("Empty or invalid response from Gemini API");
      }
      
      const responseText = (response as any).text;
      if (!responseText || typeof responseText !== 'string') {
          throw new Error("Empty response text from Gemini API");
      }
      
      return responseText;
  } catch (error: any) {
      console.error("AI Service Error Details:", {
          message: error?.message,
          error: error,
          stack: error?.stack
      });
      
      // Provide more specific feedback if it's a known error type
      if (error?.message?.includes("403") || error?.message?.includes("401")) {
          return "I'm having trouble accessing my systems. It seems my security credentials (API Key) might be restricted or invalid. Please contact the administrator.";
      }
      
      if (error?.message?.includes("timeout")) {
          return "I'm taking longer than usual to respond. Please try asking your question again.";
      }

      if (error?.message?.includes("404") || error?.message?.includes("model")) {
          return "The AI service is temporarily unavailable due to a configuration issue. Please try again later.";
      }
      
      // Return a more helpful error message
      return `I'm experiencing a connection issue. Error: ${error?.message || 'Unknown error'}. Please try again in a moment.`;
  }
};