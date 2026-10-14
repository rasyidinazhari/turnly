import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatToken } from "@/lib/utils";
import { Users } from "lucide-react";
import Link from "next/link";

export type GroupSummary = {
  id: string;
  name: string;
  status: "OPEN" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  contributionAmount: string;
  maxMembers: number;
  memberCount: number;
  currentRound: number;
  paidCount?: number;
};

const statusConfig: Record<GroupSummary["status"], { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  OPEN:      { label: "Menunggu",  variant: "outline"     },
  ACTIVE:    { label: "Aktif",     variant: "default"     },
  COMPLETED: { label: "Selesai",   variant: "secondary"   },
  CANCELLED: { label: "Dibatalkan",variant: "destructive" },
};

export function GroupCard({ group }: { group: GroupSummary }) {
  const { label, variant } = statusConfig[group.status];
  const progress =
    group.status === "ACTIVE" && group.paidCount !== undefined
      ? Math.round((group.paidCount / group.memberCount) * 100)
      : null;

  return (
    <Link href={`/groups/${group.id}`} className="block group">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight group-hover:underline">
              {group.name}
            </CardTitle>
            <Badge variant={variant} className="shrink-0">
              {label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2 space-y-3">
          <p className="text-sm text-muted-foreground">
            Iuran:{" "}
            <span className="font-medium text-foreground">
              {formatToken(BigInt(group.contributionAmount))}
            </span>
          </p>
          {progress !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Putaran {group.currentRound + 1}</span>
                <span>{group.paidCount}/{group.memberCount} bayar</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>
              {group.memberCount}/{group.maxMembers} anggota
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
