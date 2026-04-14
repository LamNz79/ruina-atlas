"""
scrapFandom.py — Scrape identity portraits from Limbus Company Wiki (Fandom).
Uses Fandom's REST API to get identity page links and portrait images.
Maps wiki page names → eldritchtools identity IDs via normalized name matching.
"""
import urllib.request
import urllib.parse
import json
import re
import os
import sys
import time
import shutil

sys.stdout.reconfigure(encoding='utf-8')

OUT = 'C:/Users/lam/02project/RuniaAtlas'
DST = f'{OUT}/public/assets/identities'
WIKI = 'https://limbuscompany.fandom.com'
HEADERS = {'User-Agent': 'Mozilla/5.0 (compatible; RuniaAtlas/1.0; educational)'}


# ── Sinner name list (for suffix stripping) ───────────────────────────────────

SINNERS = [
    'Yi Sang', 'Faust', 'Don Quixote', 'Ryoshu', 'Ryōshū', 'Meursault',
    'Hong Lu', 'Heathcliff', 'Ishmael', 'Rodion', 'Sinclair', 'Outis',
    'Gregor', 'Dante',
]


# ── Normalization ─────────────────────────────────────────────────────────────

def norm(s):
    if not s:
        return ''
    s = s.lower()
    s = re.sub(r'[\s\-–—·]+', ' ', s)
    s = re.sub(r'\.{2,}', '.', s)
    s = re.sub(r'[\[\]()【】{}]', '', s)
    s = re.sub(r'assoc\.?', 'assoc', s)
    s = re.sub(r'\bassociation\b', 'assoc', s)
    s = re.sub(r'e\.g\.o\.?', 'ego', s)
    s = re.sub(r'n corp\.?', 'n corp', s)
    s = re.sub(r'\|\|\|\||iv+', 'iiii', s)
    s = re.sub(r'[:;]\s*', ': ', s)
    s = re.sub(r'\s+', ' ', s)
    s = re.sub(r'[^\x00-\x7f]', '', s)  # strip non-ASCII noise (Ø, 【, 】, etc.)
    return s.strip('. ')


def strip_sinner_suffix(title):
    """
    Remove trailing sinner name from wiki page title.
    e.g. 'Blade Lineage Salsu Yi Sang' -> 'Blade Lineage Salsu'
         'LCB Sinner Don Quixote'      -> 'LCB Sinner'
         'N Corp. Mittelhammer Don Quixote' -> 'N Corp. Mittelhammer'
    """
    words = title.split()
    # Try longest sinner first (e.g. 'Don Quixote' before 'Don')
    for sinner in sorted(SINNERS, key=lambda s: -len(s.split())):
        sn_words = sinner.split()
        n = len(sn_words)
        if len(words) >= n and words[-n:] == [w.lower() for w in sn_words]:
            return ' '.join(words[:-n])
    return title


# ── API helpers ────────────────────────────────────────────────────────────────

def wiki_get(params):
    url = f"{WIKI}/api.php?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())


def get_portrait_url(page_title):
    """Get portrait image URL for a wiki page via Fandom API."""
    data = wiki_get({
        'action': 'query',
        'titles': page_title,
        'prop': 'pageimages',
        'piprop': 'original',
        'format': 'json',
        'redirects': '1',
    })
    for pdata in data.get('query', {}).get('pages', {}).values():
        src = pdata.get('original', {}).get('source', '')
        if src:
            return src
    return None


