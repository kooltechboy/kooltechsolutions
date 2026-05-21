import { WorkerOptions, cli, defineAgent, llm } from '@livekit/agents';
import { multimodal } from '@livekit/agents-plugin-google';
import * as dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load env from Next.js root if needed
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 
const supabase = createClient(supabaseUrl, supabaseKey);

class AgentTools extends llm.FunctionContext {
  @llm.aiCallable({
    description: "Schedule a live demo or consultation for a potential client.",
  })
  async bookDemo(
    @llm.aiParam({ description: "The client's full name" }) name: string,
    @llm.aiParam({ description: "The client's email address" }) email: string,
    @llm.aiParam({ description: "The service they are interested in" }) service: string,
    @llm.aiParam({ description: "The date for the demo" }) date: string,
    @llm.aiParam({ description: "The time for the demo" }) time: string,
    @llm.aiParam({ description: "The client's phone number", required: false }) phone?: string,
    @llm.aiParam({ description: "Any additional notes", required: false }) message?: string
  ) {
    const first_name = name.split(" ")[0] || "Unknown";
    const last_name = name.split(" ").slice(1).join(" ") || "-";
    const bookingNote = `LIVE DEMO SCHEDULED: ${date} at ${time}`;
    
    const { data, error } = await supabase.from("leads").insert({
      first_name,
      last_name,
      email,
      phone: phone || null,
      service_interest: service,
      notes: `${bookingNote}\n\nClient Message: ${message || "None"}`,
      status: "qualified"
    }).select("id").single();
    
    if (error) return `Error booking demo: ${error.message}`;
    return `Demo booked successfully. Booking ID: ${data.id}.`;
  }

  @llm.aiCallable({
    description: "Check if a specific date has any booked slots.",
  })
  async checkAvailability(
    @llm.aiParam({ description: "The date to check (e.g., 'Oct 15')" }) date: string
  ) {
    const { data, error } = await supabase.from("leads").select("notes").ilike("notes", `%LIVE DEMO SCHEDULED: ${date}%`);
    if (error) return "No booked slots found.";
    const bookedSlots = data.map((lead: any) => {
      const match = lead.notes?.match(/at\s+(.+)$/m);
      return match ? match[1].trim() : null;
    }).filter(Boolean);
    return `Booked slots for ${date}: ${bookedSlots.join(", ") || "None"}`;
  }

  @llm.aiCallable({
    description: "Check the status of an existing support ticket by ID.",
  })
  async checkTicketStatus(
    @llm.aiParam({ description: "The ticket ID to lookup" }) ticketId: string
  ) {
    const { data, error } = await supabase.from("tickets").select("status, subject").eq("id", ticketId).single();
    if (error) return `Ticket not found or error occurred: ${error.message}`;
    return `Ticket "${data.subject}" is currently in status: ${data.status.toUpperCase()}.`;
  }
}

export default defineAgent({
  entry: async (ctx) => {
    await ctx.connect();
    console.log(`[Agent] Connected to room: ${ctx.room.name}`);

    const systemInstruction = `You are the AI Voice Workforce for KoolTech Solutions — a premium MSP serving the Dominican Republic, USA, Canada and the Caribbean. 

CORE BEHAVIORS:
1. Multilingual Support: You fluently understand and speak English and Spanish. Detect the user's language and respond naturally in the same language. If they switch, you switch.
2. Guardrails (R01 Mitigation): You ONLY provide support and scheduling for approved services (Managed IT, Cybersecurity, Cloud, Network Design, VoIP, IT Consulting). If asked about unrelated topics or non-supported tech, politely decline and steer the conversation back to our core offerings. Do not hallucinate capabilities.
3. Tool Confirmation (R03 Mitigation): BEFORE executing the bookDemo tool, you MUST verbally summarize the details (Name, Service, Date, Time) and ask the user to explicitly confirm ("Does this sound correct?").
4. Conversational Voice: You are speaking aloud, not typing. Do not use markdown, bullet points, or long lists. Keep sentences brief. Pause naturally.

Your goal is to converse naturally with the user, answer technical questions, and schedule live demos using your tools.`;
    
    // Start the Gemini Live API multimodal agent
    const agent = new multimodal.MultimodalAgent({
      model: 'models/gemini-2.0-flash-exp', 
      fncCtx: new AgentTools(),
    });

    // We can update the system prompt through session options if instructions aren't provided directly
    // agent.updateSessionOptions({ systemInstruction });

    agent.on('user_started_speaking', () => {
      console.log('[Agent] User started speaking');
    });

    agent.on('agent_started_speaking', () => {
      console.log('[Agent] Agent started speaking');
    });

    agent.start(ctx.room);
  },
});

cli.runApp(new WorkerOptions({ agent: __filename }));


