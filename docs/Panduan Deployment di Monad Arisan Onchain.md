# Panduan Deployment di Monad: Arisan Onchain

Oct 13, 2026 · @rudeboy

## 1. Ringkasan dan Pilihan Jaringan

Deploy ke **Monad Testnet (chain ID 10143)**: syarat hackathon (kontrak berjalan di mainnet atau testnet) terpenuhi, MON didapat gratis dari faucet, dan tidak ada risiko dana nyata.

| Aspek | Testnet (rekomendasi) | Mainnet |
| --- | --- | --- |
| Chain ID | 10143 | 143 |
| Biaya gas | MON gratis dari faucet | MON asli yang harus dibeli |
| Risiko | Tidak ada dana nyata | Bug kontrak bisa merugikan dana nyata, perlu audit |
| Kecocokan dengan proyek | MockIDRX memang token tes tanpa nilai | Perlu stablecoin asli dan tinjauan hukum |
| Waktu persiapan | Menit | Lebih lama (beli MON, pindah dana, audit) |

Pilih mainnet hanya jika kamu punya alasan kuat dan waktu untuk audit. Untuk batas waktu hari ini, testnet adalah pilihan yang aman.

### Alur deploy

1. Siapkan wallet deployer (keystore terenkripsi) dan isi MON testnet dari faucet.
2. Konfigurasi Foundry untuk jaringan Monad.
3. Jalankan `forge test` sampai hijau.
4. Deploy `MockIDRX` dan `ArisanPool` dengan `forge script`.
5. Verifikasi kedua kontrak di explorer.
6. Salin alamat kontrak ke variabel lingkungan frontend dan konfigurasi wagmi.
7. Deploy database dan aplikasi (Neon, Prisma, Vercel).
8. Jalankan smoke test dan catat bukti untuk submission.

### Peringatan reset testnet

Menurut dokumentasi Monad, testnet pernah di-reset dari genesis pada 16 Desember 2025, dan reset serupa bisa terjadi lagi. Karena itu simpan script deploy di repo agar seluruh kontrak bisa dipasang ulang dalam hitungan menit, dan cek pengumuman Monad sebelum submit akhir.

## 2. Parameter Jaringan

Nilai di bawah diambil dari dokumentasi resmi Monad pada 13 Oktober 2026. Cek ulang halaman sumber di bagian akhir sebelum deploy, karena RPC dan explorer bisa berubah.

| Parameter | Testnet | Mainnet |
| --- | --- | --- |
| Nama jaringan | Monad Testnet | Monad Mainnet |
| Chain ID | 10143 | 143 |
| Mata uang native | MON | MON |
| RPC utama (HTTP) | `https://testnet-rpc.monad.xyz` | `https://rpc.monad.xyz` |
| RPC utama (WebSocket) | `wss://testnet-rpc.monad.xyz` | `wss://rpc.monad.xyz` |
| RPC cadangan | `https://rpc-testnet.monadinfra.com`, `https://rpc.ankr.com/monad_testnet` | `https://rpc-mainnet.monadinfra.com`, `https://rpc1.monad.xyz` |
| Explorer MonadVision | `https://testnet.monadvision.com` | `https://monadvision.com` |
| Explorer Monadscan | `https://testnet.monadscan.com` | `https://monadscan.com` |
| Faucet | `https://faucet.monad.xyz` | tidak ada |
| Revision | `MONAD_NINE` (v0.15.2) | `MONAD_NINE` (v0.15.2) |

### Batas RPC publik (testnet)

| RPC | Penyedia | Batas | Catatan |
| --- | --- | --- | --- |
| `testnet-rpc.monad.xyz` | QuickNode | 50 rps (25 rps untuk `eth_call` dan `eth_estimateGas`) | Batch hingga 100, mendukung data arsip |
| `rpc.ankr.com/monad_testnet` | Ankr | 300 request per 10 detik | Method `debug_*` tidak boleh, tanpa data arsip |
| `rpc-testnet.monadinfra.com` | Monad Foundation | 20 rps | Batch tidak diizinkan |

