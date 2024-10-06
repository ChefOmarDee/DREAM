import { AddZipcodesFromCounties } from "@/app/_lib/mongodb/util/addzipcodes";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {

        // Now add zipcodes from these counties
        await AddZipcodesFromCounties();

        // Return the combined data as JSON
        return NextResponse.json({ hi:"hi" });
    } catch (error) {
        console.error("Error processing counties and zipcodes:", error);
        return NextResponse.json(
            { error: "Failed to process counties and zipcodes" },
            { status: 500 }
        );
    }
}