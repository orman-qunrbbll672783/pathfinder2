import {
    StudentProfile,
    University,
    Scholarship,
    Country,
    Path,
    FitScore,
    RiskAssessment,
    TimelineEvent,
} from "../types";
import { UNIVERSITIES, SCHOLARSHIPS, COUNTRIES } from "../data/seed-data";

/**
 * Core path matching engine
 * Generates exactly 3 diverse, realistic paths for a student
 */
export function generatePaths(profile: StudentProfile): Path[] {
    // Step 1: Filter impossible paths
    const eligibleUniversities = filterEligibleUniversities(profile);

    // Step 2: Calculate fit scores for each
    const scoredUniversities = eligibleUniversities.map((uni) => ({
        university: uni,
        fitScore: calculateFitScore(profile, uni),
    }));

    // Step 3: Sort by fit score
    scoredUniversities.sort((a, b) => b.fitScore.overall - a.fitScore.overall);

    // Step 4: Select top 3 with diversity
    const selectedPaths = selectDiversePaths(scoredUniversities, 3);

    // Step 5: Build complete path objects
    return selectedPaths.map((item) => buildPath(profile, item.university, item.fitScore));
}

/**
 * Filter universities based on hard constraints
 */
function filterEligibleUniversities(profile: StudentProfile): University[] {
    return UNIVERSITIES.filter((uni) => {
        // Target Country Constraint (CRITICAL)
        if (profile.targetCountry && profile.targetCountry !== uni.country) {
            // But allow similar countries if not enough matches? 
            // For now, strict match if user specified it.
            return false;
        }

        // Budget constraint
        if (profile.budgetLevel === "low" && uni.tuition.tier === "high") {
            return false;
        }

        // Visa difficulty vs fear
        if (profile.mainFear === "visa" && uni.visaDifficulty === "hard") {
            return false;
        }

        // Workload vs confidence
        if (profile.confidenceLevel === "low" && uni.workloadIntensity >= 9) {
            return false;
        }

        return true;
    });
}

/**
 * Calculate comprehensive fit score
 */
export function calculateFitScore(profile: StudentProfile, uni: University): FitScore {
    const scores = {
        teaching: calculateTeachingFit(profile, uni),
        workload: calculateWorkloadFit(profile, uni),
        language: calculateLanguageFit(profile, uni),
        cost: calculateCostFit(profile, uni),
        visa: calculateVisaFit(profile, uni),
        support: uni.internationalStudentSupport * 10,
    };

    const overall = Math.round(
        (scores.teaching * 0.2 +
            scores.workload * 0.15 +
            scores.language * 0.15 +
            scores.cost * 0.25 +
            scores.visa * 0.15 +
            scores.support * 0.1)
    );

    return {
        overall,
        breakdown: scores,
    };
}

function calculateTeachingFit(profile: StudentProfile, uni: University): number {
    // Higher confidence students may prefer research-focused
    if (profile.confidenceLevel === "high" && uni.teachingStyle === "research-focused") {
        return 90;
    }
    if (profile.confidenceLevel === "low" && uni.teachingStyle === "lecture-heavy") {
        return 85;
    }
    if (uni.teachingStyle === "mixed") {
        return 80;
    }
    return 70;
}

function calculateWorkloadFit(profile: StudentProfile, uni: University): number {
    const confidenceMap = { low: 5, medium: 7, high: 10 };
    const maxWorkload = confidenceMap[profile.confidenceLevel];

    if (uni.workloadIntensity <= maxWorkload) {
        return 100 - (maxWorkload - uni.workloadIntensity) * 5;
    }
    return Math.max(0, 100 - (uni.workloadIntensity - maxWorkload) * 15);
}

function calculateLanguageFit(profile: StudentProfile, uni: University): number {
    // Simplified: English speakers get higher scores for English universities
    if (uni.languageRequirements.primary === "English") {
        return 95;
    }
    if (uni.languageRequirements.alternatives?.includes("English")) {
        return 80;
    }
    return 60;
}

