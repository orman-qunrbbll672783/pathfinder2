import { SituationType, StudentProfile, EducationStage, BudgetLevel } from "@/lib/types";
import { AzureOpenAI } from "openai";
import { generatePaths } from "@/lib/engines/path-matcher";

// Reuse the Azure client setup
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

export interface JourneyOutcome {
    type: "exploration_map" | "university_paths" | "decision_validation" | "recovery_plan" | "info_board";
    title: string;
    message: string;
    data: any; // Flexible data structure based on type
}

export async function generateOutcome(
    situation: SituationType,
    answers: Record<string, string>
): Promise<JourneyOutcome> {
    const context = JSON.stringify(answers);

    // Decide which generator to use based on situation
    switch (situation) {
        case "dont_know":
            return generateExplorationMap(context);
        case "study_abroad":
            return generateUniversityPaths(context); // This links back to the original engine potentially
        case "unsure_choice":
            return validateDecision(context);
        case "something_wrong":
            return generateRecoveryPlan(context);
        case "explore_safely":
            return generateInfoBoard(context);
        default:
            return generateExplorationMap(context);
    }
}

async function generateExplorationMap(context: string): Promise<JourneyOutcome> {
    if (!client) return getMockExplorationMap();

    try {
        const response = await client.chat.completions.create({
            model: deploymentName,
            messages: [
                { role: "system", content: "You are a career explorer. Generate 3 distinct, creative, and relevant paths based on the user's interests. Return ONLY valid JSON." },
                { role: "user", content: `User Context: ${context}. \n\nGenerate 3 options in this JSON format: { "options": [{ "title": "string", "description": "string", "relevance": "string" }] }` }
            ]
        });

        const content = response.choices[0]?.message?.content || "{}";
        const data = parseJSONFromAI(content);

        return {
            type: "exploration_map",
            title: "Possibility Map",
            message: "Based on your unique profile, here are three directions tailored just for you.",
            data: data.options ? data.options : getMockExplorationMap().data
        };
    } catch (error) {
        console.error("AI Error:", error);
        return getMockExplorationMap();
    }
}

async function validateDecision(context: string): Promise<JourneyOutcome> {
    if (!client) return { type: "decision_validation", title: "Analysis Failed", message: "AI unavailable", data: {} };

    try {
        const response = await client.chat.completions.create({
            model: deploymentName,
            messages: [
                { role: "system", content: "You are a decision analyst. meaningful pros/cons and a verdict. Return ONLY valid JSON." },
                { role: "user", content: `Context: ${context}. \n\nAnalyze this choice. Return JSON: { "verdict": "string", "strengths": ["string"], "weaknesses": ["string"], "recommendation": "string" }` }
            ]
        });

        const data = parseJSONFromAI(response.choices[0]?.message?.content || "{}");
        return {
            type: "decision_validation",
            title: "Decision Analysis",
            message: "I've analyzed your choice against your constraints. Here is the objective breakdown.",
            data
        };
    } catch (e) {
        return { type: "decision_validation", title: "Error", message: "Could not analyze", data: { verdict: "Error", strengths: [], weaknesses: [], recommendation: "Try again" } };
    }
}

async function generateRecoveryPlan(context: string): Promise<JourneyOutcome> {
    if (!client) return { type: "recovery_plan", title: "Plan", message: "Static fallback", data: {} };

    try {
        const response = await client.chat.completions.create({
            model: deploymentName,
            messages: [
                { role: "system", content: "You are a crisis counselor. Create a practical recovery plan. Return ONLY valid JSON." },
                { role: "user", content: `Crisis Context: ${context}. \n\nReturn JSON: { "immediate_actions": ["string"], "short_term": ["string"], "fallback_options": ["string"] }` }
            ]
        });

        const data = parseJSONFromAI(response.choices[0]?.message?.content || "{}");
        return {
            type: "recovery_plan",
            title: "Recovery Strategy",
            message: "This is a fixable situation. Here is your step-by-step roadmap to get back on track.",
            data
        };
    } catch (e) {
        return { type: "recovery_plan", title: "Error", message: "Failed to generate plan", data: {} };
    }
}

async function generateInfoBoard(context: string): Promise<JourneyOutcome> {
    if (!client) return { type: "info_board", title: "Info", message: "Static fallback", data: {} };

    try {
        const response = await client.chat.completions.create({
            model: deploymentName,
            messages: [
                { role: "system", content: "You are a study abroad guide. Provide key insights based on client interest. Return ONLY valid JSON." },
                { role: "user", content: `User Interest: ${context}. \n\nReturn JSON: { "topics": [{ "title": "string", "content": "string" }] }` }
            ]
        });

        const data = parseJSONFromAI(response.choices[0]?.message?.content || "{}");
        return {
            type: "info_board",
            title: "Curated Insights",
            message: "Here is the most relevant information for your query.",
            data
        };
    } catch (e) {
        return { type: "info_board", title: "Error", message: "Failed to fetch info", data: {} };
    }
}

function parseJSONFromAI(content: string): any {
    try {
        // Strip code blocks if present
        const clean = content.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(clean);
    } catch (e) {
        console.error("JSON Parse Error", e);
        return {};
    }
}

function getMockExplorationMap() {
    return {
        type: "exploration_map",
        title: "Possibility Map (Offline Mode)",
        message: "AI is unreachable. Here are generic options.",
        data: [
            { title: "University", description: "Traditional degree", relevance: "General path" },
            { title: "Bootcamp", description: "Skill focused", relevance: "Fast track" },
            { title: "Gap Year", description: "Experience first", relevance: "Self-discovery" }
        ]
    };
}

async function generateUniversityPaths(context: string): Promise<JourneyOutcome> {
    try {
        const answers = JSON.parse(context);

        // Map answers to StudentProfile (Best effort mapping)
        // In a real system, AI would structure this. For MVP, we map known fallback IDs.
        const profile: StudentProfile = {
            id: "ai-generated",
            situation: "study_abroad",
            currentCountry: answers["current-country"] || "Unknown",
            targetCountry: answers["target-country"] || undefined,
            educationStage: mapEducationStage(answers["education-stage"] || answers["stage"] || ""),
            budgetLevel: mapBudgetLevel(answers["budget"] || ""),
            mainFear: "failure", // Default fallback
            confidenceLevel: "medium", // Default fallback
            createdAt: new Date()
        };

        // If we have AI, we might ask it to extract these fields from the text context more accurately
        // but for now, let's rely on the inputs.

        const paths = generatePaths(profile);

        return {
            type: "university_paths",
            title: "Recommended Universities",
            message: `We found ${paths.length} optimized paths for you in ${profile.targetCountry || "your preferred destinations"}.`,
            data: { paths, profile }
        };
    } catch (e) {
        console.error("Path generation failed", e);
        return {
            type: "university_paths",
            title: "Path Generation Error",
            message: "We couldn't generate paths at this moment.",
            data: { paths: [] }
        };
    }
}

function mapBudgetLevel(input: string): BudgetLevel {
    const lower = input.toLowerCase();
    if (lower.includes("low")) return "low";
    if (lower.includes("high")) return "high";
    return "medium";
}

function mapEducationStage(input: string): EducationStage {
    const lower = input.toLowerCase();
    if (lower.includes("high school")) return "high_school";
    if (lower.includes("master")) return "masters";
    if (lower.includes("phd")) return "phd";
    return "bachelors";
}


