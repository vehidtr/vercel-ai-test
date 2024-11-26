CREATE TABLE IF NOT EXISTS "Favorite" (
	"chatId" uuid NOT NULL,
	"messageId" uuid NOT NULL,
	"isFavorite" boolean NOT NULL,
	CONSTRAINT "Favorite_chatId_messageId_pk" PRIMARY KEY("chatId","messageId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_messageId_Message_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
