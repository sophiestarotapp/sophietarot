import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function projectRoot() {
  return path.join(__dirname, "..");
}

export function getNextDir(root = projectRoot()) {
  return path.join(root, ".next");
}

/** Remove broken external-cache junction from earlier setups. */
export function removeBrokenJunction(root = projectRoot()) {
  const nextDir = getNextDir(root);
  if (!fs.existsSync(nextDir)) return;

  try {
    const stat = fs.lstatSync(nextDir);
    if (stat.isSymbolicLink()) {
      fs.rmSync(nextDir, { recursive: true, force: true });
    }
  } catch {
    /* ignore */
  }
}

export function cleanNextDir(root = projectRoot()) {
  const nextDir = getNextDir(root);
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
  }
}

/** Fix common corruption: prod build leftovers, orphan tmp manifests, OneDrive half-writes. */
export function repairDevCache(root = projectRoot()) {
  const nextDir = getNextDir(root);
  if (!fs.existsSync(nextDir)) return false;

  // Production build output breaks the dev server — wipe and restart clean.
  if (fs.existsSync(path.join(nextDir, "BUILD_ID"))) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    return true;
  }

  const devStatic = path.join(nextDir, "static", "development");
  if (!fs.existsSync(devStatic)) return false;

  let files = [];
  try {
    files = fs.readdirSync(devStatic);
  } catch {
    fs.rmSync(nextDir, { recursive: true, force: true });
    return true;
  }

  const hasTmp = files.some((f) => f.includes(".tmp"));
  const hasManifest = files.some((f) => f === "_buildManifest.js");

  // Orphan .tmp manifests from OneDrive / interrupted writes → guaranteed 500s.
  if (hasTmp || !hasManifest) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    return true;
  }

  return false;
}

export function prepareForDev(root = projectRoot(), { fresh = false } = {}) {
  removeBrokenJunction(root);

  if (fresh) {
    cleanNextDir(root);
    console.log("[dev] Cleared .next cache.");
    return;
  }

  if (repairDevCache(root)) {
    console.log("[dev] Repaired corrupted .next cache.");
  }
}

export function prepareForBuild(root = projectRoot()) {
  removeBrokenJunction(root);
  cleanNextDir(root);
  console.log("[build] Cleared .next for a clean production build.");
}

/** Also remove legacy external cache folder from failed distDir experiments. */
export function cleanLegacyExternalCache() {
  const base = process.env.LOCALAPPDATA;
  if (!base) return;
  const legacy = path.join(base, "sophies-tarot-next");
  if (fs.existsSync(legacy)) {
    fs.rmSync(legacy, { recursive: true, force: true });
  }
}
