import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, agentName, agentRole, context } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return new Response('Neural configuration missing.', { status: 500 });
    }

    const systemInstruction = `You are ${agentName}, the ${agentRole} for KoolTech Solutions — a premium MSP serving the Dominican Republic, USA, Canada and the Caribbean.
Current page context: ${JSON.stringify(context)}

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
    
    // systemInstruction MUST go in getGenerativeModel, not startChat
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.75,
      },
    });

    // Build chat history (all messages except the last user message)
    const history = messages.slice(0, -1)
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

    const currentMessage = messages[messages.length - 1].content;

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(currentMessage);

    // Stream response in the format expected by ai/react useChat
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
          // Signal stream end
          controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`));
          controller.close();
        } catch (e: any) {
          console.error('Neural Stream Error:', e.message);
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      },
    });

  } catch (error: any) {
    console.error('Neural Gateway Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
