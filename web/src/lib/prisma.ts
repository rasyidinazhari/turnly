import fs from "fs";
import path from "path";

// Simple self-contained persistence for hackathon metadata
// Persists to a local JSON file in development/runtime if DATABASE_URL is not set

export interface UserRecord {
  id: string;
  privyId: string;
  walletAddress: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface MemberRecord {
  id: string;
  groupId: string;
  userId: string;
  walletAddress: string;
  position: number;
  joinTxHash: string;
  joinedAt: string;
}

export interface RoundRecord {
  id: string;
  groupId: string;
  number: number;
  recipientId: string;
  dueAt: string;
  status: "PENDING" | "OPEN" | "PAID_OUT";
  potAmount?: string | null;
  paidOutTxHash?: string | null;
  paidOutAt?: string | null;
}

export interface ContributionRecord {
  id: string;
  roundId: string;
  memberId: string;
  amount: string;
  txHash: string;
  paidAt: string;
}

export interface ActivityRecord {
  id: string;
  groupId: string;
  type: string;
  actorId?: string | null;
  payload?: any;
  txHash?: string | null;
  createdAt: string;
}

export interface GroupRecord {
  id: string;
  chainGroupId: number;
  contractAddress: string;
  name: string;
  description?: string | null;
  inviteCode: string;
  adminId: string;
  tokenAddress: string;
  contributionAmount: string;
  maxMembers: number;
  periodSeconds: number;
  status: "OPEN" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  currentRound: number;
  startedAt?: string | null;
  createdTxHash: string;
  createdAt: string;
}

interface DBStore {
  users: UserRecord[];
  groups: GroupRecord[];
  members: MemberRecord[];
  rounds: RoundRecord[];
  contributions: ContributionRecord[];
  activities: ActivityRecord[];
}

function getDbFile(): string {
  const cwd = process.cwd();
  const inCwd = path.join(cwd, ".data-store.json");
  const inWeb = path.join(cwd, "web", ".data-store.json");
  if (fs.existsSync(inWeb)) return inWeb;
  if (fs.existsSync(inCwd)) return inCwd;
  return path.basename(cwd) === "web" ? inCwd : inWeb;
}

function loadStore(): DBStore {
  try {
    const file = getDbFile();
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    }
  } catch {
    // fallback
  }
  return {
    users: [],
    groups: [],
    members: [],
    rounds: [],
    contributions: [],
    activities: [],
  };
}

function saveStore(s: DBStore) {
  try {
    const file = getDbFile();
    fs.writeFileSync(file, JSON.stringify(s, null, 2), "utf-8");
    // Sync to cwd if different
    const inCwd = path.join(process.cwd(), ".data-store.json");
    if (file !== inCwd) {
      try { fs.writeFileSync(inCwd, JSON.stringify(s, null, 2), "utf-8"); } catch {}
    }
    const inWeb = path.join(process.cwd(), "web", ".data-store.json");
    if (file !== inWeb && fs.existsSync(path.dirname(inWeb))) {
      try { fs.writeFileSync(inWeb, JSON.stringify(s, null, 2), "utf-8"); } catch {}
    }
  } catch {
    // ignore
  }
}

// Global memory cache with auto-refresh on file change
const g = globalThis as unknown as { __arisan_store?: DBStore; __arisan_mtime?: number };

function getStore(): DBStore {
  const file = getDbFile();
  try {
    if (fs.existsSync(file)) {
      const stat = fs.statSync(file);
      if (!g.__arisan_store || !g.__arisan_mtime || stat.mtimeMs > g.__arisan_mtime) {
        g.__arisan_store = JSON.parse(fs.readFileSync(file, "utf-8"));
        g.__arisan_mtime = stat.mtimeMs;
      }
    }
  } catch {
    // fallback
  }
  if (!g.__arisan_store) {
    g.__arisan_store = loadStore();
    g.__arisan_mtime = Date.now();
  }
  return g.__arisan_store;
}

// Proxy store object so that any store.groups, store.users access automatically delegates to fresh getStore()
const store: DBStore = new Proxy({} as DBStore, {
  get(_target, prop: string) {
    const s = getStore();
    return (s as any)[prop];
  },
  set(_target, prop: string, value: any) {
    const s = getStore();
    (s as any)[prop] = value;
    return true;
  },
});

