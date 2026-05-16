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
      return new Response('Neural configuration missing.', { status: 500 });
    }

    const google = createGoogleGenerativeAI({ apiKey });

    const result = await streamText({
      model: google('gemini-flash-latest') as any,
      messages,
      system: `You are ${agentName}, the ${agentRole} for KoolTech Solutions.
      Your goal is to be proactive, human-like, and high-value.
      Current Context: ${JSON.stringify(context)}
      
      PERSONALITY:
      - Professional yet warm and engaging.
      - Use subtle micro-emojis (max 1 per response).
      - Do not sound like a generic bot. Show expertise.
      
      CORE MISSIONS:
      - Kira: Identify visitor needs and capture lead info (Name, Email, Interest).
      - Max: Solve complex technical infrastructure and security queries.
      - Aria: Close the loop by setting consultations and appointments.
      
      STRATEGY:
      - If the user shows high intent, use the captureLead tool.
      - If they want a meeting, use the bookConsultation tool.
      - If they have a technical problem, use Max's persona for support.`,
      tools: {
        captureLead: tool({
          description: 'Captures visitor contact information for lead nurturing.',
          parameters: z.object({
            name: z.string().describe('Full name of the lead'),
            email: z.string().email().describe('Professional email address'),
            interest: z.string().describe('Specific solution or service of interest'),
            company: z.string().optional().describe('Company name if provided')
          }),
          execute: async ({ name, email, interest, company }) => {
            const supabase = await createClient();
            const { error } = await supabase.from('leads').insert({
              full_name: name,
              email,
              service_interest: interest,
              company_name: company || 'Not provided',
              source: 'AI Workforce - ' + agentName
            });
            return error ? 'Neural sync failed.' : 'Lead intelligence secured for ' + name;
          }
        }),
        bookConsultation: tool({
          description: 'Sets a placeholder for a high-ticket consulting session.',
          parameters: z.object({
            date: z.string().describe('Proposed date and time'),
            topic: z.string().describe('The core topic of the consultation')
          }),
          execute: async ({ date, topic }) => {
            return `I have initialized a consultation request for ${date} regarding ${topic}. Our engineering lead will finalize this with you via email shortly.`;
          }
        })
      },
      toolChoice: 'auto'
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
