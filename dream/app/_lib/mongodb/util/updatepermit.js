import { Counties } from '../models/counties';

import { ZipCode } from '../models/zipcodes';
export async function updateZipcodesForAllCounties() {
    try {
        // Step 1: Find all counties where permitted is set to false
        const counties = await Counties.find({ permitted: false });

        // Step 2: Iterate through each county and update its zip codes
        for (const county of counties) {
            const zipcodesArray = county.zipcodes;

            // Step 3: Update all zip codes in the Zipcodes collection that match the zip codes in the county
            await ZipCode.updateMany(
                { zipcode: { $in: zipcodesArray } },  // Match zipcodes in the array
                { $set: { permitted: false } }        // Set permitted to false
            );

            console.log(`Updated zip codes for county ${county.countyname}: ${zipcodesArray}`);
        }

        console.log("All counties with permitted set to false have been processed.");
    } catch (error) {
        console.error("Error updating zip codes:", error);
    }
}

// Example usage: run the function to update zip codes for all counties where permitted is false