function calculateCostFit(profile: StudentProfile, uni: University): number {
    const budgetMap = {
        low: { free: 100, low: 90, medium: 40, high: 10 },
        medium: { free: 100, low: 95, medium: 85, high: 50 },
        high: { free: 100, low: 95, medium: 90, high: 85 },
    };

    return budgetMap[profile.budgetLevel][uni.tuition.tier];
}

function calculateVisaFit(profile: StudentProfile, uni: University): number {
    if (profile.mainFear === "visa") {
        const difficultyMap = { easy: 100, medium: 60, hard: 20 };
        return difficultyMap[uni.visaDifficulty];
    }
    const difficultyMap = { easy: 100, medium: 85, hard: 70 };
    return difficultyMap[uni.visaDifficulty];
}

/**
 * Select diverse paths (not all similar universities)
 */
function selectDiversePaths(
    scored: { university: University; fitScore: FitScore }[],
    count: number
): { university: University; fitScore: FitScore }[] {
    const selected: { university: University; fitScore: FitScore }[] = [];
    const countries = new Set<string>();

    for (const item of scored) {
        if (selected.length >= count) break;

        // Ensure diversity: different countries
        if (selected.length < 2 || !countries.has(item.university.country)) {
            selected.push(item);
            countries.add(item.university.country);
        }
    }

    // Fill remaining slots if needed
    while (selected.length < count && selected.length < scored.length) {
        const remaining = scored.filter((item) => !selected.includes(item));
        if (remaining.length > 0) {
            selected.push(remaining[0]);
        } else {
            break;
        }
    }

    return selected;
}

/**
 * Build complete path object with risks, timeline, etc.
 */
function buildPath(profile: StudentProfile, uni: University, fitScore: FitScore): Path {
    const risks = assessRisks(profile, uni);
    const notForYouIf = generateExclusions(profile, uni);
    const scholarships = findMatchingScholarships(profile, uni);
    const timeline = generateTimeline(profile, uni);

    return {
        id: `path-${uni.id}`,
        type: "university",
        name: `Study at ${uni.name}`,
        description: `${uni.ranking <= 50 ? "Top-ranked" : "Quality"} ${uni.teachingStyle} university in ${uni.city}, ${uni.country}`,
        fitScore,
        risks,
        notForYouIf,
        details: uni,
        scholarships,
        timeline,
    };
}

/**
 * Assess all risk categories
 */
function assessRisks(profile: StudentProfile, uni: University): RiskAssessment {
    return {
        financial: assessFinancialRisk(profile, uni),
        visa: assessVisaRisk(profile, uni),
        academic: assessAcademicRisk(profile, uni),
        time: assessTimeRisk(profile, uni),
    };
}

function assessFinancialRisk(profile: StudentProfile, uni: University) {
    const budgetMismatch =
        (profile.budgetLevel === "low" && uni.tuition.tier === "medium") ||
        (profile.budgetLevel === "medium" && uni.tuition.tier === "high");

    const country = COUNTRIES.find((c) => c.name === uni.country);
    const highCostOfLiving = country?.costOfLiving.tier === "high";

    return {
        severity: (budgetMismatch || highCostOfLiving) ? "high" : "low" as "low" | "medium" | "high",
        likelihood: budgetMismatch ? 70 : 30,
        description: budgetMismatch
            ? `Tuition (${uni.tuition.currency} ${uni.tuition.annualCost}) may exceed your ${profile.budgetLevel} budget`
            : `Costs are manageable with ${profile.budgetLevel} budget`,
        mitigation: [
            "Apply for scholarships",
            "Look for part-time work opportunities",
            "Consider student loans",
            "Budget carefully for living expenses",
        ],
    };
}

