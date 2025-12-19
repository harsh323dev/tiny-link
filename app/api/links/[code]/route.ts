import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  props: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await props.params;

    const link = await prisma.link.findUnique({ where: { code } });
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error("Error fetching link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await props.params;

    // Check if link exists
    const link = await prisma.link.findUnique({ where: { code } });
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Delete the link
    await prisma.link.delete({ where: { code } });

    return NextResponse.json({ success: true, message: "Link deleted successfully" });
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    );
  }
}
