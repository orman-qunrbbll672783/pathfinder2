import { NextRequest, NextResponse } from "next/server";
import { AzureOpenAI } from "openai";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
const apiKey = process.env.AZURE_OPENAI_API_KEY || "";
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4";

let client: AzureOpenAI | null = null;
if (endpoint && apiKey) {
    try {
        client = new AzureOpenAI({
            endpoint,
            apiKey,
            apiVersion: "2024-08-01-preview",
            deployment: deploymentName,
        });
    } catch (e) {
        console.error("Failed to init Azure client", e);
    }
}

export async function POST(req: NextRequest) {
    if (!client) {
        return NextResponse.json({ message: "AI is offline. Please check configuration." }, { status: 503 });
    }

    try {
        const body = await req.json();
        const { messages, systemPrompt } = body;

        // Prepend system prompt if valid
        const finalMessages = [
            { role: "system", content: systemPrompt || "You are a helpful AI assistant." },
            ...messages
        ];

        const response = await client.chat.completions.create({
            model: deploymentName,
            messages: finalMessages,
        });

        const reply = response.choices[0]?.message?.content || "No response generated.";

        return NextResponse.json({ message: reply });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ message: "Sorry, I encountered an error processing your request." }, { status: 500 });
    }
}
