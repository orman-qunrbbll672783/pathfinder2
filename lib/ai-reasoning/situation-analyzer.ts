import { SituationType } from "../types";
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
        console.error("Failed to init OpenAI client", e);
    }
}

export interface SituationAnalysis {
    situation: SituationType;
    flowType: "exploration" | "execution" | "validation" | "recovery" | "browse";
    questions: DynamicQuestion[];
    aiReasoning: string;
    suggestedApproach: string;
}

export interface DynamicQuestion {
    id: string;
    question: string;
    type: "text" | "select" | "multiselect" | "scale";
    options?: string[];
    placeholder?: string;
    why: string; // Why AI is asking this
}

/**
 * Analyze situation and determine appropriate flow
 */
export async function analyzeSituation(
    situation: SituationType,
    context?: Record<string, any>
): Promise<SituationAnalysis> {
    // Define flow types based on situation
    const flowMap: Record<SituationType, SituationAnalysis["flowType"]> = {
        dont_know: "exploration",
        study_abroad: "execution",
        unsure_choice: "validation",
        something_wrong: "recovery",
        explore_safely: "browse",
    };

    const flowType = flowMap[situation];

    if (!client) {
        // Fallback when Azure not configured
        return getFallbackAnalysis(situation, flowType);
    }

    try {
        const systemPrompt = getSystemPrompt(situation);
        const userPrompt = `Analyze this student situation and determine:
1. What questions should we ask them ? (Be specific, relevant, and empathetic)
2. What approach should we take ?
    3. What outcome should we aim for?

        Situation : ${situation}
${context ? `Additional context: ${JSON.stringify(context)}` : ""}

Return your analysis in this format:
REASONING: [Your reasoning about their mental state and needs]
APPROACH: [How we should help them]
QUESTIONS: [List 3 - 5 specific questions to ask, one per line]`;

        const response = await client.chat.completions.create({
            model: deploymentName,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
        });

        const aiResponse = response.choices[0]?.message?.content || "";

        return parseAIResponse(situation, flowType, aiResponse);
    } catch (error) {
        console.error("AI reasoning error:", error);
        return getFallbackAnalysis(situation, flowType);
    }
}

function getSystemPrompt(situation: SituationType): string {
    const prompts: Record<SituationType, string> = {
        dont_know: `You are a supportive career counselor helping a confused student who doesn't know what to do next.

Your role:
- Help them explore ALL options(not just universities)
    - Ask open - ended questions about interests, fears, constraints
        - Be empathetic and non - judgmental
            - NO pressure to decide
                - Help them discover what they actually want

Remember: They are LOST.They need exploration, not decisions.`,

        study_abroad: `You are a practical study abroad advisor helping a student with a clear goal.

Your role:
- Help them execute their study abroad plan
    - Ask targeted questions(budget, country, field, timeline)
        - Focus on realistic, actionable paths
            - Provide concrete next steps

Remember: They know what they want.Help them DO it.`,

        unsure_choice: `You are a decision analyst helping a student who made a choice but feels doubt.

Your role:
- Understand what they chose and why they're unsure
    - Analyze if their decision is sound
        - Surface risks they might have missed
            - Provide validation OR suggest reconsideration
                - Be honest but supportive

Remember: They need VALIDATION, not new options.`,

        something_wrong: `You are an emergency support counselor helping a student in crisis.

Your role:
- Understand what went wrong(visa rejected, money issues, academic failure, etc.)
    - Provide immediate, practical help
        - Generate recovery plan with clear steps
            - Offer emotional support
                - Show fallback options

Remember: They are in CRISIS.Be empathetic and solution - focused.`,

        explore_safely: `You are a friendly guide for a curious but cautious student.

Your role:
- Provide information without pressure
    - Let them explore at their own pace
        - Ask minimal questions(only if they want)
- Share general insights about studying abroad

Remember: They want to BROWSE, not commit.Keep it light.`,
    };

    return prompts[situation];
}

function parseAIResponse(
    situation: SituationType,
    flowType: SituationAnalysis["flowType"],
    aiResponse: string
): SituationAnalysis {
    const reasoningMatch = aiResponse.match(/REASONING:([\s\S]*?)(?=APPROACH:|$)/);
    const approachMatch = aiResponse.match(/APPROACH:([\s\S]*?)(?=QUESTIONS:|$)/);
    const questionsMatch = aiResponse.match(/QUESTIONS:([\s\S]*?)$/);

    const reasoning = reasoningMatch?.[1]?.trim() || "Analyzing your situation...";
    const approach = approachMatch?.[1]?.trim() || "Let's explore your options together.";
    const questionsText = questionsMatch?.[1]?.trim() || "";

    const questionLines = questionsText
        .split("\n")
        .filter((line) => line.trim())
        .slice(0, 5);

    const questions: DynamicQuestion[] = questionLines.map((q, i) => ({
        id: `q - ${i + 1} `,
        question: q.replace(/^[-*]\s*/, "").trim(),
        type: "text",
        placeholder: "Your answer...",
        why: reasoning,
    }));

    return {
        situation,
        flowType,
        questions: questions.length > 0 ? questions : getFallbackQuestions(situation),
        aiReasoning: reasoning,
        suggestedApproach: approach,
    };
}

