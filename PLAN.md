# 📋 PLAN.md - Développement "Ma Cabane"

---

## 🎯 Vue d'ensemble du projet

**Jeu actuel :** Survie isométrique 40×40 tuiles avec système de saisons, faim/froid, construction de bâtiments.

**Objectif :** Ajouter 9 nouveaux bâtiments avec chaînes de production avancées + habitants autonomes + placement cohérent.

---

## 📊 État actuel (ce qui FONCTIONNE déjà)

### ✅ **Système de base**
- Terrain scrollable 40×40 tuiles
- Pan tactile (1 doigt) + Pinch-to-zoom (2 doigts)
- Boutons zoom ➕/➖ et recentrage 🎯
- PWA installable, fonctionne offline

### ✅ **Bâtiments existants (9)**
- Abri (niveau 1 et 2)
- Champ de blé
- Palissade
- Pont
- Boulangerie
- Poissonnerie
- Moulin
- Feu de camp
- Tour de guet

### ✅ **Ressources actuelles**
- Bois (🪵)
- Pierre (🪨)
- Blé (🌾)
- Farine (🌾→)
- Poisson cru (🐟)
- Poisson cuit (🍳)
- Pain (🍞)

### ✅ **Systèmes fonctionnels**
- 4 saisons (Printemps, Été, Automne, Hiver)
- Jauges faim + froid
- Habitants (spawn mais inactifs)
- Loups attaquent en hiver
- Lapins qui fuient
- Rivière + ponts
- Croissance des champs (3 stades)
- Production moulin (blé → farine)
- Production boulangerie (farine → pain)
- Production poissonnerie (poisson cru → cuit)

---

## 🚨 PROBLÈMES ACTUELS à corriger

### ❌ **Problème 1 : Placement incohérent**
**Symptôme :** Les bâtiments peuvent être placés n'importe où, même dans l'eau.

**Impact :** Immersion cassée, gameplay illogique.

**Solution requise :** Phase 1

---

### ❌ **Problème 2 : Habitants inutiles**
**Symptôme :** Les habitants spawns mais restent immobiles et ne font rien.

**Impact :** Ressource gaspillée, aucun intérêt à construire des abris.

**Solution requise :** Phase 2

---

## 📅 PLAN DE DÉVELOPPEMENT

---

# PHASE 1 : PLACEMENT COHÉRENT DES ASSETS

**Priorité :** ⭐⭐⭐ CRITIQUE
**Durée estimée :** 30 minutes
**Difficulté :** ⚡ Facile

---

## 🎯 Objectif

