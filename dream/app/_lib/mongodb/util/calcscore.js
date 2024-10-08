const { ConnectToDatabase } = require("../mongodb/connection/db");
const { calculateScoreFactor } = require("./dreamometer");
const Zipcode = require("../mongodb/models/zipcodes");
const mongoose = require("mongoose");

export async function calculateScoreFactors() {
    try {
        await ConnectToDatabase();
        console.log("Connected to database successfully");

        const count = await Zipcode.countDocuments();
        console.log(`Number of documents in Zipcode collection: ${count}`);

        const batchSize = 1000; // Process zipcodes in batches
        let processedCount = 0;

        while (processedCount < count) {
            const zipcodes = await Zipcode.find({})
                .skip(processedCount)
                .limit(batchSize)
                .lean(); // Use lean() for better performance

            console.log(`Processing batch of ${zipcodes.length} zipcodes`);

            const bulkOps = zipcodes
                .filter(zipobj => 
                    zipobj.windspeed != null &&
                    zipobj.temp != null &&
                    zipobj.humidity != null &&
                    zipobj.precip != null
                )
                .map(zipobj => ({
                    updateOne: {
                        filter: { _id: zipobj._id },
                        update: {
                            $set: {
                                lucidscore: calculateScoreFactor(
                                    zipobj.windspeed,
                                    zipobj.temp,
                                    zipobj.humidity,
                                    zipobj.precip
                                )
                            }
                        }
                    }
                }));

            if (bulkOps.length > 0) {
                const result = await Zipcode.bulkWrite(bulkOps);
                console.log(`Updated ${result.modifiedCount} zipcodes with lucid scores`);
            }

            processedCount += zipcodes.length;
            console.log(`Processed ${processedCount} out of ${count} zipcodes`);
        }

        console.log("Finished processing all zipcodes");
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        console.log("Closing database connection");
        await mongoose.connection.close();
    }
}
