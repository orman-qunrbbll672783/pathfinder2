import { AzureOpenAI } from "openai";
import { StudentProfile, Path, AIExplanation } from "./types";

// Azure OpenAI Configuration
const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
const apiKey = process.env.AZURE_OPENAI_API_KEY || "";
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4";

// Initialize client (will be null if credentials not provided)
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
        console.error("Failed to initialize Azure OpenAI client", e);
    }
}

export function isAzureConfigured(): boolean {
    return client !== null;
}

/**
 * Generate path explanation using Azure OpenAI with streaming
 */
export async function* generatePathExplanation(
    profile: StudentProfile,
    path: Path
): AsyncGenerator<string> {
    if (!client) {
        // Fallback to basic explanation if Azure not configured
        yield* generateBasicExplanation(profile, path);
        return;
    }

    const systemPrompt = `You are a decision support assistant for students. Your role is to EXPLAIN, not to decide.

Rules:
1. Never invent statistics or facts
2. Always disclose uncertainty
3. Reference actual data points provided
4. Be supportive but realistic
5. Explain tradeoffs clearly
6. State assumptions explicitly`;

    const userPrompt = `Student Profile:
- Situation: ${profile.situation}
- Country: ${profile.currentCountry}
- Education Stage: ${profile.educationStage}
- Budget: ${profile.budgetLevel}
- Main Fear: ${profile.mainFear}
- Confidence: ${profile.confidenceLevel}

Recommended Path:
- Type: ${path.type}
- Name: ${path.name}
- Fit Score: ${path.fitScore.overall}/100
- Main Risks: ${Object.entries(path.risks)
            .map(([key, risk]) => `${key}: ${risk.severity} (${risk.likelihood}%)`)
            .join(", ")}

Explain:
1. Why this path matches their situation
2. Key tradeoffs they should understand
3. What we're uncertain about
4. What assumptions we made

Keep it conversational, supportive, and under 300 words.`;

    try {
        const stream = await client.chat.completions.create({
            model: deploymentName,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            stream: true,
        });

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
                yield delta;
            }
        }
    } catch (error) {
        console.error("Azure OpenAI error:", error);
        yield* generateBasicExplanation(profile, path);
    }
}

/**
 * Generate risk analysis explanation with streaming
 */
export async function* generateRiskExplanation(
    profile: StudentProfile,
    path: Path
): AsyncGenerator<string> {
    if (!client) {
        yield* generateBasicRiskExplanation(profile, path);
        return;
    }

    const systemPrompt = `You are a risk analysis expert helping students understand potential challenges.

Rules:
1. Be honest but not discouraging
2. Provide actionable mitigation strategies
3. Use real data when available
4. Acknowledge what you don't know`;

    const userPrompt = `Analyze these risks for a student:

Student Context:
- Budget: ${profile.budgetLevel}
- Main Fear: ${profile.mainFear}
- Confidence: ${profile.confidenceLevel}

Risks:
${Object.entries(path.risks)
            .map(
                ([key, risk]) =>
                    `${key.toUpperCase()}: ${risk.severity} severity, ${risk.likelihood}% likelihood
  Description: ${risk.description}
  Mitigation: ${risk.mitigation.join(", ")}`
            )
            .join("\n\n")}

Provide a clear, supportive explanation of these risks and how to manage them. Keep it under 250 words.`;

    try {
        const stream = await client.chat.completions.create({
            model: deploymentName,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            stream: true,
        });

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
                yield delta;
            }
        }
    } catch (error) {
        console.error("Azure OpenAI error:", error);
        yield* generateBasicRiskExplanation(profile, path);
    }
}

/**
 * Generate scenario narrative with streaming
 */
export async function* generateScenarioNarrative(
    profile: StudentProfile,
    path: Path,
    scenarioType: "best" | "likely" | "failure"
): AsyncGenerator<string> {
    if (!client) {
        yield* generateBasicScenario(profile, path, scenarioType);
        return;
    }

    const systemPrompt = `You are a scenario planner helping students visualize their future.

Rules:
1. Be realistic - no fairy tales
2. Include specific milestones and timelines
3. For failure scenarios, always include recovery paths
4. Base scenarios on actual data when possible`;

    const userPrompt = `Create a ${scenarioType} case scenario for this student path:

Path: ${path.name} (${path.type})
Student: ${profile.educationStage} from ${profile.currentCountry}
Budget: ${profile.budgetLevel}

Create a ${scenarioType === "best" ? "optimistic but realistic" : scenarioType === "likely" ? "most probable" : "challenging but recoverable"} scenario spanning 2-5 years.

Include:
- Key milestones with approximate dates
- Decision points
${scenarioType === "failure" ? "- Recovery steps and fallback options" : ""}

Keep it under 200 words, story-like format.`;

    try {
        const stream = await client.chat.completions.create({
            model: deploymentName,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            stream: true,
        });

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
                yield delta;
            }
        }
    } catch (error) {
        console.error("Azure OpenAI error:", error);
        yield* generateBasicScenario(profile, path, scenarioType);
    }
}

