CREATE TABLE "pending_checkouts" (
	"session_id" text PRIMARY KEY NOT NULL,
	"client_id" uuid NOT NULL,
	"trainer_id" uuid NOT NULL,
	"program_id" uuid,
	"slot_id" uuid,
	"amount_cents" integer NOT NULL,
	CONSTRAINT "pending_checkouts_slot_id_unique" UNIQUE("slot_id"),
	CONSTRAINT "pending_checkouts_client_id_program_id_unique" UNIQUE("client_id","program_id"),
	CONSTRAINT "one_checkout_item" CHECK (num_nonnulls("pending_checkouts"."program_id", "pending_checkouts"."slot_id") = 1)
);
--> statement-breakpoint
ALTER TABLE "pending_checkouts" ADD CONSTRAINT "pending_checkouts_client_id_profiles_user_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_checkouts" ADD CONSTRAINT "pending_checkouts_trainer_id_profiles_user_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_checkouts" ADD CONSTRAINT "pending_checkouts_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_checkouts" ADD CONSTRAINT "pending_checkouts_slot_id_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."slots"("id") ON DELETE no action ON UPDATE no action;