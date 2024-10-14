import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ZipCode } from '@/app/_lib/mongodb/models/zipcodes';
import { ConnectToDatabase } from '@/app/_lib/mongodb/connection/db';
import * as XLSX from 'xlsx';
import path from 'path';
import { promises as fs } from 'fs';

const processExcelSheet = async (filePath) => {
  const fileBuffer = await fs.readFile(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
};

const parseRow = (row) => {
  if (!Array.isArray(row) || row.length < 3) return null;
  let zipcode = row[0];
  const population = parseInt(row[1], 10);
  const density = parseFloat(row[2]);
  
  if (!zipcode || isNaN(population) || isNaN(density)) return null;
  
  // Add leading zero to 4-digit zipcodes
  if (zipcode.length === 4) {
    zipcode = '0' + zipcode;
  }
  
  return { zipcode, population, density };
};

export async function GET(req) {
  try {
    console.log("Starting database connection...");
    await ConnectToDatabase();
    console.log("Database connected successfully.");

    const filePath = path.join(process.cwd(), 'app', 'pop.xlsx');
    console.log(`Reading Excel file from: ${filePath}`);
    const excelData = await processExcelSheet(filePath);
    console.log(`Total rows in Excel: ${excelData.length}`);

    // Get all existing zipcodes and their population densities from the database
    const existingZipcodes = await ZipCode.find({}, 'zipcode popdensity permitted');
    const zipcodeLookup = new Map(existingZipcodes.map(z => [z.zipcode, { popdensity: z.popdensity, permitted: z.permitted }]));

    let processedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    const bulkOps = [];

    for (const row of excelData) {
      try {
        const parsedData = parseRow(row);
        if (!parsedData) {
          skippedCount++;
          continue;
        }

        const { zipcode, density: populationDensity } = parsedData;

        const existingData = zipcodeLookup.get(zipcode);
        if (!existingData) {
          console.log(`Zipcode ${zipcode} not found in database. Skipping.`);
          skippedCount++;
          continue;
        }

        let needsUpdate = false;
        let updateOp = { $set: {} };

        // Check if population density needs updating
        if (existingData.popdensity !== populationDensity) {
          updateOp.$set.popdensity = populationDensity;
          needsUpdate = true;
        }

        // Check conditions for setting permitted to false
        if ((populationDensity > 35 || populationDensity === 0) && existingData.permitted !== false) {
          updateOp.$set.permitted = false;
          updateOp.$set.score = 0;
          needsUpdate = true;
        }

        if (needsUpdate) {
          bulkOps.push({
            updateOne: {
              filter: { zipcode: zipcode },
              update: updateOp
            }
          });
          updatedCount++;
        } else {
          console.log(`No changes needed for Zipcode ${zipcode}`);
        }

        processedCount++;
      } catch (docError) {
        console.error(`Error processing document: ${docError.message}`);
        errorCount++;
      }
    }

    // Perform bulk update
    if (bulkOps.length > 0) {
      await ZipCode.bulkWrite(bulkOps);
    }

    console.log(`Processing completed. Total rows: ${excelData.length}, Processed: ${processedCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
    return NextResponse.json({
      message: 'Zipcode population density update process completed',
      totalRows: excelData.length,
      processed: processedCount,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errorCount
    });

  } catch (error) {
    console.error('Error in main process:', error);
    return NextResponse.json({
      message: 'Failed to complete zipcode population density update process',
      error: error.message
    }, { status: 500 });
  }
}
// import { NextResponse } from 'next/server';
// import mongoose from 'mongoose';
// import { ZipCode } from '@/app/_lib/mongodb/models/zipcodes';
// import { ConnectToDatabase } from '@/app/_lib/mongodb/connection/db';
// import * as XLSX from 'xlsx';
// import path from 'path';
// import { promises as fs } from 'fs';

// const processExcelSheet = async (filePath) => {
//   const fileBuffer = await fs.readFile(filePath);
//   const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
//   const sheetName = workbook.SheetNames[0];
//   const sheet = workbook.Sheets[sheetName];
//   return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
// };

// const parseRow = (row) => {
//   if (!Array.isArray(row) || row.length < 3) return null;
//   const zipcode = row[0];
//   const population = parseInt(row[1], 10);
//   const density = parseFloat(row[2]);
  
//   if (!zipcode || isNaN(population) || isNaN(density)) return null;
  
//   return { zipcode, population, density };
// };

// export async function GET(req) {
//   try {
//     console.log("Starting database connection...");
//     await ConnectToDatabase();
//     console.log("Database connected successfully.");

//     const filePath = path.join(process.cwd(), 'app', 'pop.xlsx');
//     console.log(`Reading Excel file from: ${filePath}`);
//     const excelData = await processExcelSheet(filePath);
//     console.log(`Total rows in Excel: ${excelData.length}`);

//     let processedCount = 0;
//     let updatedCount = 0;
//     let errorCount = 0;
//     let skippedCount = 0;

//     for (const row of excelData) {
//       try {
//         const parsedData = parseRow(row);
//         if (!parsedData) {
//           skippedCount++;
//           continue;
//         }

//         const { zipcode, density: populationDensity } = parsedData;

//         console.log(`Processing Zipcode: ${zipcode}, Density: ${populationDensity}`);

//         // Exclude geojson field from the query
//         const doc = await ZipCode.findOne({ zipcode }).select('-geojson');

//         if (!doc) {
//           console.log(`Zipcode ${zipcode} not found in database. Skipping.`);
//           skippedCount++;
//           continue;
//         }

//         let wasUpdated = false;
//         let newPermittedStatus = doc.permitted;

//         // Update population density
//         if (doc.popdensity !== populationDensity) {
//           doc.popdensity = populationDensity;
//           wasUpdated = true;
//         }

//         // Check conditions for setting permitted to false
//         if ((populationDensity > 35 || populationDensity === 0) && doc.permitted !== false) {
//           newPermittedStatus = false;
//           doc.score = 0;
//           wasUpdated = true;
//         }

//         // Only update if changes were made and it wasn't already not permitted
//         if (wasUpdated) {
//           doc.permitted = newPermittedStatus;
//           await doc.save();
//           updatedCount++;
//           console.log(`Updated Zipcode ${zipcode}: Population Density: ${populationDensity}, Permitted: ${newPermittedStatus}, Score: ${doc.score}`);
//         } else {
//           console.log(`No changes needed for Zipcode ${zipcode}`);
//         }

//         processedCount++;
//       } catch (docError) {
//         console.error(`Error processing document: ${docError.message}`);
//         errorCount++;
//       }
//     }

//     console.log(`Processing completed. Total rows: ${excelData.length}, Processed: ${processedCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
//     return NextResponse.json({
//       message: 'Zipcode population density update process completed',
//       totalRows: excelData.length,
//       processed: processedCount,
//       updated: updatedCount,
//       skipped: skippedCount,
//       errors: errorCount
//     });

//   } catch (error) {
//     console.error('Error in main process:', error);
//     return NextResponse.json({
//       message: 'Failed to complete zipcode population density update process',
//       error: error.message
//     }, { status: 500 });
//   }
// }