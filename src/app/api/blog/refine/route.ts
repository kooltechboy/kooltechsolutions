
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { content, instruction, mode, title } = await req.json();

    if (mode !== 'generate' && !content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";

    if (mode === 'complete') {
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
      const res = await result.response;
      const jsonText = res.text().replace(/```json|```/g, "").trim();
      
      // Strict JSON extraction
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      const cleanedJson = jsonMatch ? jsonMatch[0] : jsonText;
      
      return NextResponse.json({ metadata: JSON.parse(cleanedJson) });
    }

    if (mode === 'generate') {
      prompt = `
        Act as Daniel Joseph Williams, the Lead Content Strategist and Executive Editor for Kool Tech Solutions. 
        Your task is to write a high-authority, research-backed technical article based on this title: "${title}".
        
        EDITORIAL STANDARDS & FRAMEWORKS:
        1. THE INVERTED PYRAMID: Start with the most critical value/finding. The first two paragraphs must summarize the 'Why' and the 'Value' for a C-suite executive.
        2. AIDA FRAMEWORK: Ensure the article flows through Attention (Hook), Interest (Data/Facts), Desire (Solution Benefits), and Action (Clear CTA).
        3. HIERARCHICAL STRUCTURE: Use a strict H1 > H2 > H3 hierarchy. No skipped levels.
        4. DATA-FIRST: If there is data, technical specs, or comparisons, ALWAYS render them in Markdown Tables. Use tables for cost-benefit analyses, technical specs, or step-by-step frameworks.
        5. READABILITY: Keep sentences concise. Use bolding for key industry terms and metrics.
        6. CARIBBEAN CONTEXT: Integrate regional relevance (e.g., CARICOM digital initiatives, regional data residency, island-specific infrastructure challenges).
        
        TECHNICAL REQUIREMENTS:
        - Reference actual standards (e.g., ISO 27001, NIST 800-53, SOC2 Type II, CIS Controls).
        - Include a "Key Takeaways" box at the top (Executive Summary).
        - Include a "Recommended Action Plan" section at the end.
        
        User instruction: ${instruction || 'Make it an authoritative industry report.'}
        
        Return ONLY the Markdown content.
      `;
    } else {
      prompt = `
        You are Daniel Joseph Williams, Elite Editorial Director. 
        Refine the provided content to meet "High-Authority Publication" standards.
        
        Tasks:
        - Apply the Inverted Pyramid structure.
        - DATA-DRIVEN: Identify sections where data or comparisons are being made and convert them into beautifully structured Markdown Tables.
        - Enhance "Proof Points" (ensure claims are backed by technical reasoning).
        - Optimize for SEO while maintaining a natural, expert voice.
        - Add a "Pro-Tip" or "Expert Insight" callout box where relevant.
        
        Original Content:
        ${content}
        
        Instruction: ${instruction || 'Refine this to a professional standard.'}
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ refinedContent: text });
  } catch (error: any) {
    console.error("AI Refine Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
