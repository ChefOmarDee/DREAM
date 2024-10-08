// import { NextResponse } from 'next/server';
// import mongoose from 'mongoose';
// import { ZipCode } from '@/app/_lib/mongodb/models/zipcodes';
// import { ConnectToDatabase } from '@/app/_lib/mongodb/connection/db';

// const fetchWeatherApi = async (url, params) => {
//   const response = await fetch(url + '?' + new URLSearchParams(params));
//   if (!response.ok) throw new Error('Weather API request failed');
//   return response.json();
// };

// const calculateYearlyAverage = (values) => {
//   const sum = values.reduce((acc, val) => acc + val, 0);
//   return sum / values.length;
// };
// const calculateScore = (windSpeed, precipitation, temperature, humidity) => {
//   // Wind speed: Favor higher wind speeds, max cap adjusted to 20 m/s for better scaling
//   const windScore = Math.min(windSpeed / 20, 1);

//   // Precipitation: More aggressive scaling, favoring dry conditions (closer to 0)
//   const precipScore = Math.max(0, 1 - precipitation / 50);

//   // Temperature: Favor temperatures around 15°C with a narrower range
//   const tempScore = Math.max(0, 1 - Math.abs(temperature - 15) / 15);

//   // Humidity: Favor humidity around 50%, but allow broader tolerance
//   const humidityScore = Math.max(0, 1 - Math.abs(humidity - 50) / 40);

//   // Adjust the weights to balance the importance of each factor
//   const weightedScore = (
//     windScore * 0.4 +      // Wind has more influence on score
//     precipScore * 0.2 +    // Precipitation has less influence
//     tempScore * 0.3 +      // Temperature is moderately influential
//     humidityScore * 0.1    // Humidity has the least influence
//   );

//   // Return score constrained between 0 and 1
//   return Math.min(Math.max(weightedScore, 0), 1);
// };

// export async function GET(req) {
//   try {
//     console.log("Starting database connection...");
//     await ConnectToDatabase();
//     console.log("Database connected successfully.");

//     const batchSize = 100;
//     let processedCount = 0;

//     let cursor = ZipCode.find().select('-geojson').cursor();

//     console.log("Starting document processing...");

//     for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
//       if (!doc.permitted) {
//         doc.score = 0;
//         await doc.save();
//         processedCount++;
//         console.log(`Processed document ${processedCount} (not permitted)`);
//         continue;
//       }

//       const params = {
//         latitude: doc.lat,
//         longitude: doc.long,
//         start_date: "2022-01-01",
//         end_date: "2022-12-31",
//         models: ["CMCC_CM2_VHR4"],
//         daily: ["temperature_2m_mean", "wind_speed_10m_mean", "relative_humidity_2m_mean", "precipitation_sum"]
//       };

//       const weatherData = await fetchWeatherApi('https://climate-api.open-meteo.com/v1/climate', params);
      
//       const daily = weatherData.daily;
//       const avgTemperature = calculateYearlyAverage(daily.temperature_2m_mean);
//       const avgWindSpeed = calculateYearlyAverage(daily.wind_speed_10m_mean);
//       const avgHumidity = calculateYearlyAverage(daily.relative_humidity_2m_mean);
//       const avgPrecipitation = calculateYearlyAverage(daily.precipitation_sum);

//       // Update only the fields specified in the schema
//       doc.windspeed = avgWindSpeed;
//       doc.precip = avgPrecipitation;
//       doc.temp = avgTemperature;
//       doc.humidity = avgHumidity;

//       const score = calculateScore(avgWindSpeed, avgPrecipitation, avgTemperature, avgHumidity);
//       doc.score = score;

//       await doc.save();

//       // Print the score and temperature for each zipcode
//       console.log(`Zipcode: ${doc.zipcode}, Score: ${score.toFixed(2)}, Temperature: ${avgTemperature.toFixed(2)}°C`);

//       processedCount++;
      
//       if (processedCount % batchSize === 0) {
//         console.log(`Processed ${processedCount} documents so far...`);
//       }
//     }

//     console.log("Document processing completed.");
//     return NextResponse.json({ message: 'Weather data and scores updated successfully' });

//   } catch (error) {
//     console.error('Error processing documents:', error);
//     return NextResponse.error({ message: 'Failed to update weather data and scores' });
//   }
// }