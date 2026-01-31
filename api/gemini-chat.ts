import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ message: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing from environment variables');
    return res.status(500).json({ 
      message: 'AI service configuration error. Please contact the administrator.' 
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: `You are the AI Curator for MOCA Gandhinagar. Always refer to the museum as "MOCA Gandhinagar" or "MOCA" - never "Veer Residency" (that's just the building location).

Key facts:
- Location: Veer Residency, Gandhinagar Mahudi Highway, Gujarat, India
- Hours: Tue-Sun, 10:30 AM-6:00 PM (closed Mondays)
- Tickets: FREE, pre-registration recommended
- Parking: Free at Veer Residency
- Contact: mocagandhinagar@gmail.com

Keep responses brief (2-3 sentences max). Reply in Hindi/Gujarati if asked. Be helpful and welcoming.`
    });

    // Format history for Gemini API
    const formattedHistory = (history || []).slice(-6).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Build chat history
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 300,
      },
    });

    // Send message with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );

    const result = await Promise.race([
      chat.sendMessage(message),
      timeoutPromise
    ]) as any;

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('Gemini API Error:', {
      message: error?.message,
      error: error,
    });

    if (error?.message?.includes('timeout')) {
      return res.status(504).json({ 
        message: "I'm taking longer than usual to respond. Please try again." 
      });
    }

    if (error?.message?.includes('403') || error?.message?.includes('401')) {
      return res.status(401).json({ 
        message: 'API key is invalid or restricted. Please contact the administrator.' 
      });
    }

    return res.status(500).json({ 
      message: `AI service error: ${error?.message || 'Unknown error'}. Please try again.` 
    });
  }
}

