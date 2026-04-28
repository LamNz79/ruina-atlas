# Ruina Atlas — Community Feedback Roadmap

> Compiled from Reddit community comments. Last updated: 2026-04-24

---

## ✅ Already in Dataset

- Durante/Sephirah → Kabbalah Tree of Life
- Cain & Abel → Demian/Sinclair connection

---

## 🔴 High Priority — Literary Sources Missing

### Akutagawa Expansion (Ryoshu)
- [ ] **The Spider's Thread** — Akutagawa Ryunosuke
- [ ] **Rashomon** — Akutagawa Ryunosuke

### Ishmael — Secondary Source
- [ ] **The Little Mermaid** — Hans Christian Andersen
  - Queequeg mirrors The Mermaid: mute, self-sacrifice, dissolves into foam, becomes a spirit
  - Themes of alienation from two worlds, curiosity of the unknown, journey to gain agency

### Sinclair/Demian — Secondary Source
- [ ] **The Little Prince** — Antoine de Saint-Exupéry
  - Demian quotes the fox: *"the essential thing cannot be seen with the naked eye"*
  - Visual parallel: Sinclair's scarf resembles The Little Prince

---

## 🟡 Medium Priority — Wings & NPC References

| Entity | Literary Source | Author | Notes |
|--------|----------------|--------|-------|
| Dongrang | The Cow / The Mud Hut | Chi-Yin-Joo | Cow reference + character named Samjo |
| Rim | The Sea and The Butterfly (poem) | Kim In-Son | — |
| Indigo Elder | The Old Man and The Sea | Ernest Hemingway | — |
| Smee | Peter Pan | J.M. Barrie | — |
| Dongbaek | The Camellias | Gim Yujeong | — |
| Dreaming Electric Sheep | Do Androids Dream of Electric Sheep? | Philip K. Dick | — |
| Red Shoes | De røde sko | Hans Christian Andersen | — |

---

## 🟡 Medium Priority — Secondary Sources for Sinners

> PM's pattern: each Sinner has a primary literary source + at least one secondary source mashed in.

| Sinner | Primary Source | Secondary Source | Notes |
|--------|---------------|-----------------|-------|
| Hong Lu | Dream of the Red Chamber | Water Margin | Pinky members based on Water Margin characters |
| Don Quixote | Don Quixote (Cervantes) | Carmilla + Man of La Mancha (musical) | Vampire elements from Carmilla |
| Heathcliff | Wuthering Heights | Erlkönig + Wild Hunt (European folklore) | — |
| Gregor | The Metamorphosis | Kafka's real-life relationship with his father | Author-life parallel, not just author's works |

---

## 🟢 Low Priority — Abnormality & Event References

| Entity | Reference | Author/Origin |
|--------|-----------|---------------|
| Murder on the Warp Express | Murder on the Orient Express | Agatha Christie |
| Monstrous Santa Elf | Krampus | Central European folklore |
| Time Ripper | Jack the Ripper | Historical |

---

## 🔵 Architecture & Feature Changes

- [ ] **Secondary source relationship type**
  - Current graph has flat edges: `Sinner → Book`
  - Need: `primarySource` vs `secondarySources` with relationship notes and edge weights

- [ ] **Wings/NPC expansion milestone**
  - All non-Sinner references above need a dedicated milestone

- [ ] **Author-parallel relationship type**
  - New edge type: character ↔ author's personal life
  - Example: Gregor ↔ Kafka's relationship with his father

---

## 📌 Credits

Community research compiled from:
- u/Argold2898
- u/Emotional_Iron7353
- u/yrozr
- u/MiserableHair2233
