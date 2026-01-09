import { NextRequest, NextResponse } from "next/server";
import { StudentProfile } from "@/lib/types";
import { generatePaths } from "@/lib/engines/path-matcher";

export async function POST(request: NextRequest) {
    try {
        const profile: StudentProfile = await request.json();

        // Generate 3 paths using our matching engine
        const paths = generatePaths(profile);

        return NextResponse.json({ paths });
    } catch (error) {
        console.error("Error generating paths:", error);
        return NextResponse.json(
            { error: "Failed to generate paths" },
            { status: 500 }
        );
    }
}
