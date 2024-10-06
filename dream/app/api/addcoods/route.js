import { NextResponse } from "next/server";
import { UpdateZipcodeCoordinates } from "@/app/_lib/mongodb/util/addzipcoords";

export async function GET(req) {
    try {
        // Fetch counties from CSV
       
        await UpdateZipcodeCoordinates();
        // Return the combined data as JSON
        return NextResponse.json({ hi:"hi" });
    } catch (error) {
        console.error("Error processing counties:", error);
        return NextResponse.json(
            { error: "Failed to process counties" },
            { status: 500 }
        );
    }
}