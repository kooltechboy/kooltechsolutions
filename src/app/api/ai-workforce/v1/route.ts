import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { aiChatSchema } from "@/lib/validation";
import {
  validationError,
  serverError,
  rateLimitError,
} from "@/lib/errors";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // ── Rate limiting: 30 messages per IP per minute ───────────────────────────
  const ip = getClientIp(req);
  const rl = rateLimit(`ai-chat:${ip}`, { limit: 30, windowSecs: 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    // ── Input validation ───────────────────────────────────────────────────────
    const body = await req.json();
    const parsed = aiChatSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { messages, agentName, agentRole, context } = parsed.data;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return serverError(new Error("AI API key not configured"), "ai-chat");
    }

    // ── Portal/Admin agent auth check ──────────────────────────────────────────
    // Cortex (portal) and Nexus (admin) agents require authentication.
    const restrictedAgents = ["Cortex", "Nexus"];
    if (agentName && restrictedAgents.includes(agentName)) {
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        const { NextResponse } = await import("next/server");
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
    }

    const systemInstruction = `You are ${agentName ?? "Kira"}, the ${agentRole ?? "AI Workforce"} for KoolTech Solutions — a premium MSP serving the Dominican Republic, USA, Canada and the Caribbean.
Current page context: ${JSON.stringify(context ?? {})}

PERSONALITY:
- Professional, warm, and engaging — never robotic.
- Use at most one subtle emoji per response.
- Be proactive: ask clarifying questions to understand the visitor's needs.

CORE MISSIONS:
- Kira (Concierge): Greet visitors, understand their IT needs, capture lead info (name, email, company, interest).
- Max (Architect): Answer complex technical questions about cybersecurity, cloud, networking, and infrastructure.
- Aria (Coordinator): Help schedule consultations and demos, set appointments.

SERVICES YOU OFFER:
- Managed IT Services & 24/7 Help Desk
- Cybersecurity (SIEM, SOC, Penetration Testing, Compliance)
- Cloud Solutions (Microsoft 365, Azure, AWS, Google Workspace)
- Network Design & Management
- VoIP & Unified Communications
- IT Consulting & Virtual CTO

Always offer to connect the visitor with a KoolTech engineer for a free consultation. If they provide contact details, acknowledge that a team member will reach out.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.75,
      },
    });

    // Build history (all messages except the last user message)
    const history = messages
      .slice(0, -1)
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

    const currentMessage = messages[messages.length - 1].content;
    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(currentMessage);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
            }
          }
          controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`));
          controller.close();
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : "Stream error";
          console.error("[AI Chat] Stream error:", message);
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
      },
    });
  } catch (err) {
    return serverError(err, "ai-chat");
  }
}
