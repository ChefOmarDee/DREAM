import { NextResponse } from "next/server";
import mongoose from 'mongoose';
import { Counties } from "@/app/_lib/mongodb/models/counties";
import { ZipCode } from "@/app/_lib/mongodb/models/zipcodes";
import { ConnectToDatabase } from "@/app/_lib/mongodb/connection/db";

export async function POST(req) {
  try {
    const { countyname } = await req.json();

    // Ensure database connection
    await ConnectToDatabase();
    
    // First, find the county to get its zipcodes
    // const county = await Counties.findOne({ countyname });
    const zipcodes = await ZipCode.find(
        { state: countyname },
        'zipcode popdensity lat long geojson lucidscore'
      );
    if (!zipcodes) {
      return NextResponse.json(
        { error: "County not found" },
        { status: 404 }
      );
    }

    // Then query for all zipcode documents that match the county's zipcodes
   

    return NextResponse.json(zipcodes);
  } catch (error) {
    console.error("Error fetching zipcode data:", error);
    return NextResponse.json(
      { error: "Failed to fetch zipcode data" },
      { status: 500 }
    );
  }
}