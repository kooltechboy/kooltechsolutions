import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { rateLimitAsync, getClientIp } from "@/lib/rateLimit";
import {
  validationError,
  serverError,
  rateLimitError,
  unauthorizedError,
} from "@/lib/errors";

export const runtime = "nodejs";

const summarizeSchema = z.object({
  ticketData: z.object({
    subject: z.string().max(200),
    priority: z.string().max(20),
    description: z.string().max(5000),
  }),
  messages: z
    .array(
      z.object({
        message: z.string().max(2000),
        sender: z
          .object({ role: z.string().max(50).optional() })
          .optional(),
      })
    )
    .max(100),
});

export async function POST(req: Request) {
  // ── Rate limiting: 20 per IP per hour ─────────────────────────────────────
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`ai-summarize:${ip}`, { limit: 20, windowSecs: 60 * 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    // ── Authentication ─────────────────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return unauthorizedError();

    // ── Input validation ───────────────────────────────────────────────────────
    const body = await req.json();
    const parsed = summarizeSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { ticketData, messages } = parsed.data;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return serverError(new Error("AI API key not configured"), "summarize");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const systemInstruction = `You are Max, the Senior Solutions Architect for KoolTech Solutions.
Your task is to analyze the following IT support ticket and its message history.
Provide a concise, professional summary of the issue (1-2 sentences).
Then, provide a Recommended Action (1-2 sentences) for the support engineer to take next.
Format your response exactly as follows:
Suggested Fix: [Your summary here]
Recommended Action: [Your recommended action here]`;

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction,
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.2,
      },
    });

    const prompt = `
Ticket Subject: ${ticketData.subject}
Ticket Priority: ${ticketData.priority}
Description: ${ticketData.description}

Message History:
${messages.map((m) => `${m.sender?.role ?? "client"}: ${m.message}`).join("\n")}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ summary: responseText });
  } catch (err) {
    return serverError(err, "ai-summarize");
  }
}
