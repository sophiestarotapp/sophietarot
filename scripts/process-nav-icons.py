"""Remove black backgrounds from nav icon PNGs."""
from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(
    r"C:\Users\MyPC\.cursor\projects\c-Users-MyPC-OneDrive-Desktop-Sophies-Tarot-App\assets"
)
OUT = ROOT / "public" / "nav"

ICONS = {
    "home.png": "c__Users_MyPC_AppData_Roaming_Cursor_User_workspaceStorage_bc8002c09a509e03fad44d0f48ddfa5e_images_Home_Icon-81f8781e-14b3-48eb-8ab2-80a9ad570398.png",
    "novels.png": "c__Users_MyPC_AppData_Roaming_Cursor_User_workspaceStorage_bc8002c09a509e03fad44d0f48ddfa5e_images_Novels_Icon-fccdb66a-aa02-4ced-8b54-89db359fed5d.png",
    "collectibles.png": "c__Users_MyPC_AppData_Roaming_Cursor_User_workspaceStorage_bc8002c09a509e03fad44d0f48ddfa5e_images_Collectibles_Icon-571b58c3-130a-4055-860a-ed00124aac7e.png",
    "shop.png": "c__Users_MyPC_AppData_Roaming_Cursor_User_workspaceStorage_bc8002c09a509e03fad44d0f48ddfa5e_images_Shop_Icon-21ed0ed2-9e3c-4c39-8017-ca5d364bab7c.png",
    "profile.png": "c__Users_MyPC_AppData_Roaming_Cursor_User_workspaceStorage_bc8002c09a509e03fad44d0f48ddfa5e_images_Profile_Icon-b17da5f6-e780-420e-b349-234017f31bd5.png",
}


def is_bg(r: int, g: int, b: int) -> bool:
    mx, mn = max(r, g, b), min(r, g, b)
    return mx <= 42 and (mx - mn) <= 20


def remove_bg(arr: np.ndarray) -> np.ndarray:
    h, w = arr.shape[:2]
    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[:, :, :3] = arr[:, :, :3] if arr.shape[2] == 3 else arr[:, :, :3]
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
