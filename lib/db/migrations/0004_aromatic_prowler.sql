ALTER TABLE "Favorite" ADD COLUMN "questionId" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_questionId_Message_id_fk" FOREIGN KEY ("questionId") REFERENCES "public"."Message"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
