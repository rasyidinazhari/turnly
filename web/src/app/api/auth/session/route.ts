import { NextRequest } from "next/server";
import { verifyPrivyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyPrivyToken(req);

    const user = await prisma.user.upsert({
      where: { privyId: auth.privyId },
      update: { walletAddress: auth.walletAddress },
      create: {
        privyId: auth.privyId,
        walletAddress: auth.walletAddress,
      },
    });

    return successResponse(user, 200);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; status?: number };
    return errorResponse(error.code ?? "INTERNAL_ERROR", error.message ?? "Gagal autentikasi", error.status ?? 500);
  }
}
