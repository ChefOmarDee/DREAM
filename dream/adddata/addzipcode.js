const { ConnectToDatabase } = require("../mongodb/connection/db")
const ZipCode = require("../mongodb/models/zipcodes")

async function AddZipcode(zipcode, popdensity, lat, long, windspeed, precip, temp, humidity, geojson) {
	await ConnectToDatabase();

	try {
		const existingZipcode = await ZipCode.findOne({ zipcode });
		
		if (existingZipcode) {
			console.log("already exists");
			return;
		}

		const zipcodeinfo = await ZipCode.create({
			zipcode, 
            popdensity, 
            lat, 
            long, 
            windspeed, 
            precip, 
            temp, 
            humidity, 
            geojson
		});
		return;
	} catch (error) {
		console.error("Error in add zipcode:", error);
		throw error;
	}
}

module.exports = { AddZipcode };