import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Potong alamat wallet: 0x1234...abcd */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}

/** Format angka token dengan desimal */
export function formatToken(amount: bigint, decimals = 6, symbol = "mIDRX"): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const frac  = amount % divisor;
  const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole}${fracStr ? "." + fracStr : ""} ${symbol}`;
}

/** Format unix timestamp ke string lokal */
export function formatDeadline(ts: number): string {
  return new Date(ts * 1000).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Hitung sisa waktu dari sekarang ke deadline (detik) */
export function secondsUntil(ts: number): number {
  return Math.max(0, ts - Math.floor(Date.now() / 1000));
}

/** Format sisa waktu ke string singkat */
export function formatTimeLeft(seconds: number): string {
  if (seconds <= 0) return "Telat";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}h ${h}j`;
  if (h > 0) return `${h}j ${m}m`;
  return `${m}m`;
}
