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

    // Verify user is admin
    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const userEmail = user.email?.toLowerCase() ?? "";
    if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { ticketId } = await request.json();
    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    // Fetch ticket details
    const { data: ticket } = await supabase
      .from("tickets")
      .select("subject, description, client_id")
      .eq("id", ticketId)
      .single();

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Fetch public and internal message history for context
    const { data: messages } = await supabase
      .from("ticket_messages")
      .select("message, sender_id, is_internal_note")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    // Format chat transcript
    let transcript = `TICKET SUBJECT: ${ticket.subject}\nORIGINAL DESCRIPTION: ${ticket.description}\n\n`;
    if (messages && messages.length > 0) {
      transcript += "CORRESPONDENCE & NOTES:\n";
      messages.forEach((m, idx) => {
        const role = m.sender_id === ticket.client_id ? "Client" : "Support Engineer";
        const noteType = m.is_internal_note ? " [INTERNAL NOTE]" : "";
        transcript += `${idx + 1}. [${role}${noteType}]: ${m.message}\n`;
      });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ suggestion: "API key not configured" });
    }

    // Call Gemini 2.5 Flash
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{
            text: `You are an expert IT support engineer copilot at KoolTech Solutions.
Generate a professional, helpful, and technically accurate reply to the client for this ticket.
If there are internal notes, use them to formulate your answer, but remember that the response will be sent directly to the client (do not mention internal notes or flags).
Keep the response clear, concise, and structured. Do not use markdown headers, just plain text with clean spacing.

Ticket context:
${transcript}`
          }]
        }
      ]
    });

    const suggestion = response.text?.trim() || "No suggestion could be generated.";
    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error("AI Reply Suggestion API Error:", err);
    return NextResponse.json({ error: "Failed to generate reply suggestion" }, { status: 500 });
  }
}
