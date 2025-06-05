CREATE TABLE "balancedb" (
	"userid" text NOT NULL,
	"issuerid" text NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"lasttransdate" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" double precision NOT NULL,
	"category" text NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"menu_item_id" integer,
	"quantity" integer NOT NULL,
	"price" double precision DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text,
	"total" double precision NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qrcodedb" (
	"id" serial PRIMARY KEY NOT NULL,
	"hashid" text DEFAULT 'not hashed' NOT NULL,
	"jsondata" text DEFAULT '{}' NOT NULL,
	"userid" text NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"reference" text NOT NULL,
	"paytype" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expirydate" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"redeemcnt" integer DEFAULT 0 NOT NULL,
	"redeemtype" text DEFAULT 'once' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessiondb" (
	"id" serial PRIMARY KEY NOT NULL,
	"userid" text NOT NULL,
	"status" text NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"logincount" integer DEFAULT 0 NOT NULL,
	"lasttransdate" timestamp with time zone DEFAULT now() NOT NULL,
	"lastlogin" timestamp with time zone DEFAULT now() NOT NULL,
	"lastlogout" timestamp with time zone DEFAULT now() NOT NULL,
	"expirydate" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transdb" (
	"id" serial PRIMARY KEY NOT NULL,
	"userid" text NOT NULL,
	"xid" text NOT NULL,
	"reference" text NOT NULL,
	"transdate" timestamp with time zone DEFAULT now() NOT NULL,
	"transamt" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"userid" text NOT NULL,
	"pin" integer NOT NULL,
	"contactno" text,
	"email" text,
	"hobby" text,
	"points" integer,
	"usertype" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_userid_unique" ON "users" USING btree ("userid");