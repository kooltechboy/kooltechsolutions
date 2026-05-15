
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { content, instruction, mode, title } = await req.json();

    if (mode !== 'generate' && !content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    let prompt = "";

    if (mode === 'generate') {
      prompt = `
        Act as a Senior Research-Based Tech Copywriter for Kool Tech Solutions (a Caribbean MSP). 
        Your task is to write a high-authority, deep-dive technical article based on this title: "${title}".
        
        CRITICAL REQUIREMENTS:
        - DO NOT be generic. Use actual industry concepts (Zero Trust, SASE, NIST Framework, SOC2, HIPAA).
        - Ground the article in Caribbean business realities (regional financial hubs, tourism vulnerability, hurricane resilience, remote island workforces, regional compliance like GDPR/DPA).
        - Use data-driven language and an authoritative professional tone.
        - Structure it with: Engaging H1 Title, executive intro, multiple H2/H3 sections with bullet points, and a powerful conclusion.
        - Include a 'Key Takeaway' summary box at the end.
        - Output the content in clean Markdown.
        
        User context/instruction: ${instruction || 'Make it a comprehensive, research-backed professional guide.'}
        
        Return ONLY the Markdown content.
      `;
    } else {
      prompt = `
        You are a World-Class Professional Copywriter and SEO Editor.
        Task: Refine the provided blog content to follow professional copywriting standards.
        
        Requirements:
        1. Use a professional, authoritative, yet engaging tone.
        2. Ensure proper hierarchical formatting using Markdown (H2, H3, etc.).
        3. Use clear, punchy bullet points where information can be structured.
        4. Improve the "Hook" at the beginning to grab attention.
        5. Ensure smooth transitions between sections.
        6. Optimize for readability (short paragraphs, bold key terms).
        7. Follow this specific instruction if provided: "${instruction || 'General professional refinement'}"
        
        Format Output: Return ONLY the refined Markdown content.
        
        Original Content:
        ${content}
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
