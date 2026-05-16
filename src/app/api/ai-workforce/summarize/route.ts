import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { ticketData, messages } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Neural configuration missing.' }, { status: 500 });
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
        temperature: 0.2, // low temp for analytical output
      },
    });

    const prompt = `
Ticket Subject: ${ticketData.subject}
Ticket Priority: ${ticketData.priority}
Description: ${ticketData.description}

Message History:
${messages.map((m: any) => `${m.sender?.role || 'client'}: ${m.message}`).join('\n')}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ summary: responseText });

  } catch (error: any) {
    console.error('AI Summarization Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
