"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/layout/Navbar";
import { arisanPool, MOCK_IDRX } from "@/lib/contracts";
import { monadTestnet } from "@/lib/chains";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(3, "Minimal 3 karakter"),
  description: z.string().optional(),
  contribution: z.number().min(1, "Minimal 1 mIDRX"),
  maxMembers: z.number().int().min(2, "Minimal 2").max(10, "Maksimal 10"),
  periodDays: z.number().int().min(1, "Minimal 1 hari").max(30, "Maksimal 30 hari"),
});

export default function NewGroupPage() {
  const router = useRouter();
  const { getAccessToken, authenticated, login } = usePrivy();
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "confirming" | "saving">("form");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contribution, setContribution] = useState(100);
  const [maxMembers, setMaxMembers] = useState(5);
  const [periodDays, setPeriodDays] = useState(7);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { writeContractAsync } = useWriteContract();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authenticated) {
      login();
      return;
    }

    const validation = schema.safeParse({
      name,
      description,
      contribution,
      maxMembers,
      periodDays,
    });

    if (!validation.success) {
      const errMap: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        if (issue.path[0]) {
          errMap[issue.path[0].toString()] = issue.message;
        }
      }
      setErrors(errMap);
      return;
    }

    setErrors({});

    try {
      setStep("confirming");
      const contributionRaw = parseUnits(contribution.toString(), 6);
      const periodSeconds = periodDays * 86400;

      const hash = await writeContractAsync({
        ...arisanPool,
        functionName: "createGroup",
        args: [MOCK_IDRX, contributionRaw, maxMembers, periodSeconds],
        chainId: monadTestnet.id,
      });

      setStep("saving");
      const token = await getAccessToken();
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          txHash: hash,
          name,
          description,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan grup di server");
      const { data: group } = await res.json();

      toast({ title: "Grup berhasil dibuat!", description: name });
      router.push(`/groups/${group.id}`);
    } catch (err) {
      setStep("form");
      toast({
        title: "Gagal membuat grup",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Buat Grup Arisan</h1>
          <p className="text-sm text-muted-foreground">
            Kamu akan otomatis jadi admin dan anggota pertama.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detail Grup</CardTitle>
            <CardDescription>
              Parameter grup terkunci dan tidak bisa diubah setelah dimulai.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nama */}
              <div className="space-y-1.5">
                <Label htmlFor="name">Nama Grup</Label>
                <Input
                  id="name"
                  placeholder="Arisan Kantor Q4"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Deskripsi (opsional)</Label>
                <Textarea
                  id="description"
                  placeholder="Arisan bulanan tim engineering"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Iuran */}
              <div className="space-y-1.5">
                <Label htmlFor="contribution">Iuran per Putaran (mIDRX)</Label>
                <Input
                  id="contribution"
                  type="number"
                  min={1}
                  placeholder="100"
                  value={contribution}
                  onChange={(e) => setContribution(Number(e.target.value))}
                />
                {errors.contribution && (
                  <p className="text-xs text-destructive">{errors.contribution}</p>
                )}
              </div>

              {/* Jumlah anggota */}
              <div className="space-y-1.5">
                <Label htmlFor="maxMembers">Jumlah Anggota (2–10)</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min={2}
                  max={10}
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(Number(e.target.value))}
                />
                {errors.maxMembers && (
                  <p className="text-xs text-destructive">{errors.maxMembers}</p>
                )}
              </div>

              {/* Periode */}
              <div className="space-y-1.5">
                <Label htmlFor="periodDays">Durasi Putaran (hari, 1–30)</Label>
                <Input
                  id="periodDays"
                  type="number"
                  min={1}
                  max={30}
                  value={periodDays}
                  onChange={(e) => setPeriodDays(Number(e.target.value))}
                />
                {errors.periodDays && (
                  <p className="text-xs text-destructive">{errors.periodDays}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={step !== "form"}
              >
                {step === "form" && "Buat Grup"}
                {step === "confirming" && "Menunggu tanda tangan..."}
                {step === "saving" && "Menyimpan ke server..."}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
