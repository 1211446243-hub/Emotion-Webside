import { spawn } from "node:child_process";
import { rename, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const holds = [
  ["app/api", ".api-export-hold"],
  ["app/debug", ".debug-export-hold"],
];

async function moveAside() {
  for (const [from, to] of holds) await rename(path.join(root, from), path.join(root, to));
}

async function restore() {
  for (const [from, to] of [...holds].reverse()) {
    await rename(path.join(root, to), path.join(root, from)).catch(() => undefined);
  }
}

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
await rm(path.join(root, ".next", "dev"), { recursive: true, force: true });
await moveAside();
let code = 1;
try {
  code = await new Promise((resolve) => {
    const child = spawn(process.execPath, [nextBin, "build"], {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, GITHUB_PAGES: "1" },
    });
    child.on("exit", (status) => resolve(status ?? 1));
  });
} finally {
  await restore();
}
process.exit(code);
