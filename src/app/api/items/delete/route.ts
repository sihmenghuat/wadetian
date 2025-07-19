import { NextRequest, NextResponse } from "next/server";
import { items } from "@/db/schema";
import { db } from "@/db/index";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemid, mercid } = body;

    // Validate required fields
    if (!itemid) {
      return NextResponse.json({ success: false, message: "Item ID is required." }, { status: 400 });
    }
    if (!mercid) {
      return NextResponse.json({ success: false, message: "Merchant ID is required." }, { status: 400 });
    }

    // Check if item exists and belongs to the merchant
    const existingItem = await db.select().from(items).where(eq(items.id, parseInt(itemid, 10))).limit(1);
    if (existingItem.length === 0) {
      return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });
    }

    // Verify the item belongs to the merchant
    if (existingItem[0].mercid !== mercid) {
      return NextResponse.json({ success: false, message: "Unauthorized to delete this item." }, { status: 403 });
    }

    // Delete the item (soft delete by setting status to inactive)
    await db.update(items)
      .set({ status: "inactive" })
      .where(eq(items.id, parseInt(itemid, 10)));

    return NextResponse.json({ success: true, message: "Item deleted successfully." });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ success: false, message: "Failed to delete item." }, { status: 500 });
  }
}
