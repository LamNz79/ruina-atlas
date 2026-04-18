# AC1 Literary Sources — JSON Draft
**Generated from:** `docs/ac1-literary-sources-draft.md`
**Date:** 2026-04-17

---

## PART 1: New entries for `literarySources.json`

```json
{
  "id": "the-sea-wolf",
  "title": "The Sea-Wolf",
  "author": "Jack London",
  "year": 1904,
  "country": "United States",
  "themes": ["survival", "individualism", "nature", "civilization"],
  "summary": "A philosophical adventure novel about Wolf Larsen, a brutal but intellectually gifted sea captain, and his philosophical rivalry with the protagonist Humphrey van Weyden. Explores Nietzschean will-to-power, the nature of strength, and whether civilization restrains or shapes human potential. Wolf writes poetry in secret, revealing the tension between brute force and refined spirit."
},
{
  "id": "tartuffe",
  "title": "Tartuffe",
  "author": "Molière",
  "year": 1664,
  "country": "France",
  "themes": ["hypocrisy", "faith", "self-deception", "appearances"],
  "summary": "A satirical comedy about a devout man, Tartuffe, who dupes the wealthy Orgon into giving him control of his estate through performance of extreme piety. Explores the gap between performed righteousness and actual virtue, and how faith can be weaponized as a social tool. Tartuffe sees himself as chosen by God while committing fraud — a weaponized conscience."
},
{
  "id": "picture-dorian-gray",
  "title": "The Picture of Dorian Gray",
  "author": "Oscar Wilde",
  "year": 1890,
  "country": "United Kingdom",
  "themes": ["aestheticism", "corruption", "youth", "duality"],
  "summary": "Dorian Gray remains forever young while his portrait ages and bears the marks of his sins and debauchery. Art becomes the vessel for moral corruption — the painting externalizes what Dorian hides. Explores the dangerous idea that aesthetic beauty is the only truth and that reality is merely material for artistic transformation. The portrait is both confessional and condemnation."
},
{
  "id": "waiting-godot",
  "title": "Waiting for Godot",
  "author": "Samuel Beckett",
  "year": 1953,
  "country": "Ireland / France",
  "themes": ["absurdism", "等待", "purpose", "ritual"],
  "summary": "Two men, Vladimir and Estragon, wait by a road for someone named Godot who never arrives. A landmark of the Theatre of the Absurd — it asks why people perform rituals of meaning (waiting, greeting, departing) when no ultimate meaning exists. Estragon's indifference, Vladimir's persistence, and Pozzo and Lucky's collapse into dependency all explore different responses to a world without guarantees."
},
{
  "id": "journey-west",
  "title": "Journey to the West",
  "author": "Wu Cheng'en",
  "year": 1592,
  "country": "China",
  "themes": ["redemption", "duty", "companionship", "corruption"],
  "summary": "One of the Four Great Classical Novels of Chinese literature. A monk, Tripitaka (Xuanzang), travels west to India with three supernatural disciples — the rebellious Sun Wukong, the greedy Zhu Bajie, and the steadfast Sha Wujing — to retrieve Buddhist sutras. Each disciple is bound by past sins and seeks redemption through duty. A story of a group bound by fate, navigating corrupt institutions and supernatural trials, where each character's distinct personality creates friction and complement in equal measure."
},
{
  "id": "burns-poetry",
  "title": "Poems and Songs",
  "author": "Robert Burns",
  "year": 1793,
  "country": "Scotland",
  "themes": ["love", "nature", "rebellion", "romanticism"],
  "summary": "Scotland's national poet's collected works include 'A Red, Red Rose,' 'Highland Mary,' 'Tam o' Shanter,' and 'To a Mouse.' Brontë opens Wuthering Heights with an epigraph from Burns's 'Highland Mary.' Burns's Romantic celebration of elemental passion, love as overwhelming force, and nature as emotional landscape is the literary atmosphere Heathcliff breathes. His love for Catherine is written in the grammar of Burns — 'my heart's in the Highlands,' 'a red, red rose.'"
},
{
  "id": "kafka-letters",
  "title": "Letters to Milena",
  "author": "Franz Kafka",
  "year": 1952,
  "country": "Czech Republic",
  "themes": ["isolation", "communication", "desire", "impossibility"],
  "summary": "A collection of letters Kafka wrote to Milena Jesenská, a woman he loved but could never fully reach. The letters are written from within an impossible situation — Kafka unable to bridge the gap between his inner world and external connection. The letters explore the impossibility of making oneself understood when language itself feels inadequate. Gregor's transformation isolates him from communication exactly as Kafka's letters document: he can hear others but cannot make himself understood. Isolation as the human condition."
}
```