def get_image_list():
    """Get all identity page links from List_of_Identities wiki page."""
    data = wiki_get({
        'action': 'parse',
        'page': 'List_of_Identities',
        'prop': 'text',
        'format': 'json',
        'redirects': '1',
    })
    html = data.get('parse', {}).get('text', {}).get('*', '')

    SKIP_PREFIXES = (
        '/wiki/Special:', '/wiki/Category:', '/wiki/Template:', '/wiki/Module:',
        '/wiki/Help:', '/wiki/User:', '/wiki/Talk:', '/wiki/File:', '/wiki/Media:',
    )
    SKIP_IN_TITLE = (
        'Icon.png', 'background', '_logo', '_banner', '_frame',
        'List_of', 'Mirror_Worlds', 'Golden_Bough', 'Mephistopheles',
        'Walpurgis', 'Thread',
    )

    links = re.findall(r'href="(/wiki/[^"#]+)"[^>]*title="([^"]+)"', html)
    pages = []
    seen = set()
    for href, title in links:
        if any(href.startswith(p) for p in SKIP_PREFIXES):
            continue
        if any(s in title for s in SKIP_IN_TITLE):
            continue
        decoded = urllib.parse.unquote(href.replace('/wiki/', '').replace('+', ' ')).replace('_', ' ')
        if decoded not in seen:
            seen.add(decoded)
            pages.append(decoded)

    return pages


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print('Fetching identity links from Fandom wiki...')
    wiki_pages = get_image_list()
    print(f'  → {len(wiki_pages)} wiki pages')

    # Load eldritchtools identity names
    with open(f'{OUT}/src/data/sinners.json', encoding='utf-8') as f:
        sinners = json.load(f)['sinners']

    # Build a richer lookup: norm_name → list of (sinner_slug, eldritch_id)
    wiki_name_map_by_sinner: dict[str, list[tuple[str, str]]] = {}
    for s in sinners:
        for ident in s['identities']:
            n = norm(ident['displayName'])
            if n:
                wiki_name_map_by_sinner.setdefault(n, []).append((s['id'], ident['id']))

    # Also keep flat norm → single eldritch_id (for names unique to one sinner)
    wiki_flat_map: dict[str, str] = {}
    for n, entries in wiki_name_map_by_sinner.items():
        if len(entries) == 1:
            wiki_flat_map[n] = entries[0][1]

    print(f'  → {len(wiki_name_map_by_sinner)} unique identity names ({len(wiki_flat_map)} unique)')

    def match(wp_title):
        """
        Match wiki page title to an eldritchtools identity ID.
        Handles shared names like 'LCB Sinner' by also checking the sinner suffix.
        """
        # Direct norm match (only if unique)
        nt = norm(wp_title)
        if nt in wiki_flat_map:
            return wiki_flat_map[nt]

        # Strip trailing sinner suffix
        stripped = strip_sinner_suffix(wp_title)
        ns = norm(stripped)

        if ns in wiki_flat_map:
            return wiki_flat_map[ns]

        # Shared name: strip suffix to get identity name, then match by sinner
        if ns in wiki_name_map_by_sinner:
            # Extract sinner name from original title
            words = wp_title.split()
            sinner_slug = None
            for sinner in sorted(SINNERS, key=lambda s: -len(s.split())):
                sn_words = sinner.split()
                n_words = len(sn_words)
                if len(words) >= n_words and words[-n_words:] == [w.lower() for w in sn_words]:
                    slug = {
                        'Yi Sang': 'yi-sang', 'Faust': 'faust', 'Don Quixote': 'don-quixote',
                        'Ryoshu': 'ryoshu', 'Ryōshū': 'ryoshu', 'Meursault': 'meursault',
                        'Hong Lu': 'hong-lu', 'Heathcliff': 'heathcliff', 'Ishmael': 'ishmael',
                        'Rodion': 'rodion', 'Sinclair': 'sinclair', 'Outis': 'outis',
                        'Gregor': 'gregor', 'Dante': 'dante',
                    }.get(sinner)
                    if slug:
                        sinner_slug = slug
                    break
            if sinner_slug:
                for s_slug, eid in wiki_name_map_by_sinner[ns]:
                    if s_slug == sinner_slug:
                        return eid
        return None

    # Clear and prepare destination
    os.makedirs(DST, exist_ok=True)
    for f in os.listdir(DST):
        os.remove(os.path.join(DST, f))

    matched_ids = set()
    results = []
    unmatched = []

    for page_title in wiki_pages:
        time.sleep(0.12)  # be polite to Fandom API

        eid = match(page_title)
        img_url = get_portrait_url(page_title)

        if not img_url:
            print(f'  ⚠ no image: {page_title[:55]}')
            continue

        if eid:
            if eid not in matched_ids:  # avoid duplicates
                results.append((eid, page_title, img_url))
                matched_ids.add(eid)
                print(f'  ✓ {eid:<30} ← {page_title[:55]}')
            else:
                print(f'  = {eid:<30} ← {page_title[:55]} (duplicate)')
        else:
            unmatched.append((page_title, img_url))
            print(f'  ? {page_title[:55]} (no match)')

    print(f'\nMatched: {len(results)}, Unmatched: {len(unmatched)}')

    # Download images
    print('\nDownloading...')
    ok = fail = 0
    for eid, page_title, img_url in results:
        try:
            dst_path = os.path.join(DST, f'{eid}.png')
            req = urllib.request.Request(img_url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as r, open(dst_path, 'wb') as f:
                shutil.copyfileobj(r, f)
            ok += 1
            if ok % 25 == 0:
                print(f'  {ok}/{len(results)} done')
        except Exception as e:
            print(f'  ✗ {eid}: {e}')
            fail += 1

    print(f'\nDownloaded: {ok}, Failed: {fail}')

    # Save unmatched for manual review
    if unmatched:
        with open(f'{OUT}/dataController/fandom_unmatched.json', 'w', encoding='utf-8') as f:
            json.dump(unmatched, f, indent=2, ensure_ascii=False)
        print(f'Unmatched saved to fandom_unmatched.json')

    # Rebuild identityImages.json
    available = {f.replace('.png', '') for f in os.listdir(DST)}
    identity_images = {}
    for s in sinners:
        for ident in s['identities']:
            identity_images[ident['id']] = (
                f'/assets/identities/{ident["id"]}.png' if ident['id'] in available else None
            )

    with open(f'{OUT}/src/data/identityImages.json', 'w', encoding='utf-8') as f:
        json.dump(identity_images, f, indent=2, ensure_ascii=False)

    with_img = sum(1 for v in identity_images.values() if v)
    without_img = sum(1 for v in identity_images.values() if not v)
    print(f'\nidentityImages.json: {with_img} with images, {without_img} missing')
    print('=== DONE ===')


if __name__ == '__main__':
    main()
