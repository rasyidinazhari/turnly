"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Coins } from "lucide-react";
import { GroupCard, GroupSummary } from "@/components/groups/GroupCard";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardPage() {
  const { ready, authenticated, login, getAccessToken, user } = usePrivy();

  // Sync session to backend when authenticated
  useEffect(() => {
    async function syncSession() {
      if (authenticated) {
        try {
          const token = await getAccessToken();
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {
          // ignore
        }
      }
    }
    syncSession();
  }, [authenticated, getAccessToken]);

  const { data: groups, isLoading } = useQuery<GroupSummary[]>({
    queryKey: ["my-groups", user?.id],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch("/api/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil daftar grup");
      const json = await res.json();
      return json.data;
    },
    enabled: authenticated,
    refetchInterval: 10_000,
  });

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-6 w-6 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-16 flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle>Masuk ke Akun</CardTitle>
              <CardDescription>
                Gunakan email atau akun Google untuk mengakses dashboard grup arisan kamu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={login} className="w-full">
                Masuk Sekarang
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Grup arisan kamu</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/faucet">
                <Coins className="h-4 w-4 mr-1" />
                Faucet
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/groups/new">
                <Plus className="h-4 w-4 mr-1" />
                Buat Grup
              </Link>
            </Button>
          </div>
        </div>

        {/* Group list */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : groups && groups.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Belum ada grup</CardTitle>
              <CardDescription>
                Buat grup arisan pertama atau minta link undangan dari teman.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild>
                <Link href="/groups/new">
                  <Plus className="h-4 w-4 mr-1" />
                  Buat Grup
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
