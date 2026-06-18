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

    const { ticketId } = await request.json();
    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    // Fetch the ticket description and verify ownership
    const { data: ticket } = await supabase
      .from("tickets")
      .select("subject, description")
      .eq("id", ticketId)
      .eq("client_id", user.id)
      .single();

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Fetch public message history for context
    const { data: messages } = await supabase
      .from("ticket_messages")
      .select("message, sender_id")
      .eq("ticket_id", ticketId)
      .eq("is_internal_note", false)
      .order("created_at", { ascending: true });

    // Format chat transcript
    let transcript = `TICKET SUBJECT: ${ticket.subject}\nORIGINAL DESCRIPTION: ${ticket.description}\n\n`;
    if (messages && messages.length > 0) {
      transcript += "CORRESPONDENCE:\n";
      messages.forEach((m, idx) => {
        const role = m.sender_id === user.id ? "Client" : "Support Engineer";
        transcript += `${idx + 1}. [${role}]: ${m.message}\n`;
      });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ summary: "AI summary offline (missing API key)" });
    }

    // Call Gemini 2.5 Flash
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{
            text: `Provide a concise 1-2 sentence executive summary of the following IT support ticket and its status. Focus on the core problem and current status/next step.\n\n${transcript}`
          }]
        }
      ]
    });

    const summary = response.text?.trim() || "No summary generated.";
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Ticket Summary API Error:", err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