export const prisma = {
  $transaction: async (promises: any[]) => {
    return Promise.all(promises);
  },

  user: {
    findUnique: async ({ where }: { where: { privyId?: string; id?: string; walletAddress?: string } }) => {
      const u = store.users.find(
        (x) =>
          (where.privyId && x.privyId === where.privyId) ||
          (where.id && x.id === where.id) ||
          (where.walletAddress && x.walletAddress.toLowerCase() === where.walletAddress.toLowerCase())
      );
      if (!u) return null;

      // Populate relations if requested
      const userMembers = store.members.filter((m) => m.userId === u.id);
      const membersWithGroups = userMembers.map((m) => {
        const group = store.groups.find((grp) => grp.id === m.groupId)!;
        const groupMembers = store.members.filter((gm) => gm.groupId === group.id);
        const groupRounds = store.rounds.filter((gr) => gr.groupId === group.id);
        const roundsWithContributions = groupRounds.map((r) => ({
          ...r,
          contributions: store.contributions.filter((c) => c.roundId === r.id),
        }));

        return {
          ...m,
          group: {
            ...group,
            members: groupMembers,
            rounds: roundsWithContributions,
          },
        };
      });

      return {
        ...u,
        members: membersWithGroups,
      };
    },

    upsert: async ({
      where,
      create,
      update,
    }: {
      where: { privyId: string };
      create: { privyId: string; walletAddress: string; displayName?: string };
      update: { walletAddress?: string; displayName?: string };
    }) => {
      let u = store.users.find((x) => x.privyId === where.privyId);
      if (u) {
        if (update.walletAddress) u.walletAddress = update.walletAddress;
        if (update.displayName) u.displayName = update.displayName;
      } else {
        u = {
          id: "usr_" + Math.random().toString(36).slice(2, 10),
          privyId: create.privyId,
          walletAddress: create.walletAddress,
          displayName: create.displayName ?? null,
          avatarUrl: null,
          createdAt: new Date().toISOString(),
        };
        store.users.push(u);
      }
      saveStore(store);
      return u;
    },

    update: async ({ where, data }: { where: { privyId: string }; data: { displayName?: string; avatarUrl?: string } }) => {
      const u = store.users.find((x) => x.privyId === where.privyId);
      if (!u) throw new Error("User not found");
      if (data.displayName !== undefined) u.displayName = data.displayName;
      if (data.avatarUrl !== undefined) u.avatarUrl = data.avatarUrl;
      saveStore(store);
      return u;
    },
  },

  group: {
    findUnique: async ({ where }: { where: { id?: string; inviteCode?: string } }) => {
      const g = store.groups.find(
        (x) => (where.id && x.id === where.id) || (where.inviteCode && x.inviteCode === where.inviteCode)
      );
      if (!g) return null;

      const admin = store.users.find((u) => u.id === g.adminId) ?? {
        id: g.adminId,
        walletAddress: "",
      };

      const groupMembers = store.members
        .filter((m) => m.groupId === g.id)
        .sort((a, b) => a.position - b.position)
        .map((m) => ({
          ...m,
          user: store.users.find((u) => u.id === m.userId) ?? { displayName: null },
        }));

      const groupRounds = store.rounds
        .filter((r) => r.groupId === g.id)
        .sort((a, b) => a.number - b.number)
        .map((r) => {
          const recipient = groupMembers.find((m) => m.id === r.recipientId) ?? { walletAddress: "" };
          const contributions = store.contributions.filter((c) => c.roundId === r.id);
          return {
            ...r,
            dueAt: new Date(r.dueAt),
            recipient,
            contributions: contributions.map((c) => ({
              ...c,
              paidAt: new Date(c.paidAt),
            })),
          };
        });

      const activities = store.activities
        .filter((a) => a.groupId === g.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        ...g,
        admin,
        members: groupMembers,
        rounds: groupRounds,
        activities,
      };
    },

    create: async ({ data }: { data: any }) => {
      const id = "grp_" + Math.random().toString(36).slice(2, 10);
      const newGroup: GroupRecord = {
        id,
        chainGroupId: data.chainGroupId,
        contractAddress: data.contractAddress,
        name: data.name,
        description: data.description ?? null,
        inviteCode: data.inviteCode,
        adminId: data.adminId,
        tokenAddress: data.tokenAddress,
        contributionAmount: data.contributionAmount,
        maxMembers: data.maxMembers,
        periodSeconds: data.periodSeconds,
        status: data.status ?? "OPEN",
        currentRound: 0,
        createdTxHash: data.createdTxHash,
        createdAt: new Date().toISOString(),
      };
      store.groups.push(newGroup);

      if (data.members?.create) {
        const memData = data.members.create;
        const newMember: MemberRecord = {
          id: "mem_" + Math.random().toString(36).slice(2, 10),
          groupId: id,
          userId: memData.userId,
          walletAddress: memData.walletAddress,
          position: memData.position ?? 0,
          joinTxHash: memData.joinTxHash,
          joinedAt: new Date().toISOString(),
        };
        store.members.push(newMember);
      }

      if (data.activities?.create) {
        const actData = data.activities.create;
        store.activities.push({
          id: "act_" + Math.random().toString(36).slice(2, 10),
          groupId: id,
          type: actData.type,
          actorId: null,
          payload: actData.payload,
          txHash: actData.txHash,
          createdAt: new Date().toISOString(),
        });
      }

      saveStore(store);
      return newGroup;
    },

    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const g = store.groups.find((x) => x.id === where.id);
      if (!g) throw new Error("Group not found");
      Object.assign(g, data);
      saveStore(store);
      return g;
    },
  },

  member: {
    create: async ({ data }: { data: any }) => {
      const newMember: MemberRecord = {
        id: "mem_" + Math.random().toString(36).slice(2, 10),
        groupId: data.groupId,
        userId: data.userId,
        walletAddress: data.walletAddress,
        position: data.position,
        joinTxHash: data.joinTxHash,
        joinedAt: new Date().toISOString(),
      };
      store.members.push(newMember);
      saveStore(store);
      return newMember;
    },
  },

  round: {
    createMany: async ({ data }: { data: any[] }) => {
      for (const d of data) {
        store.rounds.push({
          id: "rnd_" + Math.random().toString(36).slice(2, 10),
          groupId: d.groupId,
          number: d.number,
          recipientId: d.recipientId,
          dueAt: d.dueAt instanceof Date ? d.dueAt.toISOString() : d.dueAt,
          status: d.status,
          potAmount: null,
          paidOutTxHash: null,
          paidOutAt: null,
        });
      }
      saveStore(store);
      return { count: data.length };
    },

    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const r = store.rounds.find((x) => x.id === where.id);
      if (!r) throw new Error("Round not found");
      Object.assign(r, data);
      saveStore(store);
      return r;
    },

    updateMany: async ({ where, data }: { where: { groupId: string; number: number }; data: any }) => {
      let count = 0;
      for (const r of store.rounds) {
        if (r.groupId === where.groupId && r.number === where.number) {
          Object.assign(r, data);
          count++;
        }
      }
      saveStore(store);
      return { count };
    },

    findMany: async ({ where }: { where: { groupId: string }; include?: any; orderBy?: any }) => {
      return store.rounds
        .filter((r) => r.groupId === where.groupId)
        .sort((a, b) => a.number - b.number)
        .map((r) => {
          const recipientMember = store.members.find((m) => m.id === r.recipientId);
          const recipientUser = recipientMember
            ? store.users.find((u) => u.id === recipientMember.userId)
            : null;

          const contributions = store.contributions
            .filter((c) => c.roundId === r.id)
            .map((c) => {
              const mem = store.members.find((m) => m.id === c.memberId);
              const usr = mem ? store.users.find((u) => u.id === mem.userId) : null;
              return {
                ...c,
                member: {
                  ...mem,
                  user: usr,
                },
              };
            });

          return {
            ...r,
            recipient: {
              ...recipientMember,
              user: recipientUser,
            },
            contributions,
          };
        });
    },
  },

  contribution: {
    upsert: async ({ where, create }: { where: { txHash: string }; update: any; create: any }) => {
      let c = store.contributions.find((x) => x.txHash === where.txHash);
      if (!c) {
        c = {
          id: "cnt_" + Math.random().toString(36).slice(2, 10),
          roundId: create.roundId,
          memberId: create.memberId,
          amount: create.amount,
          txHash: create.txHash,
          paidAt: new Date().toISOString(),
        };
        store.contributions.push(c);
        saveStore(store);
      }
      return c;
    },
  },

  activity: {
    create: async ({ data }: { data: any }) => {
      const a: ActivityRecord = {
        id: "act_" + Math.random().toString(36).slice(2, 10),
        groupId: data.groupId,
        type: data.type,
        actorId: data.actorId ?? null,
        payload: data.payload ?? null,
        txHash: data.txHash ?? null,
        createdAt: new Date().toISOString(),
      };
      store.activities.push(a);
      saveStore(store);
      return a;
    },

    findMany: async ({ where }: { where: { groupId: string }; orderBy?: any; take?: number }) => {
      return store.activities
        .filter((a) => a.groupId === where.groupId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50);
    },
  },
};
