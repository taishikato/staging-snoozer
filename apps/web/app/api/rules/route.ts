import { NextRequest, NextResponse } from "next/server";
import { db, rules, NewRule } from "@/lib/db";
import { z } from "zod";

// Schema for creating a rule
const createRuleSchema = z.object({
  serviceId: z.string(),
  action: z.enum(["STOP", "DELETE"]),
  executeAt: z.string().transform((str) => new Date(str)),
  note: z.string().optional(),
});

// GET /api/rules - List all rules
export async function GET() {
  try {
    const allRules = await db.select().from(rules).orderBy(rules.createdAt);
    return NextResponse.json(allRules);
  } catch (error) {
    console.error("Failed to fetch rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch rules" },
      { status: 500 }
    );
  }
}

// POST /api/rules - Create a new rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createRuleSchema.parse(body);

    const newRule: NewRule = {
      serviceId: validatedData.serviceId,
      action: validatedData.action,
      executeAt: validatedData.executeAt,
      note: validatedData.note,
    };

    const [created] = await db.insert(rules).values(newRule).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.format() },
        { status: 400 }
      );
    }

    console.error("Failed to create rule:", error);
    return NextResponse.json(
      { error: "Failed to create rule" },
      { status: 500 }
    );
  }
}
