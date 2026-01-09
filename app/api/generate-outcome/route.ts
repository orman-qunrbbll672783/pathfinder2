import { NextRequest, NextResponse } from "next/server";
import { generateOutcome } from "@/lib/ai-reasoning/outcome-generator";

export async function POST(request: NextRequest) {
    try {
        const { situation, answers } = await request.json();

        if (!situation) {
            return NextResponse.json(
                { error: "Situation is required" },
                { status: 400 }
            );
        }

        const outcome = await generateOutcome(situation, answers);
        return NextResponse.json(outcome);
    } catch (error) {
        console.error("Error generating outcome:", error);
        return NextResponse.json(
            { error: "Failed to generate outcome" },
            { status: 500 }
        );
    }
}
