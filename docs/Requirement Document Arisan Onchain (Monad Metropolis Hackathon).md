# Requirement Document: Arisan Onchain (Monad Metropolis Hackathon)

Oct 13, 2026 · @rudeboy

## 1. Ringkasan Proyek

Arisan Onchain adalah aplikasi arisan berbasis stablecoin di Monad tanpa bendahara: kontrak menahan iuran dan otomatis mencairkan pot ke penerima giliran begitu semua anggota sudah membayar.

- **Problem:** arisan konvensional bergantung pada satu pengelola. Uang tercampur, catatan manual, dan sulit diaudit anggota.
- **Solusi:** kontrak pintar memegang iuran, urutan giliran terkunci sejak grup dimulai, dan semua pembayaran bisa dilihat siapa saja.
- **Target user:** kelompok teman, keluarga, atau komunitas kantor yang sudah akrab dengan arisan dan tidak harus paham crypto. Login cukup email atau Google.
- **Track:** Track 02, Consumer Products & Payments.
- **Kenapa Monad:** finality cepat dan biaya rendah membuat iuran kecil dan sering tetap layak, dan konfirmasi terasa instan di demo.
- **Batas waktu:** submission ditutup 13 Oktober 2026, 23.59 ET (sekitar 14 Oktober 2026, 10.59 WIB). Seluruh scope di bawah dipotong agar muat dalam sekitar 18 jam.

### Scope MVP dan di luar scope

| Termasuk MVP | Di luar scope (taruh di README sebagai roadmap) |
| --- | --- |
| Buat grup, undang lewat link, bergabung | Jaminan/kolateral dan penalti telat bayar |
| Iuran per putaran dengan stablecoin tes | Undian acak onchain (VRF) |
| Pencairan pot otomatis ke penerima giliran | Pertukaran giliran antaranggota |
| Dashboard dan riwayat aktivitas | Notifikasi email/WhatsApp |
| Faucet token tes untuk demo | Mainnet, audit, dan token asli |

## 2. Tech Stack

Stack dipilih agar satu orang bisa menyelesaikannya dalam sehari: satu repo Next.js yang memuat frontend dan API, satu folder kontrak Foundry, dan satu database PostgreSQL.

| Lapisan | Pilihan | Alasan |
| --- | --- | --- |
| Blockchain | Monad testnet (EVM) | Wajib untuk hackathon. Chain ID testnet 10143, verifikasi RPC dan chain ID di docs.monad.xyz sebelum deploy. |
| Smart contract | Solidity 0.8.x + Foundry + OpenZeppelin | Test dan deploy cepat, `ReentrancyGuard` dan `SafeERC20` sudah tersedia. |
| Token | `MockIDRX` (ERC-20, 6 desimal) buatan sendiri dengan fungsi `faucet()` | Tidak bergantung pada stablecoin pihak ketiga di testnet. Demo bisa mulai dari nol. |
| Frontend | Next.js (App Router), TypeScript, Tailwind, shadcn/ui | Sudah kamu kuasai, komponen siap pakai. |
| Web3 client | wagmi + viem | Baca state kontrak langsung dari chain dan kirim transaksi. |
| Auth dan wallet | Privy (login email/Google, embedded wallet) | Pengguna tanpa seed phrase, sesuai target non-crypto di Track 02. |
| API | Next.js Route Handlers, validasi dengan zod | Menghindari setup NestJS terpisah. Struktur endpoint tetap bisa dipindah ke NestJS nanti. |
| Database | PostgreSQL (Neon atau Supabase) + Prisma | Menyimpan metadata off-chain, undangan, dan riwayat aktivitas. |
| Hosting | Vercel (app) + Neon (DB) | Deploy satu perintah, URL publik untuk juri. |

### Prinsip arsitektur

1. **Chain adalah sumber kebenaran** untuk uang dan giliran. Frontend membaca status grup, putaran, dan saldo langsung dari kontrak.
2. **Database hanya menyimpan yang tidak ada di chain:** nama tampilan, deskripsi, kode undangan, avatar, dan log aktivitas.
3. **Pola konfirmasi transaksi:** klien menandatangani transaksi, menunggu receipt, lalu mengirim `txHash` ke API. Server memverifikasi receipt lewat viem dan menyimpan hasilnya. Endpoint idempoten karena `txHash` unik.
4. **Gas:** pengguna demo memakai MON testnet dari faucet resmi Monad. Sponsor gas lewat paymaster masuk roadmap, bukan MVP.

