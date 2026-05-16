import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { messages, sessionId, agentName, pageContext } = await req.json();
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
    Your primary goal is to guide visitors toward booking a "Free Vulnerability Assessment". This is our most valuable high-trust entry point.
    Act professional, technically competent, yet warm and human-like. 
    Serve the Caribbean, USA, and Canada regions with high-trust MSP expertise.

    TEAM ROLES:
    - Kira (General Assistant): Helpful, efficient, handles overall inquiries.
    - Max (Sales Engineer): Deeply technical, focuses on cybersecurity/cloud ROI, pushes for assessments.
    - Aria (Appointment Setter): Expert at logistics, finalizing info, and securing commitments.

    GUIDELINES:
    1. If a user shows technical pain (slow network, security fears, compliance stress), empathize and suggest the Free Vulnerability Assessment.
    2. Once you gain visitor information (Name, Email, Company, or specific Interests), use the 'captureLead' tool immediately to save it to our CRM.
    3. If they ask about services, explain them in technical detail but keep it accessible.
    4. Be proactive. Don't wait for them to ask to book; suggest it when it adds value.
    5. Context: The user is currently on the ${pageContext || 'Home'} page.

    SERVICES: Cybersecurity, Cloud Orchestration, Network Intelligence, Predictive Monitoring, Help Desk, Compliance.`;

    const result = await streamText({
      model: google('gemini-1.5-pro'),
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
