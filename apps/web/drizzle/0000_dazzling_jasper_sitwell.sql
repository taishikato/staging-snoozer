CREATE TYPE "public"."rule_action" AS ENUM('STOP', 'DELETE');--> statement-breakpoint
CREATE TYPE "public"."rule_status" AS ENUM('PENDING', 'DONE', 'FAILED');--> statement-breakpoint
CREATE TABLE "rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" varchar(255) NOT NULL,
	"action" "rule_action" NOT NULL,
	"execute_at" timestamp NOT NULL,
	"status" "rule_status" DEFAULT 'PENDING' NOT NULL,
	"executed_at" timestamp,
	"note" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
