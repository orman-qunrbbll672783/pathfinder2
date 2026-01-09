// Core TypeScript interfaces for PathFinder

export type SituationType =
    | "dont_know"
    | "study_abroad"
    | "unsure_choice"
    | "something_wrong"
    | "explore_safely";

export type BudgetLevel = "low" | "medium" | "high";
export type ConfidenceLevel = "low" | "medium" | "high";
export type FearType = "money" | "visa" | "failure" | "time";
export type EducationStage =
    | "high_school"
    | "bachelors"
    | "masters"
    | "phd"
    | "bootcamp"
    | "working";

export interface StudentProfile {
    id: string;
    situation: SituationType;
    currentCountry: string;
    targetCountry?: string; // NEW: Country they want to study in
    educationStage: EducationStage;
    budgetLevel: BudgetLevel;
    mainFear: FearType;
    confidenceLevel: ConfidenceLevel;
    createdAt: Date;
}

export interface University {
    id: string;
    name: string;
    country: string;
    city: string;
    ranking: number;
    teachingStyle: "lecture-heavy" | "project-based" | "research-focused" | "mixed";
    workloadIntensity: number; // 1-10 scale
    languageRequirements: {
        primary: string;
        alternatives?: string[];
        proficiencyRequired: "basic" | "intermediate" | "advanced";
    };
    tuition: {
        currency: string;
        annualCost: number;
        tier: "free" | "low" | "medium" | "high";
    };
    visaDifficulty: "easy" | "medium" | "hard";
    internationalStudentSupport: number; // 1-10 scale
    acceptanceRate: number; // percentage
    website: string;
    imageUrl?: string; // NEW: University campus image
    dataSource?: { // NEW: Data transparency
        tuition: string;
        ranking: string;
        workload: string;
        visa: string;
        acceptance: string;
    };
    scrapedAt: Date;
}

export interface Scholarship {
    id: string;
    name: string;
    provider: string;
    country: string;
    eligibility: {
        countries: string[];
        minGPA?: number;
        educationStage: EducationStage[];
        ageLimit?: number;
        workExperienceRequired?: boolean;
    };
    amount: {
        currency: string;
        value: number;
        coverage: "full" | "partial";
    };
    deadline: Date;
    competitiveness: "low" | "medium" | "high";
    applicationComplexity: number; // 1-10 scale
    website: string;
    scrapedAt: Date;
}

export interface Country {
    code: string;
    name: string;
    costOfLiving: {
        tier: "low" | "medium" | "high";
        monthlyAverage: number;
        currency: string;
    };
    languageBarrier: number; // 1-10 scale
    cultureShockRisk: number; // 1-10 scale
    visaProcessing: {
        difficulty: "easy" | "medium" | "hard";
        averageProcessingDays: number;
        successRate: number; // percentage
        requirements: string[];
    };
    postStudyWork: {
        allowed: boolean;
        duration?: string;
        restrictions?: string;
    };
    safetyRating: number; // 1-10 scale
    scrapedAt: Date;
}

export interface Bootcamp {
    id: string;
    name: string;
    provider: string;
    field: string;
    duration: {
        weeks: number;
        hoursPerWeek: number;
    };
    cost: {
        currency: string;
        total: number;
    };
    format: "online" | "in-person" | "hybrid";
    jobPlacementRate: number; // percentage
    legitimacyScore: number; // 1-10 scale
    skillLevel: "beginner" | "intermediate" | "advanced";
    website: string;
    scrapedAt: Date;
}

export interface Internship {
    id: string;
    company: string;
    position: string;
    country: string;
    paid: boolean;
    compensation?: {
        currency: string;
        amount: number;
        period: "hourly" | "monthly";
    };
    duration: string;
    skillRequirements: string[];
    legitimacyScore: number; // 1-10 scale
    competitiveness: "low" | "medium" | "high";
    probabilityScore: number; // 1-10 scale (can I actually get this?)
    website: string;
    scrapedAt: Date;
}

export interface FitScore {
    overall: number; // 1-100
    breakdown: {
        teaching: number;
        workload: number;
        language: number;
        cost: number;
        visa: number;
        support: number;
    };
}

export interface RiskAssessment {
    financial: {
        severity: "low" | "medium" | "high";
        likelihood: number; // percentage
        description: string;
        mitigation: string[];
    };
    visa: {
        severity: "low" | "medium" | "high";
        likelihood: number;
        description: string;
        mitigation: string[];
    };
    academic: {
        severity: "low" | "medium" | "high";
        likelihood: number;
        description: string;
        mitigation: string[];
    };
    time: {
        severity: "low" | "medium" | "high";
        likelihood: number;
        description: string;
        mitigation: string[];
    };
}

export interface Path {
    id: string;
    type: "university" | "bootcamp" | "internship" | "alternative";
    name: string;
    description: string;
    fitScore: FitScore;
    risks: RiskAssessment;
    notForYouIf: string[];
    details: University | Bootcamp | Internship | any;
    scholarships?: Scholarship[];
    timeline: TimelineEvent[];
}

export interface TimelineEvent {
    id: string;
    date: Date;
    title: string;
    description: string;
    type: "decision" | "deadline" | "milestone" | "risk" | "fallback";
    importance: "low" | "medium" | "high";
    completed?: boolean;
}

export interface Scenario {
    type: "best" | "likely" | "failure";
    title: string;
    description: string;
    timeline: TimelineEvent[];
    outcomes: {
        year: number;
        description: string;
    }[];
    recoveryPlan?: string[]; // Only for failure scenario
}

export interface AIExplanation {
    pathId: string;
    explanation: string;
    tradeoffs: {
        gains: string[];
        losses: string[];
    };
    uncertainties: string[];
    assumptions: string[];
    dataSources: string[];
    generatedAt: Date;
}

export interface EmergencyScenario {
    type: "visa_rejected" | "money_runs_out" | "academic_failure" | "health_issue";
    title: string;
    description: string;
    recoverySteps: {
        step: number;
        action: string;
        timeline: string;
        difficulty: "easy" | "medium" | "hard";
    }[];
    fallbackPaths: Path[];
}
