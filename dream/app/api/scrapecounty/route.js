import { NextResponse } from "next/server";
import { CSVToCountyObjects } from "@/app/_lib/scraping/zipcode";
import { ScrapeCounties } from "@/app/_lib/scraping/county";
import { AddCounty } from "@/app/_lib/mongodb/util/addcounty";

export async function GET(req) {
    try {
        // Fetch counties from CSV
        const countyObjectsFromCSV = await CSVToCountyObjects();

        // Fetch counties from scraping Wikipedia
        const countyNamesFromScrape = await ScrapeCounties();

        const disallowedStates = ['Kentucky', 'Florida', 'Vermont', 'Connecticut', 'Tennessee'];
        
        // Prepare scraped counties with state information
        const scrapedCounties = countyNamesFromScrape
            .filter(fullName => fullName.toLowerCase().includes("county"))
            .map(fullName => {
                const countyName = fullName.trim();
                const state = countyName.split(', ')[1];
                return {
                    countyName: countyName,
                    state: state.trim(),
                    isAllowed: !disallowedStates.includes(state.trim()),
                    zipCodes: [] // Add an empty array for zipCodes
                };
            });

        // Prepare CSV counties with state information
        const csvCounties = countyObjectsFromCSV.counties.map(({ countyName, isAllowed, zipCodes }) => {
            return {
                countyName: countyName.trim(),
                state: countyName.split(', ')[1].trim(),
                isAllowed,
                zipCodes
            };
        });

        // Combine all counties into a single array
        const allCounties = [...csvCounties, ...scrapedCounties];

        // Add counties to the database
        await AddCounty(allCounties);

        // Return the combined data as JSON
        return NextResponse.json({ allCounties });
    } catch (error) {
        console.error("Error processing counties:", error);
        return NextResponse.json(
            { error: "Failed to process counties" },
            { status: 500 }
        );
    }
}