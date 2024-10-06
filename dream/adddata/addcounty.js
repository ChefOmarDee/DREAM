const { ConnectToDatabase } = require("../mongodb/connection/db")
const Counties = require("../mongodb/models/counties")

async function AddCounty(countyname, zipcodes, permitted) {
	await ConnectToDatabase();

	try {
		const existingCounty = await Counties.findOne({ countyname });
		
		if (existingCounty) {
			console.log("already exists");
			return;
		}

		const county = await Counties.create({
			countyname,
			zipcodes,
			permitted,
		});
		return;
	} catch (error) {
		console.error("Error in add county:", error);
		throw error;
	}
}

module.exports = { AddCounty };