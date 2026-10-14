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
    // Auth is optional for reading group details
    try {
      await verifyPrivyToken(req);
    } catch {
      // Optional for read
    }

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        admin: true,
        members: {
          include: {
            user: true,
          },
          orderBy: { position: "asc" },
        },
        rounds: {
          include: {
            contributions: true,
            recipient: true,
          },
          orderBy: { number: "asc" },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!group) {
      return errorResponse("NOT_FOUND", "Grup tidak ditemukan", 404);
    }

    return successResponse(
      {
        id: group.id,
        chainGroupId: group.chainGroupId,
        name: group.name,
        description: group.description,
        inviteCode: group.inviteCode,
        status: group.status,
        contributionAmount: group.contributionAmount,
        maxMembers: group.maxMembers,
        periodSeconds: group.periodSeconds,
        currentRound: group.currentRound,
        adminWallet: group.admin.walletAddress,
        members: group.members.map((m) => ({
          id: m.id,
          walletAddress: m.walletAddress,
          position: m.position,
          joinedAt: typeof m.joinedAt === "string" ? m.joinedAt : new Date(m.joinedAt).toISOString(),
          displayName: m.user?.displayName ?? null,
        })),
        rounds: group.rounds.map((r) => ({
          id: r.id,
          number: r.number,
          status: r.status,
          dueAt: typeof r.dueAt === "string" ? r.dueAt : new Date(r.dueAt).toISOString(),
          recipientWallet: r.recipient?.walletAddress ?? "",
          contributions: r.contributions.map((c) => ({
            memberId: c.memberId,
            txHash: c.txHash,
            paidAt: typeof c.paidAt === "string" ? c.paidAt : new Date(c.paidAt).toISOString(),
          })),
        })),
        activities: group.activities,
      },
      200
    );
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; status?: number };
    return errorResponse(error.code ?? "INTERNAL_ERROR", error.message ?? "Gagal memuat grup", error.status ?? 500);
  }
}