## 3. Role dan Hak Akses

Ada tiga role tetap dan satu peran yang berganti tiap putaran. Hak akses ditegakkan di kontrak (untuk uang) dan di API (untuk metadata).

| Role | Siapa | Boleh | Tidak boleh |
| --- | --- | --- | --- |
| Guest | Pengunjung belum login | Melihat landing page dan halaman undangan (nama grup, nominal, jumlah slot) | Membuka detail grup, mengirim transaksi |
| Anggota | User login yang sudah bergabung | Melihat detail grup, membayar iuran, melihat riwayat dan urutan giliran | Mengubah pengaturan grup, memulai grup |
| Admin grup | User yang membuat grup | Semua hak Anggota, ditambah memulai grup, mengubah nama dan deskripsi, membatalkan grup sebelum dimulai | Mengubah nominal, urutan, atau menarik dana setelah grup dimulai |
| Penerima giliran | Anggota yang gilirannya sedang berjalan (bukan role akun) | Menerima pot otomatis saat semua iuran masuk | Menarik pot sebelum semua anggota membayar |

### Aturan akses penting

- Admin otomatis menjadi anggota pertama dan mendapat giliran sesuai urutan bergabung.
- Setelah status grup `ACTIVE`, parameter grup (nominal, periode, urutan) tidak bisa diubah oleh siapa pun, termasuk admin. Ini poin kepercayaan utama.
- Fungsi `payout` bersifat internal dan berjalan otomatis di dalam transaksi iuran terakhir, bukan fungsi publik. Dana hanya bisa mengalir ke penerima giliran yang sah.
- Tidak ada fungsi admin untuk menarik dana di kontrak.

## 4. Halaman dan Alur Navigasi

Tujuh halaman cukup untuk satu alur demo lengkap: login, ambil token tes, buat grup, undang, bayar, dan lihat pot cair.

| Rute | Halaman | Akses | Isi utama |
| --- | --- | --- | --- |
| `/` | Landing | Publik | Penjelasan singkat arisan onchain, tombol Mulai, tiga langkah cara kerja |
| `/dashboard` | Dashboard | Login | Daftar grup saya, saldo token, giliran berikutnya, tombol Buat Grup |
| `/groups/new` | Buat grup | Login | Form nama, deskripsi, iuran per putaran, jumlah anggota, periode (hari) |
| `/groups/[id]` | Detail grup | Anggota | Status, daftar anggota dan urutan giliran, progres iuran putaran ini, tombol Bayar, riwayat |
| `/join/[code]` | Undangan | Publik, aksi butuh login | Ringkasan grup, tombol Gabung (membutuhkan login) |
| `/faucet` | Faucet | Login | Klaim MockIDRX gratis dan petunjuk mengambil MON testnet |
| `/profile` | Profil | Login | Nama tampilan, alamat wallet, tombol keluar |

### Alur utama (urutan demo 3 menit)

1. Login dengan email atau Google, wallet dibuat otomatis oleh Privy.
2. Buka `/faucet`, klaim MockIDRX.
3. Buat grup di `/groups/new`, lalu salin link undangan.
4. Anggota lain membuka `/join/[code]`, login, dan bergabung.
5. Admin menekan Mulai setelah slot terisi (atau minimal 2 anggota).
6. Tiap anggota menekan Bayar. Transaksi pertama butuh persetujuan token (approve), lalu setoran iuran.
7. Saat iuran terakhir masuk, pot otomatis pindah ke penerima giliran dan putaran berikutnya dibuka.
8. Tampilkan tautan transaksi di Monad Explorer untuk membuktikan integrasi onchain.

### Status UI penting di halaman detail grup

- **Menunggu anggota:** slot terisi X dari N, tombol Mulai untuk admin.
- **Putaran berjalan:** progres iuran (mis. 3 dari 5 sudah bayar), tenggat, penerima giliran.
- **Telat:** lewat tenggat tetapi putaran belum lengkap. Hanya ditandai, tanpa penalti di MVP.
- **Selesai:** semua putaran sudah dicairkan, tampil ringkasan.