/**
 * Generate emergency fallback plan with streaming
 */
export async function* generateEmergencyPlan(
    emergencyType: string,
    profile: StudentProfile,
    currentPath: Path
): AsyncGenerator<string> {
    if (!client) {
        yield `Emergency Plan for ${emergencyType}:\n\n`;
        yield "1. Stay calm and assess the situation\n";
        yield "2. Contact your university/program immediately\n";
        yield "3. Explore alternative options\n";
        yield "4. Seek professional advice\n";
        return;
    }

    const systemPrompt = `You are an emergency planning advisor for students.

Rules:
1. Provide step-by-step actionable plans
2. Include realistic timelines
3. Offer multiple fallback options
4. Be reassuring but practical`;

    const userPrompt = `Emergency: ${emergencyType}

Student Context:
- Current Path: ${currentPath.name}
- Country: ${profile.currentCountry}
- Budget: ${profile.budgetLevel}
- Main Fear: ${profile.mainFear}

Create a recovery plan with:
1. Immediate actions (within 48 hours)
2. Short-term steps (1-2 weeks)
3. Long-term alternatives (1-3 months)
4. Fallback paths

Keep it under 250 words, clear and actionable.`;

    try {
        const stream = await client.chat.completions.create({
            model: deploymentName,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            stream: true,
        });

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
                yield delta;
            }
        }
    } catch (error) {
        console.error("Azure OpenAI error:", error);
        yield "Unable to generate emergency plan. Please contact support.";
    }
}

// Fallback generators when Azure is not configured

async function* generateBasicExplanation(
    profile: StudentProfile,
    path: Path
): AsyncGenerator<string> {
    const text = `This ${path.type} path has been recommended based on your profile.

**Why this path fits:**
- Your ${profile.budgetLevel} budget aligns with the cost structure
- The path addresses your main concern about ${profile.mainFear}
- Fit score: ${path.fitScore.overall}/100

**Key considerations:**
${path.notForYouIf.map((item) => `- Not ideal if ${item}`).join("\n")}

**Main risks to be aware of:**
${Object.entries(path.risks)
            .filter(([_, risk]) => risk.severity !== "low")
            .map(([key, risk]) => `- ${key}: ${risk.description}`)
            .join("\n")}

Note: This is a basic explanation. Connect Azure OpenAI for detailed, personalized insights.`;

    // Simulate streaming
    const words = text.split(" ");
    for (const word of words) {
        yield word + " ";
        await new Promise((resolve) => setTimeout(resolve, 30));
    }
}

async function* generateBasicRiskExplanation(
    profile: StudentProfile,
    path: Path
): AsyncGenerator<string> {
    const text = `Based on your profile, here are the main risks:

${Object.entries(path.risks)
            .map(
                ([key, risk]) =>
                    `**${key.toUpperCase()} Risk (${risk.severity}):**
${risk.description}

Mitigation strategies:
${risk.mitigation.map((m) => `• ${m}`).join("\n")}`
            )
            .join("\n\n")}

Your main fear is ${profile.mainFear}, so pay special attention to related risks.`;

    const words = text.split(" ");
    for (const word of words) {
        yield word + " ";
        await new Promise((resolve) => setTimeout(resolve, 30));
    }
}

async function* generateBasicScenario(
    profile: StudentProfile,
    path: Path,
    scenarioType: "best" | "likely" | "failure"
): AsyncGenerator<string> {
    const scenarios = {
        best: `In the best case scenario, everything aligns perfectly. You get accepted, funding comes through, and you excel in your studies. Within 2-3 years, you complete the program successfully and secure opportunities in your field.`,
        likely: `Most likely, you'll face some challenges but overcome them. Expect a mix of successes and setbacks. With proper planning and persistence, you should complete this path in the expected timeframe with positive outcomes.`,
        failure: `If things don't go as planned, you have options. Common issues include visa delays, funding gaps, or academic challenges. Recovery steps: 1) Reassess and adjust timeline, 2) Explore alternative funding, 3) Consider backup programs, 4) Seek mentorship and support.`,
    };

    const text = scenarios[scenarioType];
    const words = text.split(" ");
    for (const word of words) {
        yield word + " ";
        await new Promise((resolve) => setTimeout(resolve, 30));
    }
}
