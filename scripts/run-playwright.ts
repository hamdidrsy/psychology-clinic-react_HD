import { type ChildProcess, spawn } from "node:child_process";
import { once } from "node:events";
import { resolve } from "node:path";

const root = process.cwd();
const nextCli = resolve(root, "node_modules/next/dist/bin/next");
const playwrightCli = resolve(root, "node_modules/@playwright/test/cli.js");
const maxCapturedServerLogLength = 1_000_000;

const forbiddenServerLogPatterns = [
  { label: "test e-mail address", pattern: /[A-Z0-9._%+-]+@example\.test/i },
  { label: "test phone number", pattern: /\+9055\d{8,}/ },
  {
    label: "sensitive payload or key field",
    pattern:
      /["']?(?:dataKey|trackingSecret|encryptedPayload|ciphertext)["']?\s*[:=]/i,
  },
  { label: "XSS test marker", pattern: /window\.__(?:e2eXss|decryptXss)/i },
  {
    label: "test identity",
    pattern: /E2E (?:Gizlilik|Yüz Yüze|Ağ Kesintisi)/i,
  },
] as const;

function run(
  executable: string,
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
) {
  return spawn(executable, args, {
    cwd: root,
    env,
    stdio: "inherit",
    windowsHide: true,
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:3100/iletisim");
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }
  throw new Error("E2E test server did not become ready.");
}

async function stopServer(serverProcess: ChildProcess) {
  if (serverProcess.exitCode !== null || serverProcess.signalCode !== null) {
    return;
  }
  serverProcess.kill("SIGKILL");
  await Promise.race([
    once(serverProcess, "exit"),
    new Promise((resolveWait) => setTimeout(resolveWait, 2_000)),
  ]);
}

let capturedServerLogs = "";
const server = spawn(
  process.execPath,
  [nextCli, "start", "--hostname", "127.0.0.1", "--port", "3100"],
  {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  },
);

function captureServerOutput(
  stream: NodeJS.ReadableStream | null,
  destination: NodeJS.WriteStream,
) {
  stream?.on("data", (chunk: Buffer | string) => {
    const output = chunk.toString();
    destination.write(output);

    const remainingLength =
      maxCapturedServerLogLength - capturedServerLogs.length;
    if (remainingLength > 0) {
      capturedServerLogs += output.slice(0, remainingLength);
    }
  });
}

captureServerOutput(server.stdout, process.stdout);
captureServerOutput(server.stderr, process.stderr);

let exitCode = 1;
try {
  await waitForServer();
  const test = run(
    process.execPath,
    [playwrightCli, "test", ...process.argv.slice(2)],
    { ...process.env, PLAYWRIGHT_EXTERNAL_SERVER: "1" },
  );
  const [code] = (await once(test, "exit")) as [number | null];
  exitCode = code ?? 1;
} finally {
  await stopServer(server);
}

const privacyFindings = forbiddenServerLogPatterns
  .filter(({ pattern }) => pattern.test(capturedServerLogs))
  .map(({ label }) => label);

if (privacyFindings.length > 0) {
  console.error(
    `Server log privacy scan failed (${privacyFindings.join(", ")}). Matched values were intentionally omitted.`,
  );
  exitCode = 1;
} else if (exitCode === 0) {
  console.log("Server log privacy scan passed.");
}

process.exitCode = exitCode;
