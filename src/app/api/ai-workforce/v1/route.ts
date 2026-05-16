import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key Missing' }), { status: 500 });
    }

    const google = createGoogleGenerativeAI({ apiKey });

    const result = await streamText({
      model: google('gemini-2.0-flash'),
      messages,
      system: "You are the KoolTech Solutions AI Workforce. Act as an expert IT Solutions architect.",
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('AI V1 Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error.' }), { status: 500 });
  }
}
