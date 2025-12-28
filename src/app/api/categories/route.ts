/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Quiz } from "@/lib/models/Quiz";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    // specific typing for distinct result
    const categories = await Quiz.find().distinct("category");

    // Sort cleanly
    const sortedCategories = categories
      .filter((c: unknown) => typeof c === "string")
      .sort();

    return NextResponse.json({ categories: sortedCategories });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
