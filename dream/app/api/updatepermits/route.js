import { NextResponse } from "next/server";
import { updateZipcodesForAllCounties } from "@/app/_lib/mongodb/util/updatepermit";
export async function GET(req) {
    try {
        const countyObjects = await updateZipcodesForAllCounties();
        return NextResponse.json({ countyObjects });
    } catch (error) {
        console.error("Error processing counties:", error);
        return NextResponse.json(
            { error: "Failed to process counties" },
            { status: 500 }
        );
    }
}
