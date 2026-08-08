import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => !file.endsWith("package-lock.json"));

const rules = [
  {
    name: "private key",
    pattern: new RegExp("BEGIN " + "(?:RSA |EC |OPENSSH )?PRIVATE KEY"),
  },
  { name: "Resend API key", pattern: new RegExp("re_" + "[A-Za-z0-9_-]{20,}") },
  {
    name: "GitHub token",
    pattern: new RegExp("gh[pousr]_" + "[A-Za-z0-9]{30,}"),
  },
];

const findings: string[] = [];
for (const file of files) {
  if (file === "scripts/scan-secrets.ts" || file.endsWith(".example")) continue;
  let content: string;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const rule of rules) {
    if (rule.pattern.test(content)) findings.push(`${file}: ${rule.name}`);
  }
}

if (findings.length) {
  console.error("Secret scan failed (values are intentionally hidden):");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
} else {
  console.log(`Secret scan passed (${files.length} tracked files checked).`);
}