## 5. Fitur

Prioritas P0 wajib selesai agar demo berjalan, P1 dikerjakan jika waktu ada, P2 hanya masuk roadmap.

### Fitur fungsional

| ID | Fitur | Role | Prioritas |
| --- | --- | --- | --- |
| F1 | Login email/Google dengan embedded wallet (Privy) | Semua | P0 |
| F2 | Faucet MockIDRX (klaim token tes) | Anggota | P0 |
| F3 | Buat grup (nama, iuran, jumlah anggota, periode) | Anggota | P0 |
| F4 | Link undangan dan bergabung ke grup | Guest, Anggota | P0 |
| F5 | Mulai grup dan kunci urutan giliran | Admin | P0 |
| F6 | Bayar iuran putaran berjalan (approve + contribute) | Anggota | P0 |
| F7 | Pencairan pot otomatis saat iuran terakhir masuk | Sistem | P0 |
| F8 | Dashboard daftar grup dan progres | Anggota | P0 |
| F9 | Riwayat aktivitas grup dengan tautan explorer | Anggota | P1 |
| F10 | Penanda telat bayar dan hitung mundur tenggat | Anggota | P1 |
| F11 | Salin dan bagikan link undangan (WhatsApp) | Admin | P1 |
| F12 | Batalkan grup sebelum dimulai dan tarik kembali dana | Admin | P2 |
| F13 | Jaminan dan penalti telat bayar | Sistem | P2 |
| F14 | Notifikasi email atau WhatsApp | Sistem | P2 |

### Aturan bisnis

- Iuran tiap putaran sama untuk semua anggota. Pot = iuran × jumlah anggota.
- Jumlah putaran sama dengan jumlah anggota. Setiap anggota menerima pot tepat satu kali.
- Urutan giliran mengikuti urutan bergabung dan terkunci saat grup dimulai.
- Satu anggota hanya bisa membayar satu kali per putaran.
- Putaran berikutnya baru dibuka setelah pot putaran sebelumnya cair.
- Anggota tidak bisa keluar setelah grup dimulai.
- Jumlah anggota 2 sampai 10, periode 1 sampai 30 hari.

### Persyaratan non-fungsional

| Aspek | Target |
| --- | --- |
| Keamanan | `ReentrancyGuard`, `SafeERC20`, validasi akses di setiap fungsi tulis, tanpa private key atau kredensial di repo |
| Performa | Transaksi terkonfirmasi di UI kurang dari 3 detik setelah ditandatangani |
| Kegunaan | Pengguna baru bisa mencapai transaksi pertama dalam kurang dari 2 menit, tanpa istilah teknis di UI utama |
| Transparansi | Setiap aksi uang punya tautan ke explorer Monad |
| Keterbacaan | Responsif di layar ponsel (juri bisa membuka dari HP) |
| Kepatuhan hackathon | Lisensi MIT, README lengkap, pengungkapan penggunaan AI coding tools, riwayat commit selama masa build |

## 6. Desain Smart Contract

Dua kontrak: `ArisanPool` yang mengelola banyak grup sekaligus (satu deployment, satu alamat untuk dicantumkan di submission) dan `MockIDRX` sebagai token tes.

### State utama `ArisanPool`

```solidity
enum Status { Open, Active, Completed, Cancelled }

struct Group {
    address admin;
    IERC20 token;
    uint256 contribution;   // per anggota per putaran
    uint32 maxMembers;
    uint32 periodSeconds;
    uint32 currentRound;    // mulai dari 0
    uint64 roundDeadline;   // tenggat putaran berjalan
    Status status;
    address[] members;      // urutan = urutan giliran
}

uint256 public groupCount;
mapping(uint256 => Group) private groups;
mapping(uint256 => mapping(uint32 => mapping(address => bool))) public paid; // group, round, member
mapping(uint256 => mapping(uint32 => uint32)) public paidCount;             // group, round
mapping(uint256 => mapping(address => bool)) public isMember;
```

### Fungsi

