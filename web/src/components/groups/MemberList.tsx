import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shortenAddress } from "@/lib/utils";
import { Check, Clock } from "lucide-react";

type Member = {
  id: string;
  walletAddress: string;
  position: number;
  joinedAt: string;
};

type Contribution = {
  memberId: string;
  txHash: string;
};

type Props = {
  members: Member[];
  currentRound: number;
  contributions: Contribution[];
  status: "OPEN" | "ACTIVE" | "COMPLETED" | "CANCELLED";
};

export function MemberList({ members, currentRound, contributions, status }: Props) {
  const paidMemberIds = new Set(contributions.map((c) => c.memberId));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daftar Anggota & Urutan Giliran</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {members
            .sort((a, b) => a.position - b.position)
            .map((member) => {
              const isRecipient = status === "ACTIVE" && member.position === currentRound;
              const hasPaid     = paidMemberIds.has(member.id);

              return (
                <li
                  key={member.id}
                  className="flex items-center justify-between px-6 py-3 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-muted-foreground w-5 shrink-0">
                      #{member.position + 1}
                    </span>
                    <span className="text-sm font-mono truncate">
                      {shortenAddress(member.walletAddress)}
                    </span>
                    {isRecipient && (
                      <Badge variant="default" className="text-xs shrink-0">
                        Penerima
                      </Badge>
                    )}
                  </div>

                  {/* Status bayar (hanya saat Active) */}
                  {status === "ACTIVE" && (
                    <div className="shrink-0">
                      {hasPaid ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-foreground" />
                          Sudah bayar
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          Belum bayar
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      </CardContent>
    </Card>
  );
}
