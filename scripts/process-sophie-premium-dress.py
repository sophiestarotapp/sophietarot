"""Prepare Sophie Premium Dress PNG: transparent background + preserved face/eyes."""
from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(
    r"C:\Users\MyPC\.cursor\projects\c-Users-MyPC-OneDrive-Desktop-Sophies-Tarot-App\assets"
)
SRC_CANDIDATES = [
    ROOT / "public" / "sophie-premium-dress-source.png",
    ASSETS
    / "c__Users_MyPC_AppData_Roaming_Cursor_User_workspaceStorage_bc8002c09a509e03fad44d0f48ddfa5e_images_Sophie_Premium_Dress-8c5302aa-0907-447c-843e-44cfb87d5e45.png",
    ASSETS
    / "c__Users_MyPC_AppData_Roaming_Cursor_User_workspaceStorage_bc8002c09a509e03fad44d0f48ddfa5e_images_Sophie_Premium_Dress-08b625b0-e162-48e5-8a65-bf3bdfccd763.png",
    ASSETS
    / "c__Users_MyPC_AppData_Roaming_Cursor_User_workspaceStorage_bc8002c09a509e03fad44d0f48ddfa5e_images_Sophie_Premium_Dress-fdb5ec1b-9212-4ac3-9318-b8d7fc836b5e.png",
]
OUT = ROOT / "public" / "sophie-premium-dress.png"


def resolve_source() -> Path:
    for path in SRC_CANDIDATES:
        if path.exists():
            return path
    raise FileNotFoundError("Premium Dress Sophie source PNG not found")


def is_bg(r: int, g: int, b: int) -> bool:
    mx, mn = max(r, g, b), min(r, g, b)
    return mx <= 48 and (mx - mn) <= 22


def is_pink_hair(r: int, g: int, b: int) -> bool:
    return r > 65 and r > g + 5 and b > 50 and g > 40


def is_skin(r: int, g: int, b: int) -> bool:
    return r > 95 and g > 70 and b > 72 and r >= g - 8


def in_face_preserve_zone(y: int, x: int, h: int, w: int) -> bool:
    if y < h * 0.165 or y > h * 0.385:
        return False
    if x < w * 0.22 or x > w * 0.78:
        return False
    return True


def in_eye_zone(y: int, x: int, h: int, w: int) -> bool:
    cy = h * 0.299
    for cx in (w * 0.367, w * 0.597):
        if ((x - cx) / (w * 0.058)) ** 2 + ((y - cy) / (h * 0.048)) ** 2 <= 1.0:
            return True
    return False


def in_hair_cleanup_zone(y: int, x: int, h: int, w: int) -> bool:
    return y < int(h * 0.22) and not in_face_preserve_zone(y, x, h, w)


def restore_preserved_face_from_source(arr: np.ndarray, src_rgb: np.ndarray) -> None:
    h, w = arr.shape[:2]
    for y in range(h):
        for x in range(w):
            if not in_face_preserve_zone(y, x, h, w):
                continue
            sr, sg, sb = map(int, src_rgb[y, x])
            if is_bg(sr, sg, sb):
                arr[y, x, 3] = 0
                continue
            arr[y, x, :3] = src_rgb[y, x]
            arr[y, x, 3] = 255


def restore_eyes_from_source(arr: np.ndarray, src_rgb: np.ndarray) -> None:
    h, w = arr.shape[:2]
    for y in range(h):
        for x in range(w):
            if not in_eye_zone(y, x, h, w):
                continue
            sr, sg, sb = map(int, src_rgb[y, x])
            if is_bg(sr, sg, sb):
                arr[y, x, 3] = 0
                continue
            arr[y, x, :3] = src_rgb[y, x]
            arr[y, x, 3] = 255


def pink_neighbors(arr: np.ndarray, y: int, x: int, radius: int = 5) -> int:
    h, w = arr.shape[:2]
    count = 0
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            if dy == 0 and dx == 0:
                continue
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and arr[ny, nx, 3] > 0:
                if is_pink_hair(*map(int, arr[ny, nx, :3])):
                    count += 1
    return count


def transparent_neighbors(arr: np.ndarray, y: int, x: int, radius: int = 2) -> int:
    h, w = arr.shape[:2]
    count = 0
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            if dy == 0 and dx == 0:
                continue
            ny, nx = y + dy, x + dx
            if not (0 <= ny < h and 0 <= nx < w) or arr[ny, nx, 3] == 0:
                count += 1
    return count


def remove_background(src_rgb: np.ndarray) -> np.ndarray:
    h, w = src_rgb.shape[:2]
    arr = np.zeros((h, w, 4), dtype=np.uint8)
    arr[:, :, :3] = src_rgb
    arr[:, :, 3] = 255

    visited = np.zeros((h, w), dtype=bool)
    queue: deque[tuple[int, int]] = deque()
    for y in range(h):
        for x in (0, w - 1):
            if is_bg(*map(int, arr[y, x, :3])):
                visited[y, x] = True
                queue.append((y, x))
    for x in range(w):
        for y in (0, h - 1):
            if is_bg(*map(int, arr[y, x, :3])) and not visited[y, x]:
                visited[y, x] = True
                queue.append((y, x))
    while queue:
        y, x = queue.popleft()
        arr[y, x, 3] = 0
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_bg(*map(int, arr[ny, nx, :3])):
                visited[ny, nx] = True
                queue.append((ny, nx))
    return arr


