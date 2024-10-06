import { ConnectToDatabase } from "../connection/db";
import ZipCode from '@/mongodb/models/zipcodes';
const zipcodes = require('zipcodes');

export async function UpdateZipcodeCoordinates() {
    await ConnectToDatabase();

    let updatedCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;
    let skippedCount = 0;

    try {
        const allZipcodes = await ZipCode.find({});
        console.log(`Found ${allZipcodes.length} zipcodes in the database`);

        for (const zipCodeDoc of allZipcodes) {
            const zipcode = zipCodeDoc.zipcode;
            console.log(`Processing zipcode: ${zipcode}`);

            // Skip if lat and long already exist
            if (zipCodeDoc.lat && zipCodeDoc.long) {
                console.log(`Skipping zipcode ${zipcode} as it already has coordinates`);
                skippedCount++;
                continue;
            }

            try {
                const location = zipcodes.lookup(zipcode);
                if (location) {
                    const { latitude, longitude, state } = location;

                    const result = await ZipCode.findOneAndUpdate(
                        { zipcode: zipcode },
                        { 
                            $set: { 
                                lat: latitude, 
                                long: longitude,
                                state: state
                            } 
                        },
                        { new: true }
                    );

                    if (result) {
                        updatedCount++;
                        console.log(`Updated zipcode ${zipcode}`);
                    }
                } else {
                    notFoundCount++;
                    console.log(`Location not found for zipcode ${zipcode}`);
                }
            } catch (error) {
                console.error(`Error updating zipcode ${zipcode}:`, error);
                errorCount++;
            }
        }

        console.log(`Updated ${updatedCount} zipcodes`);
        console.log(`Skipped ${skippedCount} zipcodes that already had coordinates`);
        console.log(`Encountered errors for ${errorCount} zipcodes`);
        console.log(`Location not found for ${notFoundCount} zipcodes`);
        return { updatedCount, skippedCount, errorCount, notFoundCount };
    } catch (error) {
        console.error('Error in UpdateZipcodeCoordinates:', error);
        throw error;
    }
}