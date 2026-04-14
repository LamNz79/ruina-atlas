"""
fix_identities.py — Fix sinners.json identities using GLL as ground truth.
Key fixes applied:
1. Sinclair ↔ Rodion identity swap (eldritchtools has them swapped)
2. "Assoc." abbreviation normalization (GLL uses short form)
3. New identities not in eldritchtools (House of Spiders, new Lobotomy EGOs)
4. "Night Awl" vs "Night Awls" / || vs II spelling variants
"""
import json, re, urllib.request, os, sys
sys.stdout.reconfigure(encoding='utf-8')

TMP = os.environ.get('TEMP', '/tmp')
OUT = 'C:/Users/lam/02project/RuniaAtlas/src/data'

with open(os.path.join(TMP, 'gll_ids_clean.json'), encoding='utf-8') as f:
    gll_ids_raw = json.load(f)
with open(os.path.join(OUT, 'sinners.json'), encoding='utf-8') as f:
    sinners = json.load(f)['sinners']

with urllib.request.urlopen(
    'https://raw.githubusercontent.com/eldritchtools/limbus-shared-library/main/public/data/identities.json'
) as r:
    old_ids_raw = json.loads(r.read())

def norm(s):
    if not s: return ''
    s = s.lower()
    s = re.sub(r'[\s\-–—·]+', ' ', s)
    s = re.sub(r'\.{2,}', '.', s)
    s = re.sub(r'[\[\]()【】{}]', '', s)
    s = re.sub(r'assoc\.?\s*', 'assoc ', s)
    s = re.sub(r'e\.g\.o\.?', 'ego', s)
    s = re.sub(r'n corp\.?', 'n corp', s)
    s = re.sub(r'\|\|\|\||iv+', 'iiii', s)
    s = re.sub(r'[:;]\s*', ': ', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip('. ')

def simple(s):
    return re.sub(r'[^a-z]', '', s.lower())

GLL_SN_TO_ID = {
    'yi sang': 1, 'faust': 2, 'don quixote': 3, 'ryoshu': 4,
    'mersault': 5, 'hong lu': 6, 'heathcliff': 7, 'ishmael': 8,
    'sinclair': 9, 'rodion': 10, 'outis': 11, 'gregor': 12,
}
# eldritchtools has Sinclair/Rodion swapped → correct it
swap_map = {9: 10, 10: 9}
SLUG_TO_NUM = {
    'dante': 0, 'yi-sang': 1, 'faust': 2, 'don-quixote': 3, 'ryoshu': 4,
    'meursault': 5, 'hong-lu': 6, 'heathcliff': 7, 'ishmael': 8,
    'sinclair': 9, 'rodion': 10, 'outis': 11, 'gregor': 12,
}

# Build old lookup with CORRECTED sid (swap Sinclair↔Rodion)
old_lookup = {}
for kid, info in old_ids_raw.items():
    sid = swap_map.get(info.get('sinnerId', 0), info.get('sinnerId', 0))
    n = norm(info.get('name', ''))
    old_lookup[(sid, n)] = kid

# GLL lookup
gll_by = {}
for item in gll_ids_raw:
    sn = item.get('sinner', '').strip()
    if not sn: continue
    n = norm(item.get('nameEN', ''))
    gll_by.setdefault(sn, {})[n] = item

# Manual mapping for identities not in eldritchtools
# (new identities added to GLL after eldritchtools was last updated)
MANUAL_IDS = {
    # New House of Spiders identities (appear in GLL, not in eldritchtools)
    ('yi sang', 'the house of spiders:the index nursefather'):     'ho_spiders_index',
    ('faust', 'the house of spiders:the ring apprentice'):        'ho_spiders_ring',
    ('hong lu', 'the house of spiders:the ring nursefather'):     'ho_spiders_nurse',
    ('ishmael', 'the house of spiders:the middle apprentice'):   'ho_spiders_middle',
    ('sinclair', 'the house of spiders:the pinky apprentice'):   'ho_spiders_pinky',
    # New Lobotomy identities
    ('gregor', 'lce ego: : aedd'):                               'lce_ego_aedd_gregor',
    ('gregor', 'lobotomy ego: : lamp'):                          'lobotomy_ego_lamp',
    ('ryoshu', 'lobotomy ego: :faint aroma & solitude'):         'lobotomy_ego_faint',
    ('mersault', 'lobotomy ego: : hornetalteration'):           'lobotomy_ego_hornet',
    # New standard identities
    ('don quixote', 'cinq east section 3'):                      'cinq_east_3_dq',
    ('faust', 'shi east section 3'):                             'shi_east_3_faust',
    ('heathcliff', 'oufi south section 3'):                      'oufi_south_3_heath',
}

MANUAL_NAMES = {
    'ho_spiders_index':     'The House of Spiders: The Index Nursefather',
    'ho_spiders_ring':       'The House of Spiders: The Ring Apprentice',
    'ho_spiders_nurse':     'The House of Spiders: The Ring Nursefather',
    'ho_spiders_middle':    'The House of Spiders: The Middle Apprentice',
    'ho_spiders_pinky':     'The House of Spiders: The Pinky Apprentice',
    'lce_ego_aedd_gregor': 'LCE E.G.O::AEDD',
    'lobotomy_ego_lamp':    'Lobotomy E.G.O::Lamp',
    'lobotomy_ego_faint':   'Lobotomy E.G.O::Faint Aroma & Solitude',
    'lobotomy_ego_hornet': 'Lobotomy E.G.O::Hornet Alteration',
    'cinq_east_3_dq':      'Cinq East Section 3',
    'shi_east_3_faust':    'Shi East Section 3',
    'oufi_south_3_heath':  'Oufi South Section 3',
}

MANUAL_SOURCE = {
    'lce_ego_aedd_gregor': 'ruina',
    'lobotomy_ego_faint':   'lobotomy',
    'lobotomy_ego_hornet':  'lobotomy',
}

# Map GLL → our IDs
gll_mapped = {}
unmapped = []
for sn, items in gll_by.items():
    sid = GLL_SN_TO_ID.get(sn, 0)
    if not sid: continue
    for gll_n, gll_item in items.items():
        key = (sid, gll_n)
        str_key = (sn, gll_n)
        if key in old_lookup:
            gll_mapped[str_key] = old_lookup[key]
        elif str_key in MANUAL_IDS:
            gll_mapped[str_key] = MANUAL_IDS[str_key]
        else:
            # Try simple normalization
            sk = (sid, simple(gll_n))
            if sk in old_lookup:
                gll_mapped[str_key] = old_lookup[sk]
            else:
                # Try "assoc" variations
                alt_n = gll_n.replace('assoc ', 'assoc').replace('assoc', 'assoc ')
                for old_k in old_lookup:
                    if old_k[0] == sid and (alt_n in old_k[1] or old_k[1] in alt_n):
                        gll_mapped[str_key] = old_lookup[old_k]
                        break
                else:
                    unmapped.append((sn, gll_n, gll_item.get('nameEN', '')))

print(f"Mapped: {len(gll_mapped)}, Unmapped: {len(unmapped)}")
for sn, gll_n, orig in sorted(unmapped):
    print(f"  [{sn}] '{orig}'")

# Build corrected id lists
corrected_ids = {sid: [] for sid in range(0, 13)}
for (sn, gll_n), our_id in gll_mapped.items():
    sid = GLL_SN_TO_ID.get(sn, 0)
    if sid and our_id:
        corrected_ids[sid].append(our_id)

for sid in corrected_ids:
    corrected_ids[sid] = list(dict.fromkeys(corrected_ids[sid]))

print("\nFinal counts:")
for sid in sorted(corrected_ids):
    m = {v: k for k, v in GLL_SN_TO_ID.items()}
    print(f"  sid={sid} ({m.get(sid, 'dante')}): {len(corrected_ids[sid])}")

# Apply to sinners.json
sinner_by_slug = {s['id']: s for s in sinners}
faction_kws = [
    'Association', 'Corp', 'Lineage', 'Office', 'Syndicate', 'Finger',
    'Family', 'Kurokumo', 'Dead Rabbits', 'Pequod', 'La Mancha', 'R.B.',
    'Night Awls', 'TingTang', 'Twinhook', 'Hook', 'Fanghunt',
    'Rosespanner', 'MultiCrack', 'Full-Stop', 'Jeong', 'Dawn',
    'LCA', 'LCC', 'Wild Hunt', 'Nightmare', 'Molar',
]

for slug, num in SLUG_TO_NUM.items():
    s = sinner_by_slug.get(slug)
    if not s:
        continue
    if num == 0:
        s['identities'] = []
        continue

    new_list = []
    for id_str in corrected_ids.get(num, []):
        info = old_ids_raw.get(id_str, {})
        tags = info.get('tags', [])
        manual_name = MANUAL_NAMES.get(id_str, '')
        display = info.get('name', '') or manual_name

        # Source game
        if manual_name and id_str in MANUAL_SOURCE:
            source = MANUAL_SOURCE[id_str]
        elif any('Lobotomy' in t or 'L Corp.' in t for t in tags):
            source = 'lobotomy'
        elif any(x in ' '.join(tags) for x in ['LCE', 'N Corp', 'Technology Liberation']):
            source = 'ruina'
        else:
            source = 'limbus'

        # Faction
        faction = next((t for t in tags if any(kw in t for kw in faction_kws)), None)
        if faction:
            faction = faction.replace('<color=#d40000><s>Jia Family</s></color>', 'Jia Family')

        # Primary damage
        skill_types = info.get('skillTypes', [])
        dmg = skill_types[0]['type']['type'] if skill_types else ''

        new_list.append({
            'id': id_str,
            'displayName': display,
            'sourceGame': source,
            'wingOrGroup': faction,
            'damageType': dmg,
        })

    s['identities'] = new_list

with open(os.path.join(OUT, 'sinners.json'), 'w', encoding='utf-8') as f:
    json.dump({'sinners': sinners}, f, indent=2, ensure_ascii=False)

print("\n=== DONE ===")
for s in sinners:
    print(f"  {s['id']}: {len(s['identities'])} identities")