RPC publik cukup untuk demo. Karena batasnya rendah, frontend sebaiknya membaca data dengan `multicall` dan tidak melakukan polling agresif.

### Kontrak kanonik testnet yang berguna

| Nama | Alamat |
| --- | --- |
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| Wrapped MON | `0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541` |
| Permit2 | `0x000000000022d473030f116ddee9f6b43ac78ba3` |

## 3. Persiapan

Selesaikan bagian ini dalam 30 menit pertama, terutama faucet, karena antreannya bisa lambat.

### Instal alat

Dokumentasi Monad meminta Foundry v1.8.0 atau lebih baru.

```sh
curl -L https://foundry.paradigm.xyz | bash
foundryup
forge --version   # harus v1.8.0 atau lebih baru
```

### Buat wallet deployer dengan keystore

Keystore mengenkripsi private key sehingga tidak perlu ditempel ke terminal atau disimpan di repo.

```sh
cast wallet import monad-deployer --private-key $(cast wallet new | grep 'Private key:' | awk '{print $3}')
cast wallet address --account monad-deployer
```

Perintah pertama meminta password enkripsi. Simpan password itu, karena tidak bisa dipulihkan. Perintah kedua mencetak alamat deployer.

### Isi MON testnet

1. Buka `https://faucet.monad.xyz` dan klaim MON ke alamat deployer.
2. Lakukan hal yang sama untuk 3 akun demo (akun Privy yang akan dipakai merekam video), setelah akun itu dibuat.
3. Cek saldo:

```sh
cast balance <ALAMAT_DEPLOYER> --rpc-url https://testnet-rpc.monad.xyz --ether
```

Deploy dua kontrak biasanya butuh MON dalam jumlah kecil, tetapi jangan berhenti di saldo nol. Klaim lagi jika saldo kurang.

### Variabel lingkungan

Buat `.env` di root repo dan masukkan ke `.gitignore`. Contoh isi:

```sh
# Kontrak (Foundry)
MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
MONAD_MAINNET_RPC=https://rpc.monad.xyz
DEPLOYER_ACCOUNT=monad-deployer

# Frontend dan API (diisi setelah deploy)
NEXT_PUBLIC_CHAIN_ID=10143
NEXT_PUBLIC_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_EXPLORER_URL=https://testnet.monadvision.com
NEXT_PUBLIC_ARISAN_POOL=0x...
NEXT_PUBLIC_MOCK_IDRX=0x...
NEXT_PUBLIC_PRIVY_APP_ID=...
PRIVY_APP_SECRET=...
DATABASE_URL=postgresql://...
```

Jangan pernah commit `.env`, private key, atau `PRIVY_APP_SECRET`. Sediakan `.env.example` dengan nilai kosong untuk juri.

## 4. Setup Foundry

Gunakan template resmi `foundry-monad` agar konfigurasi Monad sudah benar, lalu tambahkan OpenZeppelin.

```sh
forge init --template monad-developers/foundry-monad contracts
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
```

Jika memakai proyek Foundry biasa (`forge init contracts`), ubah `foundry.toml` mengikuti contoh di dokumentasi Monad. Bentuk akhirnya:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
network = "monad"
metadata = true
metadata_hash = "none"      # nonaktifkan IPFS hash agar verifikasi Sourcify cocok
use_literal_content = true  # sertakan kode sumber di metadata
remappings = ["@openzeppelin/=lib/openzeppelin-contracts/"]

# Monad Testnet
eth-rpc-url = "https://testnet-rpc.monad.xyz"
chain_id = 10143
```

Pengaturan `network = "monad"` membuat Forge memakai aturan eksekusi Monad saat kompilasi, test, script, dan simulasi transaksi. Untuk beralih ke mainnet nanti, ganti `eth-rpc-url` menjadi `https://rpc.monad.xyz` dan `chain_id` menjadi `143`.

### Struktur folder kontrak

```text
contracts/
  src/
    MockIDRX.sol
    ArisanPool.sol
  test/
    ArisanPool.t.sol
  script/
    Deploy.s.sol
  foundry.toml
```

### Cek sebelum deploy

