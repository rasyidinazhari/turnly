import { NextRequest } from "next/server";
import { verifyPrivyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await verifyPrivyToken(req);

    const activities = await prisma.activity.findMany({
      where: { groupId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return successResponse(activities, 200);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; status?: number };
    return errorResponse(error.code ?? "INTERNAL_ERROR", error.message ?? "Gagal memuat aktivitas", error.status ?? 500);
  }
}
