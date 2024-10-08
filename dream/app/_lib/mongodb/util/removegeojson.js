import ZipCode from "@/mongodb/models/zipcodes";
import { ConnectToDatabase } from "../connection/db";

export async function removeZipcodesWithoutGeoJSON() {
    try {
        // Ensure mongoose is connected
        await ConnectToDatabase();

        // Remove documents where geojson does not exist, is null, or is an empty array
        const result = await ZipCode.deleteMany({
            $or: [
                { geojson: { $exists: false } }, // GeoJSON does not exist
                { geojson: null },               // GeoJSON is null
                { geojson: { $size: 0 } }        // GeoJSON is an empty array
            ]
        });

        console.log(`Removed ${result.deletedCount} Zipcode documents without GeoJSON data`);

    } catch (error) {
        console.error('Error removing Zipcodes:', error);
    }
}