```sh
forge build
forge test -vv
```

Jangan deploy sebelum enam test di dokumen requirement hijau.

## 5. Deploy Kontrak

Deploy lewat satu script supaya urutannya bisa diulang persis jika testnet di-reset. Dokumentasi Monad menyarankan keystore dan bukan private key di terminal.

### Kontrak token tes

```solidity
// src/MockIDRX.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockIDRX is ERC20 {
    uint256 public constant FAUCET_AMOUNT = 1_000 * 1e6; // 1.000 token per klaim
    uint256 public constant COOLDOWN = 1 hours;
    mapping(address => uint256) public lastClaim;

    constructor() ERC20("Mock IDRX", "mIDRX") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function faucet() external {
        require(block.timestamp >= lastClaim[msg.sender] + COOLDOWN, "cooldown");
        lastClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}
```

Token ini hanya untuk demo di testnet. Jangan pernah memakainya di mainnet.

### Script deploy

`ArisanPool` menerima batas periode minimum lewat konstruktor, sehingga demo bisa memakai periode 60 detik sementara produksi memakai 1 hari.

```solidity
// script/Deploy.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MockIDRX} from "../src/MockIDRX.sol";
import {ArisanPool} from "../src/ArisanPool.sol";

contract Deploy is Script {
    function run() external {
        uint32 minPeriod = uint32(vm.envOr("MIN_PERIOD_SECONDS", uint256(60)));

        vm.startBroadcast();
        MockIDRX token = new MockIDRX();
        ArisanPool pool = new ArisanPool(minPeriod);
        vm.stopBroadcast();

        console.log("MockIDRX :", address(token));
        console.log("ArisanPool:", address(pool));
    }
}
```

### Jalankan

Muat `.env`, lakukan simulasi dulu tanpa `--broadcast`, lalu deploy sungguhan.

```sh
source .env
export DEPLOYER=$(cast wallet address --account $DEPLOYER_ACCOUNT)

# 1. Simulasi (tidak mengirim transaksi)
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $MONAD_TESTNET_RPC \
  --account $DEPLOYER_ACCOUNT --sender $DEPLOYER

# 2. Deploy sungguhan
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $MONAD_TESTNET_RPC \
  --account $DEPLOYER_ACCOUNT --sender $DEPLOYER \
  --broadcast
```

Forge akan meminta password keystore. Setelah sukses, kedua alamat tercetak di terminal, dan detail transaksi tersimpan di `broadcast/Deploy.s.sol/10143/run-latest.json`.

### Catat hasil deploy

Simpan alamat dan hash transaksi di repo agar juri dan frontend memakai sumber yang sama.

```json
// deployments/monad-testnet.json
{
  "chainId": 10143,
  "network": "Monad Testnet",
  "deployedAt": "2026-10-13",
  "contracts": {
    "MockIDRX": { "address": "0x...", "txHash": "0x..." },
    "ArisanPool": { "address": "0x...", "txHash": "0x..." }
  }
}
```

Salin ABI untuk frontend:

```sh
mkdir -p ../web/src/abi
jq '.abi' out/ArisanPool.sol/ArisanPool.json > ../web/src/abi/ArisanPool.json
jq '.abi' out/MockIDRX.sol/MockIDRX.json > ../web/src/abi/MockIDRX.json
```

### Deploy ke mainnet (hanya jika memilih mainnet)

Ganti `--rpc-url $MONAD_MAINNET_RPC`, pastikan deployer punya MON asli, gunakan `MIN_PERIOD_SECONDS=86400`, dan jangan deploy `MockIDRX`: pakai alamat stablecoin asli sebagai token grup. Lakukan audit atau setidaknya tinjauan keamanan independen sebelum menerima dana pengguna.

## 6. Verifikasi Kontrak

Verifikasi membuat kode sumber tampil di explorer sehingga juri bisa membandingkannya dengan bytecode di chain. Ini juga bukti kuat untuk poin Technical Excellence dan Monad Integration. Perintah di bawah mengikuti panduan resmi Monad untuk Foundry v1.8 atau lebih baru.

