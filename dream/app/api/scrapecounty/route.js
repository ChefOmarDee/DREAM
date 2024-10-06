import { NextResponse } from "next/server";
import { CSVToCountyObjects } from "@/app/_lib/scraping/zipcode";
import { ScrapeCounties } from "@/app/_lib/scraping/county";
import { AddCounty } from "@/app/_lib/mongodb/util/addcounty";

// Function to normalize county names
function normalizeCountyName(name) {
    return name.toLowerCase()
               .replace(/\s+county$/i, '')
               .replace(/\s+/g, ' ')
               .trim();
}

export async function GET(req) {
    try {
        // Fetch counties from CSV
        const countyObjectsFromCSV = await CSVToCountyObjects();

        // Fetch counties from scraping Wikipedia
        const countyNamesFromScrape = await ScrapeCounties();

        const disallowedStates = ['Kentucky', 'Florida', 'Vermont', 'Connecticut', 'Tennessee'];
        
        // Create a map to store unique counties
        const countyMap = new Map();

        // Process CSV counties
        countyObjectsFromCSV.counties.forEach(({ countyName, isAllowed, zipCodes }) => {
            let [name, state] = countyName.split(',').map(s => s.trim());
            name = normalizeCountyName(name);
            const key = `${name},${state}`;
            if (!countyMap.has(key)) {
                countyMap.set(key, {
                    countyName: name,
                    state: state,
                    isAllowed: !disallowedStates.includes(state),
                    zipCodes: new Set(zipCodes)
                });
            } else {
                // Merge zipcodes if the county already exists
                zipCodes.forEach(zip => countyMap.get(key).zipCodes.add(zip));
            }
        });

        // Process scraped counties
        countyNamesFromScrape
            .filter(fullName => fullName.toLowerCase().includes("county"))
            .forEach(fullName => {
                let [name, state] = fullName.split(',').map(s => s.trim());
                name = normalizeCountyName(name);
                const key = `${name},${state}`;
                if (!countyMap.has(key)) {
                    countyMap.set(key, {
                        countyName: name,
                        state: state,
                        isAllowed: !disallowedStates.includes(state),
                        zipCodes: new Set()
                    });
                }
            });

        // Convert the map to an array and sort zipCodes
        const allCounties = Array.from(countyMap.values()).map(county => ({
            ...county,
            countyName: `${county.countyName} County`,
            zipCodes: Array.from(county.zipCodes).sort((a, b) => a.localeCompare(b))
        }));

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