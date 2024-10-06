import { NextResponse } from "next/server";
import { CSVToCountyObjects } from "@/app/_lib/scraping/zipcode";
import { ScrapeCounties } from "@/app/_lib/scraping/county";

// Function to fetch both scraped and CSV counties
export async function GET(req) {
    try {
        // Fetch counties from CSV
        const countyObjectsFromCSV = await CSVToCountyObjects();

        // Fetch counties from scraping Wikipedia
        const countyNamesFromScrape = await ScrapeCounties();

        // Create a combined result for counties
        const disallowedStates = ['Kentucky', 'Florida', 'Vermont', 'Connecticut', 'Tennessee'];
        
        // Prepare scraped counties with state information
        const scrapedCounties = countyNamesFromScrape
            .filter(fullName => fullName.toLowerCase().includes("county"))
            .map(fullName => {
                // No split; keep full name as is
                const countyName = fullName.trim(); // Trim to clean whitespace
                const state = countyName.split(', ')[1]; // Extract state from full name
                return {
                    countyName: countyName, // Keep full name
                    state: state.trim(), // Get state
                    isAllowed: !disallowedStates.includes(state.trim()) // Check against disallowed states
                };
            });

        // Prepare CSV counties with state information
        const csvCounties = countyObjectsFromCSV.counties.map(({ countyName, isAllowed, zipCodes }) => {
            return {
                countyName: countyName.trim(), // Keep county name as is
                state: countyName.split(', ')[1].trim(), // Extract state from county name
                isAllowed,
                zipCodes
            };
        });

        // Merge scraped counties and CSV counties
        const combinedCountyData = {
            csvCounties,
            scrapedCounties
        };

        // Return the combined data as JSON
        return NextResponse.json({ combinedCountyData });
    } catch (error) {
        console.error("Error processing counties:", error);
        return NextResponse.json(
            { error: "Failed to process counties" },
            { status: 500 }
        );
    }
}
