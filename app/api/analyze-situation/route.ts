import { NextRequest, NextResponse } from "next/server";
import { SituationType } from "@/lib/types";
import { analyzeSituation } from "@/lib/ai-reasoning/situation-analyzer";

export async function POST(request: NextRequest) {
    try {
        const { situation, context } = await request.json();

        if (!situation) {
            return NextResponse.json(
                { error: "Situation type is required" },
                { status: 400 }
            );
        }

        // Use Azure OpenAI to analyze the situation and determine flow
        const analysis = await analyzeSituation(situation as SituationType, context);

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("Error analyzing situation:", error);
        return NextResponse.json(
            { error: "Failed to analyze situation" },
            { status: 500 }
        );
    }
}
