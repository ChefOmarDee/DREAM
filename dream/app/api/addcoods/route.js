import { NextResponse } from "next/server";


export async function GET(req) {
    try {
        // Fetch counties from CSV
       

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