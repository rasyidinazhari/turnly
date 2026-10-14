import { NextRequest } from "next/server";
import { verifyPrivyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { publicClient } from "@/lib/viem-client";
import { ARISAN_POOL } from "@/lib/contracts";
import { decodeEventLog } from "viem";
import arisanPoolArtifact from "@/abi/ArisanPool.json";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyPrivyToken(req);

    const user = await prisma.user.findUnique({
      where: { privyId: auth.privyId },
      include: {
        members: {
          include: {
            group: {
              include: {
                members: true,
                rounds: {
                  include: {
                    contributions: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return successResponse([], 200);

    const groups = user.members.map((m) => {
      const g = m.group;
      const currentRound = g.rounds.find((r) => r.number === g.currentRound);
      return {
        id: g.id,
        chainGroupId: g.chainGroupId,
        name: g.name,
        description: g.description,
        status: g.status,
        contributionAmount: g.contributionAmount,
        maxMembers: g.maxMembers,
        memberCount: g.members.length,
        currentRound: g.currentRound,
        paidCount: currentRound?.contributions?.length ?? 0,
      };
    });

    return successResponse(groups, 200);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; status?: number };
    return errorResponse(error.code ?? "INTERNAL_ERROR", error.message ?? "Gagal memuat grup", error.status ?? 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyPrivyToken(req);
    const body = await req.json();
    const { txHash, name, description } = body;

    if (!txHash || !name) {
      return errorResponse("INVALID_INPUT", "txHash dan name wajib diisi", 400);
    }

    // 1. Verifikasi transaksi onchain via viem
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (receipt.status !== "success") {
      return errorResponse("TX_FAILED", "Transaksi gagal di blockchain", 400);
    }

    // 2. Decode GroupCreated event
    let createdEvent: {
      groupId: bigint;
      admin: string;
      token: string;
      contribution: bigint;
      maxMembers: number;
      periodSeconds: number;
    } | null = null;

    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: arisanPoolArtifact.abi,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "GroupCreated") {
          createdEvent = decoded.args as unknown as typeof createdEvent;
          break;
        }
      } catch {
        // Skip log from other contracts
      }
    }

    if (!createdEvent) {
      return errorResponse("EVENT_NOT_FOUND", "Event GroupCreated tidak ditemukan pada transaksi", 400);
    }

    // 3. Upsert user
    const user = await prisma.user.upsert({
      where: { privyId: auth.privyId },
      update: { walletAddress: auth.walletAddress },
      create: { privyId: auth.privyId, walletAddress: auth.walletAddress },
    });

    // 4. Buat Group dan Member (admin) di database
    const inviteCode = generateInviteCode();
    const chainGroupId = Number(createdEvent.groupId);

    const group = await prisma.group.create({
      data: {
        chainGroupId,
        contractAddress: ARISAN_POOL || receipt.to || "",
        name,
        description,
        inviteCode,
        adminId: user.id,
        tokenAddress: createdEvent.token,
        contributionAmount: createdEvent.contribution.toString(),
        maxMembers: Number(createdEvent.maxMembers),
        periodSeconds: Number(createdEvent.periodSeconds),
        status: "OPEN",
        currentRound: 0,
        createdTxHash: txHash,
        members: {
          create: {
            userId: user.id,
            walletAddress: auth.walletAddress,
            position: 0,
            joinTxHash: txHash,
          },
        },
        activities: {
          create: {
            type: "GROUP_CREATED",
            txHash,
            payload: { name, contribution: createdEvent.contribution.toString() },
          },
        },
      },
      include: {
        members: true,
      },
    });

    return successResponse(group, 201);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; status?: number };
    return errorResponse(error.code ?? "INTERNAL_ERROR", error.message ?? "Gagal menyimpan grup", error.status ?? 500);
  }
}
