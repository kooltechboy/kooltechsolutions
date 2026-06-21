import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { blogRefineSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import {
  validationError,
  serverError,
  rateLimitError,
  unauthorizedError,
  forbiddenError,
} from "@/lib/errors";

export async function POST(req: Request) {
  // ── Rate limiting: 20 requests per IP per hour ─────────────────────────────
  const ip = getClientIp(req);
  const rl = await rateLimit(`blog-refine:${ip}`, { limit: 20, windowSecs: 60 * 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    // ── Authentication + admin role check ──────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return unauthorizedError();

    // Only admin-role users may access the blog AI features
    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const userEmail = user.email?.toLowerCase() ?? "";
    if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(userEmail)) {
      return forbiddenError();
    }

    // ── Input validation ───────────────────────────────────────────────────────
    const body = await req.json();
    const parsed = blogRefineSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { content, instruction, mode, title } = parsed.data;

    if (mode !== "generate" && !content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return serverError(new Error("AI API key not configured"), "blog-refine");
    }

    // Instantiate inside the handler — not at module level
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    let prompt = "";

    if (mode === "complete") {
      prompt = `
        Analyze this blog content and generate professional metadata for a CMS.
        Content: ${content}

        IMPORTANT: Return ONLY a valid JSON object. No markdown blocks, no commentary.
        {
          "excerpt": "A high-impact 1-2 sentence summary for SEO",
          "category": "The best category (e.g. Cybersecurity, Cloud Computing, AI & Automation, Managed IT, Digital Strategy)",
          "read_time": "Estimated read time in minutes (e.g. '5 min')",
          "slug": "an-seo-friendly-url-slug-based-on-the-content"
        }
      `;
      const result = await model.generateContent(prompt);
      const jsonText = result.response.text().replace(/```json|```/g, "").trim();
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      const cleanedJson = jsonMatch ? jsonMatch[0] : jsonText;
      return NextResponse.json({ metadata: JSON.parse(cleanedJson) });
    }

    if (mode === "generate") {
      prompt = `
        Act as Daniel Joseph Williams, the Lead Content Strategist and Executive Editor for Kool Tech Solutions.
        Your task is to write a high-authority, research-backed technical article based on this title: "${title}".

        EDITORIAL STANDARDS & FRAMEWORKS:
        1. THE INVERTED PYRAMID: Start with the most critical value/finding.
        2. AIDA FRAMEWORK: Attention → Interest → Desire → Action.
        3. HIERARCHICAL STRUCTURE: Use a strict H1 > H2 > H3 hierarchy.
        4. DATA-FIRST: Use Markdown Tables for comparisons, specs, and cost-benefit analyses.
        5. READABILITY: Keep sentences concise. Bold key industry terms and metrics.
        6. CARIBBEAN CONTEXT: Integrate regional relevance (CARICOM, regional data residency).

        TECHNICAL REQUIREMENTS:
        - Reference actual standards (ISO 27001, NIST 800-53, SOC2 Type II, CIS Controls).
        - Include a "Key Takeaways" box at the top (Executive Summary).
        - Include a "Recommended Action Plan" at the end.

        User instruction: ${instruction ?? "Make it an authoritative industry report."}

        Return ONLY the Markdown content.
      `;
    } else {
      prompt = `
        You are Daniel Joseph Williams, Elite Editorial Director.
        Refine the provided content to meet "High-Authority Publication" standards.

        Tasks:
        - Apply the Inverted Pyramid structure.
        - Convert data comparisons into structured Markdown Tables.
        - Enhance "Proof Points" with technical reasoning.
        - Optimize for SEO with a natural, expert voice.
        - Add a "Pro-Tip" or "Expert Insight" callout where relevant.

        Original Content:
        ${content}

        Instruction: ${instruction ?? "Refine this to a professional standard."}
      `;
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ refinedContent: text });
  } catch (err) {
    return serverError(err, "blog-refine");
  }
}
