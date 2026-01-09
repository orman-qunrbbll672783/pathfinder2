"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { SituationType } from "@/lib/types";
import { SituationAnalysis, DynamicQuestion } from "@/lib/ai-reasoning/situation-analyzer";
import { JourneyOutcome } from "@/lib/ai-reasoning/outcome-generator";
import { VoiceInput } from "@/components/VoiceInput";

export default function JourneyPage() {
    const params = useParams();
    const router = useRouter();
    const situation = params.situation as SituationType;

    // State
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<SituationAnalysis | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [outcome, setOutcome] = useState<JourneyOutcome | null>(null);

    // Load AI Analysis on mount
    useEffect(() => {
        const initJourney = async () => {
            try {
                const res = await fetch("/api/analyze-situation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ situation }),
                });
                const data = await res.json();
                setAnalysis(data);
            } catch (err) {
                console.error("Failed to analyze situation", err);
            } finally {
                setLoading(false);
            }
        };

        if (situation) {
            initJourney();
        }
    }, [situation]);

    const handleAnswer = (questionId: string, value: any) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleNext = async () => {
        if (!analysis) return;

        if (currentQuestionIndex < analysis.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            // All questions answered, generate outcome
            setAnalyzing(true);
            try {
                const res = await fetch("/api/generate-outcome", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ situation, answers }),
                });
                const data = await res.json();

                // If it's the "study abroad" flow, we might redirect to existing paths page
                // But passing the collected data. For now, let's handle the outcome display here or redirect.
                if (data.type === "university_paths" && data.data.profile) {
                    sessionStorage.setItem("studentProfile", JSON.stringify(data.data.profile));
                }
                setOutcome(data);
            } catch (err) {
                console.error("Failed to generate outcome", err);
            } finally {
                setAnalyzing(false);
            }
        }
    };

    const renderQuestionInput = (question: DynamicQuestion) => {
        switch (question.type) {
            case "select":
                return (
                    <div className="grid grid-cols-1 gap-3">
                        {question.options?.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => handleAnswer(question.id, opt)}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${answers[question.id] === opt
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-300"
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                );
            case "text":
            default:
                return (
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full p-4 pr-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                            placeholder={question.placeholder}
                            value={answers[question.id] || ""}
                            onChange={(e) => handleAnswer(question.id, e.target.value)}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <VoiceInput
                                onTranscript={(text) => handleAnswer(question.id, (answers[question.id] || "") + " " + text)}
                            />
                        </div>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">AI is analyzing your situation...</p>
                </div>
            </div>
        );
    }

    const renderOutcomeContent = () => {
        if (!outcome) return null;

        switch (outcome.type) {
            case "exploration_map":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {outcome.data?.map((opt: any, i: number) => (
                            <div key={i} className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{opt.title}</h3>
                                <p className="text-gray-600 mb-4 text-sm">{opt.description}</p>
                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium inline-block">
                                    {opt.relevance}
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case "decision_validation":
                return (
                    <div className="bg-white border rounded-2xl p-8 shadow-sm">
                        <div className="mb-6 border-b pb-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{outcome.data.verdict}</h3>
                            <p className="text-gray-600 italic">{outcome.data.recommendation}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                                    <span className="mr-2">✓</span> Strengths
                                </h4>
                                <ul className="space-y-2">
                                    {outcome.data.strengths?.map((s: string, i: number) => (
                                        <li key={i} className="text-gray-600 text-sm flex items-start">
                                            <span className="mr-2">•</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                                    <span className="mr-2">!</span> Risks to Consider
                                </h4>
                                <ul className="space-y-2">
                                    {outcome.data.weaknesses?.map((w: string, i: number) => (
                                        <li key={i} className="text-gray-600 text-sm flex items-start">
                                            <span className="mr-2">•</span> {w}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case "recovery_plan":
                return (
                    <div className="space-y-6">
                        <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-red-800 mb-4">🚨 Immediate Actions (Next 48h)</h3>
                            <ul className="space-y-2">
                                {outcome.data.immediate_actions?.map((action: string, i: number) => (
                                    <li key={i} className="flex items-center text-red-700 font-medium">
                                        <input type="checkbox" className="mr-3 h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500" />
                                        {action}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white border rounded-xl p-6">
                                <h4 className="font-semibold mb-3">Short Term Steps</h4>
                                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                    {outcome.data.short_term?.map((step: string, i: number) => (
                                        <li key={i}>{step}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-gray-50 border rounded-xl p-6">
                                <h4 className="font-semibold mb-3 text-gray-700">Fallback Options</h4>
                                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                    {outcome.data.fallback_options?.map((opt: string, i: number) => (
                                        <li key={i}>{opt}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case "info_board":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {outcome.data.topics?.map((topic: any, i: number) => (
                            <div key={i} className="bg-white border rounded-xl p-6">
                                <h3 className="font-bold text-gray-900 mb-2 border-b pb-2">{topic.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{topic.content}</p>
                            </div>
                        ))}
                    </div>
                );
            default:
                // Fallback / University Paths preview
                if (outcome.type === "university_paths") {
                    return (
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
                            <div className="text-5xl mb-4">🎓</div>
                            <h3 className="text-2xl font-bold text-blue-900 mb-2">We found matches!</h3>
                            <p className="text-blue-700 mb-6">Based on your detailed profile, we have identified specific university programs that match your criteria.</p>
                        </div>
                    );
                }
                return (
                    <div className="bg-gray-50 p-6 rounded-2xl">
                        <pre className="whitespace-pre-wrap text-sm text-gray-600">
                            {JSON.stringify(outcome.data, null, 2)}
                        </pre>
                    </div>
                );
        }
    };

    if (outcome) {
        return (
            <div className="min-h-screen bg-white p-8">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 text-center"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">{outcome.title}</h1>
                        <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">{outcome.message}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {renderOutcomeContent()}
                    </motion.div>

                    <div className="mt-12 flex justify-center gap-4">
                        <button
                            onClick={() => router.push("/")}
                            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Start Over
                        </button>
                        {outcome.type === "university_paths" && (
                            <button
                                onClick={() => router.push("/paths")}
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                View University Matches -&gt;
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!analysis) return <div>Error loading analysis.</div>;

    const currentQuestion = analysis.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === analysis.questions.length - 1;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* AI Reasoning Header */}
            <div className="bg-white border-b border-gray-100 p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-2">
                        AI Analysis
                    </div>
                    <p className="text-gray-600 italic">"{analysis.aiReasoning}"</p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-2xl w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {currentQuestion.question}
                            </h2>
                            <p className="text-gray-500 text-sm mb-6">
                                Why we ask: {currentQuestion.why}
                            </p>

                            {renderQuestionInput(currentQuestion)}

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={!answers[currentQuestion.id]}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {analyzing ? "Generating Plan..." : isLastQuestion ? "Finish" : "Next"}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Progress */}
                    <div className="mt-8 flex justify-center gap-2">
                        {analysis.questions.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 w-8 rounded-full transition-colors ${idx <= currentQuestionIndex ? "bg-blue-600" : "bg-gray-200"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
