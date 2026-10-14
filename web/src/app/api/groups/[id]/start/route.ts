import { NextRequest } from "next/server";
import { verifyPrivyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { publicClient } from "@/lib/viem-client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await verifyPrivyToken(req);
    const body = await req.json();
    const { txHash } = body;

    if (!txHash) {
      return errorResponse("INVALID_INPUT", "txHash wajib disertakan", 400);
    }

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        admin: true,
        members: { orderBy: { position: "asc" } },
      },
    });

    if (!group) return errorResponse("NOT_FOUND", "Grup tidak ditemukan", 404);
    if (group.admin.walletAddress.toLowerCase() !== auth.walletAddress.toLowerCase()) {
      return errorResponse("FORBIDDEN", "Hanya admin yang boleh memulai grup", 403);
    }

    // 1. Verifikasi tx di chain
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (receipt.status !== "success") {
      return errorResponse("TX_FAILED", "Transaksi startGroup gagal di chain", 400);
    }

    // 2. Hitung dueAt tiap putaran dan buat baris Round
    const now = new Date();
    const roundsData = group.members.map((member, index) => {
      const dueAt = new Date(now.getTime() + (index + 1) * group.periodSeconds * 1000);
      return {
        groupId: group.id,
        number: index,
        recipientId: member.id,
        dueAt,
        status: index === 0 ? ("OPEN" as const) : ("PENDING" as const),
      };
    });

    // 3. Update status grup dan buat Rounds dalam satu transaksi
    await prisma.$transaction([
      prisma.group.update({
        where: { id: group.id },
        data: {
          status: "ACTIVE",
          startedAt: now,
        },
      }),
      prisma.round.createMany({
        data: roundsData,
      }),
      prisma.activity.create({
        data: {
          groupId: group.id,
          type: "GROUP_STARTED",
          txHash,
          payload: { startedAt: now.toISOString() },
        },
      }),
    ]);

    return successResponse({ started: true }, 200);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; status?: number };
    return errorResponse(error.code ?? "INTERNAL_ERROR", error.message ?? "Gagal memulai grup", error.status ?? 500);
  }
}
