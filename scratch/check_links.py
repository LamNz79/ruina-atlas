import json
import os

def check_links():
    sinner_path = r'c:\Users\lam\02project\RuniaAtlas\src\data\sinners.json'
    lit_path = r'c:\Users\lam\02project\RuniaAtlas\src\data\literarySources.json'
    entity_path = r'c:\Users\lam\02project\RuniaAtlas\src\data\crossGameEntities.json'

    with open(sinner_path, 'r', encoding='utf-8') as f:
        sinners_data = json.load(f)
    
    with open(lit_path, 'r', encoding='utf-8') as f:
        lit_data = json.load(f)

    with open(entity_path, 'r', encoding='utf-8') as f:
        entities_data = json.load(f)

    linked_ids = set()
    for s in sinners_data.get('sinners', []):
        for ls in s.get('literarySources', []):
            linked_ids.add(ls['id'])
    
    for e in entities_data.get('entities', []):
        if 'literarySourceIds' in e:
            for lid in e['literarySourceIds']:
                linked_ids.add(lid)
        # Check if any entity is a literary source itself or has connections
        # (Though usually literarySources.json is the source of truth for the nodes)

    unlinked = []
    for ls in lit_data.get('literarySources', []):
        if ls['id'] not in linked_ids:
            unlinked.append(ls)

    print(f"Total Literary Sources: {len(lit_data.get('literarySources', []))}")
    print(f"Unlinked Sources: {len(unlinked)}")
    for u in unlinked:
        print(f"- {u['id']}: {u['title']}")

if __name__ == "__main__":
    check_links()
