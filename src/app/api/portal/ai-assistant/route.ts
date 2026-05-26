import { createClient } from "@/utils/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    // Fetch user context: tickets
    const { data: tickets } = await supabase
      .from("tickets")
      .select("id, subject, status, priority, created_at")
      .eq("client_id", user.id);

    // Fetch user context: services
    const { data: services } = await supabase
      .from("client_services")
      .select("service_name, price, status, next_billing_date")
      .eq("client_id", user.id);

    // Format context for the model
    const ticketContext = tickets && tickets.length > 0
      ? tickets.map(t => `- Ticket #${t.id.slice(0, 8)}: "${t.subject}" [Status: ${t.status}, Priority: ${t.priority}] (Created: ${new Date(t.created_at).toLocaleDateString()})`).join("\n")
      : "No support tickets on file.";

    const serviceContext = services && services.length > 0
      ? services.map(s => `- ${s.service_name} ($${s.price}/${s.status === "active" ? "Active" : s.status}) (Renewal: ${s.next_billing_date})`).join("\n")
      : "No active subscriptions on file.";

    const systemPrompt = `You are Kira, the intelligent virtual support engineer at Kool Tech Solutions.
Your goal is to answer client queries about their active tickets, subscriptions, or general IT inquiries with extreme precision.

Below is the real-time context of the client currently logged in:
------------------
CLIENT EMAIL: ${user.email}

ACTIVE SERVICES:
${serviceContext}

SUPPORT TICKETS:
${ticketContext}
------------------

Guidelines:
1. Always be professional, helpful, and technically precise.
2. If the user asks about the status of their tickets, reference their ticket context.
3. If they ask about services or subscriptions, refer to their active services.
4. Keep answers concise. Do not use markdown headers if not necessary. Use clean lists.`;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ text: "AI Assistant is currently offline. Please configure API keys." });
    }

    // Initialize GenAI
    const ai = new GoogleGenAI({ apiKey });
    
    // Map history to Google GenAI format (role: user/model)
    const contents = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    // Call generateContent
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt
      }
    });

    const aiText = response.text || "I apologize, but I could not formulate a response at this moment.";
    return NextResponse.json({ text: aiText });
  } catch (err) {
    console.error("AI Assistant API Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
