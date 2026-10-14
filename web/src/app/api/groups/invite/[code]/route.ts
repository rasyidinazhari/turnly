import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const group = await prisma.group.findUnique({
      where: { inviteCode: code },
      include: {
        members: true,
      },
    });

    if (!group) {
      return errorResponse("NOT_FOUND", "Kode undangan tidak ditemukan", 404);
    }

    return successResponse(
      {
        id: group.id,
        chainGroupId: group.chainGroupId,
        name: group.name,
        description: group.description,
        contributionAmount: group.contributionAmount,
        maxMembers: group.maxMembers,
        memberCount: group.members.length,
        periodSeconds: group.periodSeconds,
        status: group.status,
      },
      200
    );
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; status?: number };
    return errorResponse(error.code ?? "INTERNAL_ERROR", error.message ?? "Terjadi kesalahan", error.status ?? 500);
  }
}
