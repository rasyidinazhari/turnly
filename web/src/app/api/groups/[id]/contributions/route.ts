import { NextRequest } from "next/server";
import { verifyPrivyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { publicClient } from "@/lib/viem-client";
import { decodeEventLog } from "viem";
import arisanPoolArtifact from "@/abi/ArisanPool.json";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await verifyPrivyToken(req);
    const body = await req.json();
    const { txHash } = body;

    if (!txHash) return errorResponse("INVALID_INPUT", "txHash wajib disertakan", 400);

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: true,
        rounds: {
          where: { status: "OPEN" },
          include: { contributions: true },
        },
      },
    });

    if (!group) return errorResponse("NOT_FOUND", "Grup tidak ditemukan", 404);

    const currentMember = group.members.find(
      (m) => m.walletAddress.toLowerCase() === auth.walletAddress.toLowerCase()
    );

    if (!currentMember) {
      return errorResponse("FORBIDDEN", "Bukan anggota grup ini", 403);
    }

    const openRound = group.rounds[0];
    if (!openRound) {
      return errorResponse("BAD_REQUEST", "Tidak ada putaran yang sedang dibuka", 400);
    }

    // 1. Verifikasi transaksi onchain
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (receipt.status !== "success") {
      return errorResponse("TX_FAILED", "Transaksi iuran gagal di chain", 400);
    }

    // 2. Cek apakah ada event RoundPaidOut atau GroupCompleted di logs
    let paidOutEvent: { round: number; recipient: string; amount: bigint } | null = null;
    let groupCompleted = false;

    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: arisanPoolArtifact.abi,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "RoundPaidOut") {
          paidOutEvent = decoded.args as unknown as typeof paidOutEvent;
        } else if (decoded.eventName === "GroupCompleted") {
          groupCompleted = true;
        }
      } catch {
        // Skip logs from other contracts
      }
    }

    // 3. Catat kontribusi (idempoten via txHash unique)
    const contribution = await prisma.contribution.upsert({
      where: { txHash },
      update: {},
      create: {
        roundId: openRound.id,
        memberId: currentMember.id,
        amount: group.contributionAmount,
        txHash,
      },
    });

    // 4. Log activity
    await prisma.activity.create({
      data: {
        groupId: group.id,
        type: "CONTRIBUTED",
        actorId: currentMember.id,
        txHash,
        payload: {
          round: openRound.number,
          amount: group.contributionAmount,
        },
      },
    });

    // 5. Jika pot cair di putaran ini:
    if (paidOutEvent) {
      // Tandai putaran ini PAID_OUT
      await prisma.round.update({
        where: { id: openRound.id },
        data: {
          status: "PAID_OUT",
          potAmount: paidOutEvent.amount.toString(),
          paidOutTxHash: txHash,
          paidOutAt: new Date(),
        },
      });

      await prisma.activity.create({
        data: {
          groupId: group.id,
          type: "ROUND_PAID_OUT",
          txHash,
          payload: {
            round: openRound.number,
            recipient: paidOutEvent.recipient,
            amount: paidOutEvent.amount.toString(),
          },
        },
      });

      if (groupCompleted) {
        await prisma.group.update({
          where: { id: group.id },
          data: { status: "COMPLETED" },
        });

        await prisma.activity.create({
          data: {
            groupId: group.id,
            type: "GROUP_COMPLETED",
            txHash,
          },
        });
      } else {
        // Buka putaran berikutnya
        const nextRoundNumber = openRound.number + 1;
        await prisma.round.updateMany({
          where: { groupId: group.id, number: nextRoundNumber },
          data: { status: "OPEN" },
        });
        await prisma.group.update({
          where: { id: group.id },
          data: { currentRound: nextRoundNumber },
        });
      }
    }

    return successResponse(
      {
        contribution,
        paidOut: !!paidOutEvent,
        completed: groupCompleted,
      },
      200
    );
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; status?: number };
    return errorResponse(error.code ?? "INTERNAL_ERROR", error.message ?? "Gagal memproses iuran", error.status ?? 500);
  }
}
