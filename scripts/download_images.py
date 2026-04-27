#!/usr/bin/env python3
"""
Download and process NBA player images from players.yaml.

For each player with image_url, downloads the image, converts to JPEG,
saves two sizes, computes sha256, and updates players.yaml.

Output layout:
  assets/images/full/{id}.jpg   — max 512px on longest side
  assets/images/thumb/{id}.jpg  — 256×256 center crop

Usage:
  python scripts/download_images.py
  python scripts/download_images.py --force       # re-download even if cached
  python scripts/download_images.py --dry-run
  python scripts/download_images.py --limit 10

Requirements: pip install Pillow pyyaml requests
"""
import sys, io, time, hashlib, argparse
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("pip install requests")
try:
    import yaml
except ImportError:
    sys.exit("pip install pyyaml")
try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("pip install Pillow")

FULL_MAX = 512   # max pixels on longest side
THUMB_SIZE = (256, 256)
RATE_LIMIT = 0.35  # seconds between downloads
TIMEOUT = 20
MAX_RETRIES = 3
USER_AGENT = "BigBrainTerry/1.0 (quiz game; houxizhu@gmail.com)"


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return "sha256:" + h.hexdigest()


def fetch_with_retry(url: str) -> bytes:
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            r = requests.get(url, timeout=TIMEOUT, headers={"User-Agent": USER_AGENT})
            r.raise_for_status()
            ct = r.headers.get("content-type", "")
            if not ct.startswith("image/"):
                raise ValueError(f"Non-image content-type: {ct!r}")
            return r.content
        except Exception as e:
            if attempt == MAX_RETRIES:
                raise
            wait = 2 ** attempt
            print(f"    retry {attempt}/{MAX_RETRIES} after {wait}s: {e}", file=sys.stderr)
            time.sleep(wait)
    raise RuntimeError("unreachable")  # keep linter happy


def process_image(data: bytes, full_path: Path, thumb_path: Path) -> None:
    img = Image.open(io.BytesIO(data)).convert("RGB")

    # Full: shrink to fit within FULL_MAX×FULL_MAX, preserving aspect ratio
    img.thumbnail((FULL_MAX, FULL_MAX), Image.LANCZOS)
    img.save(full_path, "JPEG", quality=90, optimize=True)

    # Thumb: center-crop to exact THUMB_SIZE from the already-shrunk image
    thumb = ImageOps.fit(img, THUMB_SIZE, Image.LANCZOS)
    thumb.save(thumb_path, "JPEG", quality=85, optimize=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--force", action="store_true", help="Re-download even if checksum matches")
    parser.add_argument("--dry-run", action="store_true", help="Print what would happen, write nothing")
    parser.add_argument("--limit", type=int, default=0, help="Stop after N downloads attempted")
    args = parser.parse_args()

    root = Path(__file__).parent.parent
    yaml_path = root / "assets" / "players.yaml"
    full_dir = root / "assets" / "images" / "full"
    thumb_dir = root / "assets" / "images" / "thumb"

    if not args.dry_run:
        full_dir.mkdir(parents=True, exist_ok=True)
        thumb_dir.mkdir(parents=True, exist_ok=True)

    with open(yaml_path, encoding="utf-8") as f:
        players = yaml.safe_load(f)

    downloaded = skipped = failed = 0
    failures: list[str] = []
    attempted = 0

    for player in players:
        if not isinstance(player, dict):
            continue

        pid = player["id"]
        image_url = player.get("image_url")

        if not image_url:
            print(f"  SKIP {pid} — no image_url")
            skipped += 1
            continue

        if args.limit and attempted >= args.limit:
            break
        attempted += 1

        full_path = full_dir / f"{pid}.jpg"
        thumb_path = thumb_dir / f"{pid}.jpg"
        stored_checksum = player.get("checksum", "")

        # Skip if cached and checksum matches
        if not args.force and full_path.exists() and thumb_path.exists() and stored_checksum:
            actual = sha256_file(full_path)
            if actual == stored_checksum:
                print(f"  CACHED {pid}")
                skipped += 1
                attempted -= 1  # don't count cached against limit
                continue

        if args.dry_run:
            print(f"  DRY  {pid} — {image_url[:70]}...")
            downloaded += 1
            continue

        try:
            data = fetch_with_retry(image_url)
            process_image(data, full_path, thumb_path)
            checksum = sha256_file(full_path)
            player["local_path"] = f"assets/images/full/{pid}.jpg"
            player["checksum"] = checksum
            size_kb = full_path.stat().st_size // 1024
            print(f"  DOWN {pid} ({size_kb}KB)")
            downloaded += 1
            time.sleep(RATE_LIMIT)
        except Exception as e:
            print(f"  ERR  {pid} — {e}", file=sys.stderr)
            failed += 1
            failures.append(pid)

    if not args.dry_run:
        with open(yaml_path, "w", encoding="utf-8") as f:
            yaml.dump(players, f, allow_unicode=True, sort_keys=False, default_flow_style=False)
        print(f"\nWrote {yaml_path}")

    print(f"\nDownloaded: {downloaded}  Cached/skipped: {skipped}  Failed: {failed}")
    if failures:
        print("Failed:", failures)
        sys.exit(1)


if __name__ == "__main__":
    main()
