#!/usr/bin/env python3
"""
Download AFL team logos from Wikipedia via the REST summary API.

For each team in assets/afl_teams.yaml, fetches the Wikipedia infobox
image using the summary endpoint, composites on white, and saves two sizes.

Output layout:
  assets/p_afl/full/{id}.jpg   — max 512px on longest side, white bg
  assets/p_afl/thumb/{id}.jpg  — 256×256 center crop

Usage:
  python scripts/download_afl.py
  python scripts/download_afl.py --force
  python scripts/download_afl.py --dry-run

Requirements: pip install Pillow pyyaml requests
"""
import sys, io, time, hashlib, argparse, urllib.parse
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

FULL_MAX    = 512
THUMB_SIZE  = (256, 256)
RATE_LIMIT  = 0.5
TIMEOUT     = 20
MAX_RETRIES = 3
USER_AGENT  = "BigBrainTerry/1.0 (quiz game; houxizhu@gmail.com)"

WIKI_API = "https://en.wikipedia.org/api/rest_v1/page/summary/{}"


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return "sha256:" + h.hexdigest()


def get_wiki_image_url(wiki_title: str) -> str:
    encoded = urllib.parse.quote(wiki_title, safe="_/")
    api_url = WIKI_API.format(encoded)
    r = requests.get(api_url, timeout=TIMEOUT, headers={"User-Agent": USER_AGENT})
    r.raise_for_status()
    data = r.json()
    img = data.get("originalimage") or data.get("thumbnail")
    if not img:
        raise ValueError(f"No image in Wikipedia summary for {wiki_title!r}")
    return img["source"]


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
    raise RuntimeError("unreachable")


def process_image(data: bytes, full_path: Path, thumb_path: Path) -> None:
    img = Image.open(io.BytesIO(data))

    if img.mode in ("RGBA", "LA", "P"):
        if img.mode == "P":
            img = img.convert("RGBA")
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
        img = bg
    else:
        img = img.convert("RGB")

    img.thumbnail((FULL_MAX, FULL_MAX), Image.LANCZOS)
    img.save(full_path, "JPEG", quality=90, optimize=True)

    thumb = ImageOps.fit(img, THUMB_SIZE, Image.LANCZOS)
    thumb.save(thumb_path, "JPEG", quality=85, optimize=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--force",   action="store_true", help="Re-download even if cached")
    parser.add_argument("--dry-run", action="store_true", help="Print what would happen, write nothing")
    args = parser.parse_args()

    root      = Path(__file__).parent.parent
    yaml_path = root / "assets" / "afl_teams.yaml"
    full_dir  = root / "assets" / "p_afl" / "full"
    thumb_dir = root / "assets" / "p_afl" / "thumb"

    if not args.dry_run:
        full_dir.mkdir(parents=True, exist_ok=True)
        thumb_dir.mkdir(parents=True, exist_ok=True)

    with open(yaml_path, encoding="utf-8") as f:
        teams = yaml.safe_load(f)

    downloaded = skipped = failed = 0
    failures: list[str] = []

    for team in teams:
        if not isinstance(team, dict):
            continue

        tid  = team["id"]
        wiki = team.get("wiki")
        if not wiki:
            print(f"  SKIP {tid} — no wiki title")
            skipped += 1
            continue

        full_path  = full_dir  / f"{tid}.jpg"
        thumb_path = thumb_dir / f"{tid}.jpg"
        stored_checksum = team.get("checksum", "")

        if not args.force and full_path.exists() and thumb_path.exists() and stored_checksum:
            actual = sha256_file(full_path)
            if actual == stored_checksum:
                print(f"  CACHED {tid}")
                skipped += 1
                continue

        if args.dry_run:
            print(f"  DRY  {tid} — wiki:{wiki}")
            downloaded += 1
            continue

        try:
            image_url = get_wiki_image_url(wiki)
            data      = fetch_with_retry(image_url)
            process_image(data, full_path, thumb_path)
            checksum = sha256_file(full_path)
            team["checksum"] = checksum
            size_kb = full_path.stat().st_size // 1024
            print(f"  DOWN {tid} ({size_kb}KB) — {image_url[:80]}")
            downloaded += 1
            time.sleep(RATE_LIMIT)
        except Exception as e:
            print(f"  ERR  {tid} — {e}", file=sys.stderr)
            failed += 1
            failures.append(tid)

    if not args.dry_run:
        with open(yaml_path, "w", encoding="utf-8") as f:
            yaml.dump(teams, f, allow_unicode=True, sort_keys=False, default_flow_style=False)
        print(f"\nWrote {yaml_path}")

    print(f"\nDownloaded: {downloaded}  Cached/skipped: {skipped}  Failed: {failed}")
    if failures:
        print("Failed IDs (fix wiki title in assets/afl_teams.yaml):", failures)
        sys.exit(1)


if __name__ == "__main__":
    main()