| Fungsi | Pemanggil | Perilaku |
| --- | --- | --- |
| `createGroup(token, contribution, maxMembers, periodSeconds)` | Siapa saja | Membuat grup berstatus `Open`, pembuat jadi admin dan anggota pertama, mengembalikan `groupId` |
| `joinGroup(groupId)` | Siapa saja | Hanya saat `Open`, belum jadi anggota, slot belum penuh. Menambah ke akhir daftar anggota |
| `startGroup(groupId)` | Admin | Hanya saat `Open` dengan minimal 2 anggota. Mengunci urutan, status `Active`, mengatur tenggat putaran 0 |
| `contribute(groupId)` | Anggota | Hanya saat `Active` dan belum bayar di putaran ini. Menarik `contribution` token lewat `transferFrom`. Jika ini iuran terakhir, langsung memanggil pencairan internal |
| `_payout(groupId)` | Internal | Mengirim `contribution × members.length` ke `members[currentRound]`, menaikkan `currentRound`, mengatur tenggat baru, atau menandai `Completed` jika putaran terakhir |
| `getGroup(groupId)` | View | Mengembalikan data grup, daftar anggota, dan penerima giliran sekarang |
| `hasPaid(groupId, round, member)` | View | Status bayar satu anggota |
| `cancelGroup(groupId)` (P2) | Admin | Hanya saat `Open`, status `Cancelled`, tidak ada dana yang perlu dikembalikan karena iuran baru ditarik setelah `Active` |

Pencairan terjadi otomatis di dalam transaksi iuran terakhir, jadi tidak ada fungsi `payout` publik yang bisa disalahgunakan.

### Event

- `GroupCreated(groupId, admin, token, contribution, maxMembers, periodSeconds)`
- `MemberJoined(groupId, member, position)`
- `GroupStarted(groupId, firstDeadline)`
- `Contributed(groupId, round, member, amount)`
- `RoundPaidOut(groupId, round, recipient, amount)`
- `GroupCompleted(groupId)`

### Aturan keamanan

- `nonReentrant` pada `contribute`, `SafeERC20` untuk semua transfer.
- Cek-efek-interaksi: tandai `paid` dan naikkan `paidCount` sebelum transfer keluar.
- Batasi `maxMembers` 2 sampai 10 dan `periodSeconds` minimal 1 hari (diizinkan minimal 60 detik di mode demo lewat konstanta yang bisa diubah saat deploy).
- Tidak ada fungsi `owner` yang bisa memindahkan dana atau mengubah grup aktif.

### Risiko yang diakui

Anggota yang sudah menerima pot bisa berhenti membayar di putaran berikutnya. Di MVP, putaran sekadar menunggu sampai semua membayar dan ditandai telat di UI. Mitigasi lanjutan (jaminan sebesar sisa kewajiban, penalti, reputasi) dicatat sebagai roadmap dan disebut jujur di README.

### Test Foundry yang wajib ada

1. Alur penuh 3 anggota sampai `Completed`, saldo tiap anggota sesuai.
2. Anggota tidak bisa membayar dua kali di putaran yang sama.
3. Non-anggota tidak bisa membayar.
4. Admin tidak bisa mengubah atau menarik dana setelah `Active`.
5. `joinGroup` ditolak saat penuh atau sudah dimulai.
6. Pencairan hanya terjadi saat iuran terakhir masuk.

## 7. Desain API

API hanya mengurus data off-chain dan verifikasi transaksi. Semua aksi uang ditandatangani klien langsung ke kontrak, lalu `txHash`-nya dilaporkan ke API.

### Konvensi

- Base path `/api`, format JSON, validasi body dengan zod.
- Autentikasi: header `Authorization: Bearer <Privy access token>`, diverifikasi di server. Endpoint bertanda Publik tidak butuh token.
- Respons sukses: `{ "data": ... }`. Respons gagal: `{ "error": { "code": "STRING_CODE", "message": "..." } }` dengan status HTTP 400, 401, 403, 404, atau 409.
- Endpoint konfirmasi transaksi bersifat idempoten: `txHash` yang sama mengembalikan data yang sudah tersimpan.

### Endpoint

