"""Remove black backgrounds from right-rail icon PNGs."""
from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(
    r"C:\Users\MyPC\.cursor\projects\c-Users-MyPC-OneDrive-Desktop-Sophies-Tarot-App\assets"
)
OUT = ROOT / "public" / "rail"

ICONS = {
    "events.png": "c__Users_MyPC_AppData_Roaming_Cursor_User_workspaceStorage_bc8002c09a509e03fad44d0f48ddfa5e_images_Events_Icon-8c604b1f-2d7d-48b7-8acf-5b03cc3a6f9b.png",
    "wardrobe.png": "c__Users_MyPC_AppData_Roaming_Cursor_User_workspaceStorage_bc8002c09a509e03fad44d0f48ddfa5e_images_Style_Icon-c34bb315-38cc-4edb-afc5-33507fa7f76d.png",
    "gift.png": "c__Users_MyPC_AppData_Roaming_Cursor_User_workspaceStorage_bc8002c09a509e03fad44d0f48ddfa5e_images_Gift_Icon-d085e31e-54bb-4d5e-9e08-961e69518671.png",
    "notifications.png": "c__Users_MyPC_AppData_Roaming_Cursor_User_workspaceStorage_bc8002c09a509e03fad44d0f48ddfa5e_images_Notifications_Icon-1d815138-981a-4c8e-8aad-3b758c110181.png",
}


def is_bg(r: int, g: int, b: int) -> bool:
    mx, mn = max(r, g, b), min(r, g, b)
    return mx <= 42 and (mx - mn) <= 20


def remove_bg(arr: np.ndarray) -> np.ndarray:
    h, w = arr.shape[:2]
    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[:, :, :3] = arr[:, :, :3]
    out[:, :, 3] = 255

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
        return out
    pad = 2
    y0, y1 = max(0, ys.min() - pad), min(h, ys.max() + pad + 1)
    x0, x1 = max(0, xs.min() - pad), min(w, xs.max() + pad + 1)
    return out[y0:y1, x0:x1]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, src_name in ICONS.items():
        src = ASSETS / src_name
        if not src.exists():
            raise FileNotFoundError(src)
        arr = np.array(Image.open(src).convert("RGBA"))
        result = remove_bg(arr)
        dest = OUT / name
        Image.fromarray(result).save(dest, "PNG")
        print(f"Wrote {dest} ({result.shape[1]}x{result.shape[0]})")


if __name__ == "__main__":
    main()
