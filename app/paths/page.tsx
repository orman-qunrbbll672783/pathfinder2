"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Path, StudentProfile, University } from "@/lib/types";

export default function PathsPage() {
    const router = useRouter();
    const [paths, setPaths] = useState<Path[]>([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<StudentProfile | null>(null);

    useEffect(() => {
        const loadPaths = async () => {
            const savedProfile = sessionStorage.getItem("studentProfile");
            if (!savedProfile) {
                // In the new flow, we might have outcome data passed differently
                // But for compatibility with existing flow:
                router.push("/");
                return;
            }

            const profileData: StudentProfile = JSON.parse(savedProfile);
            setProfile(profileData);

            try {
                const response = await fetch("/api/generate-paths", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(profileData),
                });

                const data = await response.json();
                setPaths(data.paths);
            } catch (error) {
                console.error("Error loading paths:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPaths();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                        className="text-2xl font-light text-gray-400"
                    >
                        Analyzing global data...
                    </motion.div>
                    <div className="mt-4 w-64 h-1 bg-gray-100 rounded-full mx-auto overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-600"
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex justify-between items-end">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Optimized Paths</h1>
                        <p className="text-gray-500">Based on your goals, budget, and risk profile.</p>
                    </motion.div>
                    <button
                        onClick={() => router.push("/profile")}
                        className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        Modify Profile
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {paths.map((path, index) => {
                        const uni = path.details as University;
                        return (
                            <motion.div
                                key={path.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                            >
                                {/* Image Header */}
                                <div className="h-48 bg-gray-200 relative overflow-hidden">
                                    {/* Placeholder Image Logic using minimal unsplash source for MVP */}
                                    <img
                                        src={uni.imageUrl || `https://source.unsplash.com/800x600/?university,campus,${uni.city}`}
                                        alt={uni.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-blue-600 shadow-sm">
                                        {path.fitScore.overall}% Match
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    {/* Title */}
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{uni.country}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <span className="text-xs text-gray-400">{uni.city}</span>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{path.name}</h2>
                                    </div>

                                    {/* Key Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-6 border-t border-b border-gray-50 py-4">
                                        <div>
                                            <div className="text-xs text-gray-400 mb-1">Tuition</div>
                                            <div className="font-semibold text-gray-900">
                                                {uni.tuition.currency} {uni.tuition.annualCost.toLocaleString()}
                                                {uni.tuition.tier === "free" && <span className="ml-1 text-green-500 text-xs">(Free!)</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 mb-1">Rank</div>
                                            <div className="font-semibold text-gray-900">#{uni.ranking || "N/A"}</div>
                                        </div>
                                    </div>

                                    {/* Trust & Transparency */}
                                    <div className="mb-6 space-y-2">
                                        <div className="flex items-start gap-2 text-xs text-gray-500">
                                            <span className="mt-0.5">ℹ️</span>
                                            <span>Tuition source: {uni.dataSource?.tuition || "Official University Website (2025)"}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-auto pt-4">
                                        <button
                                            onClick={() => {
                                                sessionStorage.setItem("selectedPath", JSON.stringify(path));
                                                router.push(`/scenario/${path.id}`);
                                            }}
                                            className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
                                        >
                                            Explore Scenario
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
