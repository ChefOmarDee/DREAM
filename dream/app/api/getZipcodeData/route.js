import { NextResponse } from "next/server";
import { ZipCode } from "@/app/_lib/mongodb/models/zipcodes";
import { ConnectToDatabase } from "@/app/_lib/mongodb/connection/db";
import { createClient } from "redis";
import mongoose from "mongoose";

// Create a Redis's client
const client = createClient({
    password: '99JsfvjyiKlbyR0QES7DtomuEYWsLpnR',
    socket: {
        host: 'redis-11867.c81.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 11867
    }
});
client.on('error', (err) => {
  console.error('Redis error:', err);
});

// Connect to Redis cache
await client.connect();

export async function POST(req) {
  try {
    const { countyname } = await req.json();
    
    // Create a unique cache key based on the state (countyname)
    const cacheKey = `state:${countyname}`;
    
    // Check if data is cached in Redis
    const cachedZipcodes = await client.get(cacheKey);
    
    let zipcodes;
    if (cachedZipcodes) {
      // If cache hit, retrieve documents using cached zipcodes
      console.log("cache hit");
      const zipcodesArray = JSON.parse(cachedZipcodes);
      console.log(zipcodesArray);
      
      // Ensure database connection before querying
      await ConnectToDatabase();
      
      zipcodes = await ZipCode.find(
        { zipcode: { $in: zipcodesArray } },
        'zipcode popdensity lat long geojson score'
      ).lean();
    } else {
      console.log("cache miss");
      // Ensure database connection
      await ConnectToDatabase();

      // Query MongoDB for the zipcode data
      zipcodes = await ZipCode.find(
        { state: countyname },
        'zipcode popdensity lat long geojson score'
      ).lean();

      if (!zipcodes || zipcodes.length === 0) {
        return NextResponse.json({ error: "No zipcodes found for the given state" }, { status: 404 });
      }

      // Extract only the zipcodes and cache them
      const zipcodesArray = zipcodes.map(doc => doc.zipcode);
      await client.set(cacheKey, JSON.stringify(zipcodesArray));
    }

    // Return the query result
    return NextResponse.json(zipcodes);
  } catch (error) {
    console.error("Error fetching zipcode data:", error);
    return NextResponse.json({ error: "Failed to fetch zipcode data" }, { status: 500 });
  } finally {
    // Close the MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}