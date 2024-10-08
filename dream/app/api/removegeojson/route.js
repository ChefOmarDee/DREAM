import { NextResponse } from "next/server";
import { removeZipcodesWithoutGeoJSON } from "@/app/_lib/mongodb/util/removegeojson";

export async function GET(req) {
  try {
    await removeZipcodesWithoutGeoJSON();
    return NextResponse.json({ message: "Database updated successfully" });
  } catch (error) {
    console.error("Error updating database:", error);
    return NextResponse.json(
      { error: "Failed to update database" },
      { status: 500 }
    );
  } 
}