### Opsi A: MonadVision (Sourcify), tanpa API key

Ganti alamat dengan hasil deploy.

```sh
forge verify-contract \
    <ALAMAT_MOCKIDRX> \
    MockIDRX \
    --chain 10143 \
    --verifier sourcify \
    --verifier-url https://sourcify-api-monad.blockvision.org/

forge verify-contract \
    <ALAMAT_ARISANPOOL> \
    ArisanPool \
    --chain 10143 \
    --verifier sourcify \
    --verifier-url https://sourcify-api-monad.blockvision.org/
```

Keluaran yang diharapkan diakhiri dengan `Contract successfully verified`. Setelah itu buka kontraknya di `https://testnet.monadvision.com/address/<ALAMAT>`.

### Opsi B: Monadscan (gaya Etherscan), butuh API key

Dokumentasi memakai `YourApiKeyToken` sebagai placeholder. Untuk `ArisanPool`, sertakan argumen konstruktor yang sama dengan saat deploy (60 detik pada contoh ini).

```sh
forge verify-contract \
    <ALAMAT_MOCKIDRX> \
    MockIDRX \
    --chain 10143 \
    --verifier etherscan \
    --etherscan-api-key <API_KEY> \
    --watch

forge verify-contract \
    <ALAMAT_ARISANPOOL> \
    ArisanPool \
    --chain 10143 \
    --verifier etherscan \
    --etherscan-api-key <API_KEY> \
    --constructor-args $(cast abi-encode "constructor(uint32)" 60) \
    --watch
```

Status `Pending in queue` pada awal verifikasi itu normal. Forge menunggu dan mencoba ulang otomatis.

### Rekomendasi

Pakai Opsi A karena tidak butuh akun atau API key. Mainnet memakai perintah yang sama dengan `--chain 143`, dan alamat explorernya `https://monadvision.com`.

### Jika verifikasi gagal

- Pastikan `foundry.toml` memuat `metadata_hash = "none"` dan `use_literal_content = true`, lalu jalankan `forge build --force` dan ulangi.
- Pastikan versi compiler dan optimizer sama dengan saat deploy.
- Pastikan nama kontrak persis (`ArisanPool`, bukan nama file).
- Coba halaman Verify Contract di MonadVision sebagai alternatif manual.

## 7. Konfigurasi Frontend

Frontend perlu tahu definisi chain Monad, alamat kontrak, dan ABI. Semua nilai berasal dari variabel lingkungan dan `deployments/monad-testnet.json`, sehingga beralih jaringan cukup mengganti konfigurasi.

### Definisi chain

```ts
// web/src/lib/chains.ts
import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "MonadVision", url: "https://testnet.monadvision.com" },
  },
  contracts: {
    multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
  },
});
```

`viem/chains` mungkin sudah menyediakan definisi `monadTestnet` pada versi terbaru. Jika ada, boleh dipakai langsung, tetapi definisi manual di atas selalu aman.

### Alamat dan ABI kontrak

```ts
// web/src/lib/contracts.ts
import arisanPoolAbi from "@/abi/ArisanPool.json";
import mockIdrxAbi from "@/abi/MockIDRX.json";

export const ARISAN_POOL = process.env.NEXT_PUBLIC_ARISAN_POOL as `0x${string}`;
export const MOCK_IDRX = process.env.NEXT_PUBLIC_MOCK_IDRX as `0x${string}`;

export const arisanPool = { address: ARISAN_POOL, abi: arisanPoolAbi } as const;
export const mockIdrx = { address: MOCK_IDRX, abi: mockIdrxAbi } as const;

export const explorerTx = (hash: string) =>
  `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${hash}`;
```

Pakai `explorerTx` di setiap aksi uang (gabung, bayar, pot cair) agar juri bisa membuka transaksinya di explorer.

### Privy dan wagmi

```tsx
// web/src/app/providers.tsx
"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "wagmi";
import { monadTestnet } from "@/lib/chains";

const config = createConfig({
  chains: [monadTestnet],
  transports: { [monadTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL) },
});
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ["email", "google"],
        embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" } },
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
```

