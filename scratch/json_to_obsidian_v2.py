import json
import os
import shutil
import re

def slugify(text):
    return text.lower().replace(' ', '-').replace(':', '').replace("'", '').replace('(', '').replace(')', '').replace('"', '')

def clean_text(text):
    if not text:
        return ""
    # Fix common encoding artifacts
    replacements = {
        'ÔÇö': '—',
        'ÔÇô': '–',
        'ÔÇÖ': "'",
        'ÔÇ£': '“',
        'ÔÇØ': '”',
        'ÔÇª': '...',
        'ÔÇ¢': '•',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text

def get_entity_folder(entity_type):
    entity_type = entity_type.lower()
    if entity_type == 'abnormality':
        return 'Abnormalities'
    elif entity_type == 'wing':
        return 'Wings'
    elif entity_type == 'character':
        return 'Characters'
    elif entity_type in ['organization', 'association', 'group', 'syndicate', 'finger']:
        return 'Organizations'
    else:
        return 'Misc'

def main():
    base_path = r'c:\Users\lam\02project\RuniaAtlas'
    output_base = os.path.join(base_path, 'obsidian_vault_export')
    os.makedirs(output_base, exist_ok=True)
    
    # 1. Load all data
    sinners_path = os.path.join(base_path, 'src', 'data', 'sinners.json')
    sources_path = os.path.join(base_path, 'src', 'data', 'literarySources.json')
    entities_path = os.path.join(base_path, 'src', 'data', 'crossGameEntities.json')
    
    with open(sinners_path, 'r', encoding='utf-8') as f:
        sinners_data = json.load(f)
    with open(sources_path, 'r', encoding='utf-8') as f:
        sources_data = json.load(f)
    with open(entities_path, 'r', encoding='utf-8') as f:
        entities_data = json.load(f)
        
    # 2. Build ID to Title/Name mapping for linking
    id_map = {} # id -> filename_without_extension
    
    for sinner in sinners_data['sinners']:
        id_map[sinner['id']] = sinner['name']
        
    for source in sources_data['literarySources']:
        id_map[source['id']] = source['id'] # Sources use ID as filename for now, or should we use title?
        # User's previous script used source['id'] for filename
        # Let's check if titles are better. Source titles can have spaces/special chars.
        # Let's stick to source['id'] but maybe use titles in links? 
        # Obsidian supports [[filename|display name]].
        # For now, let's keep source links as [[id]].
        
    for entity in entities_data['entities']:
        id_map[entity['id']] = entity['name']

    # Helper for link generation
    def get_link(target_id, display_text=None):
        if target_id in id_map:
            target = id_map[target_id]
            if display_text:
                return f"[[{target}|{display_text}]]"
            return f"[[{target}]]"
        # Fallback to capitalized ID if not found
        fallback = target_id.replace('-', ' ').title()
        if display_text:
            return f"[[{fallback}|{display_text}]]"
        return f"[[{fallback}]]"

    # 3. Process Sinners
    os.makedirs(os.path.join(output_base, 'Sinners'), exist_ok=True)
    for sinner in sinners_data['sinners']:
        filename = f"{sinner['name']}.md"
        filepath = os.path.join(output_base, 'Sinners', filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write("---\n")
            f.write(f"id: {sinner['id']}\n")
            f.write(f"type: Sinner\n")
            f.write(f"sinner_number: \"{sinner['sinnerNumber']}\"\n")
            f.write(f"color: \"{sinner['signatureColor']}\"\n")
            f.write(f"game: {sinner['canonicalGame']}\n")
            if 'themes' in sinner:
                f.write(f"themes: {json.dumps(sinner['themes'])}\n")
            f.write("---\n\n")
            
            f.write(f"# {sinner['name']}\n\n")
            f.write(f"## Lore Summary\n{clean_text(sinner.get('loreSummary', 'No summary available.'))}\n\n")
            
            f.write("## Literary Sources\n")
            for source in sinner.get('literarySources', []):
                link = get_link(source['id'])
                f.write(f"- {link} ({source['role']}): {clean_text(source['specificConnection'])}\n")
            f.write("\n")
            
            f.write("## Cantos\n")
            for canto in sinner.get('cantos', []):
                f.write(f"- **{canto['id']}**: {clean_text(canto['summary'])}\n")
            f.write("\n")
            
            f.write("## Identities\n")
            f.write("| ID | Name | Game | Group | Type |\n")
            f.write("|----|------|------|-------|------|\n")
            for identity in sinner.get('identities', []):
                f.write(f"| {identity['id']} | {identity['displayName']} | {identity['sourceGame']} | {identity.get('wingOrGroup') or 'N/A'} | {identity.get('damageType') or 'N/A'} |\n")
            f.write("\n")
            
            f.write("## E.G.O\n")
            f.write("| ID | Name | Rank | Affinity | Description |\n")
            f.write("|----|------|------|----------|-------------|\n")
            for ego in sinner.get('egos', []):
                desc = clean_text(ego.get('description', ''))
                f.write(f"| {ego['id']} | {ego['displayName']} | {ego.get('rank')} | {ego.get('colorTheme')} | {desc} |\n")

    # 4. Process Sources
    os.makedirs(os.path.join(output_base, 'Sources'), exist_ok=True)
    for source in sources_data['literarySources']:
        filename = f"{source['id']}.md"
        filepath = os.path.join(output_base, 'Sources', filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write("---\n")
            f.write(f"id: {source['id']}\n")
            f.write(f"type: Source\n")
            f.write(f"author: \"{source.get('author', 'Unknown')}\"\n")
            if 'year' in source:
                f.write(f"year: {source['year']}\n")
            if 'themes' in source:
                f.write(f"themes: {json.dumps(source['themes'])}\n")
            f.write("---\n\n")
            
            f.write(f"# {source['title']}\n\n")
            f.write(f"**Author:** {source.get('author', 'Unknown')}\n")
            if 'year' in source:
                f.write(f"**Year:** {source['year']}\n")
            f.write("\n")
            
            if 'passage' in source:
                f.write(f"> [!quote] Passage\n")
                f.write(f"> {clean_text(source['passage'])}\n")
                if 'passageContext' in source:
                    f.write(f">\n> *{clean_text(source['passageContext'])}*\n")
                f.write("\n")
            
            f.write(f"## Historical & Lore Context\n{clean_text(source.get('historicalContext', 'No context available.'))}\n\n")
            
            if 'coverImage' in source:
                image_rel_path = source['coverImage'].lstrip('/')
                image_src = os.path.join(base_path, 'public', image_rel_path)
                
                if os.path.exists(image_src):
                    attachments_dir = os.path.join(output_base, 'Attachments')
                    os.makedirs(attachments_dir, exist_ok=True)
                    
                    image_filename = os.path.basename(image_src)
                    image_dest = os.path.join(attachments_dir, image_filename)
                    shutil.copy2(image_src, image_dest)
                    
                    f.write(f"## Cover\n![[{image_filename}]]\n\n")

            if 'wikiUrl' in source:
                f.write(f"[Wikipedia]({source['wikiUrl']})\n")

    # 5. Process Entities
    entities_dir = os.path.join(output_base, 'Entities')
    os.makedirs(entities_dir, exist_ok=True)
    
    for entity in entities_data['entities']:
        folder = get_entity_folder(entity['type'])
        os.makedirs(os.path.join(entities_dir, folder), exist_ok=True)
        
        # Sanitize filename
        safe_name = entity['name'].replace(':', '-').replace('"', '').replace('?', '').replace('*', '').replace('/', '-')
        filepath = os.path.join(entities_dir, folder, f"{safe_name}.md")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write("---\n")
            f.write(f"id: {entity['id']}\n")
            f.write(f"type: {entity['type'].capitalize()}\n")
            if 'subjectNumber' in entity:
                f.write(f"subject_number: \"{entity['subjectNumber']}\"\n")
            if 'riskLevel' in entity:
                f.write(f"risk_level: {entity['riskLevel']}\n")
            f.write(f"game: {entity['canonicalGame']}\n")
            if 'themes' in entity:
                f.write(f"themes: {json.dumps(entity['themes'])}\n")
            if 'parentEntityId' in entity:
                f.write(f"parent_entity: {entity['parentEntityId']}\n")
            if 'spoilerLevel' in entity:
                f.write(f"spoiler_level: {entity['spoilerLevel']}\n")
            f.write("---\n\n")
            
            f.write(f"# {entity['name']}\n\n")
            
            if 'subjectNumber' in entity:
                f.write(f"**Subject Number:** {entity['subjectNumber']} | **Risk Level:** {entity.get('riskLevel', 'N/A')}\n\n")
            
            f.write(f"## Lore Summary\n{clean_text(entity.get('loreSummary', 'No summary available.'))}\n\n")
            
            if 'appearances' in entity:
                f.write("## Appearances\n")
                f.write(", ".join([a.capitalize() for a in entity['appearances']]) + "\n\n")

            if 'literarySourceIds' in entity:
                f.write("## Literary Sources\n")
                for source_id in entity['literarySourceIds']:
                    f.write(f"- {get_link(source_id)}\n")
                f.write("\n")
            
            # Handle inline literary sources (like in Dongrang)
            if 'literarySources' in entity:
                f.write("## Literary Origins\n")
                for s in entity['literarySources']:
                    f.write(f"- {get_link(s['id'])} ({s['role']}): {clean_text(s.get('specificConnection', ''))}\n")
                f.write("\n")

            if 'relatedSinnerIds' in entity or 'connectionInsights' in entity:
                f.write("## Sinner Connections\n")
                insights = entity.get('connectionInsights', {})
                for sinner_id in entity.get('relatedSinnerIds', []):
                    insight = clean_text(insights.get(sinner_id, "No specific insight available."))
                    f.write(f"- **{get_link(sinner_id)}**: {insight}\n")
                f.write("\n")
            
            if 'parentEntityId' in entity:
                f.write(f"## Parent Organization\n- {get_link(entity['parentEntityId'])}\n\n")

            if 'relatedEntityIds' in entity:
                f.write("## Related Entities\n")
                insights = entity.get('connectionInsights', {})
                for rel_id in entity['relatedEntityIds']:
                    insight = clean_text(insights.get(rel_id))
                    link = get_link(rel_id)
                    if insight:
                        f.write(f"- {link}: {insight}\n")
                    else:
                        f.write(f"- {link}\n")
                f.write("\n")

    print(f"Export complete. Vault refreshed at: {output_base}")

if __name__ == "__main__":
    main()
