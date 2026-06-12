import net from "net";
import { execSync } from "child_process";

export function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(true));
    server.once("listening", () => {
      server.close();
      resolve(false);
    });
    server.listen(port, "127.0.0.1");
  });
}

export async function isDevRunning(port = 3000) {
  return isPortInUse(port);
}

function getListeningPids(port) {
  if (process.platform === "win32") {
    try {
      const out = execSync(
        `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique"`,
        { encoding: "utf8" }
      );
      return out
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((pid) => pid && /^\d+$/.test(pid));
    } catch {
      return [];
    }
  }

  try {
    const out = execSync(`lsof -ti tcp:${port}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return out
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

/** Stop whatever is listening on the dev port (prevents dev + build cache fights). */
export async function stopDevServer(port = 3000) {
  const pids = getListeningPids(port);
  if (pids.length === 0) return;

  for (const pid of pids) {
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /PID ${pid} /F /T`, { stdio: "ignore" });
      } else {
        execSync(`kill -9 ${pid}`, { stdio: "ignore" });
      }
    } catch {
      /* already gone */
    }
  }
}

/** Stop common Next.js dev ports so only one server owns .next. */
export async function stopAllDevServers() {
  for (const port of [3000, 3001, 3002, 3003]) {
    await stopDevServer(port);
  }
  // Give Windows a moment to release the port after taskkill.
  await new Promise((resolve) => setTimeout(resolve, 800));
}
