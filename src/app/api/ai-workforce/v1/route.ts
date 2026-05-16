import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, agentName, agentRole, context } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      console.error('Neural Gateway: GOOGLE_GENERATIVE_AI_API_KEY is missing');
      return new Response('Neural configuration missing.', { status: 500 });
    }

    const google = createGoogleGenerativeAI({ apiKey });

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      messages,
      system: `You are ${agentName}, the ${agentRole} for KoolTech Solutions.
      Be proactive, human-like, and professional. Use subtle micro-emojis.`,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Neural Gateway Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
