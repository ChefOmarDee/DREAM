import { ConnectToDatabase } from "../connection/db";
import { Counties } from "../models/counties";

export async function AddCounty(countyData) {
    await ConnectToDatabase();

    try {
        // Validate input data
        if (!Array.isArray(countyData)) {
            throw new Error("Input must be an array of county objects");
        }

        let updatedCount = 0;
        let insertedCount = 0;

        for (const county of countyData) {
            if (!county.countyName || !county.state || !Array.isArray(county.zipCodes)) {
                console.warn("Skipping invalid county object:", county);
                continue;
            }

            // Normalize the county name
            const normalizedCountyName = county.countyName.toLowerCase().trim();

            const filter = { 
                countyname: normalizedCountyName,
                state: county.state 
            };

            const update = {
                $set: {
                    permitted: county.isAllowed !== undefined ? county.isAllowed : true,
                    state: county.state, // Ensure state is always set/updated
                },
                $addToSet: { zipcodes: { $each: county.zipCodes } }
            };

            const options = { upsert: true, new: true };

            try {
                const result = await Counties.findOneAndUpdate(filter, update, options);

                if (result.upserted) {
                    insertedCount++;
                } else {
                    updatedCount++;
                }
            } catch (err) {
                if (err.code === 11000) {
                    // Duplicate key error
                    console.warn(`Duplicate county found: ${normalizedCountyName}, ${county.state}. Updating existing record.`);
                    // Try to update without upsert
                    await Counties.updateOne(filter, update);
                    updatedCount++;
                } else {
                    throw err;
                }
            }
        }

        console.log(`Updated ${updatedCount} counties and inserted ${insertedCount} new counties`);
        return { updatedCount, insertedCount };
    } catch (error) {
        console.error("Error in AddCounty:", error);
        throw error;
    }
}