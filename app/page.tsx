"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { SituationType } from "@/lib/types";

const situations = [
  {
    id: "dont_know" as SituationType,
    title: "I don't know what to do next",
    description: "Feeling lost? Let's explore your options together.",
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: "from-blue-500/10 to-cyan-500/10",
    borderGradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "study_abroad" as SituationType,
    title: "I want to study abroad",
    description: "Ready to explore international education paths.",
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: "from-purple-500/10 to-pink-500/10",
    borderGradient: "from-purple-500 to-pink-500",
  },
  {
    id: "unsure_choice" as SituationType,
    title: "I already chose but feel unsure",
    description: "Let's validate your decision and explore alternatives.",
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: "from-orange-500/10 to-amber-500/10",
    borderGradient: "from-orange-500 to-amber-500",
  },
  {
    id: "something_wrong" as SituationType,
    title: "Something went wrong",
    description: "Need a backup plan? We'll help you recover.",
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    gradient: "from-red-500/10 to-rose-500/10",
    borderGradient: "from-red-500 to-rose-500",
  },
  {
    id: "explore_safely" as SituationType,
    title: "I just want to explore safely",
    description: "No pressure. Browse options at your own pace.",
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    gradient: "from-green-500/10 to-emerald-500/10",
    borderGradient: "from-green-500 to-emerald-500",
  },
];

export default function Home() {
  const router = useRouter();

  const handleSituationSelect = (situation: SituationType) => {
    sessionStorage.setItem("situation", situation);
    router.push(`/journey/${situation}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Gradient orbs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative z-10">
        {/* Header */}
        <header className="pt-16 pb-12 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-700">Powered by Azure OpenAI</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              PathFinder
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              Your decision support platform for education clarity
            </p>
          </motion.div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 pb-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
              Which situation describes you best?
            </h2>
            <p className="text-lg text-gray-500 font-light">
              Choose one to get personalized guidance and clear paths forward
            </p>
          </motion.div>

          {/* Situation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {situations.map((situation, index) => (
              <motion.button
                key={situation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSituationSelect(situation.id)}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 hover:border-transparent hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 text-left"
              >
                {/* Gradient border on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${situation.borderGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm`} />

                {/* Subtle background gradient */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${situation.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative z-10">
                  <div className="text-gray-700 group-hover:text-gray-900 mb-6 transition-colors">
                    {situation.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                    {situation.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed font-light">
                    {situation.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="absolute bottom-6 right-6 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-20 text-center"
          >
            <p className="text-sm text-gray-400 font-light">
              Built for Imagine Cup 2026
            </p>
          </motion.div>
        </main>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

