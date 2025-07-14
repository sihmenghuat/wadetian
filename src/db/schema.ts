// db/schema.ts
import { pgTable, text, integer, doublePrecision, timestamp, serial, uniqueIndex } from 'drizzle-orm/pg-core';
import { it } from 'node:test';

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    userid: text("userid").notNull(),
    pin: text("pin").notNull(),
    contactno: text("contactno"),
    email: text("email"),
    hobby: text("hobby"),
    points: integer("points"),
    usertype: text("usertype").notNull().default("user"),
    issuelimit: integer("issuelimit").notNull().default(0),
    balancelimit: integer("balancelimit").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).notNull().defaultNow(),
},
(table) => ({
    users_userid_unique: uniqueIndex("users_userid_unique").on(table.userid),
})
);
export type UserSelect = typeof users.$inferSelect;

export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(),
  url: text('url'), // for reroute
  qrhash: text('qrhash'), // for QR code
  itemDescription: text('item_description'), // for feedback
  price: doublePrecision('price').notNull().default(0),
  points: integer('points').notNull().default(0),
  eventDate: timestamp('event_date', { withTimezone: true }),
  eventLocation: text('event_location'),
  eventDetails: text('event_details'),
  mediaUrl: text('media_url').notNull(), // for picture or video
  mercid: text('mercid').notNull(),
  views: integer('views').notNull().default(0), // for tracking views
  status: text('status').notNull().default('active'), // active, inactive
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  itemId: integer('item_id').notNull().references(() => items.id),
  fromid: text("userid").notNull(), 
  toid: text('name').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: doublePrecision('price').notNull(),
  category: text('category').notNull(),
  imageUrl: text('image_url'),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email'),
  total: doublePrecision('total').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id),
  menuItemId: integer('menu_item_id').references(() => menuItems.id),
  quantity: integer('quantity').notNull(),
  price: doublePrecision('price').notNull().default(0),
});

export const sessiondb = pgTable("sessiondb", {
    id: serial("id").primaryKey(),
    userid: text("userid").notNull(),
    status: text("status").notNull(),
    balance: integer("balance").notNull().default(0),
    logincount: integer("logincount").notNull().default(0),
    lasttransdate: timestamp("lasttransdate", { withTimezone: true }).notNull().defaultNow(),
    lastlogin: timestamp("lastlogin", { withTimezone: true }).notNull().defaultNow(),
    lastlogout: timestamp("lastlogout", { withTimezone: true }).notNull().defaultNow(),
    expirydate: timestamp("expirydate", { withTimezone: true }).notNull().defaultNow(),
});

export const transdb = pgTable("transdb", {
    id: serial("id").primaryKey(),
    userid: text("userid").notNull(),
    xid: text("xid").notNull(),
    transdesc: text("reference").notNull(),
    transdate: timestamp("transdate", { withTimezone: true }).notNull().defaultNow(),
    transamt: integer("transamt").notNull().default(0),
    hashid: text("hashid"),
});

export const balancedb = pgTable("balancedb",
  {
    userid: text("userid").notNull(),
    issuerid: text("issuerid").notNull(),
    balance: integer("balance").notNull().default(0),
    lasttransdate: timestamp("lasttransdate", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    primaryKey: [table.userid, table.issuerid],
  })
);
export type IssuerSelect = typeof balancedb.$inferSelect;

export const qrcodedb = pgTable("qrcodedb", {
    id: serial("id").primaryKey(),
    hashid: text("hashid").notNull().default("not hashed"),
    jsondata: text("jsondata").notNull().default("{}"),
    userid: text("userid").notNull(),
    points: integer("points").notNull().default(0),
    reference: text("reference").notNull(),
    paytype: text("paytype").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    expirydate: timestamp("expirydate", { withTimezone: true }).notNull().defaultNow(),
    status: text("status").notNull().default("active"),
    redeemCnt: integer("redeemcnt").notNull().default(0),
    redeemtype: text("redeemtype").notNull().default("once"),
});
export type QrcodeSelect = typeof qrcodedb.$inferSelect;