def hair_color(arr: np.ndarray, hair_cut: int) -> np.ndarray:
    pink_mask = (
        (arr[:hair_cut, :, 3] > 0)
        & (arr[:hair_cut, :, 0] > 65)
        & (arr[:hair_cut, :, 0] > arr[:hair_cut, :, 1] + 5)
    )
    if pink_mask.any():
        return arr[:hair_cut, :, :3][pink_mask].mean(axis=0)
    return np.array([223.0, 179.0, 186.0])


def fill_hair_gaps(arr: np.ndarray, color: np.ndarray, hair_cut: int) -> None:
    h, w = arr.shape[:2]
    for y in range(hair_cut):
        for x in range(w):
            if not in_hair_cleanup_zone(y, x, h, w) or arr[y, x, 3] == 0:
                continue
            r, g, b = map(int, arr[y, x, :3])
            if is_skin(r, g, b) or max(r, g, b) > 72:
                continue
            if pink_neighbors(arr, y, x) < 4:
                continue
            arr[y, x, :3] = color.astype(np.uint8)
            arr[y, x, 3] = 255


def remove_dark_halos(arr: np.ndarray, color: np.ndarray, hair_cut: int) -> None:
    h, w = arr.shape[:2]
    for y in range(hair_cut):
        for x in range(w):
            if not in_hair_cleanup_zone(y, x, h, w) or arr[y, x, 3] == 0:
                continue
            r, g, b = map(int, arr[y, x, :3])
            if is_skin(r, g, b) or max(r, g, b) > 58:
                continue
            pink_n = pink_neighbors(arr, y, x, radius=4)
            trans_n = transparent_neighbors(arr, y, x, radius=2)
            if trans_n >= 8 and pink_n >= 2:
                arr[y, x, 3] = 0
            elif pink_n >= 5:
                arr[y, x, :3] = color.astype(np.uint8)


def soften_hair_fringe(arr: np.ndarray, color: np.ndarray, hair_cut: int) -> None:
    h, w = arr.shape[:2]
    for y in range(hair_cut):
        for x in range(w):
            if not in_hair_cleanup_zone(y, x, h, w) or arr[y, x, 3] == 0:
                continue
            r, g, b = map(int, arr[y, x, :3])
            if is_skin(r, g, b) or max(r, g, b) > 80:
                continue
            if pink_neighbors(arr, y, x, radius=6) < 6:
                continue
            arr[y, x, :3] = color.astype(np.uint8)


def polish_hair(arr: np.ndarray, color: np.ndarray, hair_cut: int) -> None:
    h, w = arr.shape[:2]
    for y in range(hair_cut):
        for x in range(w):
            if not in_hair_cleanup_zone(y, x, h, w) or arr[y, x, 3] == 0:
                continue
            r, g, b = map(int, arr[y, x, :3])
            if is_skin(r, g, b) or max(r, g, b) > 68:
                continue
            if pink_neighbors(arr, y, x, radius=4) < 3:
                continue
            arr[y, x, :3] = color.astype(np.uint8)


def trim_transparent(arr: np.ndarray, pad: int = 2) -> np.ndarray:
    ys, xs = np.where(arr[:, :, 3] > 0)
    h, w = arr.shape[:2]
    return arr[
        max(0, ys.min() - pad) : min(h, ys.max() + pad + 1),
        max(0, xs.min() - pad) : min(w, xs.max() + pad + 1),
    ]


def main() -> None:
    src_path = resolve_source()
    src_rgb = np.array(Image.open(src_path).convert("RGB"), dtype=np.uint8)
    h = src_rgb.shape[0]
    hair_cut = int(h * 0.22)

    arr = remove_background(src_rgb)
    color = hair_color(arr, hair_cut)
    fill_hair_gaps(arr, color, hair_cut)
    remove_dark_halos(arr, color, hair_cut)
    soften_hair_fringe(arr, color, hair_cut)
    polish_hair(arr, color, hair_cut)
    restore_preserved_face_from_source(arr, src_rgb)
    restore_eyes_from_source(arr, src_rgb)
    arr = trim_transparent(arr)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(arr).save(OUT, "PNG", compress_level=1, optimize=False)
    ch, cw = arr.shape[:2]

    top = arr[: int(ch * 0.45), :, :]
    dark = (top[:, :, :3].max(axis=2) <= 60) & (top[:, :, 3] > 0)
    print(f"Source: {src_path}")
    print(f"Wrote {OUT} ({cw}x{ch}), aspect={ch / cw:.4f}")
    print(f"Remaining dark pixels in hair zone: {dark.sum()}")


if __name__ == "__main__":
    main()
