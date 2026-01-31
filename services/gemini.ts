
/**
 * MOCA AI Curator Service
 * Handles conversational queries about the museum via server-side API route.
 */
export const sendMessageToCurator = async (message: string, history: Array<{role: 'user' | 'model', text: string}>) => {
  try {
      const response = await fetch('/api/gemini-chat', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              message,
              history: history.slice(-6), // Limit to last 6 messages for speed
          }),
      });

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.text) {
          throw new Error('Empty response from AI service');
      }
      
      return data.text;
  } catch (error: any) {
      console.error("AI Service Error:", error);
      
      // Provide user-friendly error messages
      if (error?.message?.includes("Failed to fetch") || error?.message?.includes("NetworkError")) {
          return "I'm having trouble connecting to the server. Please check your internet connection and try again.";
      }
      
      if (error?.message?.includes("timeout")) {
          return "I'm taking longer than usual to respond. Please try asking your question again.";
      }

      if (error?.message?.includes("401") || error?.message?.includes("403")) {
          return "I'm having trouble accessing my systems. Please contact the administrator.";
      }
      
      return error?.message || "I'm experiencing a temporary connection issue. Please try again in a moment.";
  }
};