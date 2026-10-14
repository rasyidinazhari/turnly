"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { shortenAddress } from "@/lib/utils";
import { LogOut, User, Coins } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/faucet", label: "Faucet" },
];

export function Navbar() {
  const pathname = usePathname();
  const { authenticated, user, logout, login } = usePrivy();

  const walletAddr =
    user?.linkedAccounts?.find(
      (a) => a.type === "wallet" && (a as { walletClientType?: string }).walletClientType === "privy"
    )?.address ?? "";

  return (
    <nav className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo-light.png"
            alt="Turnly"
            width={96}
            height={26}
            className="h-6 w-auto object-contain dark:hidden"
            priority
          />
          <Image
            src="/logo-dark.png"
            alt="Turnly"
            width={96}
            height={26}
            className="h-6 w-auto object-contain hidden dark:block"
            priority
          />
        </Link>

        {/* Nav links (desktop) */}
        <div className="hidden sm:flex gap-1">
          {navLinks.map(({ href, label }) => (
            <Button
              key={href}
              variant={pathname === href ? "secondary" : "ghost"}
              size="sm"
              asChild
            >
              <Link href={href}>{label}</Link>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Auth */}
          {authenticated && walletAddr ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {walletAddr.slice(2, 4).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-xs font-mono">
                    {shortenAddress(walletAddr)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/faucet">
                    <Coins className="h-4 w-4 mr-2" />
                    Faucet
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={login}>
              Masuk
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
