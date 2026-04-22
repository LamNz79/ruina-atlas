# Ruina Atlas: Lore Data Summary

This document provides a simplified overview of the current data entities in the project. Use this as a reference for identifying structural hierarchies and reducing visual clutter in the `LoreGraph`.

---

## 1. Sinners (Limbus Company)
*Basic info: Name, Primary Theme, and Literary Source.*

| Sinner | Primary Themes | Literary Source |
| :--- | :--- | :--- |
| **Dante** | Guilt, Futility, Faith | *The Divine Comedy* (Dante Alighieri) |
| **Faust** | Guilt, Redemption, Knowledge | *Faust* (Goethe) |
| **Meursault** | Futility, Absurdity | *The Stranger* (Albert Camus) |
| **Hong Lu** | Decay, Family, Illusion | *Dream of the Red Chamber* (Cao Xueqin) |
| **Heathcliff** | Vengeance, Obsession | *Wuthering Heights* (Emily Brontë) |
| **Yi Sang** | Decay, Dissociation, Poetry | *The Wings* (Yi Sang) |
| **Ishmael** | Vengeance, Obsession, Survival | *Moby-Dick* (Herman Melville) |
| **Rodion** | Guilt, Redemption, Pride | *Crime and Punishment* (Dostoevsky) |
| **Sinclair** | Faith, Growth, Volatility | *Demian* (Hermann Hesse) |
| **Outis** | Vengeance, Deception, Duty | *The Odyssey* (Homer) |
| **Gregor** | Metamorphosis, Family, Guilt | *The Metamorphosis* (Franz Kafka) |
| **Don Quixote**| Absurdity, Heroism, Delusion | *Don Quixote* (Cervantes) |
| **Ryoshu** | Vengeance, Art, Obsession | *Hell Screen* (Akutagawa) |

---

## 2. Wings & Major Groups
*Structural hierarchy used for graph grouping.*

### **Lobotomy Corporation (L-Corp)**
*   **Status**: Parent Wing
*   **Sub-Groups (Teams)**:
    *   Control, Information, Training, Security, Central Command, Disciplinary, Welfare, Extraction, Record, Architecture.
*   **Key Personnel**: Ayin (Director), Angela (AI), 10 Sephirah (Managers).

### **Library of Ruina**
*   **Status**: Successor Entity
*   **Sub-Groups (Floors)**:
    *   History, Tech. Sciences, Literature, Art, Natural Sciences, Language, Social Sciences, Philosophy, Religion.
*   **Key Personnel**: Angela (Director), Roland (Librarian), 10 Patron Librarians (Sephirah).

### **Limbus Company**
*   **Status**: Current Focus
*   **Key Entities**: LCB (Bus), LC-B (Before), LC-A (After), LCCB (Before), LCC-B.
*   **Key Personnel**: Dante, Vergilius, Faust, Charon.

### **Other Wings (The City)**
*   **N Corp**: Nagel und Hammer (Inquisition), Mirror Technology.
*   **W Corp**: Warp Trains, Cleanup Agents.
*   **K Corp**: HP Ampules, Excision Staff.
*   **R Corp**: Private Military, Rabbit/Reindeer/Rhino Packs.

---

## 3. Abnormalities
*Entities that grant E.G.O to Sinners.*

| Abnormality | Risk Level | Connected Sinners |
| :--- | :--- | :--- |
| **One Sin and Hundreds of Good Deeds** | ZAYIN | Sinclair, Ryoshu |
| **Plague Doctor / WhiteNight** | ALEPH | (General) |
| **Fairy Festival** | ZAYIN | Ishmael |
| **Forsaken Murderer** | TETH | Faust |
| **Punishing Bird** | TETH | (The Three Birds) |
| **Der Freischütz** | HE | Outis |
| **The Queen of Hatred** | WAW | Don Quixote |
| **Nothing There** | ALEPH | (Metamorphosis) |
| **Funeral of the Dead Butterflies** | HE | Yi Sang |
| **The Knight of Despair** | WAW | Rodion |
| **Ardor Blossom Moth** | HE | Faust |
| **Drifting Fox** | HE | Heathcliff, Yi Sang |

---

## 4. Key Cross-Game Characters
*Entities bridging multiple titles.*

*   **Angela**: AI from Lobotomy, Director of the Library.
*   **Ayin (A)**: Creator of L-Corp, architect of the Seed of Light.
*   **The Sephirah**: 10 managers of L-Corp teams who became the 10 Patron Librarians of the Library floors.
*   **Vergilius**: The Red Gaze, guide for Limbus Company.
*   **Charon**: Driver of Mephistopheles.

---

## 5. Structural Link Types
*Used to define the edges in the LoreGraph.*

1.  **structural-hierarchy**: Parent/Child (e.g., L-Corp -> Control Team).
2.  **literary-origin**: Sinner -> Literary Source.
3.  **ego-synchronization**: Sinner -> Abnormality (via E.G.O equipment).
4.  **wing-affiliation**: Sinner Identity -> Wing/Group.
5.  **cross-game-continuity**: Character appearance across games (e.g., Angela).
6.  **thematic-link**: Weakest link (Shared themes like "Guilt" or "Machinery").
