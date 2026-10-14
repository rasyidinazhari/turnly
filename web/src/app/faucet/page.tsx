"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useBalance } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { mockIdrx, explorerTx } from "@/lib/contracts";
import { monadTestnet } from "@/lib/chains";
import { formatToken, shortenAddress } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Coins, Loader2, Sparkles, Copy, Check, AlertCircle, Clock } from "lucide-react";

export default function FaucetPage() {
  const { address } = useAccount();
  const { authenticated, login } = usePrivy();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string>("");
  const [now, setNow] = useState<number>(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: balance, refetch: refetchBalance } = useReadContract({
    ...mockIdrx,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address },
  });

  const { data: lastClaimTime, refetch: refetchLastClaim } = useReadContract({
    ...mockIdrx,
    functionName: "lastClaim",
    args: [address!],
    query: { enabled: !!address },
  });

  const cooldownPeriod = 3600; // 1 jam cooldown di MockIDRX.sol
  const lastClaimSec = lastClaimTime ? Number(lastClaimTime) : 0;
  const nextClaimTime = lastClaimSec > 0 ? lastClaimSec + cooldownPeriod : 0;
  const remainingCooldown = Math.max(0, nextClaimTime - now);
  const isCooldown = remainingCooldown > 0;

  function formatCooldown(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) {
      return `${m}m ${s < 10 ? "0" : ""}${s}s`;
    }
    return `${s}s`;
  }

  const { data: monBalance, refetch: refetchMonBalance } = useBalance({
    address,
  });

  const { writeContractAsync } = useWriteContract();

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast({
      title: "Alamat Disalin",
      description: "Alamat wallet berhasil disalin ke clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleClaim() {
    if (!address) {
      login();
      return;
    }

    if (isCooldown) {
      toast({
        title: "Cooldown Masih Aktif",
        description: `Kamu baru bisa klaim lagi dalam ${formatCooldown(remainingCooldown)}.`,
        variant: "destructive",
      });
      return;
    }

    if (monBalance && monBalance.value === 0n) {
      toast({
        title: "Butuh MON untuk Gas",
        description: "Saldo native MON kamu 0. Ambil MON gratis dari faucet Monad terlebih dahulu untuk membayar gas transaksi.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const hash = await writeContractAsync({
        ...mockIdrx,
        functionName: "faucet",
        chainId: monadTestnet.id,
      });
      setLastTxHash(hash);
      toast({
        title: "Klaim Berhasil!",
        description: "+1,000 mIDRX telah dikirim ke wallet kamu.",
      });
      setTimeout(() => {
        refetchBalance();
        refetchMonBalance();
        refetchLastClaim();
      }, 2000);
    } catch (err) {
      const msg = (err as Error).message || "";
      let errorDescription = msg;
      if (msg.toLowerCase().includes("cooldown")) {
        errorDescription = "Cooldown aktif. Kamu hanya bisa klaim 1 jam sekali.";
      } else if (
        msg.toLowerCase().includes("insufficient") ||
        msg.toLowerCase().includes("gas") ||
        msg.toLowerCase().includes("exceeds the balance")
      ) {
        errorDescription = "Saldo MON kamu tidak cukup untuk membayar gas fee. Ambil MON testnet di faucet.monad.xyz.";
      }
      toast({
        title: "Gagal Mengambil Token",
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Testnet Faucet</h1>
          <p className="text-sm text-muted-foreground">
            Ambil saldo uji coba untuk menjalankan arisan di Monad Testnet.
          </p>
        </div>

        {/* MockIDRX Faucet */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Token mIDRX (Mock IDRX)</CardTitle>
            </div>
            <CardDescription>
              Token stablecoin simulasi yang digunakan sebagai mata uang iuran arisan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40 text-sm">
                <span className="text-muted-foreground">Saldo mIDRX Kamu</span>
                <span className="font-semibold font-mono">
                  {address && balance !== undefined
                    ? formatToken(balance as bigint)
                    : "0 mIDRX"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20 text-xs">
                <span className="text-muted-foreground">Saldo Gas MON</span>
                <span className="font-mono font-medium">
                  {address && monBalance
                    ? `${Number(monBalance.formatted).toFixed(4)} MON`
                    : "0 MON"}
                </span>
              </div>
            </div>

            {address && (
              <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/10 px-3 py-2 text-xs">
                <div className="text-muted-foreground truncate">
                  Wallet: <code className="font-mono text-foreground">{shortenAddress(address)}</code>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1"
                  onClick={copyAddress}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Tersalin" : "Salin Alamat"}
                </Button>
              </div>
            )}

            {address && monBalance && monBalance.value === 0n && (
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Saldo MON Kamu 0 (Butuh Gas Fee)</span>
                </div>
                <p className="text-muted-foreground">
                  Klaim mIDRX adalah transaksi smart contract yang memerlukan gas fee mikro. Salin alamat wallet di atas dan ambil MON gratis di faucet Monad.
                </p>
              </div>
            )}

            {isCooldown && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Cooldown Aktif — Tunggu {formatCooldown(remainingCooldown)}</span>
                </div>
                <p className="text-muted-foreground">
                  Faucet mIDRX dibatasi 1 klaim per jam per wallet. Tombol akan otomatis aktif kembali saat cooldown selesai.
                </p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleClaim}
              disabled={loading || !authenticated || isCooldown}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengirim transaksi...
                </>
              ) : !authenticated ? (
                "Masuk untuk Klaim"
              ) : isCooldown ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Cooldown Aktif ({formatCooldown(remainingCooldown)})
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Klaim 1,000 mIDRX
                </>
              )}
            </Button>

            {lastTxHash && (
              <p className="text-xs text-center text-muted-foreground">
                <a
                  href={explorerTx(lastTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline inline-flex items-center gap-1"
                >
                  Lihat transaksi di MonadVision <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Monad Native MON Faucet Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">MON Testnet (Gas Fee)</CardTitle>
            <CardDescription>
              Diperlukan saldo native MON untuk membayar biaya transaksi di jaringan Monad.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground text-xs">
              Klaim native MON gratis dari faucet resmi pengembang Monad:
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a
                href="https://faucet.monad.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                Buka Monad Official Faucet <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
