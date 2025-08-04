import { pgTable, varchar, timestamp, pgEnum, uuid } from "drizzle-orm/pg-core";

export const ruleStatusEnum = pgEnum("rule_status", [
  "PENDING",
  "DONE",
  "FAILED",
]);
export const ruleActionEnum = pgEnum("rule_action", ["STOP", "DELETE"]);

export const rules = pgTable("rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceId: varchar("service_id", { length: 255 }).notNull(),
  action: ruleActionEnum("action").notNull(),
  executeAt: timestamp("execute_at").notNull(),
  status: ruleStatusEnum("status").default("PENDING").notNull(),
  executedAt: timestamp("executed_at"),
  note: varchar("note", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Rule = typeof rules.$inferSelect;
export type NewRule = typeof rules.$inferInsert;
