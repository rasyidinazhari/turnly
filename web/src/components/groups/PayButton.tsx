"use client";

import { useState } from "react";
import { useReadContract, useWriteContract, useAccount, usePublicClient } from "wagmi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { arisanPool, mockIdrx, ARISAN_POOL, explorerTx } from "@/lib/contracts";
import { monadTestnet } from "@/lib/chains";
import { usePrivy } from "@privy-io/react-auth";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Check, Loader2 } from "lucide-react";

type Props = {
  groupId: number;         // chainGroupId
  groupDbId: string;       // DB id untuk API call
  contribution: bigint;
  round: number;
  onSuccess?: () => void;
};

type Step = "idle" | "approving" | "contributing" | "saving" | "done";

export function PayButton({ groupId, groupDbId, contribution, round, onSuccess }: Props) {
  const { address } = useAccount();
  const { getAccessToken } = usePrivy();
  const { toast } = useToast();
  const publicClient = usePublicClient();
  const [step, setStep] = useState<Step>("idle");
  const [txHash, setTxHash] = useState<string>("");

  const { writeContractAsync } = useWriteContract();

  // Baca allowance saat ini
  const { data: allowance } = useReadContract({
    ...mockIdrx,
    functionName: "allowance",
    args: [address!, ARISAN_POOL],
    query: { enabled: !!address },
  });

  // Cek apakah sudah bayar putaran ini
  const { data: alreadyPaid } = useReadContract({
    ...arisanPool,
    functionName: "hasPaid",
    args: [BigInt(groupId), round, address!],
    query: { enabled: !!address },
  });

  async function handlePay() {
    if (!address) return;
    try {
      // 1. Approve jika allowance kurang
      if ((allowance ?? 0n) < contribution) {
        setStep("approving");
        const approveHash = await writeContractAsync({
          ...mockIdrx,
          functionName: "approve",
          args: [ARISAN_POOL, contribution],
          chainId: monadTestnet.id,
        });
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
        }
        toast({
          title: "Approval sukses",
          description: "Wallet sudah mengizinkan kontrak menarik token.",
        });
      }

      // 2. Contribute
      setStep("contributing");
      const hash = await writeContractAsync({
        ...arisanPool,
        functionName: "contribute",
        args: [BigInt(groupId)],
        chainId: monadTestnet.id,
      });
      setTxHash(hash);

      // 3. Simpan ke API
      setStep("saving");
      const token = await getAccessToken();
      await fetch(`/api/groups/${groupDbId}/contributions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ txHash: hash }),
      });

      setStep("done");
      toast({
        title: "Iuran berhasil!",
        description: (
          <a
            href={explorerTx(hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline flex items-center gap-1"
          >
            Lihat di MonadVision <ExternalLink className="h-3 w-3" />
          </a>
        ),
      });
      onSuccess?.();
    } catch (err) {
      setStep("idle");
      toast({
        title: "Gagal membayar",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  }

  if (alreadyPaid) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Check className="h-3 w-3" />
        Sudah Bayar
      </Badge>
    );
  }

  if (step === "done") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <Check className="h-3 w-3" />
          Sudah Bayar
        </Badge>
        {txHash && (
          <a
            href={explorerTx(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Explorer
          </a>
        )}
      </div>
    );
  }

  const isLoading = step !== "idle";
  const labels: Record<Step, string> = {
    idle:         "Bayar Iuran",
    approving:    "Approval...",
    contributing: "Membayar...",
    saving:       "Menyimpan...",
    done:         "Selesai",
  };

  return (
    <Button onClick={handlePay} disabled={isLoading} className="w-full sm:w-auto">
      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      {labels[step]}
    </Button>
  );
}
