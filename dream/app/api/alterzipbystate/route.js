import { NextResponse } from "next/server";
import { AlterZipByState } from "@/app/_lib/mongodb/util/editstatezipcode";
export async function GET(req) {
    try {
        await AlterZipByState();
        return NextResponse.json({ "countyObjects":"ef" });
    } catch (error) {
        console.error("Error processing counties:", error);
        return NextResponse.json(
            { error: "Failed to process counties" },
            { status: 500 }
        );
    }
}
