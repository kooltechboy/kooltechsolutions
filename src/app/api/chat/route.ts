import { streamText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { messages, sessionId, agentName, pageContext, telemetry } = await req.json();
    const currentSessionId = sessionId || "no-session";

    // Diagnostic Heartbeat
    if (messages[messages.length - 1].content.toUpperCase() === 'PING') {
      return new Response(JSON.stringify({ text: 'PONG - Backend is reachable and authenticated.' }), { status: 200 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      console.error('[AI CHAT] CRITICAL ERROR: GOOGLE_GENERATIVE_AI_API_KEY is missing from environment.');
      return new Response(JSON.stringify({ error: 'AI Service configuration missing. Please check API keys.' }), { status: 500 });
    }

    console.log(`[AI CHAT] Request received. Key detected (length: ${apiKey.length})`);
    
    // Log User message
    const userMessage = messages[messages.length - 1];
    try {
      if (supabaseUrl && supabaseUrl !== 'https://your-project-ref.supabase.co') {
        await supabase.from('agent_logs').insert({
          session_id: currentSessionId,
          role: 'user',
          content: userMessage.content,
          agent_name: agentName || 'Kira'
        });
      }
    } catch (dbError) {
      console.warn('[AI CHAT] Logging to Supabase failed, but continuing stream:', dbError);
    }

    const systemPrompt = `You are a member of the Kool Tech Solutions AI Workforce. You are currently acting as ${agentName || 'Kira'}.
    
    MISSION: 
    Your primary goal is to identify visitor needs across our entire service spectrum and guide them toward the most appropriate high-value solution or strategy session.
    Whether they need Zero-Trust Cybersecurity, Cloud Orchestration, Predictive Monitoring, or Compliance auditing, your mission is to be their enterprise architect.
    Act professional, technically competent, yet warm and human-like. 
    Serve the Caribbean, USA, and Canada regions with high-trust MSP expertise.

    TEAM ROLES:
    - Kira (General Assistant): Helpful, efficient, handles overall inquiries and cross-service coordination.
    - Max (Senior Solutions Engineer): Deeply technical, focuses on hardening environments and infrastructure ROI.
    - Aria (Strategic Coordinator): Expert at logistics, securing commitments, and aligning client needs with our engineering team.

    ENVIRONMENTAL CONTEXT (TELEMETRY):
    - Browser/Platform: ${telemetry?.ua || 'Unknown'}
    - Screen Resolution: ${telemetry?.screen || 'Unknown'}
    - Preferred Language: ${telemetry?.lang || 'en-US'}
    - Referrer: ${telemetry?.referrer || 'Direct'}
    - Current Page: ${pageContext || 'Home'}

    GUIDELINES:
    1. Identify technical pain points early. If a user mentions downtime, security fears, or scaling issues, suggest a discovery session for the relevant service.
    2. Once you gain visitor information (Name, Email, Company, or specific Interests), use the 'captureLead' tool immediately to save it to our CRM.
    3. Be an expert on all services: Cybersecurity, Cloud Orchestration, Network Intelligence, Predictive Monitoring, Help Desk, and Compliance.
    4. Be proactive. Suggest specific solutions that match their technical queries.
    5. Use the Telemetry context to personalize advice.

    IMPORTANT: If you use the captureLead tool, always follow up with a verbal confirmation.`;

    console.log('[AI CHAT] Diagnostic: Initializing streamText with gemini-1.5-flash...');
    
    const result = await streamText({
      model: google('gemini-1.5-flash') as any,
      messages,
      system: systemPrompt,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('AI Chat Error (DIAGNOSTIC):', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error.' }), { status: 500 });
  }
}
