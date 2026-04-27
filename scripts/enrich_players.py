#!/usr/bin/env python3
"""
Enrich players.yaml with image_url, source_urls, license from Wikipedia.

Queries the Wikipedia pageimages API for each player that lacks image_url.
Updates assets/players.yaml in place (reformats to block-style YAML).

Usage:
  python scripts/enrich_players.py
  python scripts/enrich_players.py --dry-run
  python scripts/enrich_players.py --limit 10

Requirements: pip install pyyaml
"""
import sys, json, time, argparse
from pathlib import Path
import urllib.request
import urllib.parse
import yaml

WIKI_API = "https://en.wikipedia.org/w/api.php"
RATE_LIMIT = 0.5  # seconds between requests
TIMEOUT = 10
USER_AGENT = "BigBrainTerry/1.0 (quiz game; houxizhu@gmail.com)"


def wiki_image(title: str) -> tuple[str | None, str | None]:
    """Return (image_url, page_url) for a Wikipedia article title, or (None, None)."""
    params = {
        "action": "query",
        "titles": title,
        "prop": "pageimages",
        "piprop": "original",
        "format": "json",
        "formatversion": "2",
    }
    url = WIKI_API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        data = json.loads(r.read())
    pages = data.get("query", {}).get("pages", [])
    if not pages:
        return None, None
    p = pages[0]
    if p.get("missing"):
        return None, None
    img = p.get("original", {}).get("source")
    page_url = "https://en.wikipedia.org/wiki/" + urllib.parse.quote(
        p.get("title", title).replace(" ", "_")
    )
    return img, page_url


def find_image(name: str, wiki_title: str | None = None) -> tuple[str | None, str | None, str | None]:
    """
    Try multiple title variants and return (image_url, source_url, matched_title).
    Falls back to disambiguation suffixes if the bare name fails.
    """
    candidates = []
    if wiki_title:
        candidates.append(wiki_title)
    candidates += [name, f"{name} (basketball)", f"{name} (basketball player)"]

    for title in candidates:
        try:
            img, src = wiki_image(title)
            time.sleep(RATE_LIMIT)
            if img:
                return img, src, title
        except Exception as e:
            print(f"    warn: {title!r} → {e}", file=sys.stderr)
            time.sleep(RATE_LIMIT)

    return None, None, None


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true", help="Find URLs but don't write YAML")
    parser.add_argument("--limit", type=int, default=0, help="Stop after N players processed")
    args = parser.parse_args()

    root = Path(__file__).parent.parent
    yaml_path = root / "assets" / "players.yaml"

    with open(yaml_path, encoding="utf-8") as f:
        players = yaml.safe_load(f)

    enriched = skipped = failed = 0
    failures: list[str] = []
    processed = 0

    for player in players:
        if not isinstance(player, dict):
            continue
        if args.limit and processed >= args.limit:
            break

        pid = player["id"]

        if player.get("image_url"):
            skipped += 1
            continue

        processed += 1
        name = player["name"]
        wiki_title = player.get("wiki_title")  # optional override field
        img_url, src_url, matched = find_image(name, wiki_title)

        if img_url:
            print(f"  OK   {pid}")
            print(f"       [{matched}] {img_url[:80]}")
            if not args.dry_run:
                player["image_url"] = img_url
                player["source_urls"] = [src_url]
                player["license"] = "CC-BY-SA-4.0"
            enriched += 1
        else:
            print(f"  MISS {pid} ({name})", file=sys.stderr)
            failed += 1
            failures.append(pid)

    if not args.dry_run:
        with open(yaml_path, "w", encoding="utf-8") as f:
            yaml.dump(players, f, allow_unicode=True, sort_keys=False, default_flow_style=False)
        print(f"\nWrote {yaml_path}")

    print(f"\nEnriched: {enriched}  Already had URL: {skipped}  Failed: {failed}")
    if failures:
        print("No image found for:", failures)
        sys.exit(1)


if __name__ == "__main__":
    main()
