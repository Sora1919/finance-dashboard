import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await db.$queryRaw`SELECT 1`;

        return NextResponse.json({
            success: true,
            message: "Database connection successful",
        });
    } catch (error: unknown) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Database connection failed",
            },
            { status: 500 }
        );
    }
}