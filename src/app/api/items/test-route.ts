import { NextResponse } from "next/server";

const items = [
  { id: 1, name: "Item 1", description: "First item", mediaUrl: "" },
  { id: 2, name: "Item 2", description: "Second item", mediaUrl: "" },
];

export async function GET() {
  return NextResponse.json(items);
}