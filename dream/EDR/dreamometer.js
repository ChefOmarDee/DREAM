import { NextResponse } from "next/server";
import https from "https";
import fs from "fs";
import { ZipCode } from "@/mongodb/models/zipcodes";
import { ConnectToDatabase } from "@/mongodb/connection/db";

// Logging function
function log(message, type = "info") {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
  console.log(logMessage);
  fs.appendFileSync("zipcode_processing.log", logMessage);
}

// Normalize function
function normalize(value, min, max) {
  return (value - min) / (max - min);
}

// Calculate score factor function
function calculateScoreFactor(Wavg, Tfac, Hfac, Pfac) {
  const normalizedWavg = normalize(Wavg, 3, 25);
  const normalizedTfac = normalize(Tfac, -30, 50);
  const normalizedHfac = normalize(Hfac, 0, 100);
  const normalizedPfac = normalize(Pfac, 0, 2000);

  return 0.45 * normalizedWavg + 0.10 * normalizedPfac + 0.20 * normalizedTfac + 0.25 * normalizedHfac;
}

function fetchData(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const makeRequest = (attemptsLeft) => {
      const startTime = Date.now();
      const req = https.get(url, (response) => {
        if (response.statusCode !== 200) {
          if (attemptsLeft > 0) {
            log(`HTTP error! status: ${response.statusCode}. Retrying...`, "warn");
            return makeRequest(attemptsLeft - 1);
          } else {
            reject(new Error(`HTTP error! status: ${response.statusCode}`));
            return;
          }
        }

        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            const endTime = Date.now();
            log(`API call completed in ${endTime - startTime}ms: ${url}`);
            resolve(jsonData);
          } catch (e) {
            reject(new Error(`JSON parsing error: ${e.message}`));
          }
        });
      });

      req.on('error', (err) => {
        if (attemptsLeft > 0) {
          log(`Fetch error: ${err.message}. Retrying...`, "warn");
          return makeRequest(attemptsLeft - 1);
        } else {
          reject(new Error(`Fetch error: ${err.message}`));
        }
      });

      req.on('timeout', () => {
        req.destroy();
        if (attemptsLeft > 0) {
          log(`Request timed out. Retrying...`, "warn");
          return makeRequest(attemptsLeft - 1);
        } else {
          reject(new Error('Request timed out'));
        }
      });

      req.setTimeout(10000);
    };

    makeRequest(retries);
  });
}

