import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { rateLimitError } from "@/lib/errors";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  // Rate limiting: 20 messages per IP per minute
  const ip = getClientIp(request);
  const rl = await rateLimit(`chat-agent:${ip}`, { limit: 20, windowSecs: 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    // Optional auth check for client-specific context
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userContext = "";
    if (user) {
      const { data: tickets } = await supabase
        .from("tickets")
        .select("id, subject, status, priority")
        .eq("client_id", user.id)
        .limit(3);

      const { data: services } = await supabase
        .from("client_services")
        .select("service_name, price, status")
        .eq("client_id", user.id);

      userContext = `
Authenticated User: ${user.email}
Active Services: ${services?.map(s => `${s.service_name} ($${s.price})`).join(", ") || "None"}
Recent Tickets: ${tickets?.map(t => `#${t.id.slice(0, 8)} (${t.subject}: ${t.status})`).join(", ") || "None"}
`;
    }

    const systemPrompt = `You are Kira, the Senior AI Solutions Architect & Executive Concierge for KoolTech Solutions (KTS).
KTS is an elite, tier-1 digital engineering and autonomous AI systems agency serving enterprise clients across the Dominican Republic, Canada, the United States, and the Caribbean.

Core Competencies of KTS:
1. Autonomous AI Systems & Multi-Agent Workflows: Custom LLM pipelines, autonomous lead qualification, generative UI dashboards, agentic integrations.
2. Mission-Critical Cloud Infrastructure: AWS, Azure, GCP, hybrid enterprise setups with sub-15ms latency, IaC (Terraform), Kubernetes.
3. Zero-Trust Cybersecurity & Compliance: Continuous threat containment, SOC 2 Type II, ISO 27001, HIPAA compliance architectures.
4. Enterprise Managed Services (MSP/MSSP): 24/7 proactive telemetry monitoring, automated patching, guaranteed 15-minute emergency SLA.

Your Persona:
- Tone: Technically authoritative, concise, confident, and executive (Linear/Stripe caliber). No patronizing or fluffy sales jargon.
- Format: Clean markdown. Use bullet points and bold technical terms. Keep answers concise (2-4 paragraphs or crisp bullet list).
- Lead Qualification: Use the BANT framework (Budget, Authority, Need, Timeline). If a prospective client describes a project, recommend our dynamic ROI assessment or direct consultation.
- Booking: If they want to schedule a call, tell them they can click "Schedule Technical Consultation" or use our calendar booking interface.
${userContext ? `\nUser Context:\n${userContext}` : ""}`;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        text: "KoolTech AI Concierge is currently operating in offline mode. For immediate enterprise support, please reach out directly to contact@kooltech.solutions or schedule a consultation via our booking calendar."
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const contents = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "I am ready to assist with your engineering and infrastructure architecture.";
    return NextResponse.json({ text: replyText });
  } catch (err) {
    console.error("AI Chat Agent Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