Empêcher le placement de bâtiments dans des zones invalides (rivière, hors carte, sur d'autres bâtiments).

---

## 🔧 Spécifications techniques

### **Zones INTERDITES pour la construction**

1. **Tuiles de rivière** (sauf si pont existant)
   - Vérifier `riverTileSet.has(key)`
   - Autoriser si `bridges.some(b => b.x === x && b.y === y)`

2. **Hors limites du monde**
   - `x < 0 || x >= CONFIG.worldWidth`
   - `y < 0 || y >= CONFIG.worldHeight`

3. **Tuiles occupées**
   - Arbre non coupé
   - Autre bâtiment existant
   - Pile de ressources

### **Fonction à modifier : `isTileFree(x, y)`**

**Localisation :** Ligne ~820 dans `game.js`

**Amélioration requise :**

```javascript
function isTileFree(x, y) {
    // Vérifier limites du monde
    if (x < 0 || x >= CONFIG.worldWidth || y < 0 || y >= CONFIG.worldHeight) {
        return false;
    }
    
    // Vérifier rivière (sauf si pont)
    const key = `${x},${y}`;
    const isRiver = riverTileSet.has(key);
    const hasBridge = bridges.some(b => b.x === x && b.y === y);
    if (isRiver && !hasBridge) {
        return false;
    }
    
    // Vérifier occupation actuelle
    const hasTree     = trees.some(t => !t.chopped && t.x === x && t.y === y);
    const hasShelter  = shelters.some(s => s.x === x && s.y === y);
    const hasField    = fields.some(f => f.x === x && f.y === y);
    const hasPalisade = palisades.some(p => p.x === x && p.y === y);
    const hasMill     = mills.some(m => m.x === x && m.y === y);
    const hasBakery   = bakeries.some(b => b.x === x && b.y === y);
    const hasCampfire = campfires.some(c => c.x === x && c.y === y);
    const hasPoissonnerie = poissonneries.some(p => p.x === x && p.y === y);
    const hasTower    = towers.some(t => t.x === x && t.y === y);
    const hasWoodPile = woodPiles.some(w => w.x === x && w.y === y);
    const hasStonePile = stonePiles.some(s => s.x === x && s.y === y);
    
    return !hasTree && !hasShelter && !hasField && !hasPalisade && 
           !hasMill && !hasBakery && !hasCampfire && !hasPoissonnerie && 
           !hasTower && !hasWoodPile && !hasStonePile;
}
```

### **Gestion des clics de construction**

**Localisation :** Event listener `canvas.addEventListener('click', ...)` ligne ~2100

**Modification requise :**

Pour CHAQUE mode de construction, ajouter la vérification :

```javascript
if (buildMode) {
    if (!isTileFree(gridPos.x, gridPos.y)) {
        spawnPopup('⚠️ Emplacement invalide !', gridPos.x, gridPos.y);
        return;
    }
    // ... reste du code de construction
}
```

**Appliquer à tous les modes :**
- `buildMode` (abri)
- `buildFieldMode` (champ)
- `buildPalisadeMode` (palissade)
- `buildBridgeMode` (pont - EXCEPTION : doit être sur rivière)
- `buildMillMode` (moulin)
- `buildBakeryMode` (boulangerie)
- `buildCampfireMode` (feu)
- `buildPoissonnierieMode` (poissonnerie)
- `buildTowerMode` (tour)

**Exception pour les ponts :**

```javascript
if (buildBridgeMode) {
    const isRiver = riverTileSet.has(`${gridPos.x},${gridPos.y}`);
    const alreadyBridge = bridges.some(b => b.x === gridPos.x && b.y === gridPos.y);
    
    if (!isRiver) {
        spawnPopup('⚠️ Le pont doit être sur la rivière !', gridPos.x, gridPos.y);
        return;
    }
    if (alreadyBridge) {
        spawnPopup('⚠️ Un pont existe déjà ici !', gridPos.x, gridPos.y);
        return;
    }
    // ... construction du pont
}
```

---

## ✅ Checklist Phase 1

- [ ] Modifier fonction `isTileFree(x, y)` avec toutes les vérifications
- [ ] Ajouter vérification `!isTileFree()` pour chaque mode de construction
- [ ] Tester : essayer de construire dans l'eau → doit refuser
- [ ] Tester : essayer de construire hors carte → doit refuser
- [ ] Tester : essayer de construire sur un arbre → doit refuser
- [ ] Tester : pont sur terre → doit refuser
- [ ] Tester : pont sur rivière → doit accepter
- [ ] Messages d'erreur clairs pour chaque cas

---

## 🧪 Tests de validation Phase 1

**Test 1 : Rivière**
1. Activer mode construction abri
2. Cliquer sur une tuile de rivière
3. ✅ Attendu : Message "⚠️ Emplacement invalide !"

**Test 2 : Arbre**
1. Activer mode construction champ
2. Cliquer sur un arbre
3. ✅ Attendu : Message "⚠️ Emplacement invalide !"

**Test 3 : Pont**
1. Activer mode construction pont
2. Cliquer sur terre
3. ✅ Attendu : Message "⚠️ Le pont doit être sur la rivière !"

**Test 4 : Hors carte**
1. Zoomer/dézoomer pour voir les limites
2. Cliquer au-delà de la grille 40×40
3. ✅ Attendu : Rien ne se passe (ou message d'erreur)

---

# PHASE 2 : HABITANTS AUTONOMES

**Priorité :** ⭐⭐⭐ HAUTE
**Durée estimée :** 1-2 heures
**Difficulté :** ⚡⚡ Moyenne

---

## 🎯 Objectif

Faire fonctionner les habitants : ils doivent se déplacer, collecter des ressources automatiquement et consommer de la nourriture.

---

## 📊 État actuel du système habitants

**Code existant (INACTIF) :**
- ✅ Variable `habitants[]` ligne ~800
- ✅ Fonction `spawnHabitant(shelter)` ligne ~1816
- ✅ Fonction `updateHabitants()` ligne ~1870
- ✅ Fonction `drawHabitant(h)` ligne ~1940
- ✅ Sprites homme/femme chargés

**Problème :** `updateHabitants()` est appelé dans `gameLoop()` mais ne fonctionne pas correctement.

---

## 🔧 Spécifications techniques

### **Comportement attendu d'un habitant**

#### **1. Déplacement aléatoire (vagabondage)**

**Rayon d'action :** `CONFIG.habitantWanderRadius = 4` tuiles autour de l'abri

**Algorithme :**
```
Quand waitTimer atteint 0 :
1. Choisir une cible aléatoire dans un rayon de 4 tuiles autour de l'abri
2. Vérifier que la cible n'est pas dans la rivière (sauf pont)
3. Se déplacer progressivement vers la cible
4. Arrivé → pause (waitTimer = 120-300 frames)
5. Répéter
```

**Variables requises :**
```javascript
{
    x, y,              // Position actuelle
    targetX, targetY,  // Destination
    shelter,           // Référence à l'abri d'origine
    walkCycle,         // Animation de marche
    isMoving,          // Vrai si en déplacement
    waitTimer,         // Pause entre déplacements
    gatherCooldown,    // Délai entre collectes
    foodTimer          // Compteur avant prochain repas
}
```

#### **2. Collecte automatique de ressources**

**Ressources collectées :**
- 🪵 **Piles de bois** (`woodPiles`)
- 🌾 **Champs mûrs** (`fields` avec `stage === 3`)

**Algorithme :**
```javascript
// À chaque frame dans updateHabitants() :
if (gatherCooldown === 0) {
    // Chercher pile de bois proche (< 1.5 tuiles)
    const woodIdx = woodPiles.findIndex(w => distance(habitant, w) < 1.5);
    if (woodIdx !== -1) {
        player.wood += woodPiles[woodIdx].amount;
        woodPiles.splice(woodIdx, 1);
        spawnPopup(`+${amount}🪵`, habitant.x, habitant.y);
        habitant.gatherCooldown = CONFIG.habitantGatherCooldown; // 300 frames
        updateWoodDisplay();
        return;
    }
    
    // Chercher champ mûr proche
    const matureField = fields.find(f => 
        f.stage === 3 && distance(habitant, f) < 1.5
    );
    if (matureField) {
        player.wheat += CONFIG.wheatPerHarvest;
        matureField.stage = 0;
        matureField.growTimer = CONFIG.growthStageTime;
        spawnPopup(`+${CONFIG.wheatPerHarvest}🌾`, habitant.x, habitant.y);
        habitant.gatherCooldown = CONFIG.habitantGatherCooldown;
        updateWheatDisplay();
    }
}
```

**Config requise :**
```javascript
CONFIG.habitantGatherCooldown = 300; // 5 secondes entre collectes
```

#### **3. Consommation de nourriture**

**Fréquence :** Toutes les `CONFIG.habitantFoodInterval` frames (~2 minutes)

**Ordre de préférence :**
1. Poisson cuit (meilleur)
2. Pain
3. Poisson cru (moins bon)

**Algorithme :**
```javascript
habitant.foodTimer++;
if (habitant.foodTimer >= CONFIG.habitantFoodInterval) {
    habitant.foodTimer = 0;
    
    // Essayer de manger (ordre de préférence)
    if (player.cookedFish > 0) {
        player.cookedFish--;
        updateCookedFishDisplay();
    } else if (player.bread > 0) {
        player.bread--;
        updateBreadDisplay();
    } else if (player.fish > 0) {
        player.fish--;
        updateFishDisplay();
    } else {
        // FAMINE : l'habitant quitte le village
        spawnPopup('😢 Un habitant est parti !', habitant.shelter.x, habitant.shelter.y);
        habitants.splice(index, 1);
        updateHabitantDisplay();
    }
}
```

**Config requise :**
```javascript
CONFIG.habitantFoodInterval = 7200; // 120s à 60fps = 2 minutes
```

---

## 🛠️ Code à modifier

### **Fichier : `game.js`**

### **1. Vérifier updateHabitants() est bien appelé**

**Localisation :** Fonction `gameLoop()` ligne ~2400

**Vérifier la présence de :**
```javascript
function gameLoop() {
    // ... autre code
    updateHabitants(); // ← DOIT être présent
    // ... autre code
}
```

**Si absent, ajouter après `updateRabbits()`**

---

### **2. Corriger updateHabitants()**

**Localisation :** Ligne ~1870

**Code complet à remplacer :**

```javascript
function updateHabitants() {
    for (let i = habitants.length - 1; i >= 0; i--) {
        const h = habitants[i];

        // --- MOUVEMENT ---
        const dx = h.targetX - h.x;
        const dy = h.targetY - h.y;
        const distToTarget = Math.sqrt(dx * dx + dy * dy);
        
        h.isMoving = distToTarget > 0.05;

        if (h.isMoving) {
            // Avancer vers la cible
            const speed = CONFIG.playerSpeed * 0.55;
            h.x += (dx / distToTarget) * speed;
            h.y += (dy / distToTarget) * speed;
            
            // Arrondir quand très proche
            if (Math.abs(h.x - h.targetX) < 0.1) h.x = h.targetX;
            if (Math.abs(h.y - h.targetY) < 0.1) h.y = h.targetY;
            
            // Animation de marche
            h.walkCycle += 0.12;
        } else {
            // Ralentir l'animation
            h.walkCycle *= 0.85;
            
            // Attente avant prochaine destination
            h.waitTimer--;
            if (h.waitTimer <= 0) {
                // Choisir nouvelle destination aléatoire autour de l'abri
                const radius = CONFIG.habitantWanderRadius;
                let nx = Math.round(h.shelter.x + (Math.random() * 2 - 1) * radius);
                let ny = Math.round(h.shelter.y + (Math.random() * 2 - 1) * radius);
                
                // Limiter aux bords du monde
                nx = Math.max(0, Math.min(CONFIG.worldWidth - 1, nx));
                ny = Math.max(0, Math.min(CONFIG.worldHeight - 1, ny));
                
                // Vérifier rivière
                const key = `${nx},${ny}`;
                const isRiver = riverTileSet.has(key);
                const hasBridge = bridges.some(b => b.x === nx && b.y === ny);
                
                if (!isRiver || hasBridge) {
                    h.targetX = nx;
                    h.targetY = ny;
                }
                
                h.waitTimer = 120 + Math.floor(Math.random() * 200);
            }
        }

        // --- COLLECTE DE RESSOURCES ---
        if (h.gatherCooldown > 0) {
            h.gatherCooldown--;
        } else {
            // Pile de bois proche ?
            const woodIdx = woodPiles.findIndex(w => {
                const dx = h.x - w.x;
                const dy = h.y - w.y;
                return Math.sqrt(dx * dx + dy * dy) < 1.5;
            });
            
            if (woodIdx !== -1) {
                const amount = woodPiles[woodIdx].amount;
                player.wood += amount;
                woodPiles.splice(woodIdx, 1);
                spawnPopup(`+${amount}🪵`, Math.round(h.x), Math.round(h.y));
                updateWoodDisplay();
                h.gatherCooldown = CONFIG.habitantGatherCooldown;
                continue; // Passer au prochain habitant
            }
            
            // Champ mûr proche ?
            const matureField = fields.find(f => {
                if (f.stage < 3) return false;
                const dx = h.x - f.x;
                const dy = h.y - f.y;
                return Math.sqrt(dx * dx + dy * dy) < 1.5;
            });
            
            if (matureField) {
                player.wheat += CONFIG.wheatPerHarvest;
                matureField.stage = 0;
                matureField.growTimer = CONFIG.growthStageTime;
                spawnPopup(`+${CONFIG.wheatPerHarvest}🌾`, Math.round(h.x), Math.round(h.y));
                updateWheatDisplay();
                h.gatherCooldown = CONFIG.habitantGatherCooldown;
            }
        }

        // --- CONSOMMATION DE NOURRITURE ---
        h.foodTimer++;
        if (h.foodTimer >= CONFIG.habitantFoodInterval) {
            h.foodTimer = 0;
            
            // Ordre de préférence : poisson cuit > pain > poisson cru
            if (player.cookedFish > 0) {
                player.cookedFish--;
                updateCookedFishDisplay();
            } else if (player.bread > 0) {
                player.bread--;
                updateBreadDisplay();
            } else if (player.fish > 0) {
                player.fish--;
                updateFishDisplay();
            } else {
                // FAMINE : l'habitant quitte
                spawnPopup('😢 Un habitant est parti !', h.shelter.x, h.shelter.y);
                habitants.splice(i, 1);
                updateHabitantDisplay();
            }
        }
    }
}
```

---

### **3. Vérifier CONFIG**

**Localisation :** Ligne ~10

**Ajouter si absent :**

```javascript
const CONFIG = {
    // ... configs existants
    habitantWanderRadius: 4,       // Rayon de vagabondage (tuiles)
    habitantGatherCooldown: 300,   // Frames entre collectes (~5s)
    habitantFoodInterval: 7200,    // Frames entre repas (~2min)
};
```

---

## ✅ Checklist Phase 2

- [ ] Vérifier que `updateHabitants()` est appelé dans `gameLoop()`
- [ ] Remplacer le code de `updateHabitants()` avec la version complète
- [ ] Ajouter les configs manquantes dans `CONFIG`
- [ ] Tester : construire un abri → habitant doit apparaître
- [ ] Tester : habitant doit se déplacer aléatoirement autour de l'abri
- [ ] Tester : poser du bois près d'un habitant → doit le ramasser
- [ ] Tester : planter blé, attendre maturité, habitant proche → doit récolter
- [ ] Tester : sans nourriture pendant 2 min → habitant doit partir
- [ ] Tester : avec nourriture → habitant reste
- [ ] Vérifier affichage du compteur "👥 Habitants"

---

## 🧪 Tests de validation Phase 2

**Test 1 : Spawn habitant**
1. Construire un abri
2. ✅ Attendu : Message "👤 Un habitant arrive !"
3. ✅ Attendu : Compteur habitants : 1

**Test 2 : Déplacement**
1. Observer l'habitant pendant 30 secondes
2. ✅ Attendu : Se déplace dans un rayon de ~4 tuiles autour de l'abri
3. ✅ Attendu : Ne va pas dans la rivière (sauf pont)

**Test 3 : Collecte bois**
1. Couper un arbre → pile de bois au sol
2. Attendre que l'habitant s'approche (< 1.5 tuiles)
3. ✅ Attendu : Bois ramassé automatiquement
4. ✅ Attendu : Popup "+3🪵"
5. ✅ Attendu : Inventaire joueur augmente

**Test 4 : Collecte blé**
1. Planter un champ
2. Attendre maturité (stade 3)
3. Habitant proche
4. ✅ Attendu : Blé récolté automatiquement
5. ✅ Attendu : Popup "+5🌾"
6. ✅ Attendu : Champ revient au stade 0

**Test 5 : Consommation nourriture**
1. Avoir poisson cuit dans inventaire
2. Attendre 2 minutes (temps réel)
3. ✅ Attendu : Poisson cuit disparaît (compteur -1)
4. Continuer à attendre sans nourriture
5. ✅ Attendu : Message "😢 Un habitant est parti !"
6. ✅ Attendu : Compteur habitants : 0

**Test 6 : Plusieurs habitants**
1. Construire 3 abris
2. ✅ Attendu : 3 habitants actifs
3. ✅ Attendu : Chacun reste près de son abri
4. ✅ Attendu : Tous collectent indépendamment

---

# PHASE 3 : INTÉGRATION DES NOUVEAUX BÂTIMENTS

**Priorité :** ⭐⭐ MOYENNE
**Durée estimée :** 3-4 heures
**Difficulté :** ⚡⚡⚡ Élevée

---

## 🎯 Objectif

Ajouter 9 nouveaux bâtiments fonctionnels au jeu avec leurs sprites 4 saisons et leurs mécaniques de production.

---

## 📦 Liste des bâtiments à implémenter

| # | Bâtiment | Sprites | Fonction | Priorité |
|---|----------|---------|----------|----------|
| 1 | Mine | 1 image (pas saisons) | Produit fer, cuivre, or | ⭐⭐⭐ |
| 2 | Scierie | 4 saisons | Bois → Planches | ⭐⭐⭐ |
| 3 | Four | 4 saisons | Fer + Charbon → Lingot | ⭐⭐ |
| 4 | Forge | 4 saisons | Lingot → Outils/Armes | ⭐⭐ |
| 5 | Grenier | 4 saisons | Stocke blé/farine | ⭐ |
| 6 | Séchoir | 4 saisons | Poisson → Séché | ⭐ |
| 7 | Ferme | 4 saisons | Élève moutons | ⭐ |
| 8 | Marché | 4 saisons | Échange ressources | ⭐ |
| 9 | Caravane | 1 image (événement) | Commerce rare | ⭐ |

---

## 📝 NOTE IMPORTANTE

**Phase 3 est TRÈS longue et technique.**

Pour ne pas surcharger ce fichier, voici l'approche recommandée :

1. **Implémenter Mine en premier** (pattern de référence)
2. **Utiliser le même pattern** pour les autres bâtiments
3. **Chaque bâtiment suit le même workflow :**
   - Ajouter sprites
   - Créer nouvelles ressources
   - Définir CONFIG
   - Créer array de structures
   - Implémenter update()
   - Implémenter interaction()
   - Implémenter draw()
   - Charger sprites
   - Ajouter popup construction
   - Gérer mode construction

---

## 🏗️ Pattern de référence : MINE

### **1. Ajouter sprite**
```
assets/mine.png
```

### **2. Nouvelles ressources**
```javascript
const player = {
    iron: 0,
    copper: 0,
    gold: 0
};
```

### **3. Configuration**
```javascript
CONFIG.mineCostWood = 20;
CONFIG.mineCostStone = 15;
CONFIG.miningDuration = 3600;
CONFIG.mineIronPerBatch = 2;
CONFIG.mineCopperPerBatch = 1;
CONFIG.mineGoldPerBatch = 1;
```

### **4. Structure de données**
```javascript
const mines = [];
// {x, y, isWorking, miningProgress, ironReady, copperReady, goldReady}
```

### **5. Fonction update**
```javascript
function updateMines() {
    for (const mine of mines) {
        if (mine.isWorking) {
            mine.miningProgress++;
            if (mine.miningProgress >= CONFIG.miningDuration) {
                mine.ironReady += CONFIG.mineIronPerBatch;
                // ... production
            }
        }
    }
}
```

### **6. Fonction interaction**
```javascript
function checkMineInteraction() {
    // Récupérer minerais si proche
}
```

### **7. Fonction draw**
```javascript
function drawMine(mine) {
    // Dessiner sprite + barre progression + indicateur
}
```

### **8. Charger sprite**
```javascript
let mineSprite = null;
// loadSprites() → charger mine.png
```

### **9. Popup construction**
```html
<div class="build-card" data-build="mine" data-cost="20" data-cost-stone="15">
    <div class="build-icon">⛏️</div>
    <div class="build-name">Mine</div>
    <div class="build-cost">💰 20 🪵 + 15 🪨</div>
</div>
```

### **10. Affichage ressources**
```html
<div class="res-chip"><span class="res-icon">⚙️</span><span id="iron">0</span></div>
```

### **11. Mode construction**
```javascript
let buildMineMode = false;
// Gérer activation/désactivation + clic construction
```

### **12. GameLoop**
```javascript
function gameLoop() {
    updateMines();
    checkMineInteraction();
    // Ajouter mine dans entities pour rendu
}
```

---

## 🏗️ Bâtiments suivants

**Appliquer le même pattern pour :**

### **Scierie** (priorité haute)
- Sprites : 4 saisons
- Ressource : `planks`
- Production : 3 bois → 5 planches

### **Four** (priorité moyenne)
- Sprites : 4 saisons
- Ressources : `charcoal`, `ironIngot`
- Production : fer + charbon → lingot

### **Forge** (priorité moyenne)
- Sprites : 4 saisons
- Ressources : `tools`, `weapons`
- Production : lingot → outils/armes

### **Grenier** (priorité basse)
- Sprites : 4 saisons
- Fonction : stockage passif illimité

### **Séchoir** (priorité basse)
- Sprites : 4 saisons
- Ressource : `driedFish`
- Production : poisson cru → séché

### **Ferme** (priorité basse)
- Sprites : 4 saisons
- Objets : moutons vivants
- Production : viande + laine

### **Marché** (priorité basse)
- Sprites : 4 saisons
- UI : fenêtre échange ressources

### **Caravane** (priorité basse)
- Sprite : 1 image événement
- Timer : arrive toutes les 5 min
- Commerce : ressources rares

---

## ✅ Checklist Phase 3

### **Préparation assets**
- [ ] Créer/copier tous les sprites (30 images)
- [ ] Placer dans `assets/`
- [ ] Ajouter dans `service-worker.js`

### **Mine**
- [ ] Implémenter Mine complète (12 étapes)
- [ ] Tester production minerais

### **Scierie**
- [ ] Implémenter Scierie
- [ ] Tester bois → planches

### **Four**
- [ ] Implémenter Four
- [ ] Tester fer + charbon → lingot

### **Forge**
- [ ] Implémenter Forge
- [ ] Tester lingot → outils

### **Grenier**
- [ ] Implémenter Grenier
- [ ] Tester stockage illimité

### **Séchoir**
- [ ] Implémenter Séchoir
- [ ] Tester poisson → séché

### **Ferme**
- [ ] Implémenter Ferme
- [ ] Tester spawn moutons

### **Marché**
- [ ] Implémenter Marché
- [ ] Tester échanges

### **Caravane**
- [ ] Implémenter Caravane
- [ ] Tester événement

---

# PHASE 4 : CHAÎNES DE PRODUCTION COMPLÈTES

**Priorité :** ⭐ BASSE (après Phase 3)
**Durée estimée :** 2-3 heures
**Difficulté :** ⚡⚡ Moyenne

---

## 🎯 Objectif

Relier tous les bâtiments entre eux pour créer des chaînes de production automatisées.

---

## 🔗 Chaînes à implémenter

### **Chaîne A : Bois → Construction**
```
Arbre → Bois → Scierie → Planches → Construction bâtiments avancés
```

### **Chaîne B : Métallurgie**
```
Mine → Fer + Cuivre + Or → Four → Lingot → Forge → Outils/Armes
```

### **Chaîne C : Agriculture automatisée**
```
Habitants → Plantent → Champs → Blé → Grenier → Moulin → Boulangerie
```

### **Chaîne D : Élevage**
```
Ferme → Moutons → Viande + Laine → Craft vêtements
```

### **Chaîne E : Conservation**
```
Poisson → Séchoir → Poisson séché (dure 3× plus)
```

### **Chaîne F : Commerce**
```
Surplus → Marché → Pièces d'or → Caravane → Ressources rares
```

---

## ✅ Checklist Phase 4

- [ ] Chaîne Bois : bâtiments coûtent planches
- [ ] Chaîne Métallurgie : système équipement habitants
- [ ] Chaîne Agriculture : habitants plantent auto
- [ ] Chaîne Élevage : spawn moutons + craft laine
- [ ] Chaîne Conservation : poisson séché conserve
- [ ] Chaîne Commerce : UI marché + événement caravane

---

# 📝 NOTES IMPORTANTES

## 🚨 Ordre d'exécution STRICT

**NE PAS sauter de phase !**

1. ✅ Phase 1 terminée → Tester → Phase 2
2. ✅ Phase 2 terminée → Tester → Phase 3
3. ✅ Phase 3 terminée → Tester → Phase 4

---

## 📊 Temps estimé TOTAL

| Phase | Durée | Difficulté |
|-------|-------|-----------|
| Phase 1 | 30 min | ⚡ Facile |
| Phase 2 | 1-2h | ⚡⚡ Moyenne |
| Phase 3 | 3-4h | ⚡⚡⚡ Élevée |
| Phase 4 | 2-3h | ⚡⚡ Moyenne |
| **TOTAL** | **7-10h** | Progressif |

---

## 🚀 LANCEMENT

**Pour commencer :**

1. **Copier ce fichier** dans `/home/pcbmax/projets/ma-cabane/PLAN.md`

2. **Ouvrir Claude Code** dans ce dossier

3. **Donner cette instruction à Claude Code :**

```
Lis PLAN.md et commence par la Phase 1 : Placement cohérent des assets.

Modifie game.js pour :
1. Améliorer isTileFree() avec toutes les vérifications
2. Ajouter vérification de placement dans tous les modes construction
3. Gérer l'exception des ponts (doivent être sur rivière)
4. Ajouter messages d'erreur clairs

Respecte exactement les spécifications de PLAN.md Phase 1.
```

4. **Tester Phase 1** complètement avant de passer à Phase 2

---

**Bon courage ! 💪 Tu as tout ce qu'il faut maintenant ! 🎮**
