# Turnly — Arisan Onchain

Arisan berbasis stablecoin di Monad tanpa bendahara. Kontrak menahan iuran dan otomatis mencairkan pot ke penerima giliran begitu semua anggota sudah membayar.

> **Monad Metropolis Hackathon · Track 02: Consumer Products & Payments**

## Demo

- App: _coming soon (Vercel)_
- Contract: _coming soon (Monad Testnet)_

## Monad Integration

- **Network:** Monad Testnet (chain ID `10143`)
- **ArisanPool:** [`0x40F5E2555b3bB291f12916fd3323A98943ad3759`](https://testnet.monadvision.com/address/0x40F5E2555b3bB291f12916fd3323A98943ad3759)
- **MockIDRX:** [`0x807831c9A85d2c8f97eA30D3860a1Fb44F1B2F8a`](https://testnet.monadvision.com/address/0x807831c9A85d2c8f97eA30D3860a1Fb44F1B2F8a)
- **Deployment Txs:**
  - MockIDRX: [`0xe438d6d74f587971c5532ad1e3ca7e581793cdeab9575d04f5f86850ace9faf8`](https://testnet.monadvision.com/tx/0xe438d6d74f587971c5532ad1e3ca7e581793cdeab9575d04f5f86850ace9faf8)
  - ArisanPool: [`0xa45915fef823633c21b0bbf76b88b26e5f14cb41f0f3f5a2c4b82933e975c9f3`](https://testnet.monadvision.com/tx/0xa45915fef823633c21b0bbf76b88b26e5f14cb41f0f3f5a2c4b82933e975c9f3)
- **Why Monad:** Finalitas 1 detik dan biaya gas mikro (<0.001 MON) memungkinkan iuran mikro mingguan/harian tanpa terbebani biaya gas, dan pencairan pot arisan instan secara otomatis.

## Tech Stack

| Layer | Choice |
|---|---|
| Blockchain | Monad Testnet (EVM, chain ID 10143) |
| Smart Contract | Solidity 0.8.x + Foundry + OpenZeppelin |
| Token | MockIDRX (ERC-20, 6 decimals, faucet) |
| Frontend | Next.js App Router + TypeScript + Tailwind |
| UI Components | shadcn/ui (Default palette) |
| Web3 | wagmi + viem |
| Auth & Wallet | Privy (email/Google, embedded wallet) |
| API | Next.js Route Handlers + zod |
| Database | PostgreSQL (Neon) + Prisma |
| Hosting | Vercel |

## Local Setup

```sh
# Clone
git clone <repo-url>

# Contracts
cd contracts
forge install
forge test

# Web
cd ../web
cp .env.example .env.local   # fill in values
npm install
npm run dev
```

## Roadmap

- Jaminan / kolateral dan penalti telat bayar
- Undian acak onchain (VRF)
- Pertukaran giliran antaranggota
- Notifikasi email / WhatsApp
- Mainnet + audit

## AI Tools Disclosure

Proyek ini dikembangkan dengan bantuan AI coding tools (Google Antigravity / Claude) untuk scaffolding, boilerplate, dan review kode. Semua logika kontrak dan keputusan arsitektur dibuat dan diverifikasi oleh developer.

## License

MIT
