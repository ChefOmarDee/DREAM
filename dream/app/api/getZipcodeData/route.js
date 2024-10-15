import { NextResponse } from "next/server";
import { ZipCode } from "@/app/_lib/mongodb/models/zipcodes";
import { ConnectToDatabase } from "@/app/_lib/mongodb/connection/db";

export async function POST(req) {
  try {
    const { countyname } = await req.json();

    // Ensure database connection
    await ConnectToDatabase();

    const zipcodes = await ZipCode.find(
      { state: countyname },
      'zipcode popdensity lat long geojson score'
    );

    if (!zipcodes || zipcodes.length === 0) {
      return NextResponse.json({ error: "No zipcodes found for the given state" }, { status: 404 });
    }

    return NextResponse.json(zipcodes);
  } catch (error) {
    console.error("Error fetching zipcode data:", error);
    return NextResponse.json({ error: "Failed to fetch zipcode data" }, { status: 500 });
  }
}