import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ZipCode } from '@/app/_lib/mongodb/models/zipcodes';
import { ConnectToDatabase } from '@/app/_lib/mongodb/connection/db';

const fetchWeatherApi = async (url, params) => {
  try {
    const response = await fetch(url + '?' + new URLSearchParams(params));
    if (!response.ok) throw new Error(`Weather API request failed with status ${response.status}`);
    return response.json();
  } catch (error) {
    console.error(`Error fetching weather data: ${error.message}`);
    return null;
  }
};

const calculateYearlyAverage = (values) => {
  if (!values || values.length === 0) return null;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

const calculateScore = (windSpeed, precipitation, temperature, humidity) => {
  if (windSpeed === null || precipitation === null || temperature === null || humidity === null) {
    return null;
  }
  
  const windScore = Math.min(windSpeed / 20, 1);
  const precipScore = Math.max(0, 1 - precipitation / 50);
  const tempScore = Math.max(0, 1 - Math.abs(temperature - 15) / 15);
  const humidityScore = Math.max(0, 1 - Math.abs(humidity - 50) / 40);

  const weightedScore = (
    windScore * 0.4 +
    precipScore * 0.2 +
    tempScore * 0.3 +
    humidityScore * 0.1
  );

  return Math.min(Math.max(weightedScore, 0), 1);
};

export async function GET(req) {
  try {
    console.log("Starting database connection...");
    await ConnectToDatabase();
    console.log("Database connected successfully.");

    const batchSize = 100;
    let processedCount = 0;
    let errorCount = 0;
    const startingZipcode = '72379';

    let cursor = ZipCode.find({ zipcode: { $gte: startingZipcode } }).select('-geojson').cursor();

    console.log(`Starting document processing from zipcode ${startingZipcode}...`);

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      try {
        if (!doc.permitted) {
          doc.score = 0;
          await doc.save();
          processedCount++;
          console.log(`Processed document ${processedCount} (not permitted) - Zipcode: ${doc.zipcode}`);
          continue;
        }

        const params = {
          latitude: doc.lat,
          longitude: doc.long,
          start_date: "2022-01-01",
          end_date: "2022-12-31",
          models: ["CMCC_CM2_VHR4"],
          daily: ["temperature_2m_mean", "wind_speed_10m_mean", "relative_humidity_2m_mean", "precipitation_sum"]
        };

        const weatherData = await fetchWeatherApi('https://climate-api.open-meteo.com/v1/climate', params);
        
        if (weatherData) {
          const daily = weatherData.daily;
          const avgTemperature = calculateYearlyAverage(daily.temperature_2m_mean);
          const avgWindSpeed = calculateYearlyAverage(daily.wind_speed_10m_mean);
          const avgHumidity = calculateYearlyAverage(daily.relative_humidity_2m_mean);
          const avgPrecipitation = calculateYearlyAverage(daily.precipitation_sum);

          doc.windspeed = avgWindSpeed;
          doc.precip = avgPrecipitation;
          doc.temp = avgTemperature;
          doc.humidity = avgHumidity;

          const score = calculateScore(avgWindSpeed, avgPrecipitation, avgTemperature, avgHumidity);
          doc.score = score;

          await doc.save();

          console.log(`Zipcode: ${doc.zipcode}, Score: ${score ? score.toFixed(2) : 'N/A'}, Temperature: ${avgTemperature ? avgTemperature.toFixed(2) : 'N/A'}°C`);
        } else {
          console.log(`Failed to fetch weather data for Zipcode: ${doc.zipcode}`);
          errorCount++;
        }

        processedCount++;
        
        if (processedCount % batchSize === 0) {
          console.log(`Processed ${processedCount} documents so far... (Errors: ${errorCount})`);
        }
      } catch (docError) {
        console.error(`Error processing document for Zipcode ${doc.zipcode}: ${docError.message}`);
        errorCount++;
      }
    }

    console.log(`Document processing completed. Total processed: ${processedCount}, Errors: ${errorCount}`);
    return NextResponse.json({ 
      message: 'Weather data and scores update process completed',
      totalProcessed: processedCount,
      errors: errorCount
    });

  } catch (error) {
    console.error('Error in main process:', error);
    return NextResponse.json({ 
      message: 'Failed to complete weather data and scores update process',
      error: error.message
    }, { status: 500 });
  }
}