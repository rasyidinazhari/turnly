"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberList } from "@/components/groups/MemberList";
import { PayButton } from "@/components/groups/PayButton";
import { formatToken, formatDeadline, shortenAddress } from "@/lib/utils";
import { explorerTx, arisanPool } from "@/lib/contracts";
import { monadTestnet } from "@/lib/chains";
import { useWriteContract } from "wagmi";
import { Copy, ExternalLink, Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  OPEN:      { label: "Menunggu Anggota", variant: "outline"      as const },
  ACTIVE:    { label: "Aktif",            variant: "default"      as const },
  COMPLETED: { label: "Selesai",          variant: "secondary"    as const },
  CANCELLED: { label: "Dibatalkan",       variant: "destructive"  as const },
};

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getAccessToken, user } = usePrivy();
  const { toast } = useToast();

  const walletAddr = (user?.linkedAccounts?.find(
    (a) => a.type === "wallet" && (a as { walletClientType?: string }).walletClientType === "privy"
  ) as { address?: string } | undefined)?.address?.toLowerCase() ?? "";

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const token = await getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/groups/${id}`, { headers });
      if (!res.ok) throw new Error("Gagal memuat grup");
      return res.json() as Promise<{ data: GroupDetail }>;
    },
    refetchInterval: 10_000,
  });

  const group = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-32 w-full" />
        </main>
      </div>
    );
  }

  if (!group) return null;

  const { label, variant } = statusConfig[group.status];
  const isAdmin    = group.adminWallet?.toLowerCase() === walletAddr;
  const isMember   = group.members.some((m) => m.walletAddress.toLowerCase() === walletAddr);
  const myMember   = group.members.find((m) => m.walletAddress.toLowerCase() === walletAddr);
  const inviteUrl  = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${group.inviteCode}`;

  const currentRoundData = group.rounds?.[group.currentRound];
  const paidCount   = currentRoundData?.contributions?.length ?? 0;
  const totalMembers = group.members.length;
  const progress    = totalMembers > 0 ? Math.round((paidCount / totalMembers) * 100) : 0;
  const recipient   = group.members.find((m) => m.position === group.currentRound);

  const [starting, setStarting] = useState(false);
  const { writeContractAsync } = useWriteContract();

  async function handleStart() {
    if (group.members.length < 2) {
      toast({
        title: "Anggota Belum Cukup",
        description: "Minimal butuh 2 anggota untuk memulai arisan.",
        variant: "destructive",
      });
      return;
    }

    try {
      setStarting(true);
      const hash = await writeContractAsync({
        ...arisanPool,
        functionName: "startGroup",
        args: [BigInt(group.chainGroupId)],
        chainId: monadTestnet.id,
      });

      const token = await getAccessToken();
      const res = await fetch(`/api/groups/${id}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ txHash: hash }),
      });

      if (!res.ok) throw new Error("Gagal memulai grup di server");

      toast({
        title: "Grup Resmi Dimulai!",
        description: "Urutan giliran telah dikunci di blockchain Monad.",
      });

      refetch();
    } catch (err) {
      toast({
        title: "Gagal Memulai Grup",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold">{group.name}</h1>
              <Badge variant={variant}>{label}</Badge>
            </div>
            {group.description && (
              <p className="text-sm text-muted-foreground">{group.description}</p>
            )}
          </div>
          {/* Tombol admin */}
          {isAdmin && group.status === "OPEN" && (
            <Button size="sm" onClick={handleStart} disabled={starting}>
              {starting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Memulai...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Mulai Grup
                </>
              )}
            </Button>
          )}
        </div>

        {/* Info utama */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-1">
              <p className="text-xs text-muted-foreground">Iuran per Putaran</p>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{formatToken(BigInt(group.contributionAmount))}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <p className="text-xs text-muted-foreground">Anggota</p>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{group.members.length}/{group.maxMembers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <p className="text-xs text-muted-foreground">Total Pot</p>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">
                {formatToken(BigInt(group.contributionAmount) * BigInt(group.members.length))}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Putaran berjalan */}
        {group.status === "ACTIVE" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Putaran {group.currentRound + 1} dari {group.maxMembers}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recipient && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Penerima giliran</span>
                  <span className="font-medium">{shortenAddress(recipient.walletAddress)}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{paidCount} dari {totalMembers} sudah bayar</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
              {/* PayButton */}
              {isMember && myMember && (
                <PayButton
                  groupId={group.chainGroupId}
                  groupDbId={id}
                  contribution={BigInt(group.contributionAmount)}
                  round={group.currentRound}
                  onSuccess={() => refetch()}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Link undangan (status OPEN) */}
        {group.status === "OPEN" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Link Undangan</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted rounded px-2 py-1 truncate">
                {inviteUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl);
                  toast({ title: "Link disalin!" });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Daftar anggota */}
        <MemberList
          members={group.members}
          currentRound={group.currentRound}
          contributions={currentRoundData?.contributions ?? []}
          status={group.status}
        />
      </main>
    </div>
  );
}

// Types
type GroupDetail = {
  id: string;
  chainGroupId: number;
  name: string;
  description?: string;
  inviteCode: string;
  status: "OPEN" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  contributionAmount: string;
  maxMembers: number;
  currentRound: number;
  adminWallet?: string;
  members: Array<{
    id: string;
    walletAddress: string;
    position: number;
    joinedAt: string;
  }>;
  rounds?: Array<{
    number: number;
    status: string;
    dueAt: string;
    contributions: Array<{ memberId: string; txHash: string }>;
  }>;
};
