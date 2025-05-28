// db/schema.ts
import { create } from 'domain';
import { pgTable, text, integer, doublePrecision, timestamp, serial } from 'drizzle-orm/pg-core';

export const responses = pgTable("responses", {
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
  price: doublePrecision('price').notNull(),
});

export type ResponseSelect = typeof responses.$inferSelect;


