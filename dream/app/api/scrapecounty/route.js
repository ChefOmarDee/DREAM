import { NextResponse } from "next/server";
import { ScrapeCounties } from "@/app/_lib/scraping/county";
export async function GET(req) {
	try {
		let counties=await ScrapeCounties();
        
		return NextResponse.json({ url: "url" });
	} catch (error) {
		console.error("Error creating presigned URL:", error);
		return NextResponse.json(
			{ error: "Failed to create presigned URL" },
			{ status: 500 }
		);
	}
}
