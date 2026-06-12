import { spawn } from "child_process";
import { stopAllDevServers } from "./dev-server.mjs";
import {
  cleanLegacyExternalCache,
  prepareForBuild,
  projectRoot,
} from "./next-dist.mjs";

const root = projectRoot();

console.log("[build] Stopping dev server (prevents .next cache conflicts)...");
await stopAllDevServers();

cleanLegacyExternalCache();
prepareForBuild(root);

const child = spawn("npx", ["next", "build", "--turbopack"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
