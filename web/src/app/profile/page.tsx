"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shortenAddress } from "@/lib/utils";
import { explorerAddr } from "@/lib/contracts";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink, LogOut, Check } from "lucide-react";

export default function ProfilePage() {
  const { user, authenticated, ready, login, logout, getAccessToken } = usePrivy();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const walletAddr =
    user?.linkedAccounts?.find(
      (a) => a.type === "wallet" && (a as { walletClientType?: string }).walletClientType === "privy"
    )?.address ?? "";

  const userEmail =
    user?.linkedAccounts?.find((a) => a.type === "email")?.address ??
    (user?.email?.address ?? "");

  useEffect(() => {
    async function fetchProfile() {
      if (!authenticated) return;
      try {
        const token = await getAccessToken();
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.data?.displayName) setDisplayName(data.data.displayName);
        }
      } catch {
        // Ignore initial fetch error if not yet saved in db
      }
    }
    fetchProfile();
  }, [authenticated, getAccessToken]);

  async function handleSaveName() {
    try {
      setSaving(true);
      const token = await getAccessToken();
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui profil");
      toast({ title: "Profil diperbarui!" });
    } catch (err) {
      toast({
        title: "Gagal menyimpan",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function handleCopyAddress() {
    if (!walletAddr) return;
    navigator.clipboard.writeText(walletAddr);
    setCopied(true);
    toast({ title: "Alamat disalin ke clipboard" });
    setTimeout(() => setCopied(false), 2000);
  }

  if (!ready) return null;

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle>Profil Pengguna</CardTitle>
              <CardDescription>Silakan login untuk melihat profil akun.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={login} className="w-full">
                Masuk dengan Email / Google
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
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Profil Akun</h1>
          <p className="text-sm text-muted-foreground">Kelola data identitas dan wallet onchain kamu.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            {userEmail && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Email Terhubung</Label>
                <div className="text-sm font-medium">{userEmail}</div>
              </div>
            )}

            {/* Wallet Address */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Alamat Monad Embedded Wallet</Label>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1.5 rounded flex-1 truncate font-mono">
                  {walletAddr}
                </code>
                <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={handleCopyAddress}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                {walletAddr && (
                  <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" asChild>
                    <a href={explorerAddr(walletAddr)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Display Name Input */}
            <div className="space-y-1.5 pt-2">
              <Label htmlFor="displayName">Nama Tampilan</Label>
              <div className="flex gap-2">
                <Input
                  id="displayName"
                  placeholder="Contoh: Budi Santoso"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <Button onClick={handleSaveName} disabled={saving} size="sm">
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Keluar dari Sesi
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