---

## PART 2: Updated `literarySources` arrays for each Sinner in `sinners.json`

```json
// ===== FAUST =====
{
  "id": "faust",
  "literarySources": [
    { "id": "faust-goethe", "role": "primary", "specificConnection": "Faust is the protagonist of Goethe's two-part tragic play (1808/1832), a scholar who makes a pact with the devil Mephistopheles trading his soul for infinite knowledge and experience. Limbus Faust mirrors this: her manipulations of the Index, her deals with other factions, and her role as a collector of forbidden knowledge all stem from Faust's unquenchable drive for understanding — even at the cost of others." },
    { "id": "mephistopheles", "role": "influence", "specificConnection": "Mephistopheles is a figure who bargains for souls across folklore, legend, and literature beyond Goethe's play alone — the devil's bargain as cultural archetype. Limbus Faust doesn't just reference Goethe's Faust; she embodies the *idea* of the devil's bargain itself. Her signature manipulation of the Index and her morally ambiguous contracts throughout Limbus Company are the Mephistopheles archetype in action — a figure who sees through human weakness and exploits it with cold precision." }
  ]
}

// ===== ISHMAEL =====
{
  "id": "ishmael",
  "literarySources": [
    { "id": "moby-dick", "role": "primary", "specificConnection": "The sole survivor of a whaling ship destroyed by the white whale Moby Dick, Ishmael narrates the obsessive pursuit of the whale by Captain Ahab. His survival and transformation through the experience mirrors Limbus Ishmael's arc — she alone survives the confrontation with Captain Ahab and is fundamentally changed by it. Ishmael's role as the narrator and sole survivor connects directly to Limbus Ishmael's identity as the one who remembers and bears witness." },
    { "id": "the-sea-wolf", "role": "secondary", "specificConnection": "Captain Wolf of The Sea-Wolf is Ahab's literary foil — a brutal survivalist whose philosophical strength is undercut by his own hidden refinement (he writes poetry in secret). Both Wolf and Ahab are captains whose obsession reveals something essential about human nature under pressure. Ishmael survives both encounters and in both cases is changed by the experience — the 'literary survivor' archetype that connects London to Melville through Ishmael's eyes." }
  ]
}

// ===== SINCLAIR =====
{
  "id": "sinclair",
  "literarySources": [
    { "id": "demian", "role": "primary", "specificConnection": "Emil Sinclair is a young man caught between two worlds — the safe light of conventional morality and a dark 'other side' represented by Max Demian. His awakening to his own shadow, and his journey toward selfhood through confrontation with that darkness, is the direct template for Limbus Sinclair's arc from sheltered innocence to confronting the monstrous power within himself." },
    { "id": "brothers-karamazov", "role": "secondary", "specificConnection": "Both Sinclair and Dmitri Karamazov are physically or spiritually young men destroyed and remade by exposure to darkness. Dmitri's collision between base impulses and moral aspiration, his guilt, and his spiritual crisis mirror Sinclair's journey from innocence through the 'Klein family' dark wing to self-acceptance. Both Hesse and Dostoevsky use the 'descent to find truth' structural arc — entering the shadow to emerge transformed." }
  ]
}

// ===== DON QUIXOTE =====
{
  "id": "don-quixote",
  "literarySources": [
    { "id": "don-quixote", "role": "primary", "specificConnection": "Alonso Quijano believes he is a knight-errant and rides out to right wrongs, mistaking windmills for giants and peasant women for noble ladies. His unwavering conviction and his golden dream — that the world can be made right through heroic action — are the heart of Cervantes's novel. Limbus Don Quixote's EGO manifestations and relentless pursuit of her ideals follow this template directly." },
    { "id": "tartuffe", "role": "secondary", "specificConnection": "Tartuffe weaponizes religious conviction — he performs righteousness while committing fraud. Don Quixote inverts this: genuine conviction mistaken for madness. Both characters' relationship with faith, truth, and self-image creates friction with the world around them. Limbus Don Quixote's unwavering belief in her golden dream parallels both Tartuffe's performed faith and Quixote's genuine delusion — exploring the gap between performed righteousness and actual conviction. The 'performance vs. reality of virtue' theme connects directly." }
  ]
}

// ===== RYOSHU =====
{
  "id": "ryoshu",
  "literarySources": [
    { "id": "utai-rashomon", "role": "primary", "specificConnection": "Rashomon is the gate of Rashomon in medieval Kyoto — a feudal setting where corpse disposal created a moral crisis. The structure of the play (multiple perspectives on the same event) and the question of moral accountability in a collapsed society connects directly to Ryoshu's identity as a violent artist operating in a world where no authority holds. The 'truth hidden behind perspective' theme mirrors Ryoshu's 'art is the only truth' philosophy." },
    { "id": "picture-dorian-gray", "role": "secondary", "specificConnection": "Dorian Gray's portrait bears his sins while he remains beautiful — art externalizing moral corruption. Ryoshu is an artist who treats art as more real than reality, using violence and madness as raw material. Her EGO and identity art literally manifests her inner world externally. Both characters use art to externalize and hide their true nature simultaneously — the portrait and the painting as moral mirrors. The 'art as corruption vehicle' theme is shared across both Wilde and the Rashomon legacy." }
  ]
}

// ===== MEURSAULT =====
{
  "id": "meursault",
  "literarySources": [
    { "id": "the-stranger", "role": "primary", "specificConnection": "Meursault is Camus's exemplar of the absurd man — he feels no grief at his mother's funeral, commits a motiveless murder, and refuses to perform the emotions society demands at his trial. His refusal to invest social rituals with meaning, and his ultimate acceptance of the indifference of the universe, is Limbus Meursault's direct template." },
    { "id": "waiting-godot", "role": "secondary", "specificConnection": "Meursault's refusal to perform emotions or invest social rituals with meaning is structurally identical to Vladimir and Estragon's predicament in Waiting for Godot — going through meaningless motions, unable to act, waiting for something that never arrives. Meursault is the absurd man who doesn't wait for Godot; he simply *is*. His trial demands he perform meaning he doesn't feel — exactly the trap Vladimir and Estragon are in. Both works interrogate why people perform rituals when no ultimate meaning exists." }
  ]
}

// ===== HONG LU =====
{
  "id": "hong-lu",
  "literarySources": [
    { "id": "dream-of-the-red-chamber", "role": "primary", "specificConnection": "Hong Lu's primary literary connection is Dream of the Red Chamber — he comes from a wealthy, powerful family (the Rong clan) whose decline he witnesses and ultimately leaves behind. His calm detachment from suffering and his role as a witness to the Jia household's collapse mirrors the novel's themes of impermanence and the Buddhist cycle of suffering." },
    { "id": "journey-west", "role": "secondary", "specificConnection": "Both Dream of the Red Chamber and Journey to the West feature groups bound by fate, each with distinct personalities, navigating supernatural beings and corrupt institutions. Hong Lu's placid acceptance of suffering and calm helpfulness mirrors Tripitaka's serene moral leadership, while his detachment parallels Sun Wukong's irreverent freedom. Both stories use the group-traveling-through-a-hostile-world structure where each character reveals their nature through crisis." }
  ]
}

// ===== HEATHCLIFF =====
{
  "id": "heathcliff",
  "literarySources": [
    { "id": "wuthering-heights", "role": "primary", "specificConnection": "Heathcliff is an orphan brought to Wuthering Heights who develops an all-consuming, destructive love for Catherine Earnshaw. His revenge against those who separated them consumes both him and the next generation. His elemental, almost supernatural passion and his connection to the natural landscape of the Yorkshire moors are the direct template for Limbus Heathcliff — a man whose love and rage are indistinguishable, and whose violence is the expression of both." },
    { "id": "burns-poetry", "role": "secondary", "specificConnection": "Brontë opens Wuthering Heights with an epigraph from Burns's poem 'Highland Mary,' and Heathcliff's character is written in Burns's Romantic grammar: 'O my Luve is like a red, red rose,' 'forlorn, torn.' Burns's celebration of elemental passion, nature as emotional landscape, and love as overwhelming force is the atmosphere Heathcliff breathes. His moorland love for Catherine is the Romantic hero from a Burns poem given narrative form — impulsive, fierce, and ultimately destructive." }
  ]
}

// ===== RODION =====
{
  "id": "rodion",
  "literarySources": [
    { "id": "crime-and-punishment", "role": "primary", "specificConnection": "Rodya Romanov commits murder believing his intelligence exempts him from moral law — and is destroyed by guilt and the weight of his deed. His psychological spiral, his need for external validation, and his desperate grasping for a way to make his suffering mean something are Limbus Rodion's direct template. Both characters are physically imposing men of the people who are destroyed by an act committed partly from desperation and partly from pride." },
    { "id": "brothers-karamazov", "role": "secondary", "specificConnection": "Rodya Romanov and Dmitri Karamazov share the archetype of the passionate man falsely accused, destroyed by circumstance and impulse. Both are physically imposing men of the people, prone to impulsiveness, carrying enormous guilt over something not fully under their control. The psychological spiral and the desperate need for redemption through suffering is shared across both Dostoevsky's masterworks. Rodion's anxious self-talk and need for validation is pure Dmitri." }
  ]
}

// ===== GREGOR =====
{
  "id": "gregor",
  "literarySources": [
    { "id": "metamorphosis-kafka", "role": "primary", "specificConnection": "Gregor Samsa wakes one morning to find himself transformed into a monstrous vermin — losing his job, his identity, and eventually his family's care. His silent, persistent humanity beneath the bug form and his slow erasure from the family's consciousness is Limbus Gregor's direct template. Both Gregors are men made monstrous by circumstance, who lose the ability to speak and must watch as the world moves on without them." },
    { "id": "kafka-letters", "role": "influence", "specificConnection": "Kafka's letters — especially Letters to Milena and the letters from The Castle's protagonist K. — explore the impossibility of making contact when language feels inadequate. Gregor's transformation isolates him from communication: he can hear others clearly but cannot make himself understood. This mirrors Kafka's letters, written from within an impossible situation, reaching toward connection that cannot arrive. Gregor's silent humanity is the same impulse as Kafka's letters — reaching through the impossibility." }
  ]
}
```

