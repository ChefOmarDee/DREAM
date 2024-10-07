const fs = require('fs');
const readline = require('readline');
const { MongoClient } = require('mongodb');

// MongoDB connection URI and database/collection info
const uri = 'mongodb+srv://DreamHacks:Quoc@cluster0.rez7l.mongodb.net/DreamDB?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'DreamDB';
const collectionName = 'Zipcodes';

// Function to process the file and update MongoDB
async function extractZipCodesAndCoordinates() {
    const fileStream = fs.createReadStream('C:\\Users\\dahpa\\dream\\DREAM\\dream\\zipcodeGeojson.geojson');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity // Recognize all instances of CR LF as a single line break
    });

    // Connect to MongoDB
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Process the file line by line
    for await (const line of rl) {
        try {
            // Remove trailing comma if it exists
            const trimmedLine = line.trim().replace(/,\s*$/, '');

            // Parse the line as JSON
            const feature = JSON.parse(trimmedLine);

            // Extract the ZIP code from properties
            const zipcode = feature.properties.ZCTA5CE20;

            // Extract coordinates, assuming it's a MultiPolygon
            const coordinates = feature.geometry.coordinates[0];

            // Update MongoDB document if the zip code exists
            const result = await collection.updateOne(
                { zipcode: zipcode },
                { $set: { geojson: coordinates } }
            );

            // Optional: You can remove or minimize logs, but only log updates or errors
            if (result.matchedCount > 0) {
                console.log(`Updated GeoJSON for zip code: ${zipcode}`);
            } else {
                console.log(`Zip code not found in database: ${zipcode}`);
            }
        } catch (error) {
            console.error('Error processing line:', error.message);
        }
    }

    // Close the MongoDB connection
    await client.close();
    console.log('Finished processing the GeoJSON file.');
}

// Run the function
extractZipCodesAndCoordinates();
