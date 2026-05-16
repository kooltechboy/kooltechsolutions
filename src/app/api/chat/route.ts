import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { messages, sessionId, agentName, pageContext, telemetry } = await req.json();
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
    5. Use the Telemetry context to personalize advice (e.g., if they are on a mobile device, mention mobile workforce security).`;

    const result = await streamText({
      model: google('gemini-1.5-pro') as any,
      messages,
      system: systemPrompt,
      tools: {
        captureLead: tool({
          description: 'Saves visitor information into the KoolTech CRM (leads table). Use this when you identify name, email, company, or specific service interests.',
          parameters: z.object({
            first_name: z.string().describe('First name of the lead'),
            last_name: z.string().optional().describe('Last name of the lead'),
            email: z.string().email().describe('Email address of the lead'),
            phone: z.string().optional().describe('Phone number'),
            company_name: z.string().optional().describe('Company name'),
            service_interest: z.string().describe('The primary service or assessment they are interested in'),
            notes: z.string().describe('Detailed summary of their needs, queries, and conversation context for the sales team')
          }),
          execute: async (args) => {
            console.log('CAPTURING LEAD:', args);
            const { data, error } = await supabase.from('leads').insert({
              first_name: args.first_name,
              last_name: args.last_name || 'Visitor',
              email: args.email,
              phone: args.phone,
              company_name: args.company_name,
              service_interest: args.service_interest,
              notes: args.notes,
              status: 'new'
            });
            if (error) throw error;
            return { success: true, message: 'Lead intelligence successfully synchronized with CRM.' };
          }
        }),
      },
      async onFinish({ text }) {
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
    return new Response(JSON.stringify({ error: 'Internal Server Error.' }), { status: 500 });
  }
}
