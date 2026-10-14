import { PrivyClient } from "@privy-io/server-auth";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export interface AuthUser {
  privyId: string;
  walletAddress: string;
}

/** Verifikasi Privy access token dari header Authorization.
 *  Lempar Error dengan kode jika gagal.
 */
export async function verifyPrivyToken(req: Request): Promise<AuthUser> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw Object.assign(new Error("Token tidak ada"), { code: "UNAUTHENTICATED", status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");

  try {
    const claims = await privy.verifyAuthToken(token);
    // Ambil wallet address dari linked accounts
    const user = await privy.getUser(claims.userId);
    const wallet = user.linkedAccounts.find(
      (a) => a.type === "wallet" && a.walletClientType === "privy"
    ) as { address: string } | undefined;

    if (!wallet) {
      throw Object.assign(new Error("Wallet belum dibuat"), { code: "UNAUTHENTICATED", status: 401 });
    }

    return { privyId: claims.userId, walletAddress: wallet.address };
  } catch (err) {
    if ((err as { code?: string }).code === "UNAUTHENTICATED") throw err;
    throw Object.assign(new Error("Token tidak valid"), { code: "UNAUTHENTICATED", status: 401 });
  }
}
