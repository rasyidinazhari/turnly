"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useWriteContract } from "wagmi";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { arisanPool } from "@/lib/contracts";
import { monadTestnet } from "@/lib/chains";
import { formatToken } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Users, Loader2, LogIn, ArrowRight } from "lucide-react";

type InviteData = {
  id: string;
  chainGroupId: number;
  name: string;
  description?: string;
  contributionAmount: string;
  maxMembers: number;
  memberCount: number;
  periodSeconds: number;
  status: string;
};

export default function JoinGroupPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { address } = useAccount();
  const { authenticated, login, getAccessToken, ready } = usePrivy();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [group, setGroup] = useState<InviteData | null>(null);

  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    async function fetchInvite() {
      try {
        setLoading(true);
        const res = await fetch(`/api/groups/invite/${code}`);
        if (!res.ok) throw new Error("Undangan tidak ditemukan");
        const json = await res.json();
        setGroup(json.data);
      } catch (err) {
        toast({
          title: "Undangan Tidak Valid",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    if (code) fetchInvite();
  }, [code, toast]);

  async function handleJoin() {
    if (!authenticated || !address) {
      login();
      return;
    }

    if (!group) return;

    try {
      setJoining(true);
      // 1. Panggil smart contract joinGroup
      const hash = await writeContractAsync({
        ...arisanPool,
        functionName: "joinGroup",
        args: [BigInt(group.chainGroupId)],
        chainId: monadTestnet.id,
      });

      // 2. Simpan receipt / txHash ke API
      const token = await getAccessToken();
      const res = await fetch(`/api/groups/${group.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ txHash: hash }),
      });

      if (!res.ok) throw new Error("Gagal mencatat keanggotaan");

      toast({
        title: "Berhasil Bergabung!",
        description: `Kamu sekarang resmi terdaftar di ${group.name}.`,
      });

      router.push(`/groups/${group.id}`);
    } catch (err) {
      toast({
        title: "Gagal Bergabung",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  }

  if (loading || !ready) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Memuat data grup...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle>Grup Tidak Ditemukan</CardTitle>
              <CardDescription>Kode undangan sudah kedaluwarsa atau salah.</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  const isFull = group.memberCount >= group.maxMembers;
  const isNotOpen = group.status !== "OPEN";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-12 space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="mb-2">Undangan Arisan</Badge>
          <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
          {group.description && (
            <p className="text-sm text-muted-foreground">{group.description}</p>
          )}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informasi Putaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border p-3 bg-muted/20">
                <span className="text-xs text-muted-foreground block">Iuran per Putaran</span>
                <span className="font-semibold text-base">
                  {formatToken(BigInt(group.contributionAmount))}
                </span>
              </div>
              <div className="rounded-lg border p-3 bg-muted/20">
                <span className="text-xs text-muted-foreground block">Slot Anggota</span>
                <span className="font-semibold text-base">
                  {group.memberCount} / {group.maxMembers}
                </span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
              <Users className="h-4 w-4" />
              <span>Urutan giliran otomatis sesuai urutan bergabung.</span>
            </div>

            <Button
              className="w-full mt-2"
              size="lg"
              disabled={joining || isFull || isNotOpen}
              onClick={handleJoin}
            >
              {joining ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengonfirmasi Transaksi...
                </>
              ) : isFull ? (
                "Slot Anggota Sudah Penuh"
              ) : isNotOpen ? (
                "Grup Sudah Dimulai"
              ) : !authenticated ? (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Masuk untuk Bergabung
                </>
              ) : (
                <>
                  Bergabung Sekarang
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
