CREATE TABLE "ai_conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text DEFAULT 'New conversation' NOT NULL,
	"mode" text DEFAULT 'EXPLAIN' NOT NULL,
	"subject_id" text,
	"topic_id" text,
	"exam_board_id" text,
	"qualification_id" text,
	"memory_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"model_id" text,
	"prompt_version" text,
	"run_id" text,
	"source_refs" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"request_id" text NOT NULL,
	"feature" text NOT NULL,
	"task" text NOT NULL,
	"requested_model_id" text,
	"actual_model_id" text,
	"fallback_used" boolean DEFAULT false NOT NULL,
	"prompt_version" text,
	"status" text NOT NULL,
	"error_code" text,
	"latency_ms" integer,
	"input_tokens" integer,
	"output_tokens" integer,
	"entitlement_source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"category" text NOT NULL,
	"subject_id" text,
	"topic_id" text,
	"props" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"target" text,
	"reason" text,
	"metadata" jsonb,
	"ip_hint" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"publisher" text,
	"url" text,
	"kind" text DEFAULT 'USER_CREATED' NOT NULL,
	"trust" text DEFAULT 'UNVERIFIED' NOT NULL,
	"subject_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"effective_from" timestamp with time zone,
	"licence" text,
	"owner_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_chunks" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"user_id" text NOT NULL,
	"page" integer DEFAULT 1 NOT NULL,
	"chunk_index" integer DEFAULT 0 NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"page_count" integer,
	"status" text DEFAULT 'PROCESSING' NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entitlements" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_slug" text NOT NULL,
	"source" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoke_reason" text,
	"key_verification_id" text,
	"provider_event_id" text,
	"created_by" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_boards" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"country" text DEFAULT 'GB' NOT NULL,
	"url" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"key" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"description" text,
	"rollout_percent" integer DEFAULT 100 NOT NULL,
	"allowlist" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcard_decks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"subject_id" text,
	"topic_id" text,
	"source" text DEFAULT 'MANUAL' NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcard_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"card_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" text NOT NULL,
	"ease_before" real,
	"interval_before" real,
	"ease_after" real,
	"interval_after" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcards" (
	"id" text PRIMARY KEY NOT NULL,
	"deck_id" text NOT NULL,
	"user_id" text NOT NULL,
	"type" text DEFAULT 'BASIC' NOT NULL,
	"front" text NOT NULL,
	"back" text NOT NULL,
	"hint" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ease" real DEFAULT 2.5 NOT NULL,
	"interval_days" real DEFAULT 0 NOT NULL,
	"repetitions" integer DEFAULT 0 NOT NULL,
	"due_at" timestamp with time zone DEFAULT now() NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb,
	"status" text DEFAULT 'QUEUED' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_error_redacted" text,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "key_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text DEFAULT 'junkie' NOT NULL,
	"key_hash" text NOT NULL,
	"key_hint" text NOT NULL,
	"state" text NOT NULL,
	"provider_status" integer,
	"provider_reference" text,
	"provider_meta" jsonb,
	"granted_entitlement_id" text,
	"latency_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_health" (
	"id" text PRIMARY KEY NOT NULL,
	"model_id" text NOT NULL,
	"status" text NOT NULL,
	"latency_ms" integer,
	"error_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_registry" (
	"model_id" text PRIMARY KEY NOT NULL,
	"provider" text DEFAULT 'nvidia' NOT NULL,
	"display_name" text,
	"description" text,
	"owned_by" text,
	"discovered_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone,
	"available" boolean DEFAULT true NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"premium_only" boolean DEFAULT false NOT NULL,
	"tasks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"input_modalities" jsonb DEFAULT '["text"]'::jsonb NOT NULL,
	"output_modalities" jsonb DEFAULT '["text"]'::jsonb NOT NULL,
	"context_length" integer,
	"fallback_rank" integer DEFAULT 100 NOT NULL,
	"max_output_tokens" integer DEFAULT 2048 NOT NULL,
	"experimental" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"subject_id" text,
	"topic_id" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"age_band" text DEFAULT 'SECONDARY' NOT NULL,
	"country" text DEFAULT 'GB' NOT NULL,
	"timezone" text DEFAULT 'Europe/London' NOT NULL,
	"exam_board_id" text,
	"qualification_id" text,
	"subject_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"goals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"target_exam_date" timestamp with time zone,
	"explain_level" text DEFAULT 'STANDARD' NOT NULL,
	"default_model_id" text,
	"theme" text DEFAULT 'system' NOT NULL,
	"reduced_motion" boolean DEFAULT false NOT NULL,
	"onboarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"template" text NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "qualifications" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"level" text NOT NULL,
	"age_band" text NOT NULL,
	"country" text DEFAULT 'GB' NOT NULL,
	"boards" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"user_id" text NOT NULL,
	"correct" boolean,
	"confidence" text,
	"time_ms" integer,
	"explanation" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"source" text DEFAULT 'USER' NOT NULL,
	"prompt" text NOT NULL,
	"subject_id" text,
	"topic_id" text,
	"topic_title" text,
	"difficulty" text DEFAULT 'MEDIUM' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"quiz_id" text NOT NULL,
	"user_id" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"quiz_id" text NOT NULL,
	"type" text NOT NULL,
	"prompt" text NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"answer" jsonb NOT NULL,
	"explanation" text,
	"difficulty" text DEFAULT 'MEDIUM' NOT NULL,
	"topic_title" text,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"subject_id" text,
	"topic_id" text,
	"source" text DEFAULT 'GENERATED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"bucket" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"user_agent" text,
	"ip_hint" text,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specifications" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"qualification_id" text NOT NULL,
	"code" text,
	"title" text NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"source_url" text,
	"content_version" text,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_plan_items" (
	"id" text PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"user_id" text NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"subject_id" text,
	"topic_id" text,
	"topic_title" text NOT NULL,
	"activity" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"priority" integer DEFAULT 2 NOT NULL,
	"status" text DEFAULT 'PLANNED' NOT NULL,
	"notes" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"target_date" timestamp with time zone,
	"hours_per_week" real DEFAULT 5 NOT NULL,
	"session_minutes" integer DEFAULT 45 NOT NULL,
	"rest_days" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_item_id" text,
	"kind" text NOT NULL,
	"subject_id" text,
	"topic_id" text,
	"planned_minutes" integer,
	"actual_minutes" integer DEFAULT 0 NOT NULL,
	"questions_attempted" integer DEFAULT 0 NOT NULL,
	"questions_correct" integer DEFAULT 0 NOT NULL,
	"cards_reviewed" integer DEFAULT 0 NOT NULL,
	"summary" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "subject_aliases" (
	"alias" text PRIMARY KEY NOT NULL,
	"subject_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"levels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subject" text NOT NULL,
	"category" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"priority" text DEFAULT 'NORMAL' NOT NULL,
	"reply" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"parent_id" text,
	"subject_id" text,
	"specification_id" text,
	"title" text NOT NULL,
	"summary" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"provenance" text DEFAULT 'ILLUSTRATIVE' NOT NULL,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_ledger" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"metric" text NOT NULL,
	"amount" integer DEFAULT 1 NOT NULL,
	"model_id" text,
	"feature" text,
	"request_id" text,
	"entitlement_source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"granted_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_pk" PRIMARY KEY("user_id","role")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"email_verified_at" timestamp with time zone,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_runs" ADD CONSTRAINT "ai_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_sources" ADD CONSTRAINT "content_sources_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_decks" ADD CONSTRAINT "flashcard_decks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_card_id_flashcards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."flashcards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_flashcard_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."flashcard_decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "key_verifications" ADD CONSTRAINT "key_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_health" ADD CONSTRAINT "model_health_model_id_model_registry_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."model_registry"("model_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specifications" ADD CONSTRAINT "specifications_board_id_exam_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."exam_boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specifications" ADD CONSTRAINT "specifications_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specifications" ADD CONSTRAINT "specifications_qualification_id_qualifications_id_fk" FOREIGN KEY ("qualification_id") REFERENCES "public"."qualifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_plan_items" ADD CONSTRAINT "study_plan_items_plan_id_study_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."study_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_plan_items" ADD CONSTRAINT "study_plan_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_plans" ADD CONSTRAINT "study_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_aliases" ADD CONSTRAINT "subject_aliases_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_specification_id_specifications_id_fk" FOREIGN KEY ("specification_id") REFERENCES "public"."specifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_ledger" ADD CONSTRAINT "usage_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conv_user_idx" ON "ai_conversations" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_conv_idx" ON "ai_messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "runs_user_idx" ON "ai_runs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "runs_model_idx" ON "ai_runs" USING btree ("actual_model_id");--> statement-breakpoint
CREATE INDEX "events_user_idx" ON "analytics_events" USING btree ("user_id","category","created_at");--> statement-breakpoint
CREATE INDEX "audit_action_idx" ON "audit_logs" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "chunks_doc_idx" ON "document_chunks" USING btree ("document_id","page","chunk_index");--> statement-breakpoint
CREATE INDEX "docs_user_idx" ON "documents" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "entitlements_user_idx" ON "entitlements" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "entitlements_kv_idx" ON "entitlements" USING btree ("key_verification_id");--> statement-breakpoint
CREATE INDEX "decks_user_idx" ON "flashcard_decks" USING btree ("user_id","archived");--> statement-breakpoint
CREATE INDEX "reviews_user_idx" ON "flashcard_reviews" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "cards_due_idx" ON "flashcards" USING btree ("user_id","due_at");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "key_verifications_hash_uq" ON "key_verifications" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "key_verifications_user_idx" ON "key_verifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "model_health_idx" ON "model_health" USING btree ("model_id","created_at");--> statement-breakpoint
CREATE INDEX "models_enabled_idx" ON "model_registry" USING btree ("enabled","available");--> statement-breakpoint
CREATE INDEX "notes_user_idx" ON "notes" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "notif_user_idx" ON "notifications" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE UNIQUE INDEX "password_resets_token_uq" ON "password_resets" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "prompt_name_version_uq" ON "prompt_templates" USING btree ("name","version");--> statement-breakpoint
CREATE INDEX "attempts_user_idx" ON "question_attempts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "questions_user_idx" ON "questions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "quiz_attempts_user_idx" ON "quiz_attempts" USING btree ("user_id","submitted_at");--> statement-breakpoint
CREATE INDEX "qq_quiz_idx" ON "quiz_questions" USING btree ("quiz_id","order_index");--> statement-breakpoint
CREATE INDEX "quizzes_user_idx" ON "quizzes" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_uq" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "specs_board_subject_idx" ON "specifications" USING btree ("board_id","subject_id");--> statement-breakpoint
CREATE INDEX "plan_items_sched_idx" ON "study_plan_items" USING btree ("user_id","scheduled_for");--> statement-breakpoint
CREATE INDEX "plan_items_plan_idx" ON "study_plan_items" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "plans_user_idx" ON "study_plans" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "study_sessions_user_idx" ON "study_sessions" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "tickets_user_idx" ON "support_tickets" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "topics_subject_idx" ON "topics" USING btree ("subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "topics_slug_uq" ON "topics" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "usage_user_metric_idx" ON "usage_ledger" USING btree ("user_id","metric","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "users" USING btree (lower("email"));