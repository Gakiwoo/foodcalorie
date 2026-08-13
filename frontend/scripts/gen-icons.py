#!/usr/bin/env python3
"""Generate deterministic Android launcher and splash assets from the rendered design master."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


FRONTEND = Path(__file__).resolve().parents[1]
MASTER_PATH = FRONTEND / "assets" / "brand" / "app-icon-master.png"
RES_PATH = FRONTEND / "android" / "app" / "src" / "main" / "res"
BRAND_GREEN = (34, 168, 90, 255)
DENSITIES = {
    "mdpi": 1.0,
    "hdpi": 1.5,
    "xhdpi": 2.0,
    "xxhdpi": 3.0,
    "xxxhdpi": 4.0,
}


def clamp(value: float) -> float:
    return max(0.0, min(1.0, value))


def load_master() -> Image.Image:
    master = Image.open(MASTER_PATH).convert("RGBA")
    background = Image.new("RGBA", master.size, BRAND_GREEN)
    background.alpha_composite(master)
    return background.convert("RGB")


def rounded_icon(master: Image.Image, size: int, radius_ratio: float) -> Image.Image:
    icon = master.resize((size, size), Image.Resampling.LANCZOS).convert("RGBA")
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, size - 1, size - 1),
        radius=round(size * radius_ratio),
        fill=255,
    )
    icon.putalpha(mask)
    return icon


def extract_symbol(master: Image.Image) -> Image.Image:
    source = master.convert("RGBA")
    output = Image.new("RGBA", source.size, (255, 255, 255, 0))
    source_pixels = source.load()
    output_pixels = output.load()

    for y in range(source.height):
        for x in range(source.width):
            red, green, blue, alpha = source_pixels[x, y]
            maximum = max(red, green, blue)
            minimum = min(red, green, blue)
            saturation = (maximum - minimum) / maximum if maximum else 0.0
            white_score = clamp((0.42 - saturation) / 0.24) * clamp((maximum - 125) / 95)
            warm_score = (
                clamp((red - green + 30) / 75)
                * clamp((green - blue + 20) / 100)
                * clamp((red - 175) / 70)
            )
            keep = max(white_score, warm_score)
            output_pixels[x, y] = (red, green, blue, round(alpha * keep))

    alpha = output.getchannel("A").filter(ImageFilter.GaussianBlur(0.6))
    output.putalpha(alpha)
    bbox = alpha.point(lambda value: 255 if value > 8 else 0).getbbox()
    if not bbox:
        raise RuntimeError("Could not extract the foreground symbol from the app icon master")
    return output.crop(bbox)


def adaptive_foreground(symbol: Image.Image, size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    safe_size = round(size * 0.64)
    symbol.thumbnail((safe_size, safe_size), Image.Resampling.LANCZOS)
    x = (size - symbol.width) // 2
    y = (size - symbol.height) // 2
    canvas.alpha_composite(symbol, (x, y))
    return canvas


def write_launcher_assets(master: Image.Image, symbol: Image.Image) -> None:
    for density, scale in DENSITIES.items():
        legacy_size = round(48 * scale)
        adaptive_size = round(108 * scale)
        target = RES_PATH / f"mipmap-{density}"
        target.mkdir(parents=True, exist_ok=True)
        rounded_icon(master, legacy_size, 0.23).save(target / "ic_launcher.png", optimize=True)
        rounded_icon(master, legacy_size, 0.5).save(target / "ic_launcher_round.png", optimize=True)
        adaptive_foreground(symbol.copy(), adaptive_size).save(
            target / "ic_launcher_foreground.png", optimize=True
        )
        print(f"[android-assets] {density}: legacy={legacy_size}px adaptive={adaptive_size}px")


def write_splash_assets(master: Image.Image) -> None:
    splash = master.resize((192, 192), Image.Resampling.LANCZOS)
    for target in RES_PATH.glob("drawable*/splash.png"):
        splash.save(target, optimize=True)


def validate_assets() -> None:
    for density, scale in DENSITIES.items():
        target = RES_PATH / f"mipmap-{density}"
        expected = {
            "ic_launcher.png": round(48 * scale),
            "ic_launcher_round.png": round(48 * scale),
            "ic_launcher_foreground.png": round(108 * scale),
        }
        for filename, size in expected.items():
            image = Image.open(target / filename)
            if image.size != (size, size):
                raise RuntimeError(f"{target / filename} has invalid dimensions {image.size}")
            if image.mode != "RGBA":
                raise RuntimeError(f"{target / filename} must retain an alpha channel")


def main() -> None:
    master = load_master()
    symbol = extract_symbol(master)
    write_launcher_assets(master, symbol)
    write_splash_assets(master)
    validate_assets()

    background_xml = RES_PATH / "values" / "ic_launcher_background.xml"
    background_xml.write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<resources>\n'
        '    <color name="ic_launcher_background">#22A85A</color>\n'
        '</resources>\n',
        encoding="utf-8",
    )
    print(f"[android-assets] Generated from design master {MASTER_PATH}")


if __name__ == "__main__":
    main()
