#!/usr/bin/env python3
"""Draw every JPG shipped with Palm Bay Heat, procedurally, with Pillow.

Each sample scene is a Leonida coastline vignette (sunset gradient sky,
sea, palm silhouettes, skyline, boulevard, a car) with per-file variation.
Screenshots are multi-panel cover compositions titled PALM BAY HEAT,
reusing the same scene painter at panel scale. Run from the repo root:

    python3 tools/make_images.py
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def font(size, bold=True):
    names = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for name in names:
        if os.path.exists(name):
            return ImageFont.truetype(name, size)
    return ImageFont.load_default()


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def sky(draw, w, h, top, mid, low, horizon=0.62):
    hh = int(h * horizon)
    for y in range(hh):
        t = y / max(hh - 1, 1)
        col = lerp(top, mid, t * 1.6) if t < 0.62 else lerp(mid, low, (t - 0.62) / 0.38)
        draw.line([(0, y), (w, y)], fill=col)
    return hh


def sun(draw, cx, cy, r, core=(255, 236, 170), glow=(255, 140, 60)):
    for rr in range(r * 2, r, -6):
        t = (rr - r) / r
        draw.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=lerp(glow, core, 1 - t))
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=core)


def sea(draw, w, h, horizon_y, top=(38, 90, 140), deep=(10, 30, 70), rng=None):
    for y in range(horizon_y, h):
        t = (y - horizon_y) / max(h - horizon_y - 1, 1)
        draw.line([(0, y), (w, y)], fill=lerp(top, deep, t))
    if rng:
        for _ in range(int(w * 0.25)):
            x = rng.uniform(0, w)
            y = rng.uniform(horizon_y + 4, h - 4)
            ln = rng.uniform(6, 42) * (0.4 + (y - horizon_y) / max(h - horizon_y, 1))
            draw.line([(x, y), (x + ln, y)], fill=(255, 190, 120), width=2)


def skyline(draw, w, base_y, rng, dark=(24, 16, 44), lit=(255, 205, 92)):
    x = -10
    while x < w:
        bw = rng.randint(int(w * 0.05), int(w * 0.11))
        bh = rng.randint(int(base_y * 0.18), int(base_y * 0.52))
        draw.rectangle([x, base_y - bh, x + bw, base_y], fill=dark)
        if rng.random() < 0.5:
            draw.polygon([(x + bw * 0.3, base_y - bh), (x + bw * 0.5, base_y - bh - 14),
                          (x + bw * 0.7, base_y - bh)], fill=dark)
        for _ in range(bh // 16):
            wx = x + rng.randint(4, max(bw - 8, 5))
            wy = base_y - bh + rng.randint(4, max(bh - 10, 5))
            if rng.random() < 0.65:
                draw.rectangle([wx, wy, wx + 4, wy + 6], fill=lit)
        x += bw + rng.randint(2, 10)


def palm(draw, x, base_y, scale, col=(12, 26, 20), bend=1):
    trunk_top = base_y - int(150 * scale)
    pts = []
    for i in range(21):
        t = i / 20
        pts.append((x + bend * int(46 * scale * t * t), base_y - int(150 * scale * t)))
    draw.line(pts, fill=col, width=max(3, int(9 * scale)))
    tx, ty = pts[-1]
    for ang in range(-165, 15, 30):
        rad = math.radians(ang)
        ex = tx + int(math.cos(rad) * 95 * scale)
        ey = ty + int(math.sin(rad) * 55 * scale) + int(26 * scale)
        draw.arc([min(tx, ex) - 10, min(ty, ey) - 26, max(tx, ex) + 10, max(ty, ey) + 30],
                 start=0, end=360, fill=col, width=max(2, int(6 * scale)))
        draw.line([(tx, ty), (ex, ey)], fill=col, width=max(2, int(5 * scale)))


def car(draw, cx, cy, scale, body=(232, 49, 92), dark=(16, 14, 22)):
    w, h = int(300 * scale), int(64 * scale)
    draw.rounded_rectangle([cx - w // 2, cy - h, cx + w // 2, cy], radius=int(18 * scale), fill=body)
    cw = int(w * 0.52)
    draw.polygon([(cx - cw // 2, cy - h), (cx - cw // 4, cy - h - int(44 * scale)),
                  (cx + cw // 3, cy - h - int(44 * scale)), (cx + cw // 2, cy - h)],
                 fill=body)
    draw.rectangle([cx - cw // 5, cy - h - int(36 * scale), cx + cw // 6, cy - h - 4],
                   fill=(150, 220, 245))
    for wx in (cx - int(w * 0.32), cx + int(w * 0.32)):
        r = int(26 * scale)
        draw.ellipse([wx - r, cy - r, wx + r, cy + r], fill=dark)
        draw.ellipse([wx - r // 2, cy - r // 2, wx + r // 2, cy + r // 2], fill=(210, 210, 220))
    hl = max(3, int(10 * scale))
    draw.rectangle([cx - w // 2, cy - hl, cx - w // 2 + int(16 * scale), cy - 1],
                   fill=(255, 240, 170))


def beach_road(draw, w, h, horizon_y, rng):
    sand_y = int(h * 0.86)
    draw.rectangle([0, sand_y, w, h], fill=(233, 196, 138))
    draw.polygon([(0, h), (int(w * 0.38), sand_y), (int(w * 0.62), sand_y), (w, h)],
                 fill=(52, 48, 60))
    for i in range(6):
        t = i / 6
        y = sand_y + (h - sand_y) * t
        half = 6 + (w * 0.30 - 6) * t
        draw.line([(w / 2 - 3, y), (w / 2 + 3, y + 8 + 10 * t)], fill=(255, 214, 90), width=3)


def scene(w, h, seed, variant):
    rng = random.Random(seed)
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img)
    palettes = {
        "hero": ((58, 24, 92), (255, 94, 98), (255, 178, 84)),
        "pier": ((16, 20, 70), (120, 40, 140), (255, 110, 160)),
        "boulevard": ((30, 44, 110), (240, 110, 80), (255, 200, 110)),
    }
    top, mid, low = palettes[variant]
    hy = sky(d, w, h, top, mid, low)
    sun(d, int(w * (0.68 if variant != "pier" else 0.3)), int(hy * 0.62),
        int(h * 0.085))
    skyline(d, w, hy, rng)
    sea(d, w, h, hy, rng=rng)
    beach_road(d, w, h, hy, rng)
    palm(d, int(w * 0.12), int(h * 0.97), h / 900, bend=1)
    palm(d, int(w * 0.9), int(h * 0.99), h / 1050, bend=-1)
    if variant != "pier":
        car(d, int(w * 0.5), int(h * 0.965), h / 1400)
    else:
        # Pier posts + string lights for the pier variant.
        for px in range(int(w * 0.08), w, int(w * 0.16)):
            d.rectangle([px, int(h * 0.66), px + 10, int(h * 0.94)], fill=(30, 20, 26))
        d.line([(0, int(h * 0.66)), (w, int(h * 0.6))], fill=(30, 20, 26), width=8)
        for i in range(24):
            t = i / 23
            x = t * w
            y = h * 0.66 - t * h * 0.06 + math.sin(t * math.pi) * 16
            d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=(255, 220, 130))
    return img


def cover(w, h, seed, layout="classic", editor=False):
    rng = random.Random(seed)
    img = Image.new("RGB", (w, h), (10, 8, 18))
    d = ImageDraw.Draw(img)
    variants = ["hero", "pier", "boulevard"]
    if layout == "classic":
        panels = [(0, 0, .62, .58, 0), (.62, 0, .38, .34, 1), (.62, .34, .38, .24, 2),
                  (0, .58, .34, .42, 1), (.34, .58, .33, .42, 2), (.67, .58, .33, .42, 0)]
    elif layout == "triptych":
        panels = [(0, 0, .34, 1, 0), (.34, 0, .33, 1, 1), (.67, 0, .33, 1, 2)]
    else:
        panels = [(0, 0, 1, .68, 0), (0, .68, .34, .32, 1), (.34, .68, .33, .32, 2),
                  (.67, .68, .33, .32, 0)]
    gut = max(4, w // 130)
    for (x, y, pw, ph, vi) in panels:
        px, py = int(x * w) + gut // 2, int(y * h) + gut // 2
        pwid, phgt = int(pw * w) - gut, int(ph * h) - gut
        tile = scene(max(pwid, 60), max(phgt, 60), seed + vi * 17, variants[vi])
        img.paste(tile, (px, py))
        d.rectangle([px, py, px + pwid, py + phgt], outline=(245, 240, 230), width=3)
    # Title block.
    for y in range(int(h * 0.55), h):
        t = (y - h * 0.55) / (h * 0.45)
        d.line([(0, y), (w, y)], fill=lerp((10, 8, 18), (10, 8, 18), 0))
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(int(h * 0.55), h):
        a = int(190 * (y - h * 0.55) / (h * 0.45))
        od.line([(0, y), (w, y)], fill=(5, 2, 10, a))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    d = ImageDraw.Draw(img)
    size = int(min(w * 0.15, h * 0.13))
    f = font(size)
    for i, line in enumerate(["PALM BAY", "HEAT"]):
        y = int(h * 0.86) - (1 - i) * int(size * 1.05)
        d.text((w / 2, y), line, font=f, anchor="mb", fill=(255, 190, 60),
               stroke_width=max(3, size // 12), stroke_fill=(18, 6, 15))
    sf = font(int(size * 0.26))
    d.text((w / 2, int(h * 0.9)), "WELCOME BACK TO LEONIDA", font=sf, anchor="ma",
           fill=(255, 255, 255))
    # Price sticker.
    cx, cy, r = int(w * 0.86), int(h * 0.15), int(min(w, h) * 0.105)
    pts = []
    for i in range(24):
        ang = i / 24 * math.tau
        rad = r if i % 2 == 0 else r * 0.86
        pts.append((cx + math.cos(ang) * rad, cy + math.sin(ang) * rad))
    d.polygon(pts, fill=(255, 210, 31), outline=(20, 16, 10))
    pf = font(int(r * 0.52))
    d.text((cx, cy), "$69", font=pf, anchor="mm", fill=(20, 16, 10))
    if editor:
        d.rectangle([0, 0, w, int(h * 0.07)], fill=(24, 14, 44))
        ef = font(int(h * 0.032))
        d.text((18, int(h * 0.035)), "PALM BAY HEAT — COVER STUDIO  |  LAYOUT: CLASSIC  |  GRADE: LEONIDA SUNSET",
               font=ef, anchor="lm", fill=(230, 210, 255))
    return img


def save(img, rel, quality=88):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, quality=quality)
    print(f"wrote {rel} {img.size[0]}x{img.size[1]}")


def main():
    save(scene(1200, 900, 101, "hero"), "app/samples/hero.jpg")
    save(scene(1200, 900, 202, "pier"), "app/samples/pier.jpg")
    save(scene(1200, 900, 303, "boulevard"), "app/samples/boulevard.jpg")
    save(cover(1000, 1400, 11, "classic"), "screenshots/1-cover.jpg")
    save(cover(1400, 1000, 22, "classic", editor=True), "screenshots/2-editor.jpg")
    save(cover(1000, 1500, 33, "triptych"), "screenshots/3-cover-portrait.jpg")
    save(cover(1200, 1200, 44, "band"), "screenshots/4-cover-square.jpg")


if __name__ == "__main__":
    main()
