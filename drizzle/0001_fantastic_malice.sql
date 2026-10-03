CREATE TABLE IF NOT EXISTS "lesson_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"year_group" text NOT NULL,
	"status" text DEFAULT 'IN_PROGRESS' NOT NULL,
	"practice_attempted" integer DEFAULT 0 NOT NULL,
	"practice_correct" integer DEFAULT 0 NOT NULL,
	"last_score_percent" integer,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"last_visited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lessons" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"education_stage" text NOT NULL,
	"year_group" text NOT NULL,
	"subject_id" text NOT NULL,
	"topic_slug" text NOT NULL,
	"topic_title" text NOT NULL,
	"subtopic_title" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"difficulty" text DEFAULT 'Core' NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"estimated_minutes" integer DEFAULT 15 NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"learning_objectives" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"prior_knowledge_check" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"content" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"examples" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"memory_tips" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"common_mistakes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"quick_recall" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"practice_questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"answers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recap" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"spaced_revision_suggestion" text,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "education_stage" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "year_group" text;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "education_stage" text;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "year_group" text;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lesson_progress_user_lesson_uq" ON "lesson_progress" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lesson_progress_user_subject_idx" ON "lesson_progress" USING btree ("user_id","subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lessons_slug_uq" ON "lessons" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lessons_year_subject_idx" ON "lessons" USING btree ("year_group","subject_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lessons_topic_idx" ON "lessons" USING btree ("topic_slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topics_year_subject_idx" ON "topics" USING btree ("year_group","subject_id");