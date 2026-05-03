import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { messages, sessionId, agentName } = await req.json();
    const currentSessionId = sessionId || crypto.randomUUID();

    // Log User message
    const userMessage = messages[messages.length - 1];
    if (supabaseUrl && supabaseUrl !== 'https://your-project-ref.supabase.co') {
      await supabase.from('agent_logs').insert({
        session_id: currentSessionId,
        role: 'user',
        content: userMessage.content,
        agent_name: agentName || 'Kira'
      });
    }

    // Call Google Gemini using Vercel AI SDK
    const result = streamText({
      model: google('gemini-1.5-flash'),
      messages,
      system: "You are Kira, a professional AI Assistant for Kool Tech Solutions (an MSP serving the Caribbean, USA, and Canada). Provide concise, helpful IT and MSP related responses. Mention our services: Cybersecurity, Cloud, Network Management, 24/7 Monitoring, Help Desk, and Compliance.",
      async onFinish({ text }) {
        // Log Agent Reply
        if (supabaseUrl && supabaseUrl !== 'https://your-project-ref.supabase.co') {
          await supabase.from('agent_logs').insert({
            session_id: currentSessionId,
            role: 'agent',
            content: text,
            agent_name: agentName || 'Kira'
          });
        }
      }
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error. Make sure GOOGLE_GENERATIVE_AI_API_KEY is set in .env.local' }), { status: 500 });
  }
}
