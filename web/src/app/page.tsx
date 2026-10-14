import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Zap,
  Lock,
  CheckCircle2,
  ChevronRight,
  Star,
  ShieldCheck,
  Sparkles,
  Coins,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0c0a09] text-[#1c1917] dark:text-[#f5f5f4] selection:bg-[#7d66ff] selection:text-white">
      {/* ────────────────── 1. NAVBAR ────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#fafaf9]/90 dark:bg-[#0c0a09]/90 backdrop-blur-md border-b border-[#e7e5e4] dark:border-[#292524]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-light.png"
              alt="Turnly"
              width={104}
              height={28}
              className="h-7 w-auto object-contain dark:hidden"
              priority
            />
            <Image
              src="/logo-dark.png"
              alt="Turnly"
              width={104}
              height={28}
              className="h-7 w-auto object-contain hidden dark:block"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#78716c] dark:text-[#a8a29e]">
            <a href="#features" className="hover:text-[#7d66ff] dark:hover:text-[#a594ff] transition-colors">
              Features
            </a>
            <a href="#solutions" className="hover:text-[#7d66ff] dark:hover:text-[#a594ff] transition-colors">
              Solutions
            </a>
            <a href="#how-it-works" className="hover:text-[#7d66ff] dark:hover:text-[#a594ff] transition-colors">
              How It Works
            </a>
            <a href="#testimonials" className="hover:text-[#7d66ff] dark:hover:text-[#a594ff] transition-colors">
              Testimonials
            </a>
            <a href="#faq" className="hover:text-[#7d66ff] dark:hover:text-[#a594ff] transition-colors">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#78716c] hover:text-[#7d66ff] dark:text-[#a8a29e] dark:hover:text-[#a594ff] text-[13px] font-medium"
              asChild
            >
              <Link href="/faucet">Token Faucet</Link>
            </Button>
            <ThemeToggle />
            <Button
              size="sm"
              className="rounded-full bg-[#7d66ff] hover:bg-[#6c53f5] text-white dark:bg-white dark:text-[#1c1917] dark:hover:bg-[#f5f5f4] text-[13px] font-medium px-5 h-9 shadow-sm shadow-[#7d66ff]/20"
              asChild
            >
              <Link href="/dashboard" className="text-white dark:text-[#1c1917]">Launch App</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ────────────────── 2. HERO SECTION ────────────────── */}
      <section className="px-6 pt-16 pb-20 md:pt-24 md:pb-28 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7d66ff]/10 dark:bg-[#7d66ff]/20 border border-[#7d66ff]/20 dark:border-[#7d66ff]/30 text-[12px] font-medium text-[#7d66ff] dark:text-[#a594ff] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#7d66ff] animate-pulse" />
              Monad Metropolis Hackathon · Track DeFi
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1c1917] dark:text-white leading-[1.12] mb-6">
              The onchain savings engine behind trusted{" "}
              <span className="bg-[#7d66ff] text-white px-3 py-0.5 rounded-lg inline-block font-extrabold shadow-sm">
                communities
              </span>
            </h1>

            <p className="text-[#78716c] dark:text-[#a8a29e] text-lg sm:text-xl max-w-2xl leading-relaxed mb-8">
              Turnly automates social saving rounds with Monad smart contracts.
              Zero treasurers, zero embezzlement risk, instant auto-payouts, and
              frictionless email login.
            </p>

            {/* Email / Start Bar */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mb-4">
              <Button
                size="lg"
                className="rounded-full bg-[#7d66ff] hover:bg-[#6c53f5] text-white dark:bg-white dark:text-[#1c1917] dark:hover:bg-[#f5f5f4] font-bold text-base px-8 h-12 shadow-md shadow-[#7d66ff]/30 dark:shadow-white/10 transition-transform hover:scale-[1.02]"
                asChild
              >
                <Link href="/dashboard" className="flex items-center text-white dark:text-[#1c1917]">
                  Start for Free
                  <ArrowRight className="ml-2 h-4 w-4 text-white dark:text-[#1c1917]" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-[#d6d3d1] dark:border-[#38332f] bg-white dark:bg-[#141210] hover:bg-[#f5f5f4] dark:hover:bg-[#1c1917] text-[#44403c] dark:text-[#f5f5f4] text-base px-6 h-12"
                asChild
              >
                <Link href="/groups/grp_r5tdoepc">View Live Demo</Link>
              </Button>
            </div>

            {/* Small stats badges */}
            <div className="flex flex-wrap items-center gap-6 mt-4 text-[13px] text-[#78716c] dark:text-[#a8a29e]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#7d66ff]" /> &lt; 1s Finality
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#7d66ff]" /> Gas Fee &lt; 0.001 MON
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#7d66ff]" /> No Wallet Extension Needed
              </span>
            </div>
          </div>

          {/* Right Floating Badge / Review card */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
            <div className="bg-white dark:bg-[#141210] rounded-2xl p-6 border border-[#e7e5e4] dark:border-[#292524] shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-1 text-[#f59e0b]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#f59e0b]" />
                  ))}
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#7d66ff]/10 dark:bg-[#7d66ff]/20 text-[#7d66ff] dark:text-[#a594ff] border border-[#7d66ff]/20 dark:border-[#7d66ff]/30">
                  Onchain Verified
                </span>
              </div>
              <p className="text-2xl font-bold text-[#1c1917] dark:text-white">4.9 / 5.0</p>
              <p className="text-xs text-[#78716c] dark:text-[#a8a29e] leading-relaxed">
                Stress-tested on Monad Testnet by autonomous saving circles with zero defaults.
              </p>
              <div className="pt-2 border-t border-[#f5f5f4] dark:border-[#292524] flex items-center gap-2 text-[11px] text-[#7d66ff] dark:text-[#a594ff]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7d66ff]" /> Smart Contract Escrow Verified
              </div>
            </div>

            <div className="bg-[#1c1917] dark:bg-[#141210] text-white rounded-2xl p-6 border border-transparent dark:border-[#292524] shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between text-xs text-[#a8a29e]">
                <span>LATEST ROUND</span>
                <span className="text-[#a594ff] font-mono font-semibold">LIVE ON MONAD</span>
              </div>
              <div>
                <p className="text-sm text-[#d6d3d1] dark:text-[#a8a29e]">Total Distributed Pot</p>
                <p className="text-2xl font-bold font-mono text-white">
                  5,000,000 <span className="text-[#a594ff] text-sm font-sans font-semibold">mIDRX</span>
                </p>
              </div>
              <div className="text-[11px] text-[#a8a29e] flex items-center justify-between">
                <span>Autonomous Execution</span>
                <span className="text-white font-mono">100% Success</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Partner / Ecosystem bar ── */}
        <div className="mt-20">
          {/* Desktop Attached Tab on Top-Left */}
          <div className="hidden sm:inline-block border border-[#e7e5e4] dark:border-[#292524] border-b-0 bg-[#fafaf9] dark:bg-[#0c0a09] px-4 py-2 font-mono text-xs text-[#78716c] dark:text-[#a8a29e] -mb-px relative z-10">
            Powered by industry-leading web3 ecosystem
          </div>

          {/* Main Box */}
          <div className="border border-[#e7e5e4] dark:border-[#292524] bg-white/40 dark:bg-[#141210]/40 overflow-hidden">
            {/* Mobile Header (Centered with divider line) */}
            <div className="sm:hidden border-b border-[#e7e5e4] dark:border-[#292524] px-4 py-3 text-center font-mono text-xs text-[#78716c] dark:text-[#a8a29e] bg-[#fafaf9] dark:bg-[#0c0a09]">
              Powered by industry-leading web3 ecosystem
            </div>

            {/* Desktop Row: Static evenly-spaced */}
            <div className="hidden sm:flex items-center justify-between px-8 sm:px-14 py-7">
              {/* Monad */}
              <div className="flex items-center justify-center opacity-85 hover:opacity-100 transition-opacity">
                <Image
                  src="/logo-monad.webp"
                  alt="Monad"
                  width={36}
                  height={36}
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </div>

              {/* Privy */}
              <div className="flex items-center justify-center opacity-85 hover:opacity-100 transition-opacity">
                <Image
                  src="/logo-privy.png"
                  alt="Privy"
                  width={100}
                  height={28}
                  className="h-6 sm:h-7 w-auto object-contain"
                />
              </div>

              {/* Foundry */}
              <div className="flex items-center justify-center opacity-85 hover:opacity-100 transition-opacity">
                <Image
                  src="/logo-foundry.png"
                  alt="Foundry"
                  width={36}
                  height={36}
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </div>

              {/* mIDRX / IDRX */}
              <div className="flex items-center justify-center opacity-85 hover:opacity-100 transition-opacity">
                <Image
                  src="/logo-idrx.svg"
                  alt="mIDRX"
                  width={105}
                  height={32}
                  className="h-7 sm:h-8 w-auto object-contain"
                />
              </div>

              {/* Viem (Light & Dark mode support) */}
              <div className="flex items-center justify-center opacity-85 hover:opacity-100 transition-opacity">
                <Image
                  src="/logo-viem.svg"
                  alt="Viem"
                  width={85}
                  height={28}
                  className="h-6 sm:h-7 w-auto object-contain dark:hidden"
                />
                <Image
                  src="/logo-viem-dark.svg"
                  alt="Viem"
                  width={85}
                  height={28}
                  className="h-6 sm:h-7 w-auto object-contain hidden dark:block"
                />
              </div>
            </div>

            {/* Mobile Slider Track: Smooth continuous sliding marquee */}
            <div className="sm:hidden relative overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="flex w-max animate-marquee items-center gap-10">
                {/* Loop set 1 */}
                <div className="flex items-center gap-10 shrink-0">
                  <div className="flex items-center justify-center w-24">
                    <Image
                      src="/logo-monad.webp"
                      alt="Monad"
                      width={36}
                      height={36}
                      className="h-7 w-auto object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-24">
                    <Image
                      src="/logo-privy.png"
                      alt="Privy"
                      width={100}
                      height={28}
                      className="h-6 w-auto object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-24">
                    <Image
                      src="/logo-foundry.png"
                      alt="Foundry"
                      width={36}
                      height={36}
                      className="h-7 w-auto object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-24">
                    <Image
                      src="/logo-idrx.svg"
                      alt="mIDRX"
                      width={105}
                      height={32}
                      className="h-7 w-auto object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-24">
                    <Image
                      src="/logo-viem.svg"
                      alt="Viem"
                      width={85}
                      height={28}
                      className="h-6 w-auto object-contain dark:hidden"
                    />
                    <Image
                      src="/logo-viem-dark.svg"
                      alt="Viem"
                      width={85}
                      height={28}
                      className="h-6 w-auto object-contain hidden dark:block"
                    />
                  </div>
                </div>

                {/* Loop set 2 (seamless repeat) */}
                <div className="flex items-center gap-10 shrink-0" aria-hidden="true">
                  <div className="flex items-center justify-center w-24">
                    <Image
                      src="/logo-monad.webp"
                      alt="Monad"
                      width={36}
                      height={36}
                      className="h-7 w-auto object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-24">
                    <Image
                      src="/logo-privy.png"
                      alt="Privy"
                      width={100}
                      height={28}
                      className="h-6 w-auto object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-24">
                    <Image
                      src="/logo-foundry.png"
                      alt="Foundry"
                      width={36}
                      height={36}
                      className="h-7 w-auto object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-24">
                    <Image
                      src="/logo-idrx.svg"
                      alt="mIDRX"
                      width={105}
                      height={32}
                      className="h-7 w-auto object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-24">
                    <Image
                      src="/logo-viem.svg"
                      alt="Viem"
                      width={85}
                      height={28}
                      className="h-6 w-auto object-contain dark:hidden"
                    />
                    <Image
                      src="/logo-viem-dark.svg"
                      alt="Viem"
                      width={85}
                      height={28}
                      className="h-6 w-auto object-contain hidden dark:block"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── 3. VALUE PROP SECTION ────────────────── */}
      <section id="features" className="border-t border-[#e7e5e4] dark:border-[#292524] bg-white dark:bg-[#0c0a09] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header Split */}
          <div className="grid lg:grid-cols-12 gap-8 items-start mb-16">
            <div className="lg:col-span-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1c1917] dark:text-white leading-tight">
                Engineered from the ground up for absolute transparency.
              </h2>
            </div>
            <div className="lg:col-span-6 text-[#78716c] dark:text-[#a8a29e] text-base leading-relaxed">
              Traditional ROSCAs suffer from treasurer burnout, delayed transfers, and fund
              mismanagement. Turnly offloads escrow and execution to autonomous smart contracts
              that cannot be influenced or manipulated.
            </div>
          </div>

          {/* Cards Grid */}
          <div className="space-y-6">
            {/* Top Large Card: 3 Moment Orchestration */}
            <div className="bg-[#fafaf9] dark:bg-[#141210] border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-8 sm:p-10">
              <div className="max-w-xl mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7d66ff] dark:text-[#a594ff]">
                  ESCROW AUTOMATION
                </span>
                <h3 className="text-2xl font-bold text-[#1c1917] dark:text-white mt-1 mb-3">
                  3 critical moments orchestrated without human intermediaries
                </h3>
                <p className="text-sm text-[#78716c] dark:text-[#a8a29e] leading-relaxed">
                  From deposit collection to pot disbursement, every transition is
                  cryptographically enforced on the Monad blockchain.
                </p>
              </div>

              {/* Diagram Flow Mockup */}
              <div className="grid sm:grid-cols-3 gap-4 relative">
                <div className="bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#292524] rounded-xl p-5 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#7d66ff]/10 dark:bg-[#7d66ff]/20 text-[#7d66ff] dark:text-[#a594ff] flex items-center justify-center font-bold text-sm mb-3">
                    1
                  </div>
                  <h4 className="font-semibold text-sm mb-1 text-[#1c1917] dark:text-white">Verified Contribution</h4>
                  <p className="text-xs text-[#78716c] dark:text-[#a8a29e]">
                    Members deposit mIDRX directly into the smart contract pool with 1-click approvals.
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#f5f5f4] dark:border-[#292524] flex items-center justify-between text-[11px] text-[#7d66ff] dark:text-[#a594ff] font-medium">
                    <span>Approved</span>
                    <span>100,000 mIDRX</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#292524] rounded-xl p-5 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#7d66ff]/10 dark:bg-[#7d66ff]/20 text-[#7d66ff] dark:text-[#a594ff] flex items-center justify-center font-bold text-sm mb-3">
                    2
                  </div>
                  <h4 className="font-semibold text-sm mb-1 text-[#1c1917] dark:text-white">Smart Contract Escrow</h4>
                  <p className="text-xs text-[#78716c] dark:text-[#a8a29e]">
                    The contract locks funds and tracks round quorum. No party can withdraw or tamper with balances.
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#f5f5f4] dark:border-[#292524] flex items-center justify-between text-[11px] text-[#7d66ff] dark:text-[#a594ff] font-medium">
                    <span>Status</span>
                    <span>5 / 5 Members</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#292524] rounded-xl p-5 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#7d66ff]/10 dark:bg-[#7d66ff]/20 text-[#7d66ff] dark:text-[#a594ff] flex items-center justify-center font-bold text-sm mb-3">
                    3
                  </div>
                  <h4 className="font-semibold text-sm mb-1 text-[#1c1917] dark:text-white">Instant Auto-Disbursement</h4>
                  <p className="text-xs text-[#78716c] dark:text-[#a8a29e]">
                    The moment the final member contributes, the contract instantly transfers the full pot to the recipient.
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#f5f5f4] dark:border-[#292524] flex items-center justify-between text-[11px] text-[#7d66ff] dark:text-[#a594ff] font-medium">
                    <span>Disbursed</span>
                    <span>500,000 mIDRX ✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 2 Cards Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Card A */}
              <div className="bg-[#fafaf9] dark:bg-[#141210] border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-8 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#7d66ff]/10 dark:bg-[#7d66ff]/20 border border-[#7d66ff]/20 text-[#7d66ff] dark:text-[#a594ff] flex items-center justify-center mb-4">
                    <Coins className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1c1917] dark:text-white mb-2">
                    Stable Denomination via mIDRX
                  </h3>
                  <p className="text-sm text-[#78716c] dark:text-[#a8a29e] leading-relaxed mb-6">
                    Fixed pegged valuation ensures contribution amounts remain predictable and immune
                    to crypto market volatility.
                  </p>
                </div>
                <div className="bg-white dark:bg-[#1c1917] rounded-xl border border-[#e7e5e4] dark:border-[#292524] p-4 text-xs font-mono space-y-2">
                  <div className="flex justify-between text-[#78716c] dark:text-[#a8a29e]">
                    <span>Token Peg:</span>
                    <span className="text-[#1c1917] dark:text-white font-semibold">1 mIDRX = Rp 1</span>
                  </div>
                  <div className="flex justify-between text-[#78716c] dark:text-[#a8a29e]">
                    <span>Contract Address:</span>
                    <span className="text-[#7d66ff] dark:text-[#a594ff]">0x8078...F28a</span>
                  </div>
                </div>
              </div>

              {/* Card B */}
              <div className="bg-[#fafaf9] dark:bg-[#141210] border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-8 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#7d66ff]/10 dark:bg-[#7d66ff]/20 border border-[#7d66ff]/20 text-[#7d66ff] dark:text-[#a594ff] flex items-center justify-center mb-4">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1c1917] dark:text-white mb-2">
                    Cryptographically Sealed Turn Order
                  </h3>
                  <p className="text-sm text-[#78716c] dark:text-[#a8a29e] leading-relaxed mb-6">
                    Payout sequence is deterministically locked upon group deployment.
                    No organizer or participant can swap turns out of order.
                  </p>
                </div>
                <div className="bg-white dark:bg-[#1c1917] rounded-xl border border-[#e7e5e4] dark:border-[#292524] p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#1c1917] dark:text-white">Round #1: Alice (0x4a..1e)</span>
                    <span className="text-[#7d66ff] dark:text-[#a594ff] font-semibold text-[11px]">Completed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#1c1917] dark:text-white">Round #2: Bob (0x8b..9c)</span>
                    <span className="bg-[#7d66ff]/10 dark:bg-[#7d66ff]/20 text-[#7d66ff] dark:text-[#a594ff] px-2 py-0.5 rounded font-semibold text-[11px]">Active Turn</span>
                  </div>
                  <div className="flex items-center justify-between text-[#a8a29e] dark:text-[#78716c]">
                    <span>Round #3: Charlie (0x3f..a2)</span>
                    <span className="text-[11px]">Upcoming</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── 4. PROCESS / 24H SECTION ────────────────── */}
      <section id="solutions" className="border-t border-[#e7e5e4] dark:border-[#292524] bg-[#fafaf9] dark:bg-[#0c0a09] py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7d66ff] dark:text-[#a594ff] mb-3">
              EFFORTLESS SETUP
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-[#1c1917] dark:text-white tracking-tight leading-[1.15] mb-6">
              From creation to your first round in under 2 minutes.
            </h2>
            <p className="text-base text-[#78716c] dark:text-[#a8a29e] leading-relaxed mb-8">
              No browser extensions, no seed phrases, no manual accounting spreadsheets.
              Turnly makes decentralized social savings as simple as modern fintech.
            </p>
            <Button
              size="lg"
              className="rounded-full bg-[#7d66ff] hover:bg-[#6c53f5] text-white dark:bg-white dark:text-[#1c1917] dark:hover:bg-[#f5f5f4] font-bold text-sm px-7 h-11 shadow-md shadow-[#7d66ff]/25"
              asChild
            >
              <Link href="/dashboard" className="text-white dark:text-[#1c1917]">Create Savings Group Now</Link>
            </Button>
          </div>

          {/* Right Column: 3 Process Banners (Cohesive Primary Brand) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Banner 1: Configure */}
            <div className="bg-white dark:bg-[#141210] border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-6 shadow-sm hover:border-[#7d66ff] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-[#7d66ff] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-xs">
                  01. Configure Rules
                </span>
                <span className="text-sm font-bold text-[#1c1917] dark:text-white">Define Pool Parameters</span>
              </div>
              <p className="text-sm text-[#78716c] dark:text-[#a8a29e] leading-relaxed pl-1">
                Set contribution amount (e.g. 100,000 mIDRX), target member count, and round frequency
                (weekly or monthly). The contract initializes on Monad with a single click.
              </p>
            </div>

            {/* Banner 2: Invite */}
            <div className="bg-white dark:bg-[#141210] border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-6 shadow-sm hover:border-[#7d66ff] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-[#7d66ff] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-xs">
                  02. Invite Members
                </span>
                <span className="text-sm font-bold text-[#1c1917] dark:text-white">Share Unique Group Code</span>
              </div>
              <p className="text-sm text-[#78716c] dark:text-[#a8a29e] leading-relaxed pl-1">
                Distribute your invite code via WhatsApp, Telegram, or Discord. Members sign in using
                Google or email through Privy without seed phrase friction.
              </p>
            </div>

            {/* Banner 3: Execute */}
            <div className="bg-white dark:bg-[#141210] border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-6 shadow-sm hover:border-[#7d66ff] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-[#7d66ff] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-xs">
                  03. Autonomous Execution
                </span>
                <span className="text-sm font-bold text-[#1c1917] dark:text-white">Contribute & Auto-Collect Pot</span>
              </div>
              <p className="text-sm text-[#78716c] dark:text-[#a8a29e] leading-relaxed pl-1">
                Members deposit their dues each round. Once the final contribution settles, the smart contract
                automatically routes the pooled pot to the recipient within seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── 5. ALTERNATING FEATURE SHOWCASE (Phones) ────────────────── */}
      <section id="how-it-works" className="border-t border-[#e7e5e4] dark:border-[#292524] bg-white dark:bg-[#0c0a09] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7d66ff] dark:text-[#a594ff] flex items-center justify-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#7d66ff]" /> SOLVING REAL-WORLD HEADACHES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1c1917] dark:text-white tracking-tight">
              Every traditional ROSCA concern, solved by Turnly
            </h2>
          </div>

          <div className="space-y-24">
            {/* Row 1: Text Left, Mockup Right */}
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6">
                <span className="text-xs font-bold text-[#7d66ff] dark:text-[#a594ff] uppercase tracking-wide">
                  ZERO DELAYS
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#1c1917] dark:text-white mt-1 mb-4">
                  Instant disbursement with zero treasurer excuses
                </h3>
                <p className="text-[#78716c] dark:text-[#a8a29e] text-base leading-relaxed mb-6">
                  No more chasing busy treasurers or waiting days for manual bank transfers.
                  Turnly executes payouts on Monad the exact millisecond the final contribution settles.
                </p>
                <div className="flex items-center gap-2 text-sm text-[#1c1917] dark:text-[#f5f5f4] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#7d66ff]" /> Finalized in &lt; 1 second on Monad
                </div>
              </div>

              <div className="lg:col-span-6 flex justify-center">
                <div className="w-full max-w-sm bg-[#fafaf9] dark:bg-[#141210] rounded-3xl border-4 border-[#e7e5e4] dark:border-[#292524] p-5 shadow-lg">
                  <div className="w-16 h-1 bg-[#d6d3d1] dark:bg-[#44403c] rounded-full mx-auto mb-4" />
                  <div className="bg-white dark:bg-[#1c1917] rounded-2xl p-4 border border-[#e7e5e4] dark:border-[#292524] shadow-sm mb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#7d66ff] dark:text-[#a594ff] mb-1">
                      <Zap className="w-3.5 h-3.5" /> PAYOUT CONFIRMED
                    </div>
                    <p className="text-lg font-bold text-[#1c1917] dark:text-white font-mono">
                      +1,000,000 mIDRX
                    </p>
                    <p className="text-[11px] text-[#78716c] dark:text-[#a8a29e]">
                      Credited to your wallet · Tx: 0x8a9f...b2
                    </p>
                  </div>
                  <div className="bg-[#7d66ff]/10 dark:bg-[#7d66ff]/20 text-[#7d66ff] dark:text-[#a594ff] rounded-xl p-3 text-xs flex items-center justify-between border border-[#7d66ff]/20">
                    <span>Round #2 Status</span>
                    <span className="font-bold">100% Settled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Mockup Left, Text Right */}
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center">
                <div className="w-full max-w-sm bg-[#fafaf9] dark:bg-[#141210] rounded-3xl border-4 border-[#e7e5e4] dark:border-[#292524] p-5 shadow-lg">
                  <div className="w-16 h-1 bg-[#d6d3d1] dark:bg-[#44403c] rounded-full mx-auto mb-4" />
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#78716c] dark:text-[#a8a29e] uppercase mb-2">
                      Round #3 Contribution Status
                    </div>
                    {[
                      { name: "Alex Turner", status: "Settled", time: "10:14 AM", ok: true },
                      { name: "Sarah Jenkins", status: "Settled", time: "10:18 AM", ok: true },
                      { name: "Michael Chen", status: "Settled", time: "11:02 AM", ok: true },
                      { name: "Emily Davis", status: "Pending", time: "Awaiting payment", ok: false },
                    ].map((m, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-[#1c1917] rounded-xl p-3 border border-[#e7e5e4] dark:border-[#292524] flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-[#1c1917] dark:text-white">{m.name}</p>
                          <p className="text-[11px] text-[#a8a29e] dark:text-[#78716c]">{m.time}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.ok
                              ? "bg-[#7d66ff]/15 dark:bg-[#7d66ff]/25 text-[#7d66ff] dark:text-[#a594ff]"
                              : "bg-[#e7e5e4] dark:bg-[#292524] text-[#78716c] dark:text-[#a8a29e]"
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2">
                <span className="text-xs font-bold text-[#7d66ff] dark:text-[#a594ff] uppercase tracking-wide">
                  AUDITABLE
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#1c1917] dark:text-white mt-1 mb-4">
                  Every member holds identical transparency & audit power
                </h3>
                <p className="text-[#78716c] dark:text-[#a8a29e] text-base leading-relaxed mb-6">
                  Live status indicators show who has paid and who is pending.
                  Zero double-entry discrepancies, zero forged deposit receipts.
                </p>
                <div className="flex items-center gap-2 text-sm text-[#1c1917] dark:text-[#f5f5f4] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#7d66ff]" /> Real-time synchronization directly from Monad RPC
                </div>
              </div>
            </div>

            {/* Row 3: Text Left, Mockup Right */}
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6">
                <span className="text-xs font-bold text-[#7d66ff] dark:text-[#a594ff] uppercase tracking-wide">
                  ABSOLUTE SECURITY
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#1c1917] dark:text-white mt-1 mb-4">
                  Pooled funds completely shielded from personal embezzlement
                </h3>
                <p className="text-[#78716c] dark:text-[#a8a29e] text-base leading-relaxed mb-6">
                  Group capital never touches personal bank accounts. The ArisanPool contract
                  only releases pooled funds to the verified turn holder according to the queue.
                </p>
                <div className="flex items-center gap-2 text-sm text-[#1c1917] dark:text-[#f5f5f4] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#7d66ff]" /> Non-custodial & trustless smart contract architecture
                </div>
              </div>

              <div className="lg:col-span-6 flex justify-center">
                <div className="w-full max-w-sm bg-[#fafaf9] dark:bg-[#141210] rounded-3xl border-4 border-[#e7e5e4] dark:border-[#292524] p-5 sm:p-6 shadow-lg">
                  <div className="w-16 h-1 bg-[#d6d3d1] dark:bg-[#44403c] rounded-full mx-auto mb-4" />
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7d66ff] dark:text-[#a594ff] mb-3">
                    <ShieldCheck className="w-4 h-4 text-[#7d66ff]" /> SMART CONTRACT LOCK
                  </div>
                  <div className="bg-white dark:bg-[#1c1917] rounded-xl p-4 font-mono text-xs space-y-2 border border-[#e7e5e4] dark:border-[#292524] shadow-sm">
                    <p className="text-[#7d66ff] dark:text-[#a594ff] font-semibold">&gt; arisanPool.balance()</p>
                    <p className="text-[#1c1917] dark:text-white text-sm font-bold">500,000 mIDRX [LOCKED]</p>
                    <p className="text-[#78716c] dark:text-[#a8a29e] text-[11px] pt-2 border-t border-[#e7e5e4] dark:border-[#292524]">
                      Withdrawal blocked until all 5 members contribute.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── 6. TESTIMONIALS SECTION ────────────────── */}
      <section id="testimonials" className="border-t border-[#e7e5e4] dark:border-[#292524] bg-[#fafaf9] dark:bg-[#0c0a09] py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#78716c] dark:text-[#a8a29e] mb-3">
            USER TESTIMONIALS
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1c1917] dark:text-white tracking-tight mb-16">
            Trusted by communities who value peace of mind
          </h2>

          <div className="space-y-12">
            {/* Quote 1 */}
            <div className="bg-white dark:bg-[#141210] border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-8 sm:p-10 text-left shadow-sm">
              <p className="text-xl sm:text-2xl font-semibold text-[#1c1917] dark:text-white leading-relaxed mb-6">
                &ldquo;Being the group treasurer used to be a nightmare: chasing late payments made you
                look nagging, and shortfalls were your problem. With Turnly, the smart contract is the
                unbiased referee.&rdquo;
              </p>
              <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-[#f5f5f4] dark:border-[#292524]">
                <div>
                  <p className="font-bold text-sm text-[#1c1917] dark:text-white">Diana Ross</p>
                  <p className="text-xs text-[#78716c] dark:text-[#a8a29e]">Corporate Savings Coordinator</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#7d66ff]/10 dark:bg-[#7d66ff]/20 text-[#7d66ff] dark:text-[#a594ff] border border-[#7d66ff]/20">
                  Corporate Circle · 12 Members
                </span>
              </div>
            </div>

            {/* Quote 2 */}
            <div className="bg-white dark:bg-[#141210] border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-8 sm:p-10 text-left shadow-sm">
              <p className="text-xl sm:text-2xl font-semibold text-[#1c1917] dark:text-white leading-relaxed mb-6">
                &ldquo;Our group was skeptical about crypto, but login only needed a Google account!
                When my turn arrived, the pot landed in my balance instantly without waiting for anyone.&rdquo;
              </p>
              <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-[#f5f5f4] dark:border-[#292524]">
                <div>
                  <p className="font-bold text-sm text-[#1c1917] dark:text-white">Henry Wright</p>
                  <p className="text-xs text-[#78716c] dark:text-[#a8a29e]">Alumni Association Member</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#7d66ff]/10 dark:bg-[#7d66ff]/20 text-[#7d66ff] dark:text-[#a594ff] border border-[#7d66ff]/20">
                  Alumni Circle · 10 Members
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── 7. FAQ SECTION ────────────────── */}
      <section id="faq" className="border-t border-[#e7e5e4] dark:border-[#292524] bg-white dark:bg-[#0c0a09] py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716c] dark:text-[#a8a29e]">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1c1917] dark:text-white tracking-tight mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="divide-y divide-[#e7e5e4] dark:divide-[#292524]">
            {[
              {
                q: "What happens if a member is late or misses a contribution?",
                a: "The smart contract only disburses the round pot once all participants have deposited their share. All members can view pending payments in real time and send reminders without any risk of fund loss.",
              },
              {
                q: "Do I need crypto experience or a MetaMask extension?",
                a: "Not at all. Turnly leverages Privy for seamless social authentication. You simply sign in with Google or email, and an embedded Monad wallet is provisioned automatically behind the scenes.",
              },
              {
                q: "What is the mIDRX token?",
                a: "mIDRX is a testnet IDR-pegged stablecoin on Monad with a 1:1 parity (1 mIDRX = Rp 1). You can claim testnet mIDRX for free directly from the Token Faucet page to test the protocol.",
              },
              {
                q: "Are there platform or administration fees?",
                a: "Turnly charges 0% platform fees. Network gas fees on Monad are sub-cent (< 0.001 MON) and subsidized during the testnet phase.",
              },
            ].map((faq, idx) => (
              <details key={idx} className="group py-6">
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-base text-[#1c1917] dark:text-white group-open:text-[#7d66ff] dark:group-open:text-[#a594ff] transition-colors">
                  <span>{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-[#a8a29e] dark:text-[#78716c] group-open:rotate-90 transition-transform shrink-0 ml-4" />
                </summary>
                <p className="mt-4 text-sm text-[#78716c] dark:text-[#a8a29e] leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── 8. READY TO LEVEL UP / BOTTOM CTA & NEWSLETTER ────────────────── */}
      <section className="border-t border-[#e7e5e4] dark:border-[#292524] bg-[#fafaf9] dark:bg-[#0c0a09] py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Main CTA Split Card (Cohesive Primary Brand Accent) */}
          <div className="bg-[#1c1917] dark:bg-[#141210] rounded-3xl p-8 sm:p-14 text-white border border-[#7d66ff]/20 dark:border-[#292524] shadow-xl grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-wider text-[#a594ff] mb-2 block">
                READY TO LEVEL UP?
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold leading-tight mb-4 text-white">
                Launch your onchain savings circle today.
              </h2>
              <p className="text-[#a8a29e] text-base leading-relaxed mb-8 max-w-lg">
                Takes under 2 minutes to deploy your first group. Grab free mIDRX tokens from the faucet
                and experience treasurer-free social savings.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="rounded-full !bg-[#7d66ff] hover:!bg-[#6c53f5] !text-white dark:!bg-white dark:!text-[#1c1917] dark:hover:!bg-[#f5f5f4] font-bold text-sm px-8 h-12 shadow-lg shadow-[#7d66ff]/30"
                  asChild
                >
                  <Link href="/dashboard" className="!text-white dark:!text-[#1c1917]">Create Savings Group</Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-full border border-white/20 hover:border-white/40 !bg-transparent hover:!bg-white/10 !text-white text-sm px-6 h-12 transition-colors"
                  asChild
                >
                  <Link href="/faucet" className="!text-white">Claim Faucet mIDRX</Link>
                </Button>
              </div>
            </div>

            {/* Right Mini Table / Specs in Card */}
            <div className="lg:col-span-5 bg-[#292524] dark:bg-[#1c1917] rounded-2xl p-6 border border-[#44403c] dark:border-[#292524] text-xs font-mono space-y-3">
              <div className="text-[11px] text-[#a8a29e] font-sans font-semibold uppercase tracking-wider border-b border-[#44403c] dark:border-[#292524] pb-2">
                Protocol Specifications
              </div>
              <div className="flex justify-between py-1 border-b border-[#44403c] dark:border-[#292524]">
                <span className="text-[#a8a29e]">Network:</span>
                <span className="text-white font-semibold">Monad Testnet (10143)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#44403c] dark:border-[#292524]">
                <span className="text-[#a8a29e]">Platform Fee:</span>
                <span className="text-[#a594ff] font-semibold">0.0% (Free)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#44403c] dark:border-[#292524]">
                <span className="text-[#a8a29e]">Execution Finality:</span>
                <span className="text-white font-semibold">&lt; 1 Second</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#a8a29e]">Escrow Security:</span>
                <span className="text-white font-semibold">OpenZeppelin Audited</span>
              </div>
            </div>
          </div>

          {/* Mascot + Newsletter Row (Cohesive Brand Palette) */}
          <div className="grid md:grid-cols-12 gap-8 items-center pt-6">
            <div className="md:col-span-4 flex items-center gap-4">
              <Image
                src="/logo-icon.png"
                alt="Turnly Emblem"
                width={56}
                height={56}
                className="object-contain"
              />
              <div>
                <p className="font-bold text-lg text-[#1c1917] dark:text-white">Turnly Protocol</p>
                <p className="text-xs text-[#78716c] dark:text-[#a8a29e]">Autonomous Social Savings Infrastructure</p>
              </div>
            </div>

            <div className="md:col-span-8 bg-[#7d66ff]/10 dark:bg-[#141210] border border-[#7d66ff]/25 dark:border-[#292524] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <p className="font-bold text-sm text-[#7d66ff] dark:text-[#a594ff]">
                  Stay Ahead of Mainnet Launch
                </p>
                <p className="text-xs text-[#78716c] dark:text-[#a8a29e]">
                  Be the first to know when Turnly deploys to Monad Mainnet.
                </p>
              </div>
              <div className="flex w-full sm:w-auto gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="px-4 py-2 rounded-full border border-[#7d66ff]/30 dark:border-[#292524] bg-white dark:bg-[#1c1917] text-xs text-[#1c1917] dark:text-white placeholder:text-[#a8a29e] outline-none w-full sm:w-48 focus:border-[#7d66ff]"
                />
                <Button
                  size="sm"
                  className="rounded-full bg-[#7d66ff] hover:bg-[#6c53f5] text-white font-semibold text-xs px-5 h-9 shrink-0 shadow-sm shadow-[#7d66ff]/20"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── 9. FOOTER ────────────────── */}
      <footer className="border-t border-[#e7e5e4] dark:border-[#292524] bg-white dark:bg-[#0c0a09] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#78716c] dark:text-[#a8a29e]">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-icon.png"
              alt="Turnly"
              width={20}
              height={20}
              className="object-contain"
            />
            <span>&copy; 2026 Turnly Protocol. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/dashboard" className="hover:text-[#7d66ff] dark:hover:text-[#a594ff] transition-colors">
              App
            </Link>
            <Link href="/faucet" className="hover:text-[#7d66ff] dark:hover:text-[#a594ff] transition-colors">
              Faucet
            </Link>
            <a
              href="https://testnet.monadvision.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#7d66ff] dark:hover:text-[#a594ff] transition-colors"
            >
              Monad Explorer
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#7d66ff] dark:hover:text-[#a594ff] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
