"""Prepare official tarot card back PNG."""
from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(
    r"C:\Users\MyPC\.cursor\projects\c-Users-MyPC-OneDrive-Desktop-Sophies-Tarot-App\assets"
)
SRC = ASSETS / (
    "c__Users_MyPC_AppData_Roaming_Cursor_User_workspaceStorage_bc8002c09a509e03fad44d0f48ddfa5e_images_"
    "Tarot_Card_Icon-c3542460-ed56-4e57-9e56-9235ce7b4185.png"
)
OUT = ROOT / "public" / "tarot" / "card-back.png"


def is_bg(r: int, g: int, b: int) -> bool:
    mx, mn = max(r, g, b), min(r, g, b)
    return mx <= 42 and (mx - mn) <= 20


def main() -> None:
    arr = np.array(Image.open(SRC).convert("RGBA"))
    h, w = arr.shape[:2]
    out = arr.copy()

    visited = np.zeros((h, w), dtype=bool)
    queue: deque[tuple[int, int]] = deque()
    for y in range(h):
        for x in (0, w - 1):
            if is_bg(*out[y, x, :3]):
                visited[y, x] = True
                queue.append((y, x))
    for x in range(w):
        for y in (0, h - 1):
            if is_bg(*out[y, x, :3]) and not visited[y, x]:
                visited[y, x] = True
                queue.append((y, x))
    while queue:
        y, x = queue.popleft()
        out[y, x, 3] = 0
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_bg(*out[ny, nx, :3]):
                visited[ny, nx] = True
                queue.append((ny, nx))

    ys, xs = np.where(out[:, :, 3] > 0)
    if len(ys) == 0:
        raise SystemExit("No opaque pixels found in source image.")

    pad = 2
    y0, y1 = max(0, ys.min() - pad), min(h, ys.max() + pad + 1)
    x0, x1 = max(0, xs.min() - pad), min(w, xs.max() + pad + 1)
    cropped = out[y0:y1, x0:x1]

    OUT.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(cropped).save(OUT, "PNG", compress_level=1, optimize=False)
    print(f"Wrote {OUT} ({cropped.shape[1]}x{cropped.shape[0]})")


if __name__ == "__main__":
    main()