| Method | Path | Akses | Fungsi |
| --- | --- | --- | --- |
| POST | `/api/auth/session` | Login | Membuat atau memperbarui user dari token Privy (menyimpan `privyId`, alamat wallet) |
| GET | `/api/me` | Login | Profil user saat ini |
| PATCH | `/api/me` | Login | Ubah `displayName`, `avatarUrl` |
| POST | `/api/groups` | Login | Simpan metadata grup setelah transaksi `createGroup` terkonfirmasi |
| GET | `/api/groups` | Login | Daftar grup milik atau diikuti user |
| GET | `/api/groups/:id` | Anggota | Detail grup, anggota, putaran saat ini |
| GET | `/api/groups/invite/:code` | Publik | Ringkasan grup untuk halaman undangan (tanpa daftar anggota) |
| POST | `/api/groups/:id/members` | Login | Catat anggota baru setelah transaksi `joinGroup` terkonfirmasi |
| POST | `/api/groups/:id/start` | Admin | Catat status `ACTIVE` dan membuat baris putaran setelah `startGroup` terkonfirmasi |
| POST | `/api/groups/:id/contributions` | Anggota | Catat iuran setelah `contribute` terkonfirmasi, dan catat pencairan jika receipt memuat `RoundPaidOut` |
| GET | `/api/groups/:id/rounds` | Anggota | Daftar putaran, penerima, status bayar per anggota |
| GET | `/api/groups/:id/activity` | Anggota | Riwayat aktivitas, paginasi `?cursor=&limit=` |
| POST | `/api/internal/sync` | Rahasia server | Pemulihan: membaca ulang event kontrak dari blok terakhir dan menambal data yang terlewat (P1) |

### Contoh payload

`POST /api/groups` (setelah transaksi `createGroup` terkonfirmasi)

```json
{
  "txHash": "0xabc...",
  "name": "Arisan Kantor Q4",
  "description": "Iuran bulanan tim engineering"
}
```

Respons `201`

```json
{
  "data": {
    "id": "clx...",
    "chainGroupId": 7,
    "inviteCode": "K7P2XQ",
    "status": "OPEN",
    "contribution": "50000000",
    "maxMembers": 5,
    "periodSeconds": 2592000
  }
}
```

`POST /api/groups/:id/contributions`

```json
{ "txHash": "0xdef..." }
```

Respons `200`

```json
{
  "data": {
    "round": 2,
    "paidCount": 5,
    "roundClosed": true,
    "payout": { "recipient": "0x...", "amount": "250000000", "txHash": "0xdef..." }
  }
}
```

### Alur verifikasi `txHash` di server

1. Ambil receipt dari RPC Monad dengan viem. Tolak jika status bukan `success`.
2. Pastikan `receipt.to` sama dengan alamat `ArisanPool` yang terdaftar.
3. Decode log event yang relevan (`GroupCreated`, `MemberJoined`, `GroupStarted`, `Contributed`, `RoundPaidOut`).
4. Pastikan alamat pengirim sama dengan wallet user di token Privy.
5. Simpan atau perbarui baris database dalam satu transaksi Prisma. Duplikat `txHash` mengembalikan data yang sudah ada.

### Kode error

| Kode | Status | Arti |
| --- | --- | --- |
| `UNAUTHENTICATED` | 401 | Token tidak ada atau tidak valid |
| `FORBIDDEN` | 403 | Bukan anggota atau bukan admin |
| `NOT_FOUND` | 404 | Grup atau kode undangan tidak ada |
| `TX_NOT_CONFIRMED` | 400 | Receipt belum ada atau gagal |
| `TX_MISMATCH` | 400 | Alamat kontrak atau pengirim tidak cocok |
| `ALREADY_RECORDED` | 409 | Dikembalikan hanya jika data konflik, bukan duplikat idempoten |

## 8. Desain Database

Lima tabel inti plus satu tabel aktivitas. Jumlah uang disimpan sebagai string satuan terkecil token (6 desimal) agar tidak kehilangan presisi.

### Relasi

| Tabel | Isi | Relasi |
| --- | --- | --- |
| `User` | Akun login, alamat wallet, nama tampilan | 1 User punya banyak `Member` dan banyak `Group` (sebagai admin) |
| `Group` | Metadata grup dan salinan parameter on-chain | 1 Group punya banyak `Member`, `Round`, `Activity` |
| `Member` | Keanggotaan user di grup beserta posisi giliran | Milik 1 User dan 1 Group, unik per pasangan |
| `Round` | Satu putaran: penerima, tenggat, status pencairan | Milik 1 Group, menunjuk 1 `Member` sebagai penerima, punya banyak `Contribution` |
| `Contribution` | Satu setoran iuran | Milik 1 Round dan 1 Member, `txHash` unik |
| `Activity` | Log untuk riwayat di UI | Milik 1 Group |

