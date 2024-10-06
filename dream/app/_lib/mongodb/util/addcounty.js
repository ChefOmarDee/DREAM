import { ConnectToDatabase } from "../connection/db";
import { Counties } from "../models/counties";

export async function AddCounty(countyData) {
    await ConnectToDatabase();

    try {
        // Validate input data
        if (!Array.isArray(countyData)) {
            throw new Error("Input must be an array of county objects");
        }

        // Prepare the county documents
        const countiesToInsert = countyData.map(county => {
            if (!county.countyName || !county.state || !Array.isArray(county.zipCodes)) {
                console.warn("Skipping invalid county object:", county);
                return null;
            }

            return {
                countyname: county.countyName,
                state: county.state,
                permitted: county.isAllowed !== undefined ? county.isAllowed : true,
                zipcodes: county.zipCodes
            };
        }).filter(county => county !== null);

        // Use insertMany to insert all valid counties in one operation
        const result = await Counties.insertMany(countiesToInsert);

        console.log(`Successfully added ${result.length} counties`);
        return result;
    } catch (error) {
        console.error("Error in AddCounty:", error);
        throw error;
    }
}