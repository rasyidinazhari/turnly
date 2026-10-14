import arisanPoolArtifact from "@/abi/ArisanPool.json";
import mockIdrxArtifact from "@/abi/MockIDRX.json";

export const ARISAN_POOL = (process.env.NEXT_PUBLIC_ARISAN_POOL || "0x40F5E2555b3bB291f12916fd3323A98943ad3759") as `0x${string}`;
export const MOCK_IDRX   = (process.env.NEXT_PUBLIC_MOCK_IDRX   || "0x807831c9A85d2c8f97eA30D3860a1Fb44F1B2F8a") as `0x${string}`;

export const arisanPool = {
  address: ARISAN_POOL,
  abi: arisanPoolArtifact.abi,
} as const;

export const mockIdrx = {
  address: MOCK_IDRX,
  abi: mockIdrxArtifact.abi,
} as const;

export const explorerTx = (hash: string) =>
  `${process.env.NEXT_PUBLIC_EXPLORER_URL ?? "https://testnet.monadvision.com"}/tx/${hash}`;

export const explorerAddr = (addr: string) =>
  `${process.env.NEXT_PUBLIC_EXPLORER_URL ?? "https://testnet.monadvision.com"}/address/${addr}`;

