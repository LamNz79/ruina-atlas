"""
validate.py — Cross-validate sinners.json against GLL (Great Limbus Library).
Uses GLL Supabase data (scraped via Playwright) as ground truth.
"""
import json, re, urllib.request, os, sys
sys.stdout.reconfigure(encoding='utf-8')

TMP = os.environ.get('TEMP', '/tmp')
OUT = 'C:/Users/lam/02project/RuniaAtlas/src/data'

# ── Load data ────────────────────────────────────────────────────────────────

with open(os.path.join(TMP, 'gll_ids_clean.json'), encoding='utf-8') as f:
    gll_ids_raw = json.load(f)
with open(os.path.join(TMP, 'gll_egos_clean.json'), encoding='utf-8') as f:
    gll_egos_raw = json.load(f)
with open(os.path.join(OUT, 'sinners.json'), encoding='utf-8') as f:
    sinners = json.load(f)['sinners']

with urllib.request.urlopen(
    'https://raw.githubusercontent.com/eldritchtools/limbus-shared-library/main/public/data/identities.json'
) as r:
    old_ids_raw = json.loads(r.read())
with urllib.request.urlopen(
    'https://raw.githubusercontent.com/eldritchtools/limbus-shared-library/main/public/data/egos.json'
) as r:
    old_egos_raw = json.loads(r.read())

# ── Helpers ──────────────────────────────────────────────────────────────────