---

## PART 3: Summary table

| Sinner | Primary ID | Primary Title | Secondary ID | Secondary Title | Role |
|--------|------------|---------------|--------------|----------------|------|
| faust | faust-goethe | Faust | mephistopheles | Mephistopheles (Devil Legend) | influence |
| ishmael | moby-dick | Moby-Dick | the-sea-wolf | The Sea-Wolf | secondary |
| sinclair | demian | Demian | brothers-karamazov | The Brothers Karamazov | secondary |
| don-quixote | don-quixote | Don Quixote | tartuffe | Tartuffe | secondary |
| ryoshu | utai-rashomon | Rashomon | picture-dorian-gray | The Picture of Dorian Gray | secondary |
| meursault | the-stranger | The Stranger | waiting-godot | Waiting for Godot | secondary |
| hong-lu | dream-of-the-red-chamber | Dream of the Red Chamber | journey-west | Journey to the West | secondary |
| heathcliff | wuthering-heights | Wuthering Heights | burns-poetry | Poems and Songs (Robert Burns) | secondary |
| rodion | crime-and-punishment | Crime and Punishment | brothers-karamazov | The Brothers Karamazov | secondary |
| gregor | metamorphosis-kafka | The Metamorphosis | kafka-letters | Letters to Milena | influence |
