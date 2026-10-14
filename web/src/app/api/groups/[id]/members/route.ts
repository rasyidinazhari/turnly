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

    if (!txHash) {
      return errorResponse("INVALID_INPUT", "txHash wajib disertakan", 400);
    }

    const group = await prisma.group.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!group) return errorResponse("NOT_FOUND", "Grup tidak ditemukan", 404);

    // 1. Verifikasi tx di chain
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (receipt.status !== "success") {
      return errorResponse("TX_FAILED", "Transaksi tidak berhasil di Monad", 400);
    }

    // 2. Decode event MemberJoined
    let position = group.members.length;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: arisanPoolArtifact.abi,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "MemberJoined") {
          const args = decoded.args as { position: number };
          position = Number(args.position);
          break;
        }
      } catch {
        // Skip
      }
    }

    // 3. Upsert user
    const user = await prisma.user.upsert({
      where: { privyId: auth.privyId },
      update: { walletAddress: auth.walletAddress },
      create: { privyId: auth.privyId, walletAddress: auth.walletAddress },
    });

    // 4. Buat Member baru
    const member = await prisma.member.create({
      data: {
        groupId: group.id,
        userId: user.id,
        walletAddress: auth.walletAddress,
        position,
        joinTxHash: txHash,
      },
    });

    // 5. Log activity
    await prisma.activity.create({
      data: {
        groupId: group.id,
        type: "MEMBER_JOINED",
        actorId: member.id,
        txHash,
        payload: { position, walletAddress: auth.walletAddress },
      },
    });

    return successResponse(member, 201);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; status?: number };
    return errorResponse(error.code ?? "INTERNAL_ERROR", error.message ?? "Gagal mencatat anggota", error.status ?? 500);
  }
}
