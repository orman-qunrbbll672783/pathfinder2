"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { Path, Scenario } from "@/lib/types";
import { StreamingChatPanel } from "@/components/StreamingChat";

export default function ScenarioPage() {
    const params = useParams();
    const router = useRouter();
    const pathId = params.pathId as string;

    const [path, setPath] = useState<Path | null>(null);
    const [activeScenario, setActiveScenario] = useState<"best" | "likely" | "failure">("likely");

    useEffect(() => {
        // In a real app, we'd fetch this from ID. For MVP demo, active path is in storage.
        const savedPath = sessionStorage.getItem("selectedPath");
        if (savedPath) {
            const parsed = JSON.parse(savedPath);
            // Verify ID matches if needed, or just use selected
            setPath(parsed);
        }
    }, [pathId]);

    if (!path) return <div className="p-10 text-center">Loading Scenario...</div>;

    const scenarios: Record<string, Scenario> = {
        best: {
            type: "best",
            title: "Optimistic Outcome",
            description: "Everything goes perfectly according to plan.",
            timeline: [],
            outcomes: [
                { year: 1, description: "Secure high-paying internship" },
                { year: 3, description: "Graduate with Honors" }
            ]
        },
        likely: {
            type: "likely",
            title: "Most Likely Outcome",
            description: "A realistic projection based on current data.",
            timeline: [],
            outcomes: [
                { year: 1, description: "Part-time work to support living costs" },
                { year: 4, description: "Graduate and find job within 3 months" }
            ]
        },
        failure: {
            type: "failure",
            title: "Risk Scenario",
            description: "What happens if things go wrong (e.g., visa issues).",
            timeline: [],
            outcomes: [
                { year: 0, description: "Visa delayed by 2 months" },
                { year: 1, description: "Budget tighter than expected" }
            ],
            recoveryPlan: ["Apply for deferral", "Seek emergency funding"]
        }
    };

    const currentScenario = scenarios[activeScenario];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Left Panel: Scenario Visualization */}
            <div className="md:w-2/3 p-8 overflow-y-auto">
                <h1 className="text-3xl font-bold mb-2">{path.name}</h1>
                <p className="text-gray-600 mb-8">{path.description}</p>

                {/* Scenario Toggle */}
                <div className="flex bg-white rounded-xl p-1 shadow-sm mb-8 inline-flex">
                    {(["best", "likely", "failure"] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setActiveScenario(type)}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${activeScenario === type
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)} Case
                        </button>
                    ))}
                </div>

                {/* Scenario Content */}
                <motion.div
                    key={activeScenario}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentScenario.title}</h2>
                            <p className="text-gray-600">{currentScenario.description}</p>
                        </div>
                        <div className={`text-4xl ${activeScenario === "failure" ? "text-red-500" : "text-green-500"}`}>
                            {activeScenario === "failure" ? "⚠️" : activeScenario === "best" ? "🌟" : "📊"}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="font-semibold text-gray-900 border-b pb-2">projected Timeline</h3>
                        {currentScenario.outcomes.map((outcome, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="w-20 font-bold text-gray-400 pt-1">Year {outcome.year}</div>
                                <div className="p-4 bg-gray-50 rounded-xl flex-1">
                                    {outcome.description}
                                </div>
                            </div>
                        ))}

                        {activeScenario === "failure" && currentScenario.recoveryPlan && (
                            <div className="mt-8 p-6 bg-red-50 rounded-xl border border-red-100">
                                <h3 className="font-bold text-red-800 mb-3">Recovery Plan</h3>
                                <ul className="list-disc list-inside text-red-700 space-y-1">
                                    {currentScenario.recoveryPlan.map((step, i) => (
                                        <li key={i}>{step}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Right Panel: AI Context */}
            <div className="md:w-1/3 bg-white border-l border-gray-200 p-0 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">AI Counselor</h3>
                    <p className="text-xs text-gray-500">Ask me anything about this scenario</p>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <StreamingChatPanel
                        deploymentId="gpt-4" // This would be env var in real app
                        systemPrompt={`You are an AI counselor discussing the scenario: ${currentScenario.title} for path: ${path.name}. Help the student understand the risks and opportunities.`}
                        initialMessage={`I've simulated the **${currentScenario.title}** for ${path.name}. Would you like me to explain the key trade-offs?`}
                    />
                </div>
            </div>
        </div>
    );
}
