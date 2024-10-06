import { NextResponse } from "next/server";
import { CSVToCountyObjects } from "@/app/_lib/scraping/zipcode";

export async function GET(req) {
    try {
        const countyObjects = await CSVToCountyObjects();
        return NextResponse.json({ countyObjects });
    } catch (error) {
        console.error("Error processing counties:", error);
        return NextResponse.json(
            { error: "Failed to process counties" },
            { status: 500 }
        );
    }
}