def norm(s):
    """Aggressive normalization for cross-dataset name matching."""
    if not s:
        return ''
    s = s.lower()
    s = re.sub(r'[\s\-–—·]+', ' ', s)
    s = re.sub(r'\.{2,}', '.', s)
    s = re.sub(r'[\[\]()（）【】{}]', '', s)
    s = re.sub(r'assoc\.?\s*', 'assoc ', s)
    s = re.sub(r'e\.g\.o\.?', 'ego', s)
    s = re.sub(r'n corp\.?', 'n corp', s)
    s = re.sub(r'\|\|\|\||iv+', 'iiii', s)
    s = re.sub(r'[:;]\s*', ': ', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip('. ')

GLL_SN_TO_ID = {
    'yi sang': 1, 'faust': 2, 'don quixote': 3, 'ryoshu': 4,
    'mersault': 5, 'hong lu': 6, 'heathcliff': 7, 'ishmael': 8,
    'sinclair': 9, 'rodion': 10, 'outis': 11, 'gregor': 12,
}
ID_TO_SLUG = {v: k for k, v in GLL_SN_TO_ID.items()}
ID_TO_SLUG[0] = 'dante'
SLUG_TO_NUM = {'dante': 0, 'yi-sang': 1, 'faust': 2, 'don-quixote': 3,
               'ryoshu': 4, 'meursault': 5, 'hong-lu': 6, 'heathcliff': 7,
               'ishmael': 8, 'sinclair': 9, 'rodion': 10, 'outis': 11, 'gregor': 12}

# Build old identity lookup: (sinnerId, norm_name) → {id, rank, tags, ...}
old_id_lookup = {}
for kid, info in old_ids_raw.items():
    sid = info.get('sinnerId', 0)
    n = norm(info.get('name', ''))
    old_id_lookup[(sid, n)] = {'id': str(kid), 'info': info}

# Build GLL identity lookup: (gll_sinner, norm_name) → full item
gll_id_lookup = {}
for item in gll_ids_raw:
    sn = item.get('sinner', '').strip()
    if not sn:
        continue
    n = norm(item.get('nameEN', ''))
    gll_id_lookup.setdefault(sn, {})[n] = item

# ── Mapping GLL → our IDs ────────────────────────────────────────────────────

gll_to_old_id = {}
unmapped_gll = []

for sn, items in gll_id_lookup.items():
    sid = GLL_SN_TO_ID.get(sn, 0)
    if not sid:
        continue
    for gll_n, gll_item in items.items():
        # Direct match
        key = (sid, gll_n)
        if key in old_id_lookup:
            gll_to_old_id[(sn, gll_n)] = old_id_lookup[key]
            continue
        # Normalize the other way: try matching our name format
        # GLL uses "cinq east section" → our has "cinq assoc east section"
        for old_key, old_val in old_id_lookup.items():
            if old_key[0] != sid:
                continue
            old_n = old_key[1]
            # Remove "assoc " prefix from our names
            cand = old_n.replace('assoc ', '')
            if cand == gll_n or gll_n.replace('assoc ', '') == old_n.replace('assoc ', ''):
                gll_to_old_id[(sn, gll_n)] = old_val
                break
        else:
            unmapped_gll.append((sn, gll_n, gll_item.get('nameEN', '')))

print(f"Mapped: {len(gll_to_old_id)} / {sum(len(v) for v in gll_id_lookup.values())}")
print(f"Unmapped: {len(unmapped_gll)}")

# ── Build corrected identity lists per sinner ─────────────────────────────────

corrected_ids = {sid: [] for sid in range(0, 13)}
for (sn, gll_n), old_entry in gll_to_old_id.items():
    sid = GLL_SN_TO_ID.get(sn, 0)
    if sid:
        corrected_ids[sid].append(old_entry['id'])

print("\nCorrected counts per sinner:")
for sid in range(0, 13):
    print(f"  sid={sid} ({ID_TO_SLUG.get(sid,'?')}): {len(corrected_ids[sid])}")

# ── Apply corrections to sinners.json ────────────────────────────────────────

sinner_by_slug = {s['id']: s for s in sinners}

for slug, num in SLUG_TO_NUM.items():
    if slug not in sinner_by_slug:
        continue
    s = sinner_by_slug[slug]
    new_id_strs = corrected_ids.get(num, [])

    if num == 0:
        # Dante: no identities
        s['identities'] = []
        continue

    # Build new identity list using old_id_lookup metadata
    new_identities = []
    for id_str in new_id_strs:
        info = old_ids_raw.get(id_str, {})
        tags = info.get('tags', [])
        # Determine sourceGame
        if any('Lobotomy' in t or 'L Corp.' in t for t in tags):
            source = 'lobotomy'
        elif any(x in ' '.join(tags) for x in ['LCE', 'N Corp', 'Technology Liberation']):
            source = 'ruina'
        else:
            source = 'limbus'
        # Faction from tags
        faction_kws = ['Association', 'Corp', 'Lineage', 'Office', 'Syndicate',
                       'Finger', 'Family', 'Kurokumo', 'Dead Rabbits', 'Pequod',
                       'La Mancha', 'R.B.', 'Night Awls', 'TingTang', 'Twinhook',
                       'Hook', 'Fanghunt', 'Rosespanner', 'MultiCrack', 'Full-Stop',
                       'Jeong', 'Dawn', 'LCA', 'LCC', 'Wild Hunt', 'Nightmare', 'Molar']
        faction = next((t for t in tags if any(kw in t for kw in faction_kws)), None)
        if faction:
            faction = faction.replace('<color=#d40000><s>Jia Family</s></color>', 'Jia Family')
        # Primary damage from skillTypes
        skill_types = info.get('skillTypes', [])
        dmg = skill_types[0]['type']['type'] if skill_types else ''
        new_identities.append({
            'id': id_str,
            'displayName': info.get('name', ''),
            'sourceGame': source,
            'wingOrGroup': faction,
            'damageType': dmg,
        })
    s['identities'] = new_identities

# ── Write corrected data ─────────────────────────────────────────────────────

with open(os.path.join(OUT, 'sinners.json'), 'w', encoding='utf-8') as f:
    json.dump({'sinners': sinners}, f, indent=2, ensure_ascii=False)

print("\n=== FINAL VALIDATION ===")
for s in sinners:
    print(f"  {s['id']}: {len(s['identities'])} identities")

print("\nDone. sinners.json updated.")
