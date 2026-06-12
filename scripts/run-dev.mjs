import { spawn } from "child_process";
import { stopAllDevServers } from "./dev-server.mjs";
import {
  cleanLegacyExternalCache,
  prepareForDev,
  projectRoot,
} from "./next-dist.mjs";

const fresh = process.argv.includes("--fresh");
const root = projectRoot();

// Kill stale dev servers so build/dev never fight over the same .next folder.
await stopAllDevServers();

cleanLegacyExternalCache();
prepareForDev(root, { fresh });

const child = spawn("npx", ["next", "dev", "--turbopack"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

const shutdown = () => {
  child.kill("SIGTERM");
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
