import { ConnectToDatabase } from "../connection/db";
import { Counties } from "../models/counties";
import { ZipCode } from "../models/zipcodes";

export async function AddZipcodesFromCounties() {
    await ConnectToDatabase();

    try {
        // Fetch all counties
        const counties = await Counties.find({});

        // Extract all unique zipcodes from counties
        const allZipcodes = [...new Set(counties.flatMap(county => county.zipcodes))];

        // Prepare zipcode documents
        const zipcodeDocuments = allZipcodes.map(zipcode => ({
            zipcode,
            state: counties.find(county => county.zipcodes.includes(zipcode))?.state,
            permitted: counties.find(county => county.zipcodes.includes(zipcode))?.permitted
        }));

        // Insert zipcodes using bulkWrite for efficiency
        const bulkOps = zipcodeDocuments.map(doc => ({
            updateOne: {
                filter: { zipcode: doc.zipcode },
                update: { $set: doc },
                upsert: true
            }
        }));

        const result = await ZipCode.bulkWrite(bulkOps);

        console.log(`Processed ${result.nUpserted} new zipcodes and updated ${result.nModified} existing zipcodes`);
        return result;
    } catch (error) {
        console.error("Error in AddZipcodesFromCounties:", error);
        throw error;
    }
}