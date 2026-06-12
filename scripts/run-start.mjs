import { spawn } from "child_process";
import { removeBrokenJunction, projectRoot } from "./next-dist.mjs";

const root = projectRoot();
removeBrokenJunction(root);

const child = spawn("npx", ["next", "start"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