Nama paket dan opsi Privy bisa berbeda antar versi. Cocokkan dengan dokumentasi Privy yang terbaru saat memasang, dan siapkan RainbowKit dengan wallet biasa sebagai cadangan jika integrasi Privy memakan waktu.

### Alur transaksi bayar iuran

1. Baca `allowance` token milik pengguna untuk `ArisanPool`.
2. Jika kurang dari iuran, panggil `approve(ARISAN_POOL, contribution)` dan tunggu receipt.
3. Panggil `contribute(groupId)` dan tunggu receipt.
4. Kirim `txHash` ke `POST /api/groups/:id/contributions`.
5. Tampilkan tautan `explorerTx(hash)`.

## 8. Deploy Aplikasi

Aplikasi harus punya URL publik yang bisa dibuka juri tanpa setup. Urutannya: database, migrasi, lalu Vercel.

### Database (Neon)

1. Buat project di Neon, salin connection string ke `DATABASE_URL`.
2. Jalankan migrasi dari folder `web`:

```sh
npx prisma migrate deploy
npx prisma generate
```

Pakai `npx prisma migrate dev` hanya di lokal. Di server gunakan `migrate deploy`.

### Vercel

1. Hubungkan repo GitHub publik ke Vercel dan set root directory ke `web`.
2. Isi variabel lingkungan di Vercel (Settings, Environment Variables):

| Variabel | Nilai |
| --- | --- |
| `NEXT_PUBLIC_CHAIN_ID` | `10143` |
| `NEXT_PUBLIC_RPC_URL` | `https://testnet-rpc.monad.xyz` |
| `NEXT_PUBLIC_EXPLORER_URL` | `https://testnet.monadvision.com` |
| `NEXT_PUBLIC_ARISAN_POOL` | alamat `ArisanPool` hasil deploy |
| `NEXT_PUBLIC_MOCK_IDRX` | alamat `MockIDRX` hasil deploy |
| `NEXT_PUBLIC_PRIVY_APP_ID` | App ID dari dashboard Privy |
| `PRIVY_APP_SECRET` | Secret dari Privy (rahasia, jangan diawali `NEXT_PUBLIC_`) |
| `DATABASE_URL` | Connection string Neon |

3. Tambahkan domain Vercel ke daftar allowed origins di dashboard Privy, kalau tidak login akan gagal di produksi.
4. Deploy, lalu buka URL produksi dari jendela privat untuk memastikan tidak bergantung pada sesi lokal.

### Catatan penting

- Variabel `NEXT_PUBLIC_*` tertanam saat build. Setelah mengubah alamat kontrak, lakukan redeploy.
- Jika memakai RPC publik, simpan satu RPC cadangan (mis. Ankr atau Monad Foundation) dan siapkan fallback transport di wagmi.
- Simpan alamat kontrak dan URL aplikasi di README agar juri tidak perlu mencarinya.

## 9. Smoke Test, Bukti Submission, dan Troubleshooting

### Smoke test lewat CLI

Jalankan setelah deploy untuk memastikan kontrak hidup sebelum menyentuh UI. Ganti `<POOL>` dan `<TOKEN>` dengan alamat hasil deploy.

```sh
# Token punya 6 desimal
cast call <TOKEN> "decimals()(uint8)" --rpc-url $MONAD_TESTNET_RPC

# Klaim token tes dari akun deployer
cast send <TOKEN> "faucet()" --account $DEPLOYER_ACCOUNT --rpc-url $MONAD_TESTNET_RPC
cast call <TOKEN> "balanceOf(address)(uint256)" $DEPLOYER --rpc-url $MONAD_TESTNET_RPC

# Jumlah grup awal harus 0
cast call <POOL> "groupCount()(uint256)" --rpc-url $MONAD_TESTNET_RPC
```

### Smoke test lewat aplikasi (URL produksi)

- [ ] Login dengan email atau Google berhasil dan wallet dibuat
- [ ] Faucet `/faucet` menambah saldo MockIDRX
- [ ] Buat grup berhasil dan transaksinya muncul di MonadVision
- [ ] Akun kedua dan ketiga bisa bergabung lewat link undangan
- [ ] Grup dimulai, ketiga akun membayar, dan pot otomatis cair ke penerima giliran 1
- [ ] Setiap transaksi punya tautan explorer yang valid

