import axios from "axios";
import * as cheerio from "cheerio";
import { University } from "../types";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "lib", "data");

/**
 * Scrape university data from QS World Rankings
 * This is an example scraper - you can customize for specific sites
 */
export async function scrapeQSRankings(limit: number = 50): Promise<University[]> {
    console.log("Scraping QS World Rankings...");

    const universities: University[] = [];

    try {
        // Note: This is a simplified example. Real scraping would need to handle:
        // - Pagination
        // - Rate limiting
        // - Error handling
        // - Dynamic content (may need Puppeteer)

        const response = await axios.get("https://www.topuniversities.com/world-university-rankings", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data);

        // This selector would need to be updated based on actual site structure
        $(".ranking-item").slice(0, limit).each((index, element) => {
            const name = $(element).find(".university-name").text().trim();
            const country = $(element).find(".country").text().trim();
            const ranking = index + 1;

            if (name && country) {
                universities.push({
                    id: `uni-${Date.now()}-${index}`,
                    name,
                    country,
                    city: "Unknown", // Would need additional scraping
                    ranking,
                    teachingStyle: "mixed", // Default, would need specific scraping
                    workloadIntensity: 7, // Default
                    languageRequirements: {
                        primary: "English",
                        proficiencyRequired: "advanced",
                    },
                    tuition: {
                        currency: "USD",
                        annualCost: 0, // Would need specific scraping
                        tier: "medium",
                    },
                    visaDifficulty: "medium",
                    internationalStudentSupport: 7,
                    acceptanceRate: 15,
                    website: `https://www.${name.toLowerCase().replace(/\s+/g, "")}.edu`,
                    scrapedAt: new Date(),
                });
            }
        });
    } catch (error) {
        console.error("Error scraping QS Rankings:", error);
    }

    return universities;
}

/**
 * Scrape individual university website for detailed information
 */
export async function scrapeUniversityDetails(universityUrl: string): Promise<Partial<University> | null> {
    try {
        const response = await axios.get(universityUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data);

        // Extract tuition information (selectors would vary by site)
        const tuitionText = $('*:contains("tuition")').first().text();
        const tuitionMatch = tuitionText.match(/\$?([\d,]+)/);
        const tuitionCost = tuitionMatch ? parseInt(tuitionMatch[1].replace(/,/g, "")) : 0;

        return {
            tuition: {
                currency: "USD",
                annualCost: tuitionCost,
                tier: tuitionCost === 0 ? "free" : tuitionCost < 10000 ? "low" : tuitionCost < 30000 ? "medium" : "high",
            },
            scrapedAt: new Date(),
        };
    } catch (error) {
        console.error(`Error scraping ${universityUrl}:`, error);
        return null;
    }
}

/**
 * Manual data entry helper - for when scraping isn't feasible
 * This creates a template for manual data entry
 */
export function createUniversityTemplate(): University {
    return {
        id: `uni-${Date.now()}`,
        name: "",
        country: "",
        city: "",
        ranking: 0,
        teachingStyle: "mixed",
        workloadIntensity: 5,
        languageRequirements: {
            primary: "English",
            proficiencyRequired: "advanced",
        },
        tuition: {
            currency: "USD",
            annualCost: 0,
            tier: "medium",
        },
        visaDifficulty: "medium",
        internationalStudentSupport: 5,
        acceptanceRate: 20,
        website: "",
        scrapedAt: new Date(),
    };
}

/**
 * Save universities to JSON file
 */
export function saveUniversities(universities: University[]): void {
    const filePath = join(DATA_DIR, "universities.json");
    writeFileSync(filePath, JSON.stringify(universities, null, 2));
    console.log(`Saved ${universities.length} universities to ${filePath}`);
}

/**
 * Load universities from JSON file
 */
export function loadUniversities(): University[] {
    const filePath = join(DATA_DIR, "universities.json");

    if (!existsSync(filePath)) {
        return [];
    }

    const data = readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}

/**
 * Merge scraped data with existing data
 */
export function mergeUniversityData(existing: University[], newData: University[]): University[] {
    const merged = [...existing];

    for (const newUni of newData) {
        const existingIndex = merged.findIndex(u => u.name === newUni.name && u.country === newUni.country);

        if (existingIndex >= 0) {
            // Update existing entry
            merged[existingIndex] = { ...merged[existingIndex], ...newUni };
        } else {
            // Add new entry
            merged.push(newUni);
        }
    }

    return merged;
}

// Example: Manually curated universities (high-quality data for MVP)
export const CURATED_UNIVERSITIES: University[] = [
    {
        id: "uni-mit",
        name: "Massachusetts Institute of Technology",
        country: "United States",
        city: "Cambridge",
        ranking: 1,
        teachingStyle: "research-focused",
        workloadIntensity: 10,
        languageRequirements: {
            primary: "English",
            proficiencyRequired: "advanced",
        },
        tuition: {
            currency: "USD",
            annualCost: 53790,
            tier: "high",
        },
        visaDifficulty: "medium",
        internationalStudentSupport: 9,
        acceptanceRate: 4,
        website: "https://www.mit.edu",
        scrapedAt: new Date(),
    },
    {
        id: "uni-tum",
        name: "Technical University of Munich",
        country: "Germany",
        city: "Munich",
        ranking: 37,
        teachingStyle: "research-focused",
        workloadIntensity: 8,
        languageRequirements: {
            primary: "German",
            alternatives: ["English"],
            proficiencyRequired: "intermediate",
        },
        tuition: {
            currency: "EUR",
            annualCost: 0,
            tier: "free",
        },
        visaDifficulty: "easy",
        internationalStudentSupport: 8,
        acceptanceRate: 8,
        website: "https://www.tum.de",
        scrapedAt: new Date(),
    },
    {
        id: "uni-nus",
        name: "National University of Singapore",
        country: "Singapore",
        city: "Singapore",
        ranking: 8,
        teachingStyle: "mixed",
        workloadIntensity: 9,
        languageRequirements: {
            primary: "English",
            proficiencyRequired: "advanced",
        },
        tuition: {
            currency: "SGD",
            annualCost: 17550,
            tier: "medium",
        },
        visaDifficulty: "easy",
        internationalStudentSupport: 9,
        acceptanceRate: 5,
        website: "https://www.nus.edu.sg",
        scrapedAt: new Date(),
    },
    // Add more curated universities here...
];
