"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "wagmi";
import { ThemeProvider } from "next-themes";
import { StyleSheetManager } from "styled-components";
import { monadTestnet } from "@/lib/chains";

// Suppress known third-party styled-components warning from Privy in Next.js dev overlay
if (typeof window !== "undefined") {
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("isActive") || args[0].includes("isactive"))
    ) {
      return;
    }
    origError(...args);
  };
}

const wagmiConfig = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL ?? "https://testnet-rpc.monad.xyz"),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <StyleSheetManager shouldForwardProp={(prop) => prop !== "isActive" && prop !== "isactive"}>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "clxyzdemo0000000000000000"}
          config={{
            loginMethods: ["email", "google"],
            embeddedWallets: {
              ethereum: { createOnLogin: "users-without-wallets" },
            },
            defaultChain: monadTestnet,
            supportedChains: [monadTestnet],
            appearance: {
              theme: "light",
              accentColor: "#000000",
            },
          }}
        >
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={wagmiConfig}>
              {children}
            </WagmiProvider>
          </QueryClientProvider>
        </PrivyProvider>
      </StyleSheetManager>
    </ThemeProvider>
  );
}
