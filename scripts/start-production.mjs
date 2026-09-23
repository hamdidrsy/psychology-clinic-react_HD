import { spawn } from "node:child_process";
import { resolve } from "node:path";

const port =
  process.env.PORT ??
  (process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_ID
    ? "8080"
    : "3000");
const parsedPort = Number(port);

if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65_535) {
  throw new Error("PORT 1-65535 arasında tam sayı olmalıdır.");
}

const nextCli = resolve(process.cwd(), "node_modules/next/dist/bin/next");
const child = spawn(
  process.execPath,
  [nextCli, "start", "--hostname", "0.0.0.0", "--port", port],
  { stdio: "inherit", windowsHide: true },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => child.kill(signal));
}

child.once("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
