import json
import os
import shutil

def slugify(text):
    return text.lower().replace(' ', '-').replace(':', '').replace("'", '').replace('(', '').replace(')', '').replace('"', '')

def convert_sinners(sinners_data, output_dir):
    os.makedirs(os.path.join(output_dir, 'Sinners'), exist_ok=True)
    for sinner in sinners_data['sinners']:
        filename = f"{sinner['name']}.md"
        filepath = os.path.join(output_dir, 'Sinners', filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            # YAML Frontmatter
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
            f.write(f"## Lore Summary\n{sinner.get('loreSummary', 'No summary available.')}\n\n")
            
            f.write("## Literary Sources\n")
            for source in sinner.get('literarySources', []):
                # We'll assume source files exist in 'Sources' folder
                f.write(f"- [[{source['id']}]] ({source['role']}): {source['specificConnection']}\n")
            f.write("\n")
            
            f.write("## Cantos\n")
            for canto in sinner.get('cantos', []):
                f.write(f"- **{canto['id']}**: {canto['summary']}\n")
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
                f.write(f"| {ego['id']} | {ego['displayName']} | {ego.get('rank')} | {ego.get('colorTheme')} | {ego.get('description', '')} |\n")

def convert_sources(sources_data, output_dir):
    os.makedirs(os.path.join(output_dir, 'Sources'), exist_ok=True)
    for source in sources_data['literarySources']:
        filename = f"{source['id']}.md"
        filepath = os.path.join(output_dir, 'Sources', filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            # YAML Frontmatter
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
                f.write(f"> {source['passage']}\n")
                if 'passageContext' in source:
                    f.write(f">\n> *{source['passageContext']}*\n")
                f.write("\n")
            
            f.write(f"## Historical & Lore Context\n{source.get('historicalContext', 'No context available.')}\n\n")
            
            if 'coverImage' in source:
                image_rel_path = source['coverImage'].lstrip('/') # assets/books/...
                image_src = os.path.join(output_dir, '..', 'public', image_rel_path)
                
                if os.path.exists(image_src):
                    attachments_dir = os.path.join(output_dir, 'Attachments')
                    os.makedirs(attachments_dir, exist_ok=True)
                    
                    image_filename = os.path.basename(image_src)
                    image_dest = os.path.join(attachments_dir, image_filename)
                    shutil.copy2(image_src, image_dest)
                    
                    f.write(f"## Cover\n![[{image_filename}]]\n\n")

            if 'wikiUrl' in source:

                f.write(f"[Wikipedia]({source['wikiUrl']})\n")

def convert_entities(entities_data, output_dir):
    entities_dir = os.path.join(output_dir, 'Entities')
    os.makedirs(entities_dir, exist_ok=True)
    
    # Subdirectories for cleaner organization
    os.makedirs(os.path.join(entities_dir, 'Abnormalities'), exist_ok=True)
    os.makedirs(os.path.join(entities_dir, 'Wings'), exist_ok=True)
    os.makedirs(os.path.join(entities_dir, 'Characters'), exist_ok=True)
    os.makedirs(os.path.join(entities_dir, 'Organizations'), exist_ok=True)
    os.makedirs(os.path.join(entities_dir, 'Misc'), exist_ok=True)

    for entity in entities_data['entities']:
        entity_type = entity['type']
        if entity_type == 'abnormality':
            folder = 'Abnormalities'
        elif entity_type == 'wing':
            folder = 'Wings'
        elif entity_type == 'character':
            folder = 'Characters'
        elif entity_type in ['organization', 'association', 'group']:
            folder = 'Organizations'
        else:
            folder = 'Misc'
            
        filename = f"{entity['name']}.md"
        # Sanitize filename
        safe_filename = entity['name'].replace(':', '-').replace('"', '').replace('?', '').replace('*', '')
        filepath = os.path.join(entities_dir, folder, f"{safe_filename}.md")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            # YAML Frontmatter
            f.write("---\n")
            f.write(f"id: {entity['id']}\n")
            f.write(f"type: {entity_type.capitalize()}\n")
            if 'subjectNumber' in entity:
                f.write(f"subject_number: \"{entity['subjectNumber']}\"\n")
            if 'riskLevel' in entity:
                f.write(f"risk_level: {entity['riskLevel']}\n")
            f.write(f"game: {entity['canonicalGame']}\n")
            if 'themes' in entity:
                f.write(f"themes: {json.dumps(entity['themes'])}\n")
            if 'parentEntityId' in entity:
                f.write(f"parent_entity: {entity['parentEntityId']}\n")
            f.write("---\n\n")
            
            f.write(f"# {entity['name']}\n\n")
            
            if 'subjectNumber' in entity:
                f.write(f"**Subject Number:** {entity['subjectNumber']} | **Risk Level:** {entity.get('riskLevel', 'N/A')}\n\n")
            
            f.write(f"## Lore Summary\n{entity.get('loreSummary', 'No summary available.')}\n\n")
            
            if 'appearances' in entity:
                f.write("## Appearances\n")
                f.write(", ".join([a.capitalize() for a in entity['appearances']]) + "\n\n")

            if 'literarySourceIds' in entity:
                f.write("## Literary Sources\n")
                for source_id in entity['literarySourceIds']:
                    f.write(f"- [[{source_id}]]\n")
                f.write("\n")

            if 'relatedSinnerIds' in entity or 'connectionInsights' in entity:
                f.write("## Sinner Connections\n")
                insights = entity.get('connectionInsights', {})
                for sinner_id in entity.get('relatedSinnerIds', []):
                    insight = insights.get(sinner_id, "No specific insight available.")
                    # Heuristic for linking to Sinners (assuming they match name or ID)
                    f.write(f"- **[[{sinner_id.capitalize()}]]**: {insight}\n")
                f.write("\n")
            
            if 'parentEntityId' in entity:
                f.write(f"## Parent Organization\n- [[{entity['parentEntityId']}]]\n\n")

            if 'relatedEntityIds' in entity:
                f.write("## Related Entities\n")
                insights = entity.get('connectionInsights', {})
                for rel_id in entity['relatedEntityIds']:
                    insight = insights.get(rel_id)
                    link = f"[[{rel_id}]]"
                    if insight:
                        f.write(f"- {link}: {insight}\n")
                    else:
                        f.write(f"- {link}\n")
                f.write("\n")



def main():
    base_path = r'c:\Users\lam\02project\RuniaAtlas'
    output_base = os.path.join(base_path, 'obsidian_vault_export')
    os.makedirs(output_base, exist_ok=True)
    
    # Sinners
    sinners_path = os.path.join(base_path, 'src', 'data', 'sinners.json')
    with open(sinners_path, 'r', encoding='utf-8') as f:
        sinners_data = json.load(f)
    convert_sinners(sinners_data, output_base)
    
    # Sources
    sources_path = os.path.join(base_path, 'src', 'data', 'literarySources.json')
    with open(sources_path, 'r', encoding='utf-8') as f:
        sources_data = json.load(f)
    convert_sources(sources_data, output_base)

    # Entities
    entities_path = os.path.join(base_path, 'src', 'data', 'crossGameEntities.json')
    with open(entities_path, 'r', encoding='utf-8') as f:
        entities_data = json.load(f)
    convert_entities(entities_data, output_base)

    
    print(f"Export complete. Vault created at: {output_base}")

if __name__ == "__main__":
    main()