function getFallbackAnalysis(
    situation: SituationType,
    flowType: SituationAnalysis["flowType"]
): SituationAnalysis {
    return {
        situation,
        flowType,
        questions: getFallbackQuestions(situation),
        aiReasoning: getFallbackReasoning(situation),
        suggestedApproach: getFallbackApproach(situation),
    };
}

function getFallbackQuestions(situation: SituationType): DynamicQuestion[] {
    const questionSets: Record<SituationType, DynamicQuestion[]> = {
        dont_know: [
            {
                id: "interests",
                question: "What topics or activities genuinely interest you?",
                type: "text",
                placeholder: "e.g., technology, art, helping people...",
                why: "Understanding your interests helps us explore relevant paths",
            },
            {
                id: "constraints",
                question: "What are your main constraints? (money, time, location, etc.)",
                type: "text",
                placeholder: "Be honest about what limits you",
                why: "Knowing your constraints helps us suggest realistic options",
            },
            {
                id: "fears",
                question: "What scares you most about making a decision?",
                type: "text",
                placeholder: "It's okay to be afraid",
                why: "Understanding your fears helps us address them directly",
            },
        ],

        study_abroad: [
            {
                id: "target-country",
                question: "Which country do you want to study in?",
                type: "text",
                placeholder: "e.g., United States, Germany, Canada...",
                why: "This determines tuition costs and visa requirements",
            },
            {
                id: "budget",
                question: "What's your budget level?",
                type: "select",
                options: ["Low (need scholarships)", "Medium ($5k-20k/year)", "High (flexible)"],
                why: "Budget determines which universities are realistic",
            },
            {
                id: "timeline",
                question: "When do you want to start?",
                type: "select",
                options: ["As soon as possible", "Next semester", "Next year", "Flexible"],
                why: "Timeline affects application deadlines and planning",
            },
        ],

        unsure_choice: [
            {
                id: "choice",
                question: "What did you choose?",
                type: "text",
                placeholder: "e.g., MIT for Computer Science, gap year, etc.",
                why: "We need to understand your decision to analyze it",
            },
            {
                id: "doubts",
                question: "What makes you unsure about this choice?",
                type: "text",
                placeholder: "Be specific about your doubts",
                why: "Understanding your doubts helps us validate or reconsider",
            },
            {
                id: "alternatives",
                question: "What other options did you consider?",
                type: "text",
                placeholder: "What else were you thinking about?",
                why: "Comparing alternatives helps validate your decision",
            },
        ],

        something_wrong: [
            {
                id: "problem",
                question: "What happened?",
                type: "select",
                options: [
                    "Visa rejected",
                    "Ran out of money",
                    "Failed a course/semester",
                    "Health issues",
                    "Family emergency",
                    "Other",
                ],
                why: "We need to understand the problem to help you recover",
            },
            {
                id: "timeline",
                question: "When did this happen?",
                type: "select",
                options: ["Just now", "This week", "This month", "Earlier"],
                why: "Timeline affects urgency of recovery plan",
            },
            {
                id: "tried",
                question: "What have you already tried?",
                type: "text",
                placeholder: "Any steps you've taken so far",
                why: "Knowing what you've tried helps us suggest next steps",
            },
        ],

        explore_safely: [
            {
                id: "interest",
                question: "What would you like to know about?",
                type: "select",
                options: [
                    "Cost of studying abroad",
                    "Visa requirements",
                    "Country comparisons",
                    "Scholarship opportunities",
                    "Alternative education paths",
                    "Just browsing",
                ],
                why: "This helps us show you relevant information",
            },
        ],
    };

    return questionSets[situation];
}

function getFallbackReasoning(situation: SituationType): string {
    const reasoning: Record<SituationType, string> = {
        dont_know:
            "You're feeling lost and unsure about your next steps. That's completely normal. We'll help you explore different options without pressure.",
        study_abroad:
            "You have a clear goal to study abroad. We'll help you find realistic paths based on your budget, timeline, and preferences.",
        unsure_choice:
            "You've made a choice but feel uncertain. We'll analyze your decision and help you understand if it's the right path or if you should reconsider.",
        something_wrong:
            "Something didn't go as planned. We'll help you create a recovery plan with immediate actions and fallback options.",
        explore_safely:
            "You're curious but not ready to commit. We'll provide information at your own pace without any pressure to decide.",
    };

    return reasoning[situation];
}

function getFallbackApproach(situation: SituationType): string {
    const approaches: Record<SituationType, string> = {
        dont_know:
            "We'll ask open-ended questions to understand your interests, constraints, and fears. Then we'll explore multiple paths including universities, bootcamps, work, and gap years.",
        study_abroad:
            "We'll collect essential information (country, budget, timeline) and show you 3-5 realistic university paths with scholarships, visa requirements, and timelines.",
        unsure_choice:
            "We'll analyze your decision by understanding what you chose, why you're unsure, and what alternatives you considered. Then we'll provide honest validation or suggest reconsideration.",
        something_wrong:
            "We'll understand what happened, assess urgency, and create a recovery plan with immediate actions (48 hours), short-term solutions (1-4 weeks), and long-term fallbacks.",
        explore_safely:
            "We'll let you browse information about studying abroad without collecting extensive profile data. Explore at your own pace, come back when ready.",
    };

    return approaches[situation];
}
