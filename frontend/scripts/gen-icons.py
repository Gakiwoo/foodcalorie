#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""食刻品牌图标生成：adaptive icon（前景+背景）+ legacy + round + splash
设计：绿色渐变圆角背景 + 白色餐盘（叉勺简笔），与 App 品牌色一致（#34C759→#22A85A）
"""
import os
from PIL import Image, ImageDraw

RES = r"E:\00-Vibeo Coding\Foodcalorie\frontend\android\app\src\main\res"
DENSITIES = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
G1, G2 = (0x34, 0xC7, 0x59), (0x22, 0xA8, 0x5A)  # 品牌渐变

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def draw_plate(d, cx, cy, r, s):
    """白餐盘：外环 + 内碟"""
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline="white", width=max(3, int(6 * s)))
    d.ellipse([cx - r * 0.6, cy - r * 0.6, cx + r * 0.6, cy + r * 0.6], fill="white")

def draw_fork(d, x, y1, y2, s):
    """叉：柄 + 4 齿"""
    w = max(3, int(6 * s))
    d.line([(x, y1 + 8), (x, y2)], fill="white", width=w)
    for dx in (-13, -4.5, 4.5, 13):
        d.line([(x + dx * s, y1 - 4), (x, y1 + 6)], fill="white", width=max(2, int(w * 0.85)))

def draw_spoon(d, x, y1, y2, s):
    """勺：柄 + 椭圆头"""
    w = max(3, int(6.5 * s))
    d.line([(x, y1 + 12), (x, y2)], fill="white", width=w)
    d.ellipse([x - 9 * s, y1 - 8 * s, x + 9 * s, y1 + 12 * s], fill="white")

def draw_content(img, d, size):
    """盘 + 叉勺（叉勺交叉于盘上方，盘最后画在前层遮挡交叉点）"""
    s = size / 108.0
    # 叉勺（后层）
    draw_spoon(d, size * 0.35, size * 0.20, size * 0.52, s)
    draw_fork(d, size * 0.65, size * 0.20, size * 0.52, s)
    # 盘（前层，遮挡交叉）
    draw_plate(d, size * 0.5, size * 0.58, size * 0.23, s)

def make_full_icon(size, round_corners=False):
    """完整图标：渐变背景 + 内容"""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = size // 4 if not round_corners else size // 2
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=255)
    bg = Image.new("RGBA", (size, size), G1)
    for y in range(size):
        t = y / size
        ImageDraw.Draw(bg).line([(0, y), (size, y)], fill=lerp(G1, G2, t))
    img.paste(bg, (0, 0), mask)
    draw_content(img, d, size)
    return img

def make_foreground(size):
    """adaptive 前景：透明底 + 内容（居中安全区）"""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    draw_content(img, d, size)
    return img

def main():
    for name, mult in DENSITIES.items():
        size = int(48 * mult)
        make_full_icon(size).save(os.path.join(RES, f"mipmap-{name}", "ic_launcher.png"))
        make_full_icon(size, round_corners=True).save(os.path.join(RES, f"mipmap-{name}", "ic_launcher_round.png"))
        make_foreground(size).save(os.path.join(RES, f"mipmap-{name}", "ic_launcher_foreground.png"))
        print(f"[{name}] {size}px 完成")
    # splash 覆盖
    splash = make_full_icon(192)
    for folder in ("drawable", "drawable-land-hdpi", "drawable-land-mdpi", "drawable-land-xhdpi",
                   "drawable-land-xxhdpi", "drawable-land-xxxhdpi", "drawable-port-hdpi",
                   "drawable-port-mdpi", "drawable-port-xhdpi", "drawable-port-xxhdpi",
                   "drawable-port-xxxhdpi", "drawable-hdpi", "drawable-xhdpi", "drawable-xxhdpi",
                   "drawable-xxxhdpi"):
        p = os.path.join(RES, folder)
        if os.path.isdir(p):
            splash.save(os.path.join(p, "splash.png"))
    print("splash.png 已覆盖各 density 目录")
    # adaptive XML
    os.makedirs(os.path.join(RES, "mipmap-anydpi-v26"), exist_ok=True)
    xml = ('<?xml version="1.0" encoding="utf-8"?>\n'
           '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
           '    <background android:drawable="@color/ic_launcher_background"/>\n'
           '    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n'
           '    <monochrome android:drawable="@mipmap/ic_launcher_foreground"/>\n'
           '</adaptive-icon>\n')
    for f in ("ic_launcher.xml", "ic_launcher_round.xml"):
        with open(os.path.join(RES, "mipmap-anydpi-v26", f), "w", encoding="utf-8") as fh:
            fh.write(xml)
    # 背景色
    colors = os.path.join(RES, "values", "colors.xml")
    if os.path.exists(colors):
        with open(colors, "r", encoding="utf-8") as fh:
            content = fh.read()
        if "ic_launcher_background" not in content:
            content = content.replace("</resources>",
                                      '    <color name="ic_launcher_background">#22A85A</color>\n</resources>')
            with open(colors, "w", encoding="utf-8") as fh:
                fh.write(content)
    print("全部完成 ✅")

if __name__ == "__main__":
    main()
