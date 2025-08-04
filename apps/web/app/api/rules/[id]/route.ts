import { NextRequest, NextResponse } from "next/server";
import { db, rules } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Schema for updating a rule
const updateRuleSchema = z.object({
  action: z.enum(["STOP", "DELETE"]).optional(),
  executeAt: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  status: z.enum(["PENDING", "DONE", "FAILED"]).optional(),
  executedAt: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  note: z.string().optional(),
});

// GET /api/rules/[id] - Get a single rule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const [rule] = await db
      .select()
      .from(rules)
      .where(eq(rules.id, id))
      .limit(1);

    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Failed to fetch rule:", error);
    return NextResponse.json(
      { error: "Failed to fetch rule" },
      { status: 500 }
    );
  }
}

// PUT /api/rules/[id] - Update a rule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const validatedData = updateRuleSchema.parse(body);

    const [updated] = await db
      .update(rules)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(rules.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.format() },
        { status: 400 }
      );
    }

    console.error("Failed to update rule:", error);
    return NextResponse.json(
      { error: "Failed to update rule" },
      { status: 500 }
    );
  }
}

// DELETE /api/rules/[id] - Delete a rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const [deleted] = await db
      .delete(rules)
      .where(eq(rules.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Rule deleted successfully" });
  } catch (error) {
    console.error("Failed to delete rule:", error);
    return NextResponse.json(
      { error: "Failed to delete rule" },
      { status: 500 }
    );
  }
}
