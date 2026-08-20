import { type ChildProcess, spawn } from "node:child_process";
import { once } from "node:events";
import { resolve } from "node:path";

const root = process.cwd();
const nextCli = resolve(root, "node_modules/next/dist/bin/next");
const playwrightCli = resolve(root, "node_modules/@playwright/test/cli.js");

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

const server = run(process.execPath, [
  nextCli,
  "start",
  "--hostname",
  "127.0.0.1",
  "--port",
  "3100",
]);

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

process.exitCode = exitCode;
