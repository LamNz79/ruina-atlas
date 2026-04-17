import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:/Users/lam/02project/RuniaAtlas/src/data/crossGameEntities.json', encoding='utf-8') as f:
    raw = json.load(f)

entities = raw['entities']

new_entities = [
    {
        "id": "entity-hana-association",
        "name": "Hana Association",
        "type": "wing",
        "canonicalGame": "ruina",
        "appearances": ["ruina", "limbus"],
        "literaryOrigin": "Korean flag symbolism — the four cardinal trigrams (qián, duì, lí, zhèn) are embedded in South Korea's national flag. The Hana Association's logo uses either the Arabic numeral 1 or Roman numeral I, placed at the center of a trigram design, directly mirroring this national symbol.",
        "loreSummary": "The highest-ranking of the 26 Wings — responsible for administering all other Wings and Fixer Offices. Issues Fixer licenses, assigns Grades 1–9 and Colors, and classifies the threat levels of Syndicates and Phenomena (Urban Myth → Urban Legend → Urban Plague → Urban Nightmare → Star of the City → Impurity). Their equipment consists of trigrams that can morph into any shape in combat. When threats exceed even Star of the City classification, they are labeled Impurity and handled directly by The Head.",
        "themes": ["machinery", "faith", "family", "decay"],
        "relatedSinnerIds": ["yi-sang"]
    },
    {
        "id": "entity-shi-association",
        "name": "Shi Association",
        "type": "wing",
        "canonicalGame": "ruina",
        "appearances": ["ruina", "limbus"],
        "literaryOrigin": "死 (shi) — the Japanese kanji for death, featured prominently in the Association's logo. The wordplay links to the Shi Association's philosophy: all people are equal in death, making any target viable for assassination.",
        "loreSummary": "Specializes in covert assassination — completing requests silently without witnesses. Shi Fixers cultivate an eye for weak points and execute plans promptly. Each branch uses different weapons suited to their environment: southern branch wields long katanas, eastern branch uses bowblades. The Association's uniform is black with red highlights. Following the events of Library of Ruina, the southern branch remains depleted and at risk of annihilation. Their fighting style emphasizes critical hits through Poise generation, primarily using Slash and Pierce Skills.",
        "themes": ["vengeance", "guilt", "decay"],
        "relatedSinnerIds": ["ryoshu"]
    },
    {
        "id": "entity-zwei-association",
        "name": "Zwei Association",
        "type": "wing",
        "canonicalGame": "ruina",
        "appearances": ["ruina", "limbus"],
        "literaryOrigin": "German word for the number two — reflected in the Association's logo which contains the Arabic numeral 2 within a shield design. This echoes Faust's Germanic origins and placement as Limbus Company's second Sinner.",
        "loreSummary": "Operates as the City\\'s \"shield\" — providing civil protection, peacekeeping, and proximity protection to clients in assigned territories. The South Section specializes in covert operations and major crimes investigation; the West Section values an imposing presence during contracts. Equipped with Zwei handers or batons and navy-blue coats (South) or knight-style armor (West). Fixers can patrol territories for days without relief. Appeared in Library of Ruina during Urban Legend, eventually losing Walter and Isadora to the Library.",
        "themes": ["family", "machinery", "guilt"],
        "relatedSinnerIds": ["faust", "ishmael"]
    },
    {
        "id": "entity-cinq-association",
        "name": "Cinq Association",
        "type": "wing",
        "canonicalGame": "ruina",
        "appearances": ["ruina", "limbus"],
        "literaryOrigin": "French word for the number five — reflected in the Association's logo featuring a stylized \"5\" around a rapier design. The Association's dueling culture draws from The Three Musketeers, the French historical novel by Alexandre Dumas featuring swashbuckling combat, strict dueling protocols, and aristocratic swordsmanship.",
        "loreSummary": "Specializes in one-on-one duels and close combat — substituting into fights on behalf of clients who request a Fixer to fight in their place. Duels have various \"levels,\" with Level 3 indicating a duel to the death. The Western branch uses rapiers and follows strict combat rules; the Eastern branch uses martial arts enhanced by pyrojade bangles that can melt steel weapons. Identities focus on gaining Haste through high Speed to outspeed opponents. The South and West traditionally declare duels by throwing a glove.",
        "themes": ["vengeance", "guilt", "decay"],
        "relatedSinnerIds": ["meursault", "sinclair"]
    },
    {
        "id": "entity-tres-association",
        "name": "Tres Association",
        "type": "wing",
        "canonicalGame": "ruina",
        "appearances": ["ruina", "limbus"],
        "literaryOrigin": "Spanish word for the number three — reflected in Don Quixote's Spanish origins and placement as Limbus Company's third Sinner. The connection extends the pattern of Wings reflecting the Sinner order through language and origin.",
        "loreSummary": "Manages all Workshops in the City — reviewing newly designed weapons, filing patent applications to The Head, and charging relative taxes. Their domain spans weapons, gadgets, and prosthetic models. Designs rejected by the Association cannot be produced commercially in their current state. The Association also runs qualification exams, including Workshop exams, for Fixers who wish to operate Workshops. The South branch has suffered heavy losses from Distortions, particularly the Blood-red Night and L'Heure du Loup events.",
        "themes": ["family", "machinery", "decay"],
        "relatedSinnerIds": ["don-quixote"]
    }
]

# Append new entities
entities.extend(new_entities)

with open(r'C:/Users/lam/02project/RuniaAtlas/src/data/crossGameEntities.json', 'w', encoding='utf-8') as f:
    json.dump(raw, f, indent=2, ensure_ascii=False)

print(f"Added {len(new_entities)} Wings to crossGameEntities.json")
for e in new_entities:
    print(f"  - {e['name']} (related: {e['relatedSinnerIds']})")