### Skema Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum GroupStatus { OPEN ACTIVE COMPLETED CANCELLED }
enum RoundStatus { PENDING OPEN PAID_OUT }
enum ActivityType { GROUP_CREATED MEMBER_JOINED GROUP_STARTED CONTRIBUTED ROUND_PAID_OUT GROUP_COMPLETED }

model User {
  id            String   @id @default(cuid())
  privyId       String   @unique
  walletAddress String   @unique
  displayName   String?
  avatarUrl     String?
  createdAt     DateTime @default(now())
  members       Member[]
  adminOf       Group[]  @relation("GroupAdmin")
}

model Group {
  id                 String      @id @default(cuid())
  chainGroupId       Int         @unique
  contractAddress    String
  name               String
  description        String?
  inviteCode         String      @unique
  adminId            String
  admin              User        @relation("GroupAdmin", fields: [adminId], references: [id])
  tokenAddress       String
  contributionAmount String
  maxMembers         Int
  periodSeconds      Int
  status             GroupStatus @default(OPEN)
  currentRound       Int         @default(0)
  startedAt          DateTime?
  createdTxHash      String      @unique
  createdAt          DateTime    @default(now())
  members            Member[]
  rounds             Round[]
  activities         Activity[]
}

model Member {
  id            String         @id @default(cuid())
  groupId       String
  userId        String
  walletAddress String
  position      Int            // urutan giliran, mulai dari 0
  joinTxHash    String         @unique
  joinedAt      DateTime       @default(now())
  group         Group          @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user          User           @relation(fields: [userId], references: [id])
  contributions Contribution[]
  roundsWon     Round[]        @relation("RoundRecipient")

  @@unique([groupId, userId])
  @@unique([groupId, position])
}

model Round {
  id            String         @id @default(cuid())
  groupId       String
  number        Int
  recipientId   String
  dueAt         DateTime
  status        RoundStatus    @default(PENDING)
  potAmount     String?
  paidOutTxHash String?        @unique
  paidOutAt     DateTime?
  group         Group          @relation(fields: [groupId], references: [id], onDelete: Cascade)
  recipient     Member         @relation("RoundRecipient", fields: [recipientId], references: [id])
  contributions Contribution[]

  @@unique([groupId, number])
}

model Contribution {
  id       String   @id @default(cuid())
  roundId  String
  memberId String
  amount   String
  txHash   String   @unique
  paidAt   DateTime @default(now())
  round    Round    @relation(fields: [roundId], references: [id], onDelete: Cascade)
  member   Member   @relation(fields: [memberId], references: [id])

  @@unique([roundId, memberId])
}

