"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    StudentProfile,
    BudgetLevel,
    ConfidenceLevel,
    FearType,
    EducationStage,
    SituationType,
} from "@/lib/types";
import { ALL_COUNTRIES, POPULAR_STUDY_DESTINATIONS } from "@/lib/data/countries-list";

const educationStages: { value: EducationStage; label: string }[] = [
    { value: "high_school", label: "High School" },
    { value: "bachelors", label: "Bachelor's Degree" },
    { value: "masters", label: "Master's Degree" },
    { value: "phd", label: "PhD" },
    { value: "bootcamp", label: "Bootcamp/Certificate" },
    { value: "working", label: "Currently Working" },
];

const fears: { value: FearType; label: string; icon: string }[] = [
    { value: "money", label: "Financial concerns", icon: "💰" },
    { value: "visa", label: "Visa/immigration issues", icon: "🛂" },
    { value: "failure", label: "Academic failure", icon: "📉" },
    { value: "time", label: "Time/delays", icon: "⏰" },
];

export default function ProfilePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [situation, setSituation] = useState<SituationType>("dont_know");

    const [formData, setFormData] = useState({
        currentCountry: "",
        targetCountry: "",
        educationStage: null as EducationStage | null,
        budgetLevel: null as BudgetLevel | null,
        mainFear: null as FearType | null,
        confidenceLevel: 5,
    });

    const [countrySearch, setCountrySearch] = useState("");
    const [targetCountrySearch, setTargetCountrySearch] = useState("");
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [showTargetDropdown, setShowTargetDropdown] = useState(false);

    useEffect(() => {
        const savedSituation = sessionStorage.getItem("situation") as SituationType;
        if (savedSituation) {
            setSituation(savedSituation);
        }
    }, []);

    const filteredCountries = ALL_COUNTRIES.filter((country) =>
        country.toLowerCase().includes(countrySearch.toLowerCase())
    );

    const filteredTargetCountries = ALL_COUNTRIES.filter((country) =>
        country.toLowerCase().includes(targetCountrySearch.toLowerCase())
    );

    const handleNext = () => {
        if (step < 6) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = () => {
        if (!formData.educationStage || !formData.budgetLevel || !formData.mainFear) return;

        const profile: StudentProfile = {
            id: `profile-${Date.now()}`,
            situation,
            currentCountry: formData.currentCountry,
            targetCountry: formData.targetCountry,
            educationStage: formData.educationStage,
            budgetLevel: formData.budgetLevel,
            mainFear: formData.mainFear,
            confidenceLevel: formData.confidenceLevel <= 3 ? "low" : formData.confidenceLevel <= 7 ? "medium" : "high",
            createdAt: new Date(),
        };

        sessionStorage.setItem("studentProfile", JSON.stringify(profile));
        router.push("/paths");
    };

    const canProceed = () => {
        switch (step) {
            case 1: return formData.currentCountry !== "";
            case 2: return !!formData.educationStage;
            case 3: return formData.targetCountry !== "";
            case 4: return !!formData.budgetLevel;
            case 5: return !!formData.mainFear;
            case 6: return true;
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-6 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="relative z-10 max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                        Tell us about yourself
                    </h1>
                    <p className="text-lg text-gray-500 font-light">We need just a few details to find your best paths</p>
                </motion.div>

                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex gap-2 mb-3">
                        {[1, 2, 3, 4, 5, 6].map((s) => (
                            <div
                                key={s}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? "bg-gray-900" : "bg-gray-200"
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-gray-400 text-center font-light">Step {step} of 6</p>
                </div>

                {/* Question Cards */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 md:p-12 mb-8"
                    >
                        {/* Step 1: Current Country */}
                        {step === 1 && (
                            <div>
                                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                                    Where are you currently located?
                                </h2>
                                <p className="text-gray-500 mb-8 font-light">This helps us understand visa requirements</p>

                                <div className="relative">
                                    <input
                                        type="text"
                                        value={countrySearch}
                                        onChange={(e) => {
                                            setCountrySearch(e.target.value);
                                            setShowCountryDropdown(true);
                                        }}
                                        onFocus={() => setShowCountryDropdown(true)}
                                        placeholder="Type or select your country"
                                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors text-lg font-light"
                                    />

                                    {showCountryDropdown && (
                                        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                                            <div className="p-3 border-b border-gray-100">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Popular</p>
                                            </div>
                                            {POPULAR_STUDY_DESTINATIONS.slice(0, 5).map((country) => (
                                                <button
                                                    key={country}
                                                    onClick={() => {
                                                        setFormData({ ...formData, currentCountry: country });
                                                        setCountrySearch(country);
                                                        setShowCountryDropdown(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700 font-light"
                                                >
                                                    {country}
                                                </button>
                                            ))}
                                            <div className="p-3 border-t border-b border-gray-100">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">All Countries</p>
                                            </div>
                                            {filteredCountries.slice(0, 50).map((country) => (
                                                <button
                                                    key={country}
                                                    onClick={() => {
                                                        setFormData({ ...formData, currentCountry: country });
                                                        setCountrySearch(country);
                                                        setShowCountryDropdown(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700 font-light"
                                                >
                                                    {country}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Education Stage */}
                        {step === 2 && (
                            <div>
                                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                                    What's your current education stage?
                                </h2>
                                <p className="text-gray-500 mb-8 font-light">This helps us match appropriate programs</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {educationStages.map((stage) => (
                                        <button
                                            key={stage.value}
                                            onClick={() => setFormData({ ...formData, educationStage: stage.value })}
                                            className={`p-5 rounded-xl border-2 transition-all text-left ${formData.educationStage === stage.value
                                                ? "border-gray-900 bg-gray-50 shadow-md"
                                                : "border-gray-200 hover:border-gray-400"
                                                }`}
                                        >
                                            <span className="text-lg font-medium text-gray-900">{stage.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Target Country (NEW!) */}
                        {step === 3 && (
                            <div>
                                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                                    Which country do you want to study in?
                                </h2>
                                <p className="text-gray-500 mb-8 font-light">
                                    This is crucial for tuition costs and visa requirements
                                </p>

                                <div className="relative">
                                    <input
                                        type="text"
                                        value={targetCountrySearch}
                                        onChange={(e) => {
                                            setTargetCountrySearch(e.target.value);
                                            setShowTargetDropdown(true);
                                        }}
                                        onFocus={() => setShowTargetDropdown(true)}
                                        placeholder="Type or select target country"
                                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors text-lg font-light"
                                    />

                                    {showTargetDropdown && (
                                        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                                            <div className="p-3 border-b border-gray-100">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Popular Study Destinations</p>
                                            </div>
                                            {POPULAR_STUDY_DESTINATIONS.map((country) => (
                                                <button
                                                    key={country}
                                                    onClick={() => {
                                                        setFormData({ ...formData, targetCountry: country });
                                                        setTargetCountrySearch(country);
                                                        setShowTargetDropdown(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700 font-light"
                                                >
                                                    {country}
                                                </button>
                                            ))}
                                            <div className="p-3 border-t border-b border-gray-100">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">All Countries</p>
                                            </div>
                                            {filteredTargetCountries.slice(0, 50).map((country) => (
                                                <button
                                                    key={country}
                                                    onClick={() => {
                                                        setFormData({ ...formData, targetCountry: country });
                                                        setTargetCountrySearch(country);
                                                        setShowTargetDropdown(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700 font-light"
                                                >
                                                    {country}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Budget */}
                        {step === 4 && (
                            <div>
                                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                                    What's your budget level?
                                </h2>
                                <p className="text-gray-500 mb-8 font-light">Be realistic - this affects which paths we show</p>

                                <div className="space-y-4">
                                    {[
                                        { value: "low" as BudgetLevel, label: "Low Budget", desc: "Need scholarships or free/low-cost options" },
                                        { value: "medium" as BudgetLevel, label: "Medium Budget", desc: "Can afford moderate tuition ($5k-20k/year)" },
                                        { value: "high" as BudgetLevel, label: "High Budget", desc: "Budget is not a major constraint" },
                                    ].map((budget) => (
                                        <button
                                            key={budget.value}
                                            onClick={() => setFormData({ ...formData, budgetLevel: budget.value })}
                                            className={`w-full p-6 rounded-xl border-2 transition-all text-left ${formData.budgetLevel === budget.value
                                                ? "border-gray-900 bg-gray-50 shadow-md"
                                                : "border-gray-200 hover:border-gray-400"
                                                }`}
                                        >
                                            <div className="font-semibold text-lg mb-1 text-gray-900">{budget.label}</div>
                                            <div className="text-sm text-gray-600 font-light">{budget.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 5: Main Fear */}
                        {step === 5 && (
                            <div>
                                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                                    What's your main concern?
                                </h2>
                                <p className="text-gray-500 mb-8 font-light">We'll prioritize paths that address this</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {fears.map((fear) => (
                                        <button
                                            key={fear.value}
                                            onClick={() => setFormData({ ...formData, mainFear: fear.value })}
                                            className={`p-6 rounded-xl border-2 transition-all ${formData.mainFear === fear.value
                                                ? "border-gray-900 bg-gray-50 shadow-md"
                                                : "border-gray-200 hover:border-gray-400"
                                                }`}
                                        >
                                            <div className="text-3xl mb-3">{fear.icon}</div>
                                            <div className="font-medium text-gray-900">{fear.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 6: Confidence */}
                        {step === 6 && (
                            <div>
                                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                                    How confident do you feel?
                                </h2>
                                <p className="text-gray-500 mb-8 font-light">This helps us match workload intensity</p>

                                <div className="py-8">
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={formData.confidenceLevel}
                                            onChange={(e) => setFormData({ ...formData, confidenceLevel: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                                        />
                                        <div className="flex justify-between mt-4 text-sm text-gray-400 font-light">
                                            <span>Not confident</span>
                                            <span className="text-3xl font-bold text-gray-900">{formData.confidenceLevel}</span>
                                            <span>Very confident</span>
                                        </div>
                                    </div>
                                    <p className="text-center mt-6 text-gray-700">
                                        {formData.confidenceLevel <= 3 && "We'll find supportive, structured programs for you"}
                                        {formData.confidenceLevel > 3 && formData.confidenceLevel <= 7 && "You're ready for moderate challenges"}
                                        {formData.confidenceLevel > 7 && "You can handle intensive, rigorous programs"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className="px-8 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="px-8 py-4 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                        {step === 6 ? "Find My Paths →" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
}