### Bukti untuk submission

Terms hackathon meminta alamat kontrak atau hash transaksi, penjelasan integrasi Monad, dan video yang menunjukkan interaksi dengan Monad. Kumpulkan ini:

| Bukti | Sumber |
| --- | --- |
| Alamat `ArisanPool` dan `MockIDRX` | `deployments/monad-testnet.json`, tautan MonadVision |
| Tautan kode terverifikasi | Halaman kontrak di explorer |
| Contoh `txHash` untuk create, join, start, contribute, dan payout | Dari smoke test di atas |
| Tangkapan layar alur lengkap | Aplikasi produksi |
| Penjelasan kenapa Monad | README bagian Monad Integration |

Template bagian README:

```markdown
## Monad Integration
- Network: Monad Testnet (chain ID 10143)
- ArisanPool: 0x... (https://testnet.monadvision.com/address/0x...)
- MockIDRX: 0x... (https://testnet.monadvision.com/address/0x...)
- Example txs: create 0x..., join 0x..., contribute 0x..., payout 0x...
- Why Monad: finalitas cepat dan biaya rendah membuat iuran kecil yang sering
  tetap layak, dan pencairan otomatis terasa instan bagi pengguna non-crypto.
```

### Troubleshooting

| Gejala | Kemungkinan penyebab | Solusi |
| --- | --- | --- |
| `insufficient funds` saat deploy | Saldo MON deployer kosong | Klaim lagi di faucet, cek dengan `cast balance` |
| `429` atau `rate limited` | Batas RPC publik terlewati | Pindah ke RPC cadangan, kurangi polling, pakai multicall |
| Transaksi tidak ditemukan setelah deploy | Testnet di-reset atau RPC salah | Cek chain ID dengan `cast chain-id`, redeploy dengan script jika di-reset |
| Verifikasi gagal | Metadata atau versi compiler beda | Lihat daftar di bagian 6 |
| Login Privy gagal di produksi | Domain Vercel belum diizinkan | Tambahkan domain ke allowed origins di dashboard Privy |
| Frontend memanggil alamat lama | `NEXT_PUBLIC_*` lama tertanam | Perbarui variabel dan redeploy Vercel |
| `execution reverted` di `contribute` | Allowance kurang atau sudah bayar putaran ini | Jalankan approve dulu, cek `hasPaid` |

### Keamanan

- Gunakan keystore, jangan menempel private key di terminal atau commit ke repo.
- Pakai wallet deployer khusus hackathon dengan saldo minimal.
- Jangan commit `.env`, `broadcast/` yang berisi data sensitif lokal, atau kredensial Privy dan database.
- Sebelum submit, cari rahasia yang tidak sengaja ter-commit (mis. `git log -p | grep -i "private"`) dan ganti kunci jika ada yang bocor.
- Jika sempat memakai mainnet, uji dengan dana kecil dulu dan jangan menyimpan dana pengguna sebelum ada audit.

## Sumber

Halaman dokumentasi Monad yang dibuka pada 13 Oktober 2026. Parameter jaringan, perintah deploy, dan perintah verifikasi diambil dari sini.

- [Network Information (Mainnet)](https://docs.monad.xyz/developer-essentials/network-information)
- [Network Information (Testnet)](https://docs.monad.xyz/developer-essentials/testnet)
- [Deploy a smart contract on Monad using Foundry](https://docs.monad.xyz/guides/deploy-smart-contract/foundry)
- [Verify a smart contract on Monad using Foundry](https://docs.monad.xyz/guides/verify-smart-contract/foundry)

Kode `MockIDRX`, `Deploy.s.sol`, konfigurasi wagmi/Privy, dan variabel lingkungan adalah rancangan dari proyek ini, bukan salinan dokumentasi. Nama paket Privy dan versi viem perlu dicocokkan dengan dokumentasi masing-masing saat dipasang.
