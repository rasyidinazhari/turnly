import { NextRequest } from "next/server";
import { verifyPrivyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyPrivyToken(req);

    const user = await prisma.user.findUnique({
      where: { privyId: auth.privyId },
    });

    if (!user) {
      return errorResponse("NOT_FOUND", "User belum terdaftar", 404);
    }

    return successResponse(user, 200);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; status?: number };
    return errorResponse(error.code ?? "INTERNAL_ERROR", error.message ?? "Terjadi kesalahan", error.status ?? 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyPrivyToken(req);
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("INVALID_INPUT", parsed.error.issues[0]?.message ?? "Input tidak valid", 400);
    }

    const updated = await prisma.user.update({
      where: { privyId: auth.privyId },
      data: parsed.data,
    });

    return successResponse(updated, 200);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; status?: number };
    return errorResponse(error.code ?? "INTERNAL_ERROR", error.message ?? "Terjadi kesalahan", error.status ?? 500);
  }
}
