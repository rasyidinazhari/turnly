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

    const rounds = await prisma.round.findMany({
      where: { groupId: id },
      include: {
        recipient: {
          include: { user: true },
        },
        contributions: {
          include: {
            member: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: { number: "asc" },
    });

    return successResponse(rounds, 200);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; status?: number };
    return errorResponse(error.code ?? "INTERNAL_ERROR", error.message ?? "Gagal memuat putaran", error.status ?? 500);
  }
}
