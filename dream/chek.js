const { ConnectToDatabase } = require("./mongodb/connection/db");
const XLSX = require('xlsx'); 
const mongoose = require('mongoose');
const Zipcode = require('./mongodb/models/zipcodes'); 

async function readExcelFile(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;

    
    const sheet = workbook.Sheets[sheetNames[1]]; 
    const data = XLSX.utils.sheet_to_json(sheet);
    return data; 
}

async function CheckPopulations() {
    await ConnectToDatabase();

    try {
        const excelData = await readExcelFile('./Population-Density-Final.xlsx'); 

        for (const row of excelData) {
            
            const zip = row.__EMPTY; 
            const density = row.__EMPTY_2; 

            console.log(`Processing zip: ${zip}, density: ${density}`); 

            
            const existingZipcode = await Zipcode.findOne({ zipcode: zip });
            console.log(existingZipcode)
            if (existingZipcode) {
                try {
                    
                    await Zipcode.findByIdAndUpdate(
                        existingZipcode._id,
                        { 
                            permitted: density <= 35,
                            popdensity: density
                        },
                        { new: true }
                    );
                } catch (err) {
                    console.error(`Error updating population density for ${zip}:`, err);
                    await Zipcode.findByIdAndUpdate(
                        existingZipcode._id,
                        { 
                            permitted: false
                        },
                        { new: true }
                    );
                    continue;
                }
            } else {
                console.warn(`Zipcode ${zip} not found in the database.`);
            }
        }
    } catch (err) {
        console.error("Error processing population densities:", err);
    }
}

CheckPopulations();