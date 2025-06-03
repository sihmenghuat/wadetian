// db/schema.ts
import { create } from 'domain';
import { pgTable, text, integer, doublePrecision, timestamp, serial } from 'drizzle-orm/pg-core';
import { getHash } from 'next/dist/server/image-optimizer';
import { json } from 'stream/consumers';

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    userid: text("userid").notNull(),
    pin: integer("pin").notNull(),
    contactno: text("contactno"),
    email: text("email"),
    hobby: text("hobby"),
    points: integer("points"),
    createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).notNull().defaultNow(),
});
export type UserSelect = typeof users.$inferSelect;

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
  createdAt: timestamp('created_at', { withTimezone: false }).notNull(),
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
    fromid: text("userid").notNull(),
    issuerid: text("userid").notNull(),
    transdesc: text("status").notNull(),
    balance: integer("balance").notNull().default(0),
    transdate: timestamp("transdate", { withTimezone: true }).notNull().defaultNow(),
    transamount: integer("transamount").notNull().default(0),
});

export const issuerdb = pgTable("issuerdb", {
    userid: text("userid").notNull(),
    issuerid: text("userid").notNull(),
    balance: integer("balance").notNull().default(0),
    lasttransdate: timestamp("lasttransdate", { withTimezone: true }).notNull().defaultNow(),
    lasttransid: integer("lasttransid").notNull().default(0),
});
export type IssuerSelect = typeof issuerdb.$inferSelect;

export const qrcodedb = pgTable("qrcodedb", {
    id: serial("id").primaryKey(),
    hashid: text("hashid").notNull().default("not hashed"),
    jsondata: text("jsondata").notNull().default("{}"),
    userid: text("userid").notNull(),
    points: integer("points").notNull().default(0),
    reference: text("reference").notNull(),
    paytype: text("paytype").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).notNull().defaultNow(),
    expirydate: timestamp("expirydate", { withTimezone: true }).notNull().defaultNow(),
    status: text("status").notNull().default("active"),
    redeemCnt: integer("redeemcnt").notNull().default(0),
    redeemtype: text("redeemtype").notNull().default("once"),
});
export type QrcodeSelect = typeof qrcodedb.$inferSelect;
