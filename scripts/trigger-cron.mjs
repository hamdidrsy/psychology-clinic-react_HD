const allowedJobs = new Set(["appointment-notifications", "privacy-cleanup"]);
const job = process.argv[2];

if (!job || !allowedJobs.has(job)) {
  throw new Error("Geçersiz cron görevi.");
}

const origin = process.env.APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
const secret = process.env.CRON_SECRET;

if (!origin || !secret) {
  throw new Error("APP_URL/NEXT_PUBLIC_SITE_URL ve CRON_SECRET zorunludur.");
}

const url = new URL(`/api/cron/${job}`, origin);
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${secret}` },
  signal: AbortSignal.timeout(55_000),
});

if (!response.ok) {
  throw new Error(`Cron görevi başarısız oldu (HTTP ${response.status}).`);
}

console.log(`Cron görevi tamamlandı: ${job}`);