function assessVisaRisk(profile: StudentProfile, uni: University) {
    const difficulty = uni.visaDifficulty;
    const severityMap = { easy: "low", medium: "medium", hard: "high" } as const;
    const likelihoodMap = { easy: 10, medium: 30, hard: 60 };

    return {
        severity: severityMap[difficulty],
        likelihood: likelihoodMap[difficulty],
        description: `Visa difficulty is ${difficulty} for ${uni.country}`,
        mitigation: [
            "Start visa process early",
            "Prepare all documents thoroughly",
            "Seek visa consultation",
            "Have backup country options",
        ],
    };
}

function assessAcademicRisk(profile: StudentProfile, uni: University) {
    const confidenceMap = { low: 3, medium: 7, high: 10 };
    const studentCapacity = confidenceMap[profile.confidenceLevel];
    const overload = uni.workloadIntensity > studentCapacity;

    return {
        severity: overload ? "high" : "low" as "low" | "medium" | "high",
        likelihood: overload ? 60 : 20,
        description: overload
            ? `Workload intensity (${uni.workloadIntensity}/10) may be challenging for your ${profile.confidenceLevel} confidence level`
            : `Workload is manageable for your confidence level`,
        mitigation: [
            "Start with lighter course load",
            "Use university tutoring services",
            "Form study groups",
            "Manage time effectively",
        ],
    };
}

function assessTimeRisk(profile: StudentProfile, uni: University) {
    return {
        severity: "medium" as const,
        likelihood: 40,
        description: "Potential delays in graduation or visa processing",
        mitigation: [
            "Plan for buffer time",
            "Stay on top of deadlines",
            "Have contingency plans",
        ],
    };
}

/**
 * Generate exclusion criteria
 */
function generateExclusions(profile: StudentProfile, uni: University): string[] {
    const exclusions: string[] = [];

    if (uni.workloadIntensity >= 9) {
        exclusions.push("you prefer a relaxed academic environment");
    }

    if (uni.tuition.tier === "high") {
        exclusions.push("you have strict budget constraints");
    }

    if (uni.languageRequirements.primary !== "English" && !uni.languageRequirements.alternatives?.includes("English")) {
        exclusions.push(`you're not comfortable learning in ${uni.languageRequirements.primary}`);
    }

    if (uni.acceptanceRate < 10) {
        exclusions.push("you need a safer acceptance option");
    }

    return exclusions;
}

/**
 * Find matching scholarships
 */
function findMatchingScholarships(profile: StudentProfile, uni: University): Scholarship[] {
    return SCHOLARSHIPS.filter((sch) => {
        // Country match
        if (sch.country !== uni.country) return false;

        // Education stage match
        if (!sch.eligibility.educationStage.includes(profile.educationStage)) return false;

        // Country eligibility
        if (sch.eligibility.countries.length > 0 &&
            !sch.eligibility.countries.includes(profile.currentCountry) &&
            !sch.eligibility.countries.includes("All")) {
            return false;
        }

        return true;
    }).slice(0, 3); // Max 3 scholarships per path
}

/**
 * Generate timeline with milestones
 */
function generateTimeline(profile: StudentProfile, uni: University): TimelineEvent[] {
    const now = new Date();
    const events: TimelineEvent[] = [];

    // Application deadline (6 months from now)
    events.push({
        id: "evt-1",
        date: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
        title: "Application Deadline",
        description: `Submit application to ${uni.name}`,
        type: "deadline",
        importance: "high",
    });

    // Visa application (9 months from now)
    events.push({
        id: "evt-2",
        date: new Date(now.getTime() + 270 * 24 * 60 * 60 * 1000),
        title: "Visa Application",
        description: "Apply for student visa",
        type: "decision",
        importance: "high",
    });

    // Program start (12 months from now)
    events.push({
        id: "evt-3",
        date: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
        title: "Program Starts",
        description: "Begin studies",
        type: "milestone",
        importance: "high",
    });

    return events;
}
