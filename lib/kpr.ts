// lib/kpr.ts
// Estimasi kasar cicilan KPR — BUKAN simulasi resmi bank.
// Asumsi: DP 20%, tenor 15 tahun, bunga ~9%/tahun (anuitas).

export function estimateKprMonthly(price: number): number {
  const principal = price * 0.8 // 80% dibiayai bank
  const monthlyRate = 0.09 / 12
  const months = 15 * 12

  const monthly =
    (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))

  return Math.round(monthly / 100_000) * 100_000 // bulatkan ke ratusan ribu
}

export function formatRupiahShort(angka: number) {
  if (angka >= 1_000_000_000) return `Rp ${(angka / 1_000_000_000).toFixed(1)} M`
  if (angka >= 1_000_000) return `Rp ${(angka / 1_000_000).toFixed(1)} Jt`
  return `Rp ${angka.toLocaleString('id-ID')}`
}