model Activity {
  id        String       @id @default(cuid())
  groupId   String
  type      ActivityType
  actorId   String?      // Member.id jika ada
  payload   Json?
  txHash    String?
  createdAt DateTime     @default(now())
  group     Group        @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@index([groupId, createdAt])
}
```

### Catatan desain

- `@@unique([roundId, memberId])` pada `Contribution` mencerminkan aturan satu iuran per anggota per putaran.
- `txHash` unik di semua tabel konfirmasi membuat endpoint idempoten tanpa logika tambahan.
- Saat grup dimulai, API membuat semua baris `Round` sekaligus (satu per anggota) dengan `dueAt` dihitung dari tenggat awal dan `periodSeconds`. Status putaran pertama `OPEN`, sisanya `PENDING`.
- Jika waktu mepet, bagian database bisa dipangkas: halaman membaca langsung dari kontrak dan hanya `User`, `Group` (nama dan kode undangan) yang disimpan.

## 9. Fase Pengembangan dan Checklist Submission

Deadline submission jatuh pada 14 Oktober 2026 pukul 10.59 WIB, dan jadwal di bawah dihitung mundur dari sana dengan satu orang bekerja sekitar 13 jam plus tidur singkat. Draft pertama harus sudah tersubmit sebelum tidur, karena submission boleh diedit sampai deadline.

### Jadwal (WIB)

| Fase | Waktu | Durasi | Hasil yang harus ada |
| --- | --- | --- | --- |
| 0. Setup | 13 Okt 17.00 - 18.00 | 1 jam | Repo GitHub publik berlisensi MIT, commit pertama, Foundry dan Next.js jalan, akun Privy, Neon, dan Vercel siap, wallet deployer terisi MON testnet |
| 1. Smart contract | 18.00 - 21.30 | 3,5 jam | `MockIDRX` dan `ArisanPool`, test Foundry hijau, deploy ke Monad testnet, alamat kontrak dicatat |
| 2. Frontend inti | 21.30 - 00.30 | 3 jam | Login Privy, faucet, buat grup, undangan, gabung, mulai grup (langsung memanggil kontrak) |
| Gate A | 00.30 | - | Alur dari login sampai grup aktif jalan di testnet. **Submit draft pertama ke website hackathon** |
| Istirahat | 00.30 - 04.30 | 4 jam | Tidur. Jangan dipotong, kesalahan fatal di jam akhir lebih mahal daripada fitur yang hilang |
| 3. Iuran dan pencairan | 04.30 - 07.00 | 2,5 jam | Tombol Bayar (approve + contribute), pencairan otomatis tampil, status telat, progres iuran |
| 4. API dan database | 07.00 - 08.30 | 1,5 jam | Prisma, endpoint konfirmasi `txHash`, riwayat aktivitas. Dipangkas ke minimum jika terlambat |
| Gate B | 08.30 | - | Satu putaran penuh dengan 3 akun berhasil dan pot cair |
| 5. Dokumentasi dan demo | 08.30 - 10.00 | 1,5 jam | Video demo 3 menit (diunggah publik), README lengkap, diagram arsitektur |
| 6. Submit akhir | 10.00 - 10.30 | 0,5 jam | Perbarui submission di website, cek semua tautan dari jendela privat |
| Cadangan | 10.30 - 10.59 | 0,5 jam | Hanya untuk masalah teknis submission, bukan fitur baru |

### Jika terlambat, potong dalam urutan ini

1. Fase 4 (API dan database): pakai data langsung dari kontrak, simpan hanya kode undangan.
2. F9 dan F10 (riwayat dan penanda telat).
3. Halaman `/profile`.
4. Jangan potong: test kontrak, pencairan otomatis, video demo, README.

### Persiapan demo

- Siapkan 3 akun Privy dengan MON testnet dan MockIDRX, supaya satu putaran penuh bisa direkam tanpa menunggu.
- Gunakan mode demo periode pendek (mis. 5 menit) agar status telat dan putaran berikutnya terlihat di video.
- Skrip video 3 menit: 20 detik masalah arisan, 2 menit alur lengkap dengan transaksi di explorer Monad, 40 detik alasan memilih Monad dan roadmap.

### Checklist submission hackathon

- [ ] Repo GitHub publik dengan lisensi MIT dan riwayat commit sejak awal masa build
- [ ] README: deskripsi, arsitektur, tech stack, cara setup dan deploy, alamat kontrak, penjelasan penggunaan Monad
- [ ] README mencantumkan atribusi library dan pengungkapan penggunaan AI coding tools
- [ ] Kontrak ter-deploy di Monad testnet, alamat dan contoh `txHash` tercantum
- [ ] Aplikasi live di URL publik (Vercel) dan bisa dijalankan juri dari README
- [ ] Video demo maksimal 3 menit, publik (YouTube, Loom, atau Vimeo), menampilkan transaksi di Monad
- [ ] Dipilih satu track saja: Track 02
- [ ] Tidak ada private key, kredensial, atau kode milik tempat kerja di repo
- [ ] Submit lewat website hackathon sebelum 14 Oktober 2026, 10.59 WIB, lalu cek versi yang tercatat

### Risiko dan mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Faucet MON testnet lambat atau terbatas | Minta MON untuk deployer dan akun demo di awal fase 0 |
| RPC Monad testnet tidak stabil | Siapkan RPC cadangan dan retry di viem |
| Integrasi Privy memakan waktu | Fallback sementara ke RainbowKit dengan wallet biasa, sambil tetap menampilkan alur non-crypto di roadmap |
| Bug kontrak ditemukan menjelang akhir | Test Foundry ditulis bersamaan dengan kontrak, kontrak dibekukan setelah Gate A |