async function getEnvData(startDate, endDate, latitude, longitude) {
  const startTime = Date.now();
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start=${startDate}&end=${endDate}&hourly=wind_speed_10m,temperature_2m,relative_humidity_2m,precipitation&timezone=auto`;
  
  const jsonData = await fetchData(url);
  
  const windSpeeds = jsonData.hourly.wind_speed_10m;
  const temperatures = jsonData.hourly.temperature_2m;
  const humidity = jsonData.hourly.relative_humidity_2m;
  const precipitation = jsonData.hourly.precipitation;

  const avgWS = windSpeeds.length ? (windSpeeds.reduce((sum, speed) => sum + speed, 0) / windSpeeds.length) : 0;
  const avgTemp = temperatures.length ? (temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length) : 0;
  const avgHumidity = humidity.length ? (humidity.reduce((sum, hum) => sum + hum, 0) / humidity.length) : 0;
  const avgPrecipitation = precipitation.length ? (precipitation.reduce((sum, precip) => sum + precip, 0) / precipitation.length) : 0;

  const score = calculateScoreFactor(avgWS, avgTemp, avgHumidity, avgPrecipitation);
  const endTime = Date.now();
  log(`Environmental data fetched in ${endTime - startTime}ms for coordinates: ${latitude}, ${longitude}`);

  return {
    score,
    avgWS,
    avgTemp,
    avgHumidity,
    avgPrecipitation,
  };
}

async function processZipCodeBatch(zipCodes, startDate, endDate) {
  log(`Starting to process batch of ${zipCodes.length} zipcodes`);
  const batchStartTime = Date.now();
  let successCount = 0;
  let failureCount = 0;

  const bulkOps = [];

  for (const zipCode of zipCodes) {
    const zipStartTime = Date.now();
    if (zipCode.permitted !== false) {
      try {
        const envData = await getEnvData(startDate, endDate, zipCode.lat, zipCode.long);
        bulkOps.push({
          updateOne: {
            filter: { _id: zipCode._id },
            update: { 
              $set: {
                score: envData.score,
                windspeed: envData.avgWS,
                temp: envData.avgTemp,
                humidity: envData.avgHumidity,
                precip: envData.avgPrecipitation,
              }
            }
          }
        });
        successCount++;
        const zipEndTime = Date.now();
        log(`Processed zipcode ${zipCode._id} in ${zipEndTime - zipStartTime}ms`);
      } catch (error) {
        failureCount++;
        log(`Error processing zipcode ${zipCode._id}: ${error.message}`, "error");
      }
    } else {
      bulkOps.push({
        updateOne: {
          filter: { _id: zipCode._id },
          update: { $set: { score: 0 } }
        }
      });
      successCount++;
      const zipEndTime = Date.now();
      log(`Processed non-permitted zipcode ${zipCode._id} in ${zipEndTime - zipStartTime}ms`);
    }
  }

  if (bulkOps.length > 0) {
    await ZipCode.bulkWrite(bulkOps);
  }

  const batchEndTime = Date.now();
  log(`Batch processed in ${batchEndTime - batchStartTime}ms. Success: ${successCount}, Failures: ${failureCount}`);

  return { successCount, failureCount };
}

export async function GET(req) {
  const overallStartTime = Date.now();
  try {
    log("Starting database update process");
    await ConnectToDatabase();

    const startDate = "2023-01-01";
    const endDate = "2023-12-31";
    const batchSize = 25;

    const totalZipCodes = await ZipCode.countDocuments({ geojson: { $exists: true, $ne: null, $not: { $size: 0 } } });
    const totalBatches = Math.ceil(totalZipCodes / batchSize);

    log(`Total zip codes to process: ${totalZipCodes}`);
    log(`Total batches: ${totalBatches}`);

    let processedZipCodes = 0;
    let totalSuccesses = 0;
    let totalFailures = 0;

    for (let i = 0; i < totalBatches; i++) {
      const batchStartTime = Date.now();
      log(`Starting batch ${i + 1}/${totalBatches}`);
      
      const zipCodes = await ZipCode.find(
        { geojson: { $exists: true, $ne: null, $not: { $size: 0 } } },
        { _id: 1, lat: 1, long: 1, permitted: 1 }  // Only select needed fields
      )
        .skip(i * batchSize)
        .limit(batchSize);

      const { successCount, failureCount } = await processZipCodeBatch(zipCodes, startDate, endDate);

      processedZipCodes += zipCodes.length;
      totalSuccesses += successCount;
      totalFailures += failureCount;

      const batchEndTime = Date.now();
      log(`Batch ${i + 1}/${totalBatches} completed in ${batchEndTime - batchStartTime}ms. Processed ${processedZipCodes} out of ${totalZipCodes} zip codes`);

      // Delay between batches
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const overallEndTime = Date.now();
    const totalTime = (overallEndTime - overallStartTime) / 1000; // Convert to seconds
    log(`Database update completed in ${totalTime} seconds`);
    log(`Total processed: ${processedZipCodes}, Successes: ${totalSuccesses}, Failures: ${totalFailures}`);

    return NextResponse.json({ 
      message: "Database updated successfully",
      totalProcessed: processedZipCodes,
      totalSuccesses,
      totalFailures,
      totalTime
    });
  } catch (error) {
    log(`Error updating database: ${error.message}`, "error");
    return NextResponse.json(
      { error: "Failed to update database" },
      { status: 500 }
    );
  }
}