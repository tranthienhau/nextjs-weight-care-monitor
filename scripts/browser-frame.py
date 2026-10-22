"""Wrap desktop screenshots in a light browser-window frame (title bar + URL pill)."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

URLS = {
    "d1": "/sign-in", "d2": "/today", "d3": "/patients/p-alvarez", "d4": "/patients/p-alvarez/body",
    "d5": "/review", "d6": "/review/p-alvarez", "d7": "/more/reports", "d8": "/portal",
}
HOST = "nextjs-weight-care-monitor.vercel.app"
font_path = sys.argv[1] if len(sys.argv) > 1 else None


def frame(src: Path) -> None:
    shot = Image.open(src).convert("RGB")
    w, h = shot.size
    bar, pad, radius = 52, 28, 14
    win = Image.new("RGB", (w, h + bar), "#FFFFFF")
    d = ImageDraw.Draw(win)
    d.rectangle((0, 0, w, bar), fill="#EEF1F8")
    for i, c in enumerate(("#FF5F57", "#FEBC2E", "#28C840")):
        d.ellipse((20 + i * 22, 20, 32 + i * 22, 32), fill=c)
    url = HOST + URLS.get(src.stem[:2], "")
    font = ImageFont.truetype(font_path, 17) if font_path else ImageFont.load_default()
    pill_w = min(760, w - 260)
    x0 = (w - pill_w) // 2
    d.rounded_rectangle((x0, 11, x0 + pill_w, 41), radius=15, fill="#FFFFFF", outline="#DDE2EE")
    d.text((x0 + 36, 16), url, fill="#4A5068", font=font)
    d.text((x0 + 14, 15), "•", fill="#16A34A", font=font)
    win.paste(shot, (0, bar))
    mask = Image.new("L", win.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, win.width - 1, win.height - 1), radius=radius, fill=255)
    out = Image.new("RGBA", (win.width + pad * 2, win.height + pad * 2), (0, 0, 0, 0))
    shadow = Image.new("RGBA", out.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((pad, pad + 8, pad + win.width, pad + win.height + 8), radius=radius, fill=(12, 16, 31, 60))
    out = Image.alpha_composite(out, shadow.filter(ImageFilter.GaussianBlur(14)))
    out.paste(win, (pad, pad), mask)
    bg = Image.new("RGB", out.size, "#F4F6FC")
    bg.paste(out, (0, 0), out)
    bg.save(src, optimize=True)


for p in sorted(Path("screenshots").glob("d[0-9]-desktop-*.png")):
    frame(p)
    print("framed", p.name)
