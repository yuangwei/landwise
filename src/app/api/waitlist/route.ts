import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { waitlistEntries } from "~/server/db/schema";

const waitlistSchema = z.object({
  projectId: z.string().uuid(),
  email: z.string().email(),
  metadata: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, email, metadata } = waitlistSchema.parse(body);

    // Insert the waitlist entry
    const [entry] = await db.insert(waitlistEntries).values({
      projectId,
      email,
      metadata,
    }).returning();

    return NextResponse.json({
      success: true,
      id: entry.id
    });
  } catch (error) {
    console.error("Waitlist API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
