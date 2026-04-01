// ========================================
// CONFIGURATION DU JEU
// ========================================
const CONFIG = {
    tileSize: 32,           // Taille d'une tuile en pixels
    worldWidth: 15,         // Largeur du monde en tuiles
    worldHeight: 15,        // Hauteur du monde en tuiles
    playerSpeed: 0.1,       // Vitesse de déplacement du joueur (0-1)
    woodPerTree: 3,         // Bois obtenu en coupant un sapin
    treeCutDuration: 80,    // Frames pour couper un arbre (~1.3s à 60fps)
    treeRegrowTime: 3600,   // Frames avant qu'un arbre repousse (~60s à 60fps)
    fieldCost: 3,           // Bois nécessaire pour planter un champ
    wheatPerHarvest: 5,     // Blé obtenu à la récolte
    growthStageTime: 1800,  // Frames par stade de croissance (~30s à 60fps)
    palisadeCost: 2,        // Bois par segment de palissade
    seasonDuration: 10800,  // Frames par saison (~3 minutes à 60fps)
    bridgeCost: 5,          // Bois pour construire un pont
    fishingDuration: 300,   // Frames pour attraper un poisson (~5s à 60fps)
    fishingCooldown: 600,   // Frames d'attente entre deux prises (~10s)
    millCostWood: 10,       // Bois pour construire un moulin
    millCostWheat: 5,       // Blé pour construire un moulin
    millWheatPerBatch: 5,   // Blé consommé par fournée
    millFlourPerBatch: 2,   // Farine produite par fournée
    millDuration: 1800,     // Frames de mouture (~30s à 60fps)
    millMaxWheat: 10,       // Capacité max de stockage de blé dans le moulin
    bakeryCostWood: 8,      // Bois pour construire une boulangerie
    bakeryFlourPerBatch: 2, // Farine consommée par fournée de pain
    breadPerBatch: 1,       // Pain produit par fournée
    bakeryDuration: 1500,   // Frames de cuisson (~25s à 60fps)
    bakeryMaxFlour: 6,      // Capacité max de farine dans la boulangerie
    campfireCost: 3,           // Bois pour construire un feu de camp
    hungerDecayRate: 0.005,    // Points de faim perdus par frame (~5 min pour vider)
    hungerFromCookedFish: 30,  // Faim restaurée par un poisson cuit
    hungerFromBread: 40,       // Faim restaurée par un pain
    hungerFromRawFish: 8,      // Faim restaurée par un poisson cru (moins efficace)
    fishCookDuration: 240,      // Frames pour cuire un poisson au feu (~4s)
    habitantFoodInterval: 7200, // Frames entre deux repas d'un habitant (~2min à 60fps)
    habitantWanderRadius: 4,    // Rayon de vagabondage autour de l'abri (tuiles)
    habitantGatherCooldown: 300, // Frames entre deux collectes de ressources
    poissonerieCostWood: 6,      // Bois pour construire une poissonnerie
    poissonerieDuration: 900,    // Frames pour cuire un lot de poissons (~15s)
    poissonerieFishPerBatch: 2,  // Poissons crus consommés par lot
    poissonerieCookedPerBatch: 2,// Poissons cuits produits par lot
    poissonnerieMaxFish: 6,      // Capacité max de poisson cru stocké
    stonePileCount: 1,           // Un seul rocher sur la carte (ressource illimitée)
    stonePerVisit: 2,            // Pierre obtenue par collecte au rocher
    stoneCollectCooldown: 300,   // Frames entre deux collectes au même rocher (~5s)
    shelterUpgradeWood: 8,       // Bois pour améliorer un abri en niveau 2
    shelterUpgradeStone: 5,      // Pierre pour améliorer un abri en niveau 2
    wolfSpawnInterval: 1800,     // Frames entre deux apparitions de loup en hiver (~30s)
    wolfMaxCount: 3,             // Nombre maximum de loups en même temps
    wolfSpeed: 0.035,            // Vitesse de déplacement du loup
    wolfAttackRange: 1.2,        // Distance à laquelle le loup attaque (tuiles)
    wolfDamage: 8,               // Points de faim perdus par attaque de loup
    wolfAttackInterval: 150,     // Frames entre deux attaques (même loup)
    towerCostWood: 8,            // Bois pour construire une tour de guet
    towerCostStone: 5,           // Pierre pour construire une tour de guet
    towerWolfRepelRadius: 3,     // Rayon (en tuiles) où les loups fuient la tour
    coldDecayRate: 0.003,              // Points de froid perdus par frame (base)
    coldWinterMultiplier: 3,           // x3 en hiver (~1.8 min pour vider)
    coldSpringAutumnMultiplier: 0.25,  // x0.25 au printemps/automne (~22 min pour vider)
    // En été : aucune perte de froid (jauge bloquée à 100)
    coldFromCampfire: 0.08,            // Chaleur gagnée par frame près d'un feu de camp
    coldFromShelter: 0.02              // Chaleur gagnée par frame près d'un abri
};

// ========================================
// SONS — Web Audio API (aucun fichier externe)
// Tous les sons sont générés par code JavaScript
// ========================================
const SOUNDS = (() => {
    let audioCtx = null;

    // Crée ou récupère le contexte audio (créé au premier son pour respecter les règles navigateur)
    function getCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Sur mobile le contexte peut être suspendu après inactivité
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    // Coup de hache — couper un arbre
    function chop() {
        const ac = getCtx();
        const buf = ac.createBuffer(1, ac.sampleRate * 0.18, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
        }
        const src = ac.createBufferSource();
        src.buffer = buf;
        const filter = ac.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 350;
        const gain = ac.createGain();
        gain.gain.setValueAtTime(1.3, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);
        src.start();
    }

    // Ramassage — collecter une ressource (bois, pierre...)
    function collect() {
        const ac = getCtx();
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, ac.currentTime + 0.09);
        gain.gain.setValueAtTime(0.28, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.13);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + 0.13);
    }

    // Construction — poser un bâtiment
    function build() {
        const ac = getCtx();
        for (let i = 0; i < 3; i++) {
            const t = ac.currentTime + i * 0.09;
            const buf = ac.createBuffer(1, ac.sampleRate * 0.07, ac.sampleRate);
            const d = buf.getChannelData(0);
            for (let j = 0; j < d.length; j++) {
                d[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / d.length, 2);
            }
            const src = ac.createBufferSource();
            src.buffer = buf;
            const filter = ac.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 900 - i * 100;
            const gain = ac.createGain();
            gain.gain.setValueAtTime(0.7, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
            src.connect(filter);
            filter.connect(gain);
            gain.connect(ac.destination);
            src.start(t);
        }
    }

    // Attaque de loup — grognement grave
    function wolfAttack() {
        const ac = getCtx();
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const distortion = ac.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
            const x = (i * 2) / 256 - 1;
            curve[i] = (Math.PI + 180) * x / (Math.PI + 180 * Math.abs(x));
        }
        distortion.curve = curve;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(38, ac.currentTime + 0.55);
        gain.gain.setValueAtTime(0.55, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.6);
        osc.connect(distortion);
        distortion.connect(gain);
        gain.connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + 0.6);
    }

    // Manger — son de mastication
    function eat() {
        const ac = getCtx();
        for (let i = 0; i < 3; i++) {
            const t = ac.currentTime + i * 0.075;
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(310 - i * 35, t);
            osc.frequency.exponentialRampToValueAtTime(160, t + 0.065);
            gain.gain.setValueAtTime(0.22, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start(t);
            osc.stop(t + 0.075);
        }
    }

    // Pêche — splash + ding de victoire
    function fishCatch() {
        const ac = getCtx();
        // Splash (bruit filtré)
        const buf = ac.createBuffer(1, ac.sampleRate * 0.18, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.8);
        }
        const src = ac.createBufferSource();
        src.buffer = buf;
        const filter = ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1100;
        filter.Q.value = 0.6;
        const gSplash = ac.createGain();
        gSplash.gain.setValueAtTime(0.45, ac.currentTime);
        src.connect(filter);
        filter.connect(gSplash);
        gSplash.connect(ac.destination);
        src.start();
        // Ding de succès
        const osc = ac.createOscillator();
        const gDing = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ac.currentTime + 0.12);
        osc.frequency.exponentialRampToValueAtTime(1320, ac.currentTime + 0.28);
        gDing.gain.setValueAtTime(0.28, ac.currentTime + 0.12);
        gDing.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.42);
        osc.connect(gDing);
        gDing.connect(ac.destination);
        osc.start(ac.currentTime + 0.12);
        osc.stop(ac.currentTime + 0.42);
    }

    // Feu qui crépite — un petit pop aléatoire (appelé en boucle)
    function crackle() {
        const ac = getCtx();
        const buf = ac.createBuffer(1, ac.sampleRate * 0.035, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 5);
        }
        const src = ac.createBufferSource();
        src.buffer = buf;
        const filter = ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1400 + Math.random() * 1200;
        filter.Q.value = 1.2;
        const gain = ac.createGain();
        gain.gain.setValueAtTime(0.08 + Math.random() * 0.12, ac.currentTime);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);
        src.start();
    }

    return { chop, collect, build, wolfAttack, eat, fishCatch, crackle };
})();

// ========================================
// INITIALISATION DU CANVAS
// ========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Redimensionne le canvas.
// Le canvas est dans .canvas-wrapper (flex:1, height:100%) donc
// canvas.offsetWidth et canvas.offsetHeight sont toujours corrects.
// Zoom appliqué au rendu (calculé selon la taille du canvas)
let currentZoom = 1;

// Calcule le zoom pour que toute la carte isométrique rentre à l'écran
function calculateZoom() {
    if (canvas.width === 0 || canvas.height === 0) return 1;
    // Étendue horizontale de la carte en pixels isométriques
    const isoWorldWidth  = (CONFIG.worldWidth + CONFIG.worldHeight) * (CONFIG.tileSize / 2);
    // Étendue verticale (hauteur Y iso + décalage haut)
    const isoWorldHeight = (CONFIG.worldWidth + CONFIG.worldHeight) * (CONFIG.tileSize / 4) + 120;
    const zoomX = canvas.width  / isoWorldWidth;
    const zoomY = canvas.height / isoWorldHeight;
    // On prend le plus petit des deux, avec un max de 1 (pas de zoom avant)
    return Math.min(zoomX, zoomY, 1);
}

function resizeCanvas() {
    const header = document.querySelector('.header');
    const footer = document.querySelector('.controls');

    const headerHeight = header ? header.offsetHeight : 0;
    const footerHeight = 60; // Hauteur fixe du footer

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - headerHeight - footerHeight - 10;

    console.log('Canvas resized:', canvas.width, 'x', canvas.height);
}

window.addEventListener('resize', resizeCanvas);

// ========================================
// SAISONS ET CHARGEMENT DES SPRITES
// ========================================

// Les 4 saisons dans l'ordre (avec icône et label pour l'UI)
const SEASONS       = ['printemps', 'été', 'automne', 'hiver'];
const SEASON_ICONS  = ['🌸', '☀️', '🍂', '❄️'];
const SEASON_LABELS = ['Printemps', 'Été', 'Automne', 'Hiver'];

// Sprites organisés par saison : seasonSprites['hiver']['tree'] etc.
const seasonSprites = {};
for (const s of SEASONS) {
    seasonSprites[s] = { player: null, tree: null, shelter: null, shelter2: null, wood: null, mill: null, bakery: null, poissonnerie: null, rocher: null };
}

// Sprites des personnages secondaires (partagés entre toutes les saisons)
const habitantSprites = { homme: null, femme: null };

// Sprites des deux orientations de pont (partagés, pas de saison)
const bridgeSprites = { normal: null, alt: null };

// Sprite du loup (un seul fichier, pas de variante saisonnière)
let wolfSprite = null;

// Sprite de la tour de guet (un seul fichier, pas de variante saisonnière)
let towerSprite = null;

// Retourne le sprite actif pour la saison courante
function getSprite(name) {
    return seasonSprites[SEASONS[currentSeasonIndex]][name];
}

function loadSprites() {
    const promises = [];
    for (const saison of SEASONS) {
        // Sprites simples (même convention nom_saison.png)
        for (const asset of ['player', 'tree', 'wood']) {
            promises.push(new Promise(resolve => {
                const img = new Image();
                img.onload  = () => { seasonSprites[saison][asset] = img; resolve(); };
                img.onerror = () => { console.warn(`Sprite manquant : assets/${asset}_${saison}.png`); resolve(); };
                img.src = `assets/${asset}_${saison}.png`;
            }));
        }
        // Abri niveau 1 (renommé shelter_saison_niveau1.png)
        promises.push(new Promise(resolve => {
            const img = new Image();
            img.onload  = () => { seasonSprites[saison].shelter = img; resolve(); };
            img.onerror = () => { console.warn(`Sprite manquant : assets/shelter_${saison}_niveau1.png`); resolve(); };
            img.src = `assets/shelter_${saison}_niveau1.png`;
        }));
        // Abri niveau 2 (maison en pierre)
        promises.push(new Promise(resolve => {
            const img = new Image();
            img.onload  = () => { seasonSprites[saison].shelter2 = img; resolve(); };
            img.onerror = () => { console.warn(`Sprite manquant : assets/shelter_${saison}_niveau2.png`); resolve(); };
            img.src = `assets/shelter_${saison}_niveau2.png`;
        }));
        // Moulin : Moulin_saison.png (M majuscule)
        promises.push(new Promise(resolve => {
            const img = new Image();
            img.onload  = () => { seasonSprites[saison].mill = img; resolve(); };
            img.onerror = () => { console.warn(`Sprite manquant : assets/Moulin_${saison}.png`); resolve(); };
            img.src = `assets/Moulin_${saison}.png`;
        }));
        // Boulangerie : Boulangerie_saison.png (B majuscule)
        promises.push(new Promise(resolve => {
            const img = new Image();
            img.onload  = () => { seasonSprites[saison].bakery = img; resolve(); };
            img.onerror = () => { console.warn(`Sprite manquant : assets/Boulangerie_${saison}.png`); resolve(); };
            img.src = `assets/Boulangerie_${saison}.png`;
        }));
        // Poissonnerie : Poissonerie_saison.png (P majuscule, un seul 's')
        promises.push(new Promise(resolve => {
            const img = new Image();
            img.onload  = () => { seasonSprites[saison].poissonnerie = img; resolve(); };
            img.onerror = () => { console.warn(`Sprite manquant : assets/Poissonerie_${saison}.png`); resolve(); };
            img.src = `assets/Poissonerie_${saison}.png`;
        }));
        // Rocher : Rocher_saison.png (R majuscule)
        promises.push(new Promise(resolve => {
            const img = new Image();
            img.onload  = () => { seasonSprites[saison].rocher = img; resolve(); };
            img.onerror = () => { console.warn(`Sprite manquant : assets/Rocher_${saison}.png`); resolve(); };
            img.src = `assets/Rocher_${saison}.png`;
        }));
    }
    // Sprite loup (sans saison, commun à toutes les saisons)
    promises.push(new Promise(resolve => {
        const img = new Image();
        img.onload  = () => { wolfSprite = img; resolve(); };
        img.onerror = () => { console.warn('Sprite manquant : assets/loup.png'); resolve(); };
        img.src = 'assets/loup.png';
    }));
    // Sprite tour de guet (sans saison)
    promises.push(new Promise(resolve => {
        const img = new Image();
        img.onload  = () => { towerSprite = img; resolve(); };
        img.onerror = () => { console.warn('Sprite manquant : assets/tour.png'); resolve(); };
        img.src = 'assets/tour.png';
    }));
    // Sprites ponts (deux orientations, sans saison)
    for (const [key, file] of [['normal', 'Pont.png'], ['alt', 'Pont_2.png']]) {
        promises.push(new Promise(resolve => {
            const img = new Image();
            img.onload  = () => { bridgeSprites[key] = img; resolve(); };
            img.onerror = () => { console.warn(`Sprite manquant : assets/${file}`); resolve(); };
            img.src = `assets/${file}`;
        }));
    }
    // Sprites personnages secondaires (mêmes pour toutes les saisons)
    for (const [key, file] of [['homme', 'Perosnnage_secondaire_homme.png'], ['femme', 'Perosnnage_secondaire_femme.png']]) {
        promises.push(new Promise(resolve => {
            const img = new Image();
            img.onload  = () => { habitantSprites[key] = img; resolve(); };
            img.onerror = () => { console.warn(`Sprite manquant : assets/${file}`); resolve(); };
            img.src = `assets/${file}`;
        }));
    }
    return Promise.all(promises);
}

// ========================================
// GÉNÉRATION DE LA RIVIÈRE
// ========================================

// Crée une rivière sinueuse qui traverse la carte d'ouest en est
// Placée dans le tiers supérieur ou inférieur pour éviter la zone de départ (10,10)
function generateRiver() {
    // Position de départ : tiers haut (y 3-5) ou tiers bas (y 13-15)
    let ry = Math.random() < 0.5
        ? 3  + Math.floor(Math.random() * 3)
        : 13 + Math.floor(Math.random() * 3);

    function addTile(tx, ty) {
        if (tx < 0 || tx >= CONFIG.worldWidth)  return;
        if (ty < 0 || ty >= CONFIG.worldHeight) return;
        const key = `${tx},${ty}`;
        if (!riverTileSet.has(key)) {
            riverTileSet.add(key);
            riverTiles.push({ x: tx, y: ty });
        }
    }

    for (let rx = 0; rx < CONFIG.worldWidth; rx++) {
        addTile(rx, ry);      // tuile principale
        addTile(rx, ry + 1);  // rivière large de 2 tuiles

        // Changer doucement de direction tous les 2 pas
        if (rx % 2 === 0 && Math.random() < 0.45) {
            if (Math.random() < 0.5 && ry > 1) ry--;
            else if (ry < CONFIG.worldHeight - 4)  ry++;
        }
    }

    // Supprimer les arbres et piles de bois qui chevauchent la rivière
    for (let i = trees.length - 1;     i >= 0; i--)
        if (riverTileSet.has(`${trees[i].x},${trees[i].y}`))     trees.splice(i, 1);
    for (let i = woodPiles.length - 1; i >= 0; i--)
        if (riverTileSet.has(`${woodPiles[i].x},${woodPiles[i].y}`)) woodPiles.splice(i, 1);
    // Si le rocher est dans la rivière, le déplacer d'une case
    for (const stone of stonePiles) {
        if (riverTileSet.has(`${stone.x},${stone.y}`)) {
            stone.x = Math.min(stone.x + 2, CONFIG.worldWidth - 1);
        }
    }
}

// ========================================
// CONVERSION COORDONNÉES 2D ↔ ISOMÉTRIQUE
// ========================================

// Convertit des coordonnées de grille (x, y) en coordonnées isométriques à l'écran
function gridToIso(gridX, gridY) {
    const isoX = (gridX - gridY) * (CONFIG.tileSize / 2);
    const isoY = (gridX + gridY) * (CONFIG.tileSize / 4);
    return { x: isoX, y: isoY };
}

// Convertit des coordonnées d'écran en coordonnées de grille
// Tient compte du zoom appliqué au rendu.
function isoToGrid(screenX, screenY) {
    // Annuler la translation (centrage horizontal avec zoom)
    const logicalX = (screenX - canvas.width / 2 * (1 - currentZoom)) / currentZoom;
    const logicalY = screenY / currentZoom;

    const offsetX = canvas.width / 2;
    const offsetY = 100;

    const x = logicalX - offsetX;
    const y = logicalY - offsetY;

    const gridX = (x / (CONFIG.tileSize / 2) + y / (CONFIG.tileSize / 4)) / 2;
    const gridY = (y / (CONFIG.tileSize / 4) - x / (CONFIG.tileSize / 2)) / 2;

    return {
        x: Math.round(gridX),
        y: Math.round(gridY)
    };
}

// ========================================
// OBJETS DU JEU
// ========================================

// Le joueur
const player = {
    x: 10,          // Position sur la grille X
    y: 10,          // Position sur la grille Y
    targetX: 10,    // Position cible X
    targetY: 10,    // Position cible Y
    color: '#ff6b35',
    size: 30,
    wood: 0,             // Inventaire de bois
    stone: 0,            // Inventaire de pierre
    wheat: 0,            // Inventaire de blé
    flour: 0,            // Inventaire de farine
    fish: 0,             // Inventaire de poisson cru
    cookedFish: 0,       // Inventaire de poisson cuit
    bread: 0,            // Inventaire de pain
    hunger: 100,         // Jauge de faim (0-100)
    cold: 100,           // Jauge de chaleur corporelle (0-100, 0 = mort de froid)
    fishingTimer: 0,     // Progression de la pêche en cours
    fishingCooldown: 0,  // Délai avant pouvoir repêcher
    walkCycle: 0,        // Compteur pour l'animation de marche (en radians)
    isMoving: false,    // Vrai quand le joueur se déplace
    cuttingTarget: null // Arbre que le joueur est en train de couper
};

// Les abris construits
const shelters = [];

// Les popups (messages flottants temporaires)
const popups = [];

// Mode de construction
let buildMode = false;
const SHELTER_COST = 5;

// Les champs de blé plantés par le joueur
const fields = [];

// Mode de plantation de champ
let buildFieldMode = false;

// Les segments de palissade construits par le joueur
const palisades = [];

// Mode de construction de palissade
let buildPalisadeMode = false;

// Les moulins construits
const mills = [];

// Mode de construction de moulin
let buildMillMode = false;

// Les boulangeries construites
const bakeries = [];

// Mode de construction de boulangerie
let buildBakeryMode = false;

// Les poissonneries construites
const poissonneries = [];

// Mode de construction de poissonnerie
let buildPoissonnierieMode = false;

// Les feux de camp construits
const campfires = [];

// Mode de construction de feu de camp
let buildCampfireMode = false;

// Les tuiles de rivière (générées au démarrage)
let riverTiles   = [];       // tableau de {x, y} pour le rendu
let riverTileSet = new Set(); // Set de "x,y" pour la détection rapide

// Les ponts construits par le joueur
const bridges = [];

// Mode de construction de pont
let buildBridgeMode = false;

// Compteur de frames (pour l'animation de l'eau et des saisons)
let frameCount = 0;

// Saison courante
let currentSeasonIndex   = 0;   // 0=printemps, 1=été, 2=automne, 3=hiver
let seasonTimer          = 0;   // frames écoulées depuis le début de cette saison
let seasonTransitionAlpha = 0;  // fondu blanc lors d'un changement de saison (0→1)

// Mode de démolition
let demolishMode = false;

// État de fin de partie
let gameOver = false;
let gameOverCause = 'hunger'; // 'hunger' ou 'cold'

// Les habitants (un par abri construit)
const habitants = [];
// Couleurs distinctes pour reconnaître chaque habitant
const HABITANT_COLORS = ['#e05a20', '#2090e0', '#a040c0', '#d0b010', '#20b060', '#e04070'];

// Les arbres (décoration)
const trees = [];
for (let i = 0; i < 15; i++) {
    trees.push({
        x: Math.floor(Math.random() * CONFIG.worldWidth),
        y: Math.floor(Math.random() * CONFIG.worldHeight),
        type: Math.random() > 0.5 ? 'pine' : 'dead',
        chopped: false,          // Vrai quand l'arbre a été coupé
        cuttingProgress: 0,      // Progression de la coupe (0 à treeCutDuration)
        regrowTimer: 0           // Compte à rebours avant repoussée
    });
}

// Les piles de bois (ressources à collecter)
const woodPiles = [];
for (let i = 0; i < 10; i++) {
    woodPiles.push({
        x: Math.floor(Math.random() * CONFIG.worldWidth),
        y: Math.floor(Math.random() * CONFIG.worldHeight),
        amount: Math.floor(Math.random() * 3) + 1 // 1 à 3 morceaux de bois
    });
}

// Le rocher (unique sur la carte, ressource illimitée)
// Le joueur peut y revenir autant de fois qu'il veut
const stonePiles = [];
{
    // Placer le rocher loin du point de départ du joueur (10,10)
    let rx, ry;
    do {
        rx = 2 + Math.floor(Math.random() * (CONFIG.worldWidth  - 4));
        ry = 2 + Math.floor(Math.random() * (CONFIG.worldHeight - 4));
    } while (Math.abs(rx - 10) < 4 && Math.abs(ry - 10) < 4);
    stonePiles.push({ x: rx, y: ry, collectCooldown: 0 });
}

// Orientation courante pour la prochaine pose de pont (0 = Pont.png, 1 = Pont_2.png)
let bridgeOrientation = 0;

// Les lapins (animaux sauvages)
const rabbits = [];
for (let i = 0; i < 5; i++) {
    const rx = 2 + Math.floor(Math.random() * (CONFIG.worldWidth - 4));
    const ry = 2 + Math.floor(Math.random() * (CONFIG.worldHeight - 4));
    rabbits.push({
        x: rx, y: ry,
        targetX: rx, targetY: ry,
        walkCycle: Math.random() * Math.PI * 2, // phase initiale décalée
        isMoving: false,
        waitTimer: Math.floor(Math.random() * 120), // attente initiale variée
        fleeing: false
    });
}

// Les tours de guet construites par le joueur
const towers = [];

// Mode de construction de tour de guet
let buildTowerMode = false;

// Les loups (apparaissent uniquement en hiver)
const wolves = [];

// Timer de spawn de loups (décompte en frames)
let wolfSpawnTimer = CONFIG.wolfSpawnInterval;

// Générer la rivière (doit être après trees et woodPiles)
generateRiver();

// ========================================
// FONCTIONS DE DESSIN
// ========================================

// Retourne la couleur d'une tuile de sol selon la saison et le hash de variation
function getGroundShade(hash) {
    const s = SEASONS[currentSeasonIndex];
    if (s === 'hiver') {
        if (hash < 55)       return '#eef6fb';
        if (hash < 120)      return '#f4f9fc';
        if (hash < 185)      return '#e6f1f8';
        if (hash < 230)      return '#ddeef6';
        return '#f0faff';
    }
    if (s === 'printemps') {
        if (hash < 55)       return '#d8f0cc';
        if (hash < 120)      return '#e4f8d8';
        if (hash < 185)      return '#c8e8b8';
        if (hash < 230)      return '#d4ecc0';
        return '#dcf2c8';
    }
    if (s === 'été') {
        if (hash < 55)       return '#88c850';
        if (hash < 120)      return '#98d860';
        if (hash < 185)      return '#78b840';
        if (hash < 230)      return '#80c048';
        return '#a0d868';
    }
    // automne
    if (hash < 55)       return '#c88840';
    if (hash < 120)      return '#d89850';
    if (hash < 185)      return '#b87830';
    if (hash < 230)      return '#c08038';
    return '#d4a058';
}

// Teinte saisonnière légère par-dessus toute la scène
function drawSeasonOverlay() {
    const s = SEASONS[currentSeasonIndex];
    let color = null;
    if      (s === 'printemps') color = 'rgba(180,255,160,0.04)';
    else if (s === 'été')       color = 'rgba(255,230,80,0.07)';
    else if (s === 'automne')   color = 'rgba(210,100,20,0.07)';
    // hiver : pas d'overlay (la palette de neige suffit)
    if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Particules atmosphériques selon la saison
function drawSeasonParticles() {
    const s = SEASONS[currentSeasonIndex];

    if (s === 'hiver') {
        // Flocons de neige
        for (let i = 0; i < 55; i++) {
            const x = ((i * 137 + frameCount * (0.5 + (i % 3) * 0.15)) % canvas.width + canvas.width) % canvas.width;
            const y = ((i * 79  + frameCount * (0.6 + (i % 5) * 0.08)) % canvas.height);
            const r = 1 + (i % 3) * 0.6;
            ctx.fillStyle = `rgba(255,255,255,${0.5 + (i % 4) * 0.12})`;
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        }

    } else if (s === 'automne') {
        // Feuilles mortes qui tombent
        const colors = ['rgba(200,70,20,0.75)', 'rgba(220,110,20,0.7)', 'rgba(180,50,10,0.7)', 'rgba(210,140,30,0.65)'];
        for (let i = 0; i < 22; i++) {
            const x = ((i * 179 + frameCount * (0.5 + (i % 4) * 0.1)) % canvas.width + canvas.width) % canvas.width;
            const y = ((i * 97  + frameCount * (0.7 + (i % 3) * 0.12)) % canvas.height);
            const angle = Math.sin(frameCount * 0.03 + i * 0.9) * 0.7;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillStyle = colors[i % 4];
            ctx.beginPath();
            ctx.ellipse(0, 0, 5, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

    } else if (s === 'printemps') {
        // Pétales de fleurs roses
        for (let i = 0; i < 18; i++) {
            const x = ((i * 211 + frameCount * (0.35 + (i % 5) * 0.07)) % canvas.width + canvas.width) % canvas.width;
            const y = ((i * 83  + frameCount * (0.25 + (i % 4) * 0.06)) % canvas.height);
            const angle = Math.sin(frameCount * 0.025 + i * 1.1) * 0.6;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillStyle = `rgba(255,175,200,${0.55 + (i % 3) * 0.1})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

    } else if (s === 'été') {
        // Lucioles / reflets de lumière
        for (let i = 0; i < 12; i++) {
            const x = ((i * 157 + Math.sin(frameCount * 0.018 + i * 1.4) * 60) % canvas.width + canvas.width) % canvas.width;
            const y = canvas.height * 0.45 + ((i * 89 + frameCount * (0.2 + (i % 4) * 0.05)) % (canvas.height * 0.45));
            const alpha = Math.abs(Math.sin(frameCount * 0.04 + i * 1.3)) * 0.65;
            ctx.fillStyle = `rgba(255,225,60,${alpha})`;
            ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
            // Halo autour de la luciole
            ctx.fillStyle = `rgba(255,240,120,${alpha * 0.25})`;
            ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
        }
    }
}

// Dessine une tuile de sol
function drawTile(gridX, gridY, color) {
    const pos = gridToIso(gridX, gridY);
    const offsetX = canvas.width / 2;
    const offsetY = 100;
    
    const x = pos.x + offsetX;
    const y = pos.y + offsetY;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + CONFIG.tileSize / 2, y + CONFIG.tileSize / 4);
    ctx.lineTo(x, y + CONFIG.tileSize / 2);
    ctx.lineTo(x - CONFIG.tileSize / 2, y + CONFIG.tileSize / 4);
    ctx.closePath();
    ctx.fill();
    
    // Contour léger
    ctx.strokeStyle = 'rgba(168, 216, 234, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// Dessine le sol complet
function drawGround() {
    for (let y = 0; y < CONFIG.worldHeight; y++) {
        for (let x = 0; x < CONFIG.worldWidth; x++) {
            // Variation pseudo-aléatoire déterministe par tuile
            const hash = ((x * 73 + y * 37) ^ (x * 29)) & 0xff;
            drawTile(x, y, getGroundShade(hash));

            // Petits cailloux en hiver seulement (ressortent sur la neige)
            if (hash > 228 && SEASONS[currentSeasonIndex] === 'hiver') {
                const pos = gridToIso(x, y);
                const tx = pos.x + canvas.width / 2 + (hash % 12) - 6;
                const ty = pos.y + 100 + CONFIG.tileSize / 4 + (hash % 7) - 3;
                ctx.fillStyle = 'rgba(130,150,165,0.5)';
                ctx.beginPath();
                ctx.ellipse(tx, ty, 2.5, 1.4, 0.4, 0, Math.PI * 2);
                ctx.fill();
                // Petit reflet de neige sur le caillou
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.beginPath();
                ctx.ellipse(tx - 0.5, ty - 0.5, 1, 0.6, 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Dessine un arbre
function drawTree(tree) {
    const pos = gridToIso(tree.x, tree.y);
    const offsetX = canvas.width / 2;
    const offsetY = 100;

    const x = pos.x + offsetX;
    const y = pos.y + offsetY;

    // --- Souche (arbre coupé) ---
    if (tree.chopped) {
        const baseY = y + CONFIG.tileSize / 4;
        // Ombre
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(x + 3, baseY + 2, 14, 5, 0.15, 0, Math.PI * 2);
        ctx.fill();
        // Corps de la souche
        ctx.fillStyle = '#7a4828';
        ctx.fillRect(x - 7, baseY - 14, 14, 14);
        // Face latérale (profondeur iso)
        ctx.fillStyle = '#5a3010';
        ctx.beginPath();
        ctx.moveTo(x + 7, baseY - 14);
        ctx.lineTo(x + 12, baseY - 10);
        ctx.lineTo(x + 12, baseY);
        ctx.lineTo(x + 7, baseY);
        ctx.closePath();
        ctx.fill();
        // Dessus de la souche (section coupée)
        ctx.fillStyle = '#c8804a';
        ctx.beginPath();
        ctx.ellipse(x + 2, baseY - 14, 9, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Anneaux de croissance
        ctx.strokeStyle = '#8a5020';
        ctx.lineWidth = 0.7;
        for (let r = 1; r <= 3; r++) {
            ctx.beginPath();
            ctx.ellipse(x + 2, baseY - 14, r * 2.5, r * 1.4, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        // Neige sur le dessus
        ctx.fillStyle = 'rgba(235,248,255,0.7)';
        ctx.beginPath();
        ctx.ellipse(x + 2, baseY - 14, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    // --- Barre de progression de coupe ---
    if (tree.cuttingProgress > 0) {
        const baseY = y + CONFIG.tileSize / 4;
        const barW = 36;
        const barH = 6;
        const barX = x - barW / 2;
        const barY = baseY - 110;
        const progress = tree.cuttingProgress / CONFIG.treeCutDuration;
        // Fond de la barre
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 3);
        ctx.fill();
        // Remplissage (orange → vert au fur et à mesure)
        ctx.fillStyle = progress < 0.5 ? '#f0a000' : '#50c020';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW * progress, barH, 2);
        ctx.fill();
        // Icône hache
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🪓', x, barY - 4);
    }

    // --- Sprite saisonnier ---
    const treeSprite = getSprite('tree');
    if (treeSprite) {
        const baseY = y + CONFIG.tileSize / 4;
        const h = 55;
        const w = treeSprite.width * (h / treeSprite.height);
        ctx.drawImage(treeSprite, x - w / 2, baseY - h, w, h);
        return;
    }

    if (tree.type === 'pine') {
        // Ombre portée au sol
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(x + 5, y + 7, 18, 7, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Tronc (épais, avec texture écorce)
        ctx.fillStyle = '#7a4828';
        ctx.fillRect(x - 4, y - 16, 8, 25);
        ctx.strokeStyle = '#4a2810';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 1, y - 15); ctx.lineTo(x - 2, y + 8);
        ctx.moveTo(x + 2, y - 13); ctx.lineTo(x + 1, y + 8);
        ctx.stroke();

        // 4 étages de branches (sommet → base, chaque étage plus large)
        const layers = [
            { yOff: -60, w: 10, h: 13 },
            { yOff: -46, w: 15, h: 13 },
            { yOff: -32, w: 20, h: 14 },
            { yOff: -16, w: 25, h: 15 },
        ];

        for (const lyr of layers) {
            const ly = y + lyr.yOff;
            const w  = lyr.w;
            const h  = lyr.h;

            // Face droite (légèrement plus sombre — côté ombre)
            ctx.fillStyle = '#1e3d0a';
            ctx.beginPath();
            ctx.moveTo(x,     ly - h);
            ctx.lineTo(x + w, ly);
            ctx.lineTo(x,     ly);
            ctx.closePath();
            ctx.fill();

            // Face gauche (plus claire — côté lumière)
            ctx.fillStyle = '#2d5a10';
            ctx.beginPath();
            ctx.moveTo(x,     ly - h);
            ctx.lineTo(x - w, ly);
            ctx.lineTo(x,     ly);
            ctx.closePath();
            ctx.fill();

            // Neige sur le dessus (couvre environ 60% du bord)
            ctx.fillStyle = 'rgba(232,246,255,0.93)';
            ctx.beginPath();
            ctx.moveTo(x,           ly - h);
            ctx.lineTo(x - w,       ly);
            ctx.lineTo(x - w * 0.62, ly);
            ctx.lineTo(x,           ly - h + 2);
            ctx.lineTo(x + w * 0.62, ly);
            ctx.lineTo(x + w,       ly);
            ctx.closePath();
            ctx.fill();

            // Contour fin
            ctx.strokeStyle = 'rgba(10,30,5,0.25)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x - w, ly); ctx.lineTo(x, ly - h); ctx.lineTo(x + w, ly);
            ctx.stroke();
        }

    } else {
        // Arbre mort — squelette détaillé
        ctx.strokeStyle = '#5a3a2c';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y + 2);
        ctx.lineTo(x - 4, y - 30);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 4, y - 18); ctx.lineTo(x - 15, y - 12);
        ctx.moveTo(x - 4, y - 24); ctx.lineTo(x + 7,  y - 18);
        ctx.moveTo(x - 4, y - 30); ctx.lineTo(x - 9,  y - 24);
        ctx.stroke();
        ctx.lineCap = 'butt';
        // Petite neige sur le bout des branches
        ctx.fillStyle = 'rgba(232,246,255,0.85)';
        ctx.beginPath();
        ctx.ellipse(x - 15, y - 12, 4, 2, 0.3, 0, Math.PI * 2);
        ctx.ellipse(x + 7,  y - 18, 4, 2, -0.3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Dessine une pile de bois
function drawWood(wood) {
    const pos = gridToIso(wood.x, wood.y);
    const offsetX = canvas.width / 2;
    const offsetY = 100;

    const x = pos.x + offsetX;
    const y = pos.y + offsetY;

    // --- Sprite saisonnier ---
    const woodSprite = getSprite('wood');
    if (woodSprite) {
        const baseY = y + CONFIG.tileSize / 4;
        const h = 30;
        const w = woodSprite.width * (h / woodSprite.height);
        ctx.drawImage(woodSprite, x - w / 2, baseY - h, w, h);
        // Indicateur de quantité
        ctx.fillStyle = 'rgba(80,40,10,0.85)';
        ctx.font = 'bold 9px Arial';
        ctx.fillText('x' + wood.amount, x + 12, baseY - h - 2);
        return;
    }

    // Ombre portée au sol
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(x + 3, y + 7, 15, 5, 0.15, 0, Math.PI * 2);
    ctx.fill();

    const logW = 20;
    const logH = 7;

    for (let i = 0; i < wood.amount; i++) {
        const lx  = x - logW / 2;
        const ly  = y - 5 - i * (logH - 1);

        // Face principale du rondin
        ctx.fillStyle = i % 2 === 0 ? '#9a6040' : '#8a5030';
        ctx.fillRect(lx, ly, logW, logH);

        // Texture écorce : stries longitudinales
        ctx.strokeStyle = 'rgba(70,30,10,0.35)';
        ctx.lineWidth = 0.8;
        for (let s = 1; s <= 2; s++) {
            ctx.beginPath();
            ctx.moveTo(lx + 3, ly + s * 2);
            ctx.lineTo(lx + logW - 3, ly + s * 2);
            ctx.stroke();
        }
        // Ombre sous le rondin (relief d'empilement)
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(lx, ly + logH - 2, logW, 2);

        // --- Section coupée GAUCHE ---
        // Disque de bois
        ctx.fillStyle = '#7a4828';
        ctx.beginPath();
        ctx.ellipse(lx, ly + logH / 2, 4.5, logH / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Anneaux de croissance (3 cercles)
        ctx.strokeStyle = '#5a3010';
        ctx.lineWidth = 0.6;
        for (let r = 1; r <= 3; r++) {
            ctx.beginPath();
            ctx.ellipse(lx, ly + logH / 2, r * 1.2, r * (logH / 2 - 0.5) / 3.5, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        // Moelle centrale
        ctx.fillStyle = '#c8804a';
        ctx.beginPath();
        ctx.ellipse(lx, ly + logH / 2, 0.8, 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // --- Section coupée DROITE ---
        ctx.fillStyle = '#7a4828';
        ctx.beginPath();
        ctx.ellipse(lx + logW, ly + logH / 2, 4.5, logH / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5a3010';
        ctx.lineWidth = 0.6;
        for (let r = 1; r <= 3; r++) {
            ctx.beginPath();
            ctx.ellipse(lx + logW, ly + logH / 2, r * 1.2, r * (logH / 2 - 0.5) / 3.5, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = '#c8804a';
        ctx.beginPath();
        ctx.ellipse(lx + logW, ly + logH / 2, 0.8, 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Indicateur de quantité discret
    ctx.fillStyle = 'rgba(80,40,10,0.75)';
    ctx.font = 'bold 9px Arial';
    ctx.fillText('x' + wood.amount, x + 12, y - 5 - wood.amount * 6 + 3);
}

// Dessine un abri (cabane en rondins)
function drawShelter(shelter) {
    const pos = gridToIso(shelter.x, shelter.y);
    const offsetX = canvas.width / 2;
    const offsetY = 100;
    const x = pos.x + offsetX;
    const y = pos.y + offsetY;

    // --- Sprite saisonnier (niveau 1 ou 2) ---
    const shelterSprite = shelter.level >= 2 ? getSprite('shelter2') : getSprite('shelter');
    if (shelterSprite) {
        const baseY = y + CONFIG.tileSize / 4;
        const h = 70;
        const w = shelterSprite.width * (h / shelterSprite.height);
        ctx.drawImage(shelterSprite, x - w / 2, baseY - h, w, h);
        // Fumée animée (conservée même avec le sprite)
        const chimX = x - 12;
        for (let i = 0; i < 4; i++) {
            const alpha = 0.26 - i * 0.05;
            const r = 3 + i * 2.5;
            ctx.fillStyle = `rgba(190,190,190,${alpha})`;
            ctx.beginPath();
            ctx.arc(chimX + 4 + Math.sin(i * 1.3) * 2.5, baseY - h - 10 - i * 8, r, 0, Math.PI * 2);
            ctx.fill();
        }
        return;
    }

    // --- OMBRE PORTÉE (plus réaliste, allongée sur le côté) ---
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(x + 12, y + 16, 38, 12, 0.25, 0, Math.PI * 2);
    ctx.fill();
    // Second halo plus doux
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(x + 18, y + 20, 50, 16, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // --- FONDATION EN PIERRE ---
    ctx.fillStyle = '#8a7a68';
    ctx.fillRect(x - 23, y, 46, 6);
    ctx.strokeStyle = '#6a5a48';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(x - 23 + i * 9.2, y);
        ctx.lineTo(x - 23 + i * 9.2, y + 6);
        ctx.stroke();
    }

    // --- FACE LATERALE DROITE (profondeur isométrique) ---
    ctx.fillStyle = '#5a2e12';
    ctx.beginPath();
    ctx.moveTo(x + 22, y - 28);
    ctx.lineTo(x + 29, y - 22);
    ctx.lineTo(x + 29, y);
    ctx.lineTo(x + 22, y);
    ctx.closePath();
    ctx.fill();
    // Rondins sur la face latérale
    ctx.strokeStyle = '#3c1e08';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 22, y - 28 + i * 7);
        ctx.lineTo(x + 29, y - 22 + i * 7);
        ctx.stroke();
    }

    // --- MUR AVANT : rondins horizontaux (4 rangées) ---
    const logColors = ['#8c5c30', '#7a4820', '#8c5c30', '#7a4820'];
    for (let i = 0; i < 4; i++) {
        const ly = y - 28 + i * 7;
        // Corps du rondin
        ctx.fillStyle = logColors[i];
        ctx.fillRect(x - 22, ly, 44, 7);
        // Ombre sous le rondin (relief)
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(x - 22, ly + 5, 44, 2);
        // Extrémité gauche (anneau de coupe)
        ctx.fillStyle = '#4c2810';
        ctx.beginPath(); ctx.arc(x - 22, ly + 3.5, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#381808'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(x - 22, ly + 3.5, 2, 0, Math.PI * 2); ctx.stroke();
        // Extrémité droite
        ctx.fillStyle = '#4c2810';
        ctx.beginPath(); ctx.arc(x + 22, ly + 3.5, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 22, ly + 3.5, 2, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.strokeStyle = '#3a1808'; ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 22, y - 28, 44, 28);
    // Planches verticales superposées aux rondins (style cabane en bois)
    ctx.strokeStyle = 'rgba(40,12,2,0.28)';
    ctx.lineWidth = 1;
    for (let p = 1; p < 6; p++) {
        ctx.beginPath();
        ctx.moveTo(x - 22 + p * 7.3, y - 28);
        ctx.lineTo(x - 22 + p * 7.3, y);
        ctx.stroke();
    }

    // --- FENÊTRE (côté gauche) ---
    ctx.fillStyle = '#b8e8f8';
    ctx.fillRect(x - 19, y - 25, 12, 10);
    ctx.strokeStyle = '#3a1808'; ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 20, y - 26, 14, 12);
    // Croisillons
    ctx.beginPath();
    ctx.moveTo(x - 13, y - 26); ctx.lineTo(x - 13, y - 14);
    ctx.moveTo(x - 20, y - 20); ctx.lineTo(x - 6,  y - 20);
    ctx.stroke();
    // Reflet vitré
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(x - 18, y - 25, 4, 4);

    // --- PORTE (centrée) ---
    const dx = x - 7, dy = y - 22, dw = 14, dh = 22;
    // Ombre portée (légère profondeur)
    ctx.fillStyle = '#2a1208';
    ctx.fillRect(dx + 1, dy + 1, dw, dh);
    // Panneau rouge-marron
    ctx.fillStyle = '#6a1a08';
    ctx.fillRect(dx, dy, dw, dh);
    // Planches verticales + traverse
    ctx.strokeStyle = '#2a1006'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dx + 7, dy);    ctx.lineTo(dx + 7, dy + dh);
    ctx.moveTo(dx, dy + 9);    ctx.lineTo(dx + dw, dy + 9);
    ctx.moveTo(dx, dy + dh - 4); ctx.lineTo(dx + dw, dy + dh - 4);
    ctx.stroke();
    // Cadre porte
    ctx.strokeStyle = '#7a4018'; ctx.lineWidth = 2;
    ctx.strokeRect(dx, dy, dw, dh);
    // Poignée dorée
    ctx.fillStyle = '#c8a010';
    ctx.beginPath(); ctx.arc(dx + 3.5, dy + 13, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#a08008'; ctx.lineWidth = 0.8; ctx.stroke();

    // --- CHEMINÉE EN PIERRE (dessinée avant le toit) ---
    const chimX = x - 12, chimY = y - 57;
    ctx.fillStyle = '#787068';
    ctx.fillRect(chimX, chimY, 10, 26);
    ctx.strokeStyle = '#585048'; ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(chimX, chimY + i * 6); ctx.lineTo(chimX + 10, chimY + i * 6); ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(chimX + 5, chimY); ctx.lineTo(chimX + 5, chimY + 26); ctx.stroke();
    // Chapeau de cheminée (débordant)
    ctx.fillStyle = '#585048';
    ctx.fillRect(chimX - 2, chimY - 4, 14, 5);

    // --- TOIT (deux versants, effet 3D par contraste de couleur) ---
    // Versant gauche — face avant, plus claire
    ctx.fillStyle = '#c07838';
    ctx.beginPath();
    ctx.moveTo(x,     y - 52);
    ctx.lineTo(x - 30, y - 28);
    ctx.lineTo(x,      y - 28);
    ctx.closePath();
    ctx.fill();
    // Versant droit — face latérale, plus sombre
    ctx.fillStyle = '#8a5420';
    ctx.beginPath();
    ctx.moveTo(x,     y - 52);
    ctx.lineTo(x + 30, y - 28);
    ctx.lineTo(x,      y - 28);
    ctx.closePath();
    ctx.fill();
    // Bardeaux versant gauche (lignes interpolées)
    ctx.strokeStyle = 'rgba(60,25,5,0.3)'; ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
        const t = i / 5;
        ctx.beginPath();
        ctx.moveTo(x - 30 * t, y - 52 + 24 * t);
        ctx.lineTo(x,           y - 52 + 24 * t);
        ctx.stroke();
    }
    // Bardeaux versant droit
    ctx.strokeStyle = 'rgba(40,15,0,0.3)'; ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
        const t = i / 5;
        ctx.beginPath();
        ctx.moveTo(x,           y - 52 + 24 * t);
        ctx.lineTo(x + 30 * t, y - 52 + 24 * t);
        ctx.stroke();
    }
    // Neige — versant gauche
    ctx.fillStyle = 'rgba(235,248,255,0.92)';
    ctx.beginPath();
    ctx.moveTo(x,     y - 52);
    ctx.lineTo(x - 30, y - 28);
    ctx.lineTo(x - 24, y - 28);
    ctx.lineTo(x,      y - 50);
    ctx.closePath();
    ctx.fill();
    // Neige — versant droit
    ctx.fillStyle = 'rgba(210,232,248,0.85)';
    ctx.beginPath();
    ctx.moveTo(x,     y - 52);
    ctx.lineTo(x + 30, y - 28);
    ctx.lineTo(x + 24, y - 28);
    ctx.lineTo(x,      y - 50);
    ctx.closePath();
    ctx.fill();
    // Contours toit
    ctx.strokeStyle = '#5a3010'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 30, y - 28); ctx.lineTo(x, y - 52); ctx.lineTo(x + 30, y - 28);
    ctx.stroke();
    // Débord bas (gouttière)
    ctx.strokeStyle = '#4a2808'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 30, y - 28); ctx.lineTo(x + 30, y - 28);
    ctx.stroke();

    // --- FUMÉE ---
    for (let i = 0; i < 4; i++) {
        const alpha = 0.26 - i * 0.05;
        const r = 3 + i * 2.5;
        ctx.fillStyle = `rgba(190,190,190,${alpha})`;
        ctx.beginPath();
        ctx.arc(chimX + 4 + Math.sin(i * 1.3) * 2.5, y - 63 - i * 8, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Dessine toutes les tuiles de la rivière avec animation de vagues
function drawRiver() {
    const ts = CONFIG.tileSize;
    for (const tile of riverTiles) {
        const pos = gridToIso(tile.x, tile.y);
        const x = pos.x + canvas.width / 2;
        const y = pos.y + 100;

        // Couleur animée : légère variation sinusoïdale par tuile
        const wave = Math.sin(frameCount * 0.04 + tile.x * 0.7 + tile.y * 0.5);
        const r = Math.floor(35  + wave * 12);
        const g = Math.floor(115 + wave * 15);
        const b = Math.floor(195 + wave * 12);

        // Tuile d'eau
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.moveTo(x,        y);
        ctx.lineTo(x + ts/2, y + ts/4);
        ctx.lineTo(x,        y + ts/2);
        ctx.lineTo(x - ts/2, y + ts/4);
        ctx.closePath();
        ctx.fill();

        // Contour givré (berges)
        ctx.strokeStyle = 'rgba(180,225,255,0.55)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Reflet / écume qui se déplace
        const phase = (frameCount * 0.025 + tile.x * 0.55) % (Math.PI * 2);
        ctx.fillStyle = 'rgba(220,245,255,0.18)';
        ctx.beginPath();
        ctx.ellipse(
            x + Math.cos(phase) * ts * 0.18,
            y + ts / 4 + Math.sin(phase * 0.7) * ts * 0.06,
            6, 2.5, 0.3, 0, Math.PI * 2
        );
        ctx.fill();
    }
}

// Dessine une tour de guet avec son sprite PNG
// La tour repousse les loups dans un rayon de CONFIG.towerWolfRepelRadius tuiles
function drawTower(tower) {
    const pos = gridToIso(tower.x, tower.y);
    const x = pos.x + canvas.width / 2;
    const y = pos.y + 100 + CONFIG.tileSize / 4;

    // Cercle de rayon semi-transparent pour visualiser la zone de protection
    // On le dessine seulement si le joueur est en mode tour (feedback visuel)
    if (buildTowerMode) {
        const r = CONFIG.towerWolfRepelRadius;
        // Convertir le rayon en pixels (approximatif isométrique)
        const pxRadius = r * CONFIG.tileSize * 0.45;
        ctx.strokeStyle = 'rgba(100,180,255,0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.ellipse(x, y - CONFIG.tileSize * 0.1, pxRadius, pxRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    if (towerSprite) {
        // Sprite : hauteur calée sur 1.6x tileSize pour une belle tour
        const spriteH = CONFIG.tileSize * 1.6;
        const spriteW = towerSprite.width * (spriteH / towerSprite.height);
        ctx.drawImage(towerSprite, x - spriteW / 2, y - spriteH + 8, spriteW, spriteH);
    } else {
        // Fallback canvas si le sprite n'est pas chargé
        ctx.fillStyle = '#7a6040';
        ctx.fillRect(x - 8, y - 40, 16, 40);
        ctx.fillStyle = '#9a7850';
        ctx.fillRect(x - 12, y - 45, 24, 10);
        ctx.fillStyle = '#5a4030';
        ctx.fillRect(x - 10, y - 52, 6, 8);
        ctx.fillRect(x + 4,  y - 52, 6, 8);
    }

    // Petite icône de bouclier au-dessus pour signaler la protection
    ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🗼', x, y - 50);
}

// Dessine un pont sur une tuile de rivière (sprite PNG selon orientation)
function drawBridge(bridge) {
    const pos = gridToIso(bridge.x, bridge.y);
    const ox = canvas.width / 2, oy = 100;
    const x = pos.x + ox;
    const y = pos.y + oy;
    const ts = CONFIG.tileSize;

    const sprite = bridge.orientation === 1 ? bridgeSprites.alt : bridgeSprites.normal;
    if (sprite) {
        const h = ts * 0.85;
        const w = sprite.width * (h / sprite.height);
        ctx.drawImage(sprite, x - w / 2, y - h * 0.5, w, h);
        return;
    }

    // Fallback canvas si sprites non chargés
    const lift = 4;
    ctx.fillStyle = '#c09040';
    ctx.beginPath();
    ctx.moveTo(x,        y - lift);
    ctx.lineTo(x + ts/2, y + ts/4 - lift);
    ctx.lineTo(x,        y + ts/2 - lift);
    ctx.lineTo(x - ts/2, y + ts/4 - lift);
    ctx.closePath();
    ctx.fill();
}

// Dessine l'indicateur de pêche au-dessus du joueur (quand pêche en cours)
function drawFishingIndicator() {
    if (player.isMoving)            return;
    if (player.fishingCooldown > 0) return;
    if (player.fishingTimer <= 0)   return;

    const pos = gridToIso(player.x, player.y);
    const x = pos.x + canvas.width / 2;
    const y = pos.y + 100;

    const progress = player.fishingTimer / CONFIG.fishingDuration;
    const barW = 36;
    const barX = x - barW / 2;
    const barY = y - 62;

    // Fond de la barre
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.roundRect(barX - 1, barY - 1, barW + 2, 7, 3); ctx.fill();
    // Remplissage bleu
    ctx.fillStyle = '#40a8ff';
    ctx.beginPath(); ctx.roundRect(barX, barY, barW * progress, 5, 2); ctx.fill();
    // Icône
    ctx.font = '12px Arial'; ctx.textAlign = 'center';
    ctx.fillText('🎣', x, barY - 5);
}

// Dessine un champ de blé selon son stade de croissance
// Stade 0 = terre, 1 = germes, 2 = pousses, 3 = blé mûr
function drawField(field) {
    const pos = gridToIso(field.x, field.y);
    const ox = canvas.width / 2;
    const oy = 100;
    const x = pos.x + ox;
    const y = pos.y + oy;
    const ts = CONFIG.tileSize;

    // --- Tuile de terre labourée ---
    const dirtColor = field.stage === 3 ? '#7a5028' : '#9a7048';
    ctx.fillStyle = dirtColor;
    ctx.beginPath();
    ctx.moveTo(x,        y);
    ctx.lineTo(x + ts/2, y + ts/4);
    ctx.lineTo(x,        y + ts/2);
    ctx.lineTo(x - ts/2, y + ts/4);
    ctx.closePath();
    ctx.fill();
    // Contour du champ
    ctx.strokeStyle = 'rgba(80,45,8,0.55)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    if (field.stage === 0) return; // Juste la terre labourée

    // --- Plantes réparties sur la tuile ---
    // Le centre de la tuile en écran est à (x, y + ts/4)
    const cx = x;
    const cy = y + ts / 4;

    // 6 positions décalées pour remplir la tuile
    const plantPos = [
        { dx: -10, dy: -3 },
        { dx:   0, dy: -5 },
        { dx:  10, dy: -3 },
        { dx:  -5, dy:  3 },
        { dx:   5, dy:  1 },
        { dx:   0, dy:  5 },
    ];

    for (const pp of plantPos) {
        const px = cx + pp.dx;
        const py = cy + pp.dy;

        if (field.stage === 1) {
            // Stade 1 : petit germe vert
            ctx.fillStyle = '#2a7010';
            ctx.fillRect(px - 1, py - 5, 2, 5);
            ctx.fillStyle = '#40a018';
            ctx.beginPath();
            ctx.ellipse(px + 3, py - 4, 3.5, 1.5, 0.5, 0, Math.PI * 2);
            ctx.fill();

        } else if (field.stage === 2) {
            // Stade 2 : tige avec feuilles
            ctx.fillStyle = '#1e5808';
            ctx.fillRect(px - 1, py - 11, 2, 11);
            ctx.fillStyle = '#38880e';
            ctx.beginPath();
            ctx.ellipse(px + 5, py - 8, 5.5, 2, 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(px - 5, py - 5, 5.5, 2, -0.4, 0, Math.PI * 2);
            ctx.fill();

        } else if (field.stage === 3) {
            // Stade 3 : blé mûr doré
            // Tige
            ctx.fillStyle = '#b89010';
            ctx.fillRect(px - 1, py - 15, 2, 15);
            // Épi principal
            ctx.fillStyle = '#e8c018';
            ctx.beginPath();
            ctx.ellipse(px, py - 19, 2.5, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            // Barbules de l'épi (petites branches latérales)
            ctx.strokeStyle = '#c0a008';
            ctx.lineWidth = 0.8;
            for (let b = 0; b < 4; b++) {
                ctx.beginPath();
                ctx.moveTo(px, py - 14 - b * 2.5);
                ctx.lineTo(px + 4.5, py - 12 - b * 2.5);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(px, py - 14 - b * 2.5);
                ctx.lineTo(px - 4.5, py - 12 - b * 2.5);
                ctx.stroke();
            }
        }
    }

    // --- Indicateur "prêt à récolter" (clignotant) ---
    if (field.stage === 3) {
        // Utiliser Date pour le clignotement (50% du temps visible)
        const blink = Math.floor(Date.now() / 600) % 2 === 0;
        if (blink) {
            ctx.font = '13px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✨', cx, cy - 24);
        }
        // Barre de progression complète (verte pleine)
        const barW = 34;
        const barX = cx - barW / 2;
        const barY = cy - 32;
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath(); ctx.roundRect(barX - 1, barY - 1, barW + 2, 6, 3); ctx.fill();
        ctx.fillStyle = '#50c020';
        ctx.beginPath(); ctx.roundRect(barX, barY, barW, 4, 2); ctx.fill();
        return;
    }

    // --- Barre de progression de croissance ---
    const totalFrames = CONFIG.growthStageTime * field.stage + (CONFIG.growthStageTime - field.growTimer);
    const totalDuration = CONFIG.growthStageTime * 3;
    const progress = Math.min(totalFrames / totalDuration, 1);
    const barW = 34;
    const barX = cx - barW / 2;
    const barY = cy - 32;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.roundRect(barX - 1, barY - 1, barW + 2, 6, 3); ctx.fill();
    ctx.fillStyle = '#a0c840';
    ctx.beginPath(); ctx.roundRect(barX, barY, barW * progress, 4, 2); ctx.fill();
}

// Dessine un moulin avec ses ailes tournantes et son état de production
function drawMill(mill) {
    const pos = gridToIso(mill.x, mill.y);
    const ox = canvas.width / 2, oy = 100;
    const x = pos.x + ox;
    const y = pos.y + oy;
    const ts = CONFIG.tileSize;
    const gy = y + ts / 4; // sol de la tuile

    // Sprite PNG saisonnier si disponible
    const millSprite = getSprite('mill');
    if (millSprite) {
        const h = 130;
        const w = millSprite.width * (h / millSprite.height);
        ctx.drawImage(millSprite, x - w / 2, gy - h, w, h);

        // Barre de progression de mouture par-dessus le sprite
        if (mill.isWorking) {
            const progress = mill.millProgress / CONFIG.millDuration;
            const barW = 44, barX = x - barW / 2, barY = gy - h - 14;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath(); ctx.roundRect(barX - 1, barY - 1, barW + 2, 7, 3); ctx.fill();
            ctx.fillStyle = '#e8d040';
            ctx.beginPath(); ctx.roundRect(barX, barY, barW * progress, 5, 2); ctx.fill();
            ctx.font = '10px Arial'; ctx.textAlign = 'center';
            ctx.fillText('⚙️ Mouture...', x, barY - 5);
        }
        // Indicateur blé / farine
        if (!mill.isWorking && (mill.wheatStored > 0 || mill.flourReady > 0)) {
            const labelY = gy - h - 6;
            ctx.fillStyle = 'rgba(20,10,5,0.65)';
            ctx.beginPath(); ctx.roundRect(x - 30, labelY - 12, 60, 16, 5); ctx.fill();
            ctx.fillStyle = mill.flourReady > 0 ? '#ffe060' : '#ffffff';
            ctx.font = '10px Arial'; ctx.textAlign = 'center';
            const label = mill.flourReady > 0
                ? `✨ Farine x${mill.flourReady} prête !`
                : `🌾 En attente : ${mill.wheatStored}`;
            ctx.fillText(label, x, labelY - 3);
        }
        return;
    }

    const towerH = 58;
    const towerW = 26;

    // --- Ombre au sol ---
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(x + 8, gy + 4, 30, 10, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // --- Fondation en pierre ---
    ctx.fillStyle = '#a09080';
    ctx.fillRect(x - 22, gy - 10, 44, 10);
    ctx.strokeStyle = '#7a6858'; ctx.lineWidth = 0.8;
    for (let i = 1; i < 5; i++) {
        ctx.beginPath(); ctx.moveTo(x - 22 + i * 11, gy - 10); ctx.lineTo(x - 22 + i * 11, gy); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(x - 22, gy - 5); ctx.lineTo(x + 22, gy - 5); ctx.stroke();
    // Face latérale fondation
    ctx.fillStyle = '#7a6050';
    ctx.beginPath();
    ctx.moveTo(x + 22, gy - 10); ctx.lineTo(x + 29, gy - 6);
    ctx.lineTo(x + 29, gy + 4);  ctx.lineTo(x + 22, gy);
    ctx.closePath(); ctx.fill();

    // --- Tour en pierre ---
    // Face avant
    ctx.fillStyle = '#c0b098';
    ctx.fillRect(x - towerW / 2, gy - 10 - towerH, towerW, towerH);
    // Joints de briques (motif décalé)
    ctx.strokeStyle = 'rgba(90,70,50,0.35)'; ctx.lineWidth = 0.7;
    const brickH = towerH / 5;
    for (let row = 0; row <= 5; row++) {
        const by = gy - 10 - towerH + row * brickH;
        ctx.beginPath(); ctx.moveTo(x - towerW/2, by); ctx.lineTo(x + towerW/2, by); ctx.stroke();
        const offsetX = (row % 2 === 0) ? towerW / 4 : 0;
        for (let col = 0; col < 3; col++) {
            const bx = x - towerW/2 + offsetX + col * (towerW / 2);
            ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + brickH); ctx.stroke();
        }
    }
    // Face latérale tour
    ctx.fillStyle = '#9a8068';
    ctx.beginPath();
    ctx.moveTo(x + towerW/2, gy - 10 - towerH); ctx.lineTo(x + towerW/2 + 7, gy - 6 - towerH + 4);
    ctx.lineTo(x + towerW/2 + 7, gy - 6);        ctx.lineTo(x + towerW/2, gy - 10);
    ctx.closePath(); ctx.fill();

    // Petite fenêtre
    ctx.fillStyle = '#6898b8';
    ctx.fillRect(x - 5, gy - 10 - towerH * 0.4, 10, 10);
    ctx.strokeStyle = '#3a1808'; ctx.lineWidth = 1.2;
    ctx.strokeRect(x - 5, gy - 10 - towerH * 0.4, 10, 10);
    ctx.beginPath();
    ctx.moveTo(x, gy - 10 - towerH * 0.4); ctx.lineTo(x, gy - towerH * 0.4);
    ctx.moveTo(x - 5, gy - 10 - towerH * 0.4 + 5); ctx.lineTo(x + 5, gy - 10 - towerH * 0.4 + 5);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(x - 4, gy - 9 - towerH * 0.4, 3, 3);

    // --- Toit conique ---
    ctx.fillStyle = '#b07030';
    ctx.beginPath();
    ctx.moveTo(x, gy - 10 - towerH - 22);
    ctx.lineTo(x - towerW/2 - 3, gy - 10 - towerH);
    ctx.lineTo(x, gy - 10 - towerH);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#784e18';
    ctx.beginPath();
    ctx.moveTo(x, gy - 10 - towerH - 22);
    ctx.lineTo(x + towerW/2 + 3, gy - 10 - towerH);
    ctx.lineTo(x, gy - 10 - towerH);
    ctx.closePath(); ctx.fill();
    // Arête du toit
    ctx.strokeStyle = '#4a2c08'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - towerW/2 - 3, gy - 10 - towerH);
    ctx.lineTo(x, gy - 10 - towerH - 22);
    ctx.lineTo(x + towerW/2 + 3, gy - 10 - towerH);
    ctx.stroke();
    // Neige sur le toit
    ctx.fillStyle = 'rgba(235,248,255,0.85)';
    ctx.beginPath();
    ctx.moveTo(x, gy - 10 - towerH - 22);
    ctx.lineTo(x - towerW/2 - 3, gy - 10 - towerH);
    ctx.lineTo(x - towerW/2 + 2, gy - 10 - towerH);
    ctx.lineTo(x, gy - 10 - towerH - 20);
    ctx.closePath(); ctx.fill();

    // --- Ailes tournantes ---
    // Centre de rotation : face avant-droite de la tour, à mi-hauteur
    const sailCX = x + towerW / 2 + 2;
    const sailCY = gy - 10 - towerH * 0.58;

    ctx.save();
    ctx.translate(sailCX, sailCY);
    ctx.rotate(mill.angle);

    for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate(i * Math.PI / 2);

        // Poutre centrale de l'aile
        ctx.fillStyle = '#7a4818';
        ctx.fillRect(-2.5, -30, 5, 30);

        // Toile de l'aile (triangle rempli)
        const sailAlpha = mill.isWorking ? 0.88 : 0.5;
        ctx.fillStyle = `rgba(210,175,100,${sailAlpha})`;
        ctx.beginPath();
        ctx.moveTo(0, -2);
        ctx.lineTo(-9, -28);
        ctx.lineTo(9, -28);
        ctx.closePath();
        ctx.fill();
        // Contour toile
        ctx.strokeStyle = 'rgba(120,70,15,0.5)'; ctx.lineWidth = 0.8;
        ctx.stroke();
        // Traverse décorative
        ctx.strokeStyle = '#7a4818'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-7, -20); ctx.lineTo(7, -20);
        ctx.stroke();

        ctx.restore();
    }

    // Moyeu central
    ctx.fillStyle = '#4a2808';
    ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9a5828';
    ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();

    ctx.restore();

    // --- Barre de progression de mouture ---
    if (mill.isWorking) {
        const progress = mill.millProgress / CONFIG.millDuration;
        const barW = 40;
        const barX = x - barW / 2;
        const barY = gy - 10 - towerH - 36;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.roundRect(barX - 1, barY - 1, barW + 2, 7, 3); ctx.fill();
        ctx.fillStyle = '#e8d040';
        ctx.beginPath(); ctx.roundRect(barX, barY, barW * progress, 5, 2); ctx.fill();
        ctx.font = '10px Arial'; ctx.textAlign = 'center';
        ctx.fillText('⚙️ Mouture...', x, barY - 5);
    }

    // --- Indicateur blé stocké / farine prête ---
    if (!mill.isWorking && (mill.wheatStored > 0 || mill.flourReady > 0)) {
        const labelY = gy - 10 - towerH - 14;
        ctx.fillStyle = 'rgba(20,10,5,0.65)';
        ctx.beginPath(); ctx.roundRect(x - 28, labelY - 12, 56, 16, 5); ctx.fill();
        ctx.fillStyle = mill.flourReady > 0 ? '#ffe060' : '#ffffff';
        ctx.font = '10px Arial'; ctx.textAlign = 'center';
        const label = mill.flourReady > 0
            ? `✨ Farine x${mill.flourReady} prête !`
            : `🌾 En attente : ${mill.wheatStored}`;
        ctx.fillText(label, x, labelY - 3);
    }
}

// Dessine une boulangerie avec son sprite saisonnier
function drawBakery(bakery) {
    const pos = gridToIso(bakery.x, bakery.y);
    const ox = canvas.width / 2, oy = 100;
    const x = pos.x + ox;
    const y = pos.y + oy;
    const ts = CONFIG.tileSize;
    const gy = y + ts / 4;

    const bakerySprite = getSprite('bakery');
    if (bakerySprite) {
        const h = 110;
        const w = bakerySprite.width * (h / bakerySprite.height);
        ctx.drawImage(bakerySprite, x - w / 2, gy - h, w, h);

        if (bakery.isWorking) {
            const progress = bakery.bakeryProgress / CONFIG.bakeryDuration;
            const barW = 44, barX = x - barW / 2, barY = gy - h - 14;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath(); ctx.roundRect(barX - 1, barY - 1, barW + 2, 7, 3); ctx.fill();
            ctx.fillStyle = '#e8902a';
            ctx.beginPath(); ctx.roundRect(barX, barY, barW * progress, 5, 2); ctx.fill();
            ctx.font = '10px Arial'; ctx.textAlign = 'center';
            ctx.fillText('🍞 Cuisson...', x, barY - 5);
        }
        if (!bakery.isWorking && (bakery.flourStored > 0 || bakery.breadReady > 0)) {
            const labelY = gy - h - 6;
            ctx.fillStyle = 'rgba(20,10,5,0.65)';
            ctx.beginPath(); ctx.roundRect(x - 32, labelY - 12, 64, 16, 5); ctx.fill();
            ctx.fillStyle = bakery.breadReady > 0 ? '#ffd080' : '#ffffff';
            ctx.font = '10px Arial'; ctx.textAlign = 'center';
            const label = bakery.breadReady > 0
                ? `🍞 Pain x${bakery.breadReady} prêt !`
                : `🌾 Farine : ${bakery.flourStored}`;
            ctx.fillText(label, x, labelY - 3);
        }
        return;
    }

    // Fallback canvas si le sprite est absent
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(x, gy + 2, 28, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d4926a';
    ctx.fillRect(x - 24, gy - 36, 48, 36);
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.moveTo(x - 28, gy - 36); ctx.lineTo(x, gy - 56); ctx.lineTo(x + 28, gy - 36);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#6a3520';
    ctx.fillRect(x + 8, gy - 60, 10, 26);
    if (bakery.isWorking) {
        for (let i = 0; i < 3; i++) {
            const sy = gy - 62 - i * 8;
            const sx = x + 13 + Math.sin(frameCount * 0.05 + i) * 4;
            ctx.fillStyle = `rgba(200,180,160,${0.4 - i * 0.12})`;
            ctx.beginPath(); ctx.arc(sx, sy, 5 + i * 2, 0, Math.PI * 2); ctx.fill();
        }
    }
}

// Dessine une poissonnerie
function drawPoissonnerie(p) {
    const pos = gridToIso(p.x, p.y);
    const x = pos.x + canvas.width / 2;
    const gy = pos.y + 100 + CONFIG.tileSize / 4;
    const h = 110;

    const sprite = getSprite('poissonnerie');
    if (sprite) {
        const w = sprite.width * (h / sprite.height);
        ctx.drawImage(sprite, x - w / 2, gy - h, w, h);
    } else {
        // Fallback canvas : bâtiment bleu simple
        ctx.fillStyle = '#2060a0';
        ctx.fillRect(x - 22, gy - 50, 44, 50);
        ctx.fillStyle = '#4090d0';
        ctx.fillRect(x - 18, gy - 44, 36, 28);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial'; ctx.textAlign = 'center';
        ctx.fillText('🐟', x, gy - 20);
    }

    // Barre de progression
    if (p.isWorking) {
        const progress = p.cookProgress / CONFIG.poissonerieDuration;
        const barW = 40, barX = x - 20, barY = gy - h - 14;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.roundRect(barX - 1, barY - 1, barW + 2, 7, 3); ctx.fill();
        ctx.fillStyle = '#40c0ff';
        ctx.beginPath(); ctx.roundRect(barX, barY, barW * progress, 5, 2); ctx.fill();
        ctx.font = '10px Arial'; ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText('🍳 Cuisson...', x, barY - 4);
    }

    // Indicateur stock / prêt
    if (!p.isWorking && (p.fishStored > 0 || p.cookedReady > 0)) {
        const labelY = gy - h - 14;
        ctx.fillStyle = 'rgba(0,20,40,0.7)';
        ctx.beginPath(); ctx.roundRect(x - 30, labelY - 12, 60, 16, 5); ctx.fill();
        ctx.fillStyle = p.cookedReady > 0 ? '#80ffcc' : '#ffffff';
        ctx.font = '10px Arial'; ctx.textAlign = 'center';
        ctx.fillText(
            p.cookedReady > 0 ? `🐟 Cuit x${p.cookedReady} prêt !` : `🐟 Stock : ${p.fishStored}`,
            x, labelY - 3
        );
    }
}

// Met à jour la cuisson dans toutes les poissonneries
function updatePoissonneries() {
    for (const p of poissonneries) {
        if (p.isWorking) {
            p.cookProgress++;
            if (p.cookProgress >= CONFIG.poissonerieDuration) {
                p.fishStored       -= CONFIG.poissonerieFishPerBatch;
                p.cookedReady      += CONFIG.poissonerieCookedPerBatch;
                p.isWorking         = false;
                p.cookProgress      = 0;
                spawnPopup('🐟 Poisson cuit prêt !', p.x, p.y);
            }
        } else if (p.fishStored >= CONFIG.poissonerieFishPerBatch) {
            p.isWorking    = true;
            p.cookProgress = 0;
        }
        if (p.depositCooldown > 0) p.depositCooldown--;
    }
}

// Dépose du poisson cru dans une poissonnerie proche, récupère le poisson cuit
function checkPoissonnierieInteraction() {
    for (const p of poissonneries) {
        const dx = player.x - p.x, dy = player.y - p.y;
        if (Math.sqrt(dx * dx + dy * dy) > 1.5) continue;

        // Récupérer le poisson cuit
        if (p.cookedReady > 0) {
            player.cookedFish += p.cookedReady;
            spawnPopup(`+${p.cookedReady} 🐟 Cuit !`, p.x, p.y);
            p.cookedReady = 0;
            updateCookedFishDisplay();
        }

        // Déposer du poisson cru si capacité disponible et cooldown ok
        if (p.depositCooldown <= 0 && player.fish > 0 && p.fishStored < CONFIG.poissonnerieMaxFish) {
            const toDeposit = Math.min(player.fish, CONFIG.poissonnerieMaxFish - p.fishStored);
            player.fish   -= toDeposit;
            p.fishStored  += toDeposit;
            spawnPopup(`🐟 ${toDeposit} poissons déposés`, p.x, p.y);
            p.depositCooldown = 120;
            updateFishDisplay();
        }
    }
}

// Dessine un feu de camp avec flammes animées
function drawCampfire(campfire) {
    const pos = gridToIso(campfire.x, campfire.y);
    const ox = canvas.width / 2, oy = 100;
    const x = pos.x + ox;
    const y = pos.y + oy;
    const gy = y + CONFIG.tileSize / 4;

    // Ombre
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(x, gy + 1, 14, 5, 0, 0, Math.PI * 2); ctx.fill();

    // Pierres
    ctx.fillStyle = '#808080';
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const rx = x + Math.cos(angle) * 9;
        const ry = gy - 2 + Math.sin(angle) * 4;
        ctx.beginPath(); ctx.ellipse(rx, ry, 3.5, 2.5, angle, 0, Math.PI * 2); ctx.fill();
    }

    // Bûches
    ctx.strokeStyle = '#6b3a1f'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 8, gy - 2); ctx.lineTo(x + 8, gy - 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 8, gy - 2); ctx.lineTo(x - 8, gy - 6); ctx.stroke();

    // Braises
    ctx.fillStyle = 'rgba(255,80,0,0.7)';
    ctx.beginPath(); ctx.ellipse(x, gy - 5, 7, 3, 0, 0, Math.PI * 2); ctx.fill();

    // Flammes animées
    const f1 = Math.sin(frameCount * 0.15) * 0.2 + 0.8;
    const f2 = Math.sin(frameCount * 0.22 + 1.5) * 0.2 + 0.8;
    const f3 = Math.sin(frameCount * 0.18 + 3.0) * 0.2 + 0.8;

    ctx.fillStyle = `rgba(255,120,0,${0.7 * f1})`;
    ctx.beginPath();
    ctx.moveTo(x - 8, gy - 5);
    ctx.quadraticCurveTo(x - 4 + f1 * 2, gy - 20, x, gy - 28 * f1);
    ctx.quadraticCurveTo(x + 4 - f1 * 2, gy - 20, x + 8, gy - 5);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = `rgba(255,185,0,${0.8 * f2})`;
    ctx.beginPath();
    ctx.moveTo(x - 5, gy - 6);
    ctx.quadraticCurveTo(x - 2 + f2 * 2, gy - 16, x, gy - 22 * f2);
    ctx.quadraticCurveTo(x + 2 - f2 * 2, gy - 16, x + 5, gy - 6);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = `rgba(255,240,100,${0.9 * f3})`;
    ctx.beginPath();
    ctx.moveTo(x - 3, gy - 6);
    ctx.quadraticCurveTo(x + f3, gy - 12, x, gy - 16 * f3);
    ctx.quadraticCurveTo(x - f3, gy - 12, x + 3, gy - 6);
    ctx.closePath(); ctx.fill();

    // Indicateur de cuisson du poisson
    if (campfire.cookingFish) {
        const progress = campfire.cookProgress / CONFIG.fishCookDuration;
        const barW = 36, barX = x - barW / 2, barY = gy - 42;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.roundRect(barX - 1, barY - 1, barW + 2, 7, 3); ctx.fill();
        ctx.fillStyle = '#ff8820';
        ctx.beginPath(); ctx.roundRect(barX, barY, barW * progress, 5, 2); ctx.fill();
        ctx.font = '10px Arial'; ctx.textAlign = 'center';
        ctx.fillText('🐟 Cuisson...', x, barY - 4);
    }
}

// En mode démolition : surligne en rouge toutes les tuiles supprimables
function drawDemolishOverlay() {
    if (!demolishMode) return;

    const demolishable = [...palisades, ...fields, ...shelters, ...mills, ...bakeries, ...campfires, ...bridges, ...poissonneries, ...towers];
    const ts = CONFIG.tileSize;

    for (const item of demolishable) {
        const pos = gridToIso(item.x, item.y);
        const x = pos.x + canvas.width / 2;
        const y = pos.y + 100;

        // Tuile rouge semi-transparente
        ctx.fillStyle = 'rgba(220, 40, 40, 0.28)';
        ctx.strokeStyle = 'rgba(220, 40, 40, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x,        y);
        ctx.lineTo(x + ts/2, y + ts/4);
        ctx.lineTo(x,        y + ts/2);
        ctx.lineTo(x - ts/2, y + ts/4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Croix ✕ au centre
        ctx.fillStyle = 'rgba(255, 80, 80, 0.95)';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✕', x, y + ts / 4);
    }
}

// Dessine tous les champs (appelé avant les entités pour rester sous les objets)
function drawAllFields() {
    for (const field of fields) {
        drawField(field);
    }
}

// Dessine un segment de palissade et ses planches vers les voisins est/sud
// Principe : chaque segment dessine ses planches vers l'est et le sud seulement.
// Les planches vers l'ouest/nord sont dessinées par les voisins correspondants.
// Ainsi chaque mur est dessiné une seule fois, dans le bon ordre de profondeur.
function drawPalisade(pal) {
    const pos = gridToIso(pal.x, pal.y);
    const ox = canvas.width / 2, oy = 100;
    const x = pos.x + ox;
    const y = pos.y + oy;
    const ts = CONFIG.tileSize;
    const gx = x, gy = y + ts / 4; // centre au sol de cette tuile

    // Détecter les voisins dans les 4 directions
    const connE = palisades.some(p => p.x === pal.x + 1 && p.y === pal.y);
    const connS = palisades.some(p => p.x === pal.x     && p.y === pal.y + 1);
    const connW = palisades.some(p => p.x === pal.x - 1 && p.y === pal.y);
    const connN = palisades.some(p => p.x === pal.x     && p.y === pal.y - 1);

    // Centres écran des voisins est et sud (un pas de tuile complet)
    const ex = gx + ts / 2, ey = gy + ts / 4; // voisin est
    const sx = gx - ts / 2, sy = gy + ts / 4; // voisin sud

    // Dessine un mur en planches entre deux points au sol (x1,y1) → (x2,y2)
    // rightFacing : true = face éclairée (direction est), false = face sombre (direction sud)
    function drawPlanks(x1, y1, x2, y2, rightFacing) {
        // 3 planches empilées à différentes hauteurs
        const planks = [
            { h: 7,  color: rightFacing ? '#c89848' : '#9a7030' },
            { h: 15, color: rightFacing ? '#b08030' : '#886018' },
            { h: 23, color: rightFacing ? '#c89848' : '#9a7030' },
        ];
        for (const plk of planks) {
            const ph = 6; // épaisseur d'une planche
            // Face supérieure (petite bande lumineuse)
            ctx.fillStyle = rightFacing ? '#e0b860' : '#b89040';
            ctx.beginPath();
            ctx.moveTo(x1, y1 - plk.h - ph);
            ctx.lineTo(x2, y2 - plk.h - ph);
            ctx.lineTo(x2, y2 - plk.h - ph + 2);
            ctx.lineTo(x1, y1 - plk.h - ph + 2);
            ctx.closePath();
            ctx.fill();
            // Face avant (couleur principale)
            ctx.fillStyle = plk.color;
            ctx.beginPath();
            ctx.moveTo(x1, y1 - plk.h);
            ctx.lineTo(x2, y2 - plk.h);
            ctx.lineTo(x2, y2 - plk.h - ph);
            ctx.lineTo(x1, y1 - plk.h - ph);
            ctx.closePath();
            ctx.fill();
            // Interstice sombre entre les planches
            ctx.strokeStyle = 'rgba(40,18,4,0.55)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x1, y1 - plk.h); ctx.lineTo(x2, y2 - plk.h);
            ctx.stroke();
        }
        // Ligne de base du mur (ombre au sol)
        ctx.strokeStyle = 'rgba(40,18,4,0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Dessiner les planches sortantes (est et sud uniquement)
    if (connE) drawPlanks(gx, gy, ex, ey, true);
    if (connS) drawPlanks(gx, gy, sx, sy, false);

    // ── Poteau central (toujours dessiné, par-dessus les planches) ──
    const pH = 36;

    // Ombre au sol
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(gx + 2, gy + 2, 7, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Face avant du poteau
    ctx.fillStyle = '#9a6030';
    ctx.fillRect(gx - 4, gy - pH, 8, pH);

    // Face latérale iso (plus sombre, donne la profondeur)
    ctx.fillStyle = '#6a3c18';
    ctx.beginPath();
    ctx.moveTo(gx + 4, gy - pH); ctx.lineTo(gx + 7, gy - pH + 3);
    ctx.lineTo(gx + 7, gy + 3);  ctx.lineTo(gx + 4, gy);
    ctx.closePath(); ctx.fill();

    // Veinage du bois (deux stries verticales discrètes)
    ctx.strokeStyle = 'rgba(60,28,6,0.28)'; ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(gx - 1, gy - pH); ctx.lineTo(gx - 1, gy);
    ctx.moveTo(gx + 2, gy - pH); ctx.lineTo(gx + 2, gy);
    ctx.stroke();

    // Pointe taillée — face avant
    ctx.fillStyle = '#b07840';
    ctx.beginPath();
    ctx.moveTo(gx - 4, gy - pH);
    ctx.lineTo(gx,     gy - pH - 11);
    ctx.lineTo(gx + 4, gy - pH);
    ctx.closePath(); ctx.fill();

    // Pointe taillée — face latérale iso
    ctx.fillStyle = '#7a4822';
    ctx.beginPath();
    ctx.moveTo(gx + 4, gy - pH);
    ctx.lineTo(gx,     gy - pH - 11);
    ctx.lineTo(gx + 7, gy - pH + 3);
    ctx.closePath(); ctx.fill();

    // Petit contour de la pointe
    ctx.strokeStyle = 'rgba(40,18,4,0.4)'; ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(gx - 4, gy - pH); ctx.lineTo(gx, gy - pH - 11); ctx.lineTo(gx + 7, gy - pH + 3);
    ctx.stroke();

    // Indication "mode palissade" : cercle vert si on est en train de construire
    if (buildPalisadeMode) {
        ctx.strokeStyle = 'rgba(100,220,80,0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(gx, gy - pH / 2, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Ombre portée (au bas du poteau, devant)
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.ellipse(gx + 4, gy + 4, 12, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
}

// Dessine le joueur avec animation de marche
function drawPlayer() {
    const pos = gridToIso(player.x, player.y);
    const offsetX = canvas.width / 2;
    const offsetY = 100;

    const x = pos.x + offsetX;
    const y = pos.y + offsetY;

    // --- Sprite saisonnier ---
    const playerSprite = getSprite('player');
    if (playerSprite) {
        const baseY = y + CONFIG.tileSize / 4;
        const h = 35;
        const w = playerSprite.width * (h / playerSprite.height);
        const bob = player.isMoving ? Math.abs(Math.sin(player.walkCycle)) * 1.5 : 0;
        // Miroir horizontal si le joueur se dirige vers la gauche (targetX < x)
        const facingLeft = player.targetX < player.x - 0.1;
        ctx.save();
        if (facingLeft) {
            ctx.scale(-1, 1);
            ctx.drawImage(playerSprite, -x - w / 2, baseY - h - bob, w, h);
        } else {
            ctx.drawImage(playerSprite, x - w / 2, baseY - h - bob, w, h);
        }
        ctx.restore();
        return;
    }

    // --- Calcul de l'animation ---
    const swing = Math.sin(player.walkCycle);
    const legShift = swing * 6;
    const armShift = swing * 5;
    const bodyBob  = Math.abs(swing) * 1.5;
    const yBody    = y - bodyBob;

    // --- Ombre au sol ---
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y + 11, 13, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // === JAMBES (pantalon bleu foncé) ===
    // Jambe gauche
    ctx.fillStyle = '#1a2f7c';
    ctx.fillRect(x - 6 + legShift, yBody + 4, 5, 11);
    // Botte gauche (marron)
    ctx.fillStyle = '#7a4a2c';
    ctx.fillRect(x - 7 + legShift, yBody + 14, 8, 5);
    // Semelle botte gauche
    ctx.fillStyle = '#4a2a10';
    ctx.fillRect(x - 8 + legShift, yBody + 18, 10, 2);

    // Jambe droite
    ctx.fillStyle = '#1a2f7c';
    ctx.fillRect(x + 1 - legShift, yBody + 4, 5, 11);
    // Botte droite
    ctx.fillStyle = '#7a4a2c';
    ctx.fillRect(x - legShift, yBody + 14, 8, 5);
    // Semelle botte droite
    ctx.fillStyle = '#4a2a10';
    ctx.fillRect(x - 1 - legShift, yBody + 18, 10, 2);

    // === CAPUCHE (derrière la tête) ===
    ctx.fillStyle = '#2a78df';
    ctx.beginPath();
    ctx.arc(x, yBody - 21, 11, Math.PI, 0);
    ctx.fill();
    // Bord de la capuche (fourrure blanche)
    ctx.strokeStyle = '#e8f0f8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, yBody - 21, 11, Math.PI + 0.1, -0.1);
    ctx.stroke();

    // === CORPS — Parka bleue ===
    ctx.fillStyle = '#4a9eff';
    ctx.fillRect(x - 8, yBody - 12, 16, 17);
    // Coutures doudoune (bandes horizontales rembourrées)
    ctx.strokeStyle = 'rgba(20,70,180,0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x - 8, yBody - 7 + i * 5);
        ctx.lineTo(x + 8, yBody - 7 + i * 5);
        ctx.stroke();
    }
    // Fermeture éclair
    ctx.fillStyle = '#c0d8f0';
    ctx.fillRect(x - 1, yBody - 12, 2, 15);
    ctx.fillStyle = '#a0b8d8';
    ctx.fillRect(x - 2, yBody - 3, 4, 3);
    // Bordure fourrure bas de parka
    ctx.fillStyle = '#d8eaf8';
    ctx.fillRect(x - 8, yBody + 4, 16, 3);

    // === BRAS GAUCHE ===
    ctx.fillStyle = '#3a8bef';
    ctx.fillRect(x - 12, yBody - 11 + armShift, 5, 11);
    // Manchette fourrure
    ctx.fillStyle = '#d0e4f8';
    ctx.fillRect(x - 12, yBody - 1 + armShift, 5, 3);
    // Gant gauche (marron foncé)
    ctx.fillStyle = '#6a3820';
    ctx.beginPath();
    ctx.arc(x - 10, yBody + 3 + armShift, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // === BRAS DROIT ===
    ctx.fillStyle = '#3a8bef';
    ctx.fillRect(x + 7, yBody - 11 - armShift, 5, 11);
    // Manchette fourrure
    ctx.fillStyle = '#d0e4f8';
    ctx.fillRect(x + 7, yBody - 1 - armShift, 5, 3);
    // Gant droit
    ctx.fillStyle = '#6a3820';
    ctx.beginPath();
    ctx.arc(x + 10, yBody + 3 - armShift, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // === BONNET rouge/orange ===
    // Corps du bonnet
    ctx.fillStyle = '#d43010';
    ctx.beginPath();
    ctx.arc(x, yBody - 22, 8, Math.PI, 0);
    ctx.fill();
    // Revers du bonnet (bande plus claire)
    ctx.fillStyle = '#ff6030';
    ctx.fillRect(x - 9, yBody - 23, 18, 5);
    // Rayure décorative
    ctx.strokeStyle = '#ff9050';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, yBody - 22, 8, Math.PI + 0.35, -0.35);
    ctx.stroke();
    // Pompon blanc
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, yBody - 31, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(180,180,220,0.5)';
    ctx.beginPath();
    ctx.arc(x - 1, yBody - 32, 2, 0, Math.PI * 2);
    ctx.fill();

    // === TÊTE (peau beige) ===
    ctx.fillStyle = '#ffd4a3';
    ctx.beginPath();
    ctx.arc(x, yBody - 21, 7, 0, Math.PI * 2);
    ctx.fill();
    // Joues rosées
    ctx.fillStyle = 'rgba(255,170,140,0.45)';
    ctx.beginPath();
    ctx.ellipse(x - 4, yBody - 20, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 4, yBody - 20, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sourcils
    ctx.strokeStyle = '#6a4020';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - 5, yBody - 25); ctx.lineTo(x - 2, yBody - 24);
    ctx.moveTo(x + 2, yBody - 24); ctx.lineTo(x + 5, yBody - 25);
    ctx.stroke();

    // Yeux (noirs avec reflet)
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.arc(x - 2.5, yBody - 22, 1.4, 0, Math.PI * 2);
    ctx.arc(x + 2.5, yBody - 22, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(x - 1.8, yBody - 22.6, 0.5, 0, Math.PI * 2);
    ctx.arc(x + 3.2, yBody - 22.6, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Nez
    ctx.fillStyle = '#e8a87a';
    ctx.beginPath();
    ctx.arc(x, yBody - 19.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Bouche (petit sourire)
    ctx.strokeStyle = '#c07040';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, yBody - 17.5, 2, 0.2, Math.PI - 0.2);
    ctx.stroke();

}

// Dessine un lapin
function drawRabbit(rabbit) {
    const pos = gridToIso(rabbit.x, rabbit.y);
    const offsetX = canvas.width / 2;
    const offsetY = 100;
    const x = pos.x + offsetX;
    const y = pos.y + offsetY;

    // Saut animé : monte en arc quand il se déplace
    const hop = rabbit.isMoving ? Math.abs(Math.sin(rabbit.walkCycle)) * 5 : 0;
    const yb = y - hop; // base verticale animée

    const fur  = rabbit.fleeing ? '#ddd' : '#f2f2f2';
    const fur2 = rabbit.fleeing ? '#bbb' : '#d4d4d4';

    // Ombre (reste au sol, rétrécit quand il saute)
    ctx.fillStyle = `rgba(0,0,0,${0.18 - hop * 0.012})`;
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 7 - hop * 0.4, 3.5 - hop * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Queue
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x + 6, yb - 5, 3, 2.5, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Corps
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.ellipse(x, yb - 5, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Ventre (ombre sous le corps)
    ctx.fillStyle = fur2;
    ctx.beginPath();
    ctx.ellipse(x + 1, yb - 3, 5, 2.5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Patte arrière (visible sur le côté)
    ctx.fillStyle = fur2;
    ctx.beginPath();
    ctx.ellipse(x + 5, yb - 2, 3.5, 2, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Oreilles (dessinées avant la tête)
    ctx.fillStyle = fur;
    ctx.beginPath(); ctx.ellipse(x - 4, yb - 17, 2, 5.5, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0a0a0';
    ctx.beginPath(); ctx.ellipse(x - 4, yb - 17, 1, 4,   -0.15, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = fur;
    ctx.beginPath(); ctx.ellipse(x - 1, yb - 17, 2, 5.5,  0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0a0a0';
    ctx.beginPath(); ctx.ellipse(x - 1, yb - 17, 1, 4,    0.15, 0, Math.PI * 2); ctx.fill();

    // Tête
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.arc(x - 3, yb - 10, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Museau
    ctx.fillStyle = fur2;
    ctx.beginPath();
    ctx.ellipse(x - 6, yb - 9, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nez rose
    ctx.fillStyle = '#f08080';
    ctx.beginPath();
    ctx.arc(x - 7, yb - 9.5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Œil avec reflet
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(x - 4, yb - 11.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(x - 3.5, yb - 12, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Exclamation si fuite
    if (rabbit.fleeing) {
        ctx.fillStyle = '#ff3333';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('!', x - 1, yb - 23);
    }
}

// Met à jour la position de tous les lapins
function updateRabbits() {
    const FLEE_DIST   = 3.5;
    const NORMAL_SPD  = 0.04;
    const FLEE_SPD    = 0.13;

    for (const rabbit of rabbits) {
        const dx = rabbit.targetX - rabbit.x;
        const dy = rabbit.targetY - rabbit.y;
        const distToTarget = Math.sqrt(dx * dx + dy * dy);

        // Détecter la proximité du joueur
        const pdx = player.x - rabbit.x;
        const pdy = player.y - rabbit.y;
        const distToPlayer = Math.sqrt(pdx * pdx + pdy * pdy);

        if (distToPlayer < FLEE_DIST) {
            // Fuir dans la direction opposée au joueur
            rabbit.fleeing = true;
            rabbit.targetX = Math.max(1, Math.min(CONFIG.worldWidth  - 2, Math.round(rabbit.x - pdx * 3)));
            rabbit.targetY = Math.max(1, Math.min(CONFIG.worldHeight - 2, Math.round(rabbit.y - pdy * 3)));
            rabbit.waitTimer = 0;
        } else {
            rabbit.fleeing = false;
        }

        const speed = rabbit.fleeing ? FLEE_SPD : NORMAL_SPD;

        if (distToTarget > 0.05) {
            // Avancer vers la cible
            rabbit.x += (dx / distToTarget) * speed;
            rabbit.y += (dy / distToTarget) * speed;
            rabbit.isMoving = true;
            rabbit.walkCycle += rabbit.fleeing ? 0.28 : 0.16;
            if (Math.abs(dx) < 0.1) rabbit.x = rabbit.targetX;
            if (Math.abs(dy) < 0.1) rabbit.y = rabbit.targetY;
        } else {
            // Arrivé à destination
            rabbit.isMoving = false;
            rabbit.walkCycle *= 0.88; // retour à la pose neutre
            if (!rabbit.fleeing) {
                if (rabbit.waitTimer > 0) {
                    rabbit.waitTimer--;
                } else {
                    // Choisir une prochaine destination aléatoire à portée
                    rabbit.targetX = Math.max(1, Math.min(CONFIG.worldWidth  - 2, Math.round(rabbit.x + (Math.random() - 0.5) * 6)));
                    rabbit.targetY = Math.max(1, Math.min(CONFIG.worldHeight - 2, Math.round(rabbit.y + (Math.random() - 0.5) * 6)));
                    rabbit.waitTimer = 60 + Math.floor(Math.random() * 120);
                }
            }
        }
    }
}

// ========================================
// LOUPS (attaques hivernales)
// ========================================

// Dessine un loup avec son sprite (ou un fallback canvas)
function drawWolf(wolf) {
    const pos = gridToIso(wolf.x, wolf.y);
    const x = pos.x + canvas.width / 2;
    const y = pos.y + 100 + CONFIG.tileSize / 4;

    if (wolfSprite) {
        // Taille du sprite loup (un peu plus petit que le joueur)
        const spriteH = CONFIG.tileSize * 0.9;
        const spriteW = wolfSprite.width * (spriteH / wolfSprite.height);
        // Légère oscillation pour simuler la démarche
        const bounce = wolf.isMoving ? Math.abs(Math.sin(wolf.walkCycle)) * 3 : 0;
        ctx.drawImage(wolfSprite, x - spriteW / 2, y - spriteH + 8 - bounce, spriteW, spriteH);
    } else {
        // Fallback : corps gris simple
        ctx.fillStyle = '#555566';
        ctx.beginPath(); ctx.ellipse(x, y - 10, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
        // Tête
        ctx.fillStyle = '#444455';
        ctx.beginPath(); ctx.arc(x + 10, y - 14, 6, 0, Math.PI * 2); ctx.fill();
        // Oreilles
        ctx.fillStyle = '#333344';
        ctx.beginPath();
        ctx.moveTo(x + 8, y - 20); ctx.lineTo(x + 6, y - 28); ctx.lineTo(x + 12, y - 22);
        ctx.fill();
    }

    // Barre de faim rouge (indicateur visuel d'attaque imminente)
    if (wolf.attackCooldown < 30) {
        ctx.fillStyle = 'rgba(200,30,30,0.8)';
        ctx.beginPath(); ctx.arc(x, y - 30, 4, 0, Math.PI * 2); ctx.fill();
    }
}

// Vérifie si un loup peut avancer vers (nx, ny) : bloqué par les palissades
function wolfCanMove(nx, ny) {
    // Hors carte
    if (nx < 0 || nx >= CONFIG.worldWidth || ny < 0 || ny >= CONFIG.worldHeight) return false;
    // Bloqué par une palissade
    if (palisades.some(p => p.x === Math.round(nx) && p.y === Math.round(ny))) return false;
    // Bloqué par la rivière sans pont
    const key = `${Math.round(nx)},${Math.round(ny)}`;
    if (riverTileSet.has(key) && !bridges.some(b => b.x === Math.round(nx) && b.y === Math.round(ny))) return false;
    return true;
}

// Gère le spawn, le déplacement et les attaques des loups
// - Apparaissent uniquement en hiver
// - Se dirigent vers le joueur
// - Bloqués par les palissades
// - Attaquent le joueur s'il est à portée
function updateWolves() {
    const isWinter = SEASONS[currentSeasonIndex] === 'hiver';

    // Spawn de loups en hiver
    if (isWinter && wolves.length < CONFIG.wolfMaxCount) {
        wolfSpawnTimer--;
        if (wolfSpawnTimer <= 0) {
            wolfSpawnTimer = CONFIG.wolfSpawnInterval;
            // Faire apparaître le loup sur un bord de la carte, loin du joueur
            const side = Math.floor(Math.random() * 4); // 0=nord, 1=est, 2=sud, 3=ouest
            let wx, wy;
            if      (side === 0) { wx = Math.floor(Math.random() * CONFIG.worldWidth); wy = 0; }
            else if (side === 1) { wx = CONFIG.worldWidth - 1; wy = Math.floor(Math.random() * CONFIG.worldHeight); }
            else if (side === 2) { wx = Math.floor(Math.random() * CONFIG.worldWidth); wy = CONFIG.worldHeight - 1; }
            else                 { wx = 0; wy = Math.floor(Math.random() * CONFIG.worldHeight); }

            wolves.push({
                x: wx, y: wy,
                walkCycle: 0,
                isMoving: false,
                attackCooldown: 0
            });
            spawnPopup('🐺 Un loup approche !', wx, wy);
        }
    }

    // Disparition des loups quand l'hiver se termine
    if (!isWinter && wolves.length > 0) {
        wolves.length = 0; // Les loups fuient quand il ne fait plus froid
        wolfSpawnTimer = CONFIG.wolfSpawnInterval;
        return;
    }

    // Mise à jour de chaque loup
    for (const wolf of wolves) {
        // Décrémenter le cooldown d'attaque
        if (wolf.attackCooldown > 0) wolf.attackCooldown--;

        // Vérifier si une tour de guet est à portée (rayon CONFIG.towerWolfRepelRadius)
        // Si oui, le loup fuit dans la direction opposée à la tour la plus proche
        let nearTower = false;
        let closestTowerDx = 0, closestTowerDy = 0, closestTowerDist = Infinity;
        for (const t of towers) {
            const tdx = wolf.x - t.x;
            const tdy = wolf.y - t.y;
            const td  = Math.sqrt(tdx * tdx + tdy * tdy);
            if (td < CONFIG.towerWolfRepelRadius && td < closestTowerDist) {
                nearTower = true;
                closestTowerDx = tdx;
                closestTowerDy = tdy;
                closestTowerDist = td;
            }
        }

        if (nearTower) {
            // Fuir en s'éloignant de la tour
            const fd = Math.sqrt(closestTowerDx * closestTowerDx + closestTowerDy * closestTowerDy);
            const nx = wolf.x + (closestTowerDx / fd) * CONFIG.wolfSpeed * 1.5;
            const ny = wolf.y + (closestTowerDy / fd) * CONFIG.wolfSpeed * 1.5;
            wolf.x = Math.max(0, Math.min(CONFIG.worldWidth  - 1, nx));
            wolf.y = Math.max(0, Math.min(CONFIG.worldHeight - 1, ny));
            wolf.isMoving = true;
            wolf.walkCycle += 0.2;
            continue; // Ce loup fuit, pas besoin de vérifier l'attaque
        }

        // Calculer la direction vers le joueur
        const dx = player.x - wolf.x;
        const dy = player.y - wolf.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Attaque si à portée
        if (dist < CONFIG.wolfAttackRange && wolf.attackCooldown === 0) {
            player.hunger = Math.max(0, player.hunger - CONFIG.wolfDamage);
            SOUNDS.wolfAttack();
            wolf.attackCooldown = CONFIG.wolfAttackInterval;
            spawnPopup('🐺 Attaque !', Math.round(wolf.x), Math.round(wolf.y));
        }

        // Déplacement vers le joueur (si pas trop proche)
        if (dist > CONFIG.wolfAttackRange * 0.8) {
            const nx = wolf.x + (dx / dist) * CONFIG.wolfSpeed;
            const ny = wolf.y + (dy / dist) * CONFIG.wolfSpeed;

            // Vérifier que le prochain pas n'est pas bloqué
            if (wolfCanMove(nx, ny)) {
                wolf.x = nx;
                wolf.y = ny;
                wolf.isMoving = true;
                wolf.walkCycle += 0.2;
            } else {
                // Tentative de contournement : essayer de longer la palissade
                const altNx = wolf.x + (dx / dist) * CONFIG.wolfSpeed;
                const altNy = wolf.y;
                if (wolfCanMove(altNx, altNy)) {
                    wolf.x = altNx;
                    wolf.isMoving = true;
                    wolf.walkCycle += 0.2;
                } else {
                    const altNx2 = wolf.x;
                    const altNy2 = wolf.y + (dy / dist) * CONFIG.wolfSpeed;
                    if (wolfCanMove(altNx2, altNy2)) {
                        wolf.y = altNy2;
                        wolf.isMoving = true;
                        wolf.walkCycle += 0.2;
                    } else {
                        wolf.isMoving = false;
                    }
                }
            }
        } else {
            wolf.isMoving = false;
        }
    }
}

// Vérifie si le joueur peut ramasser du bois
function checkWoodCollection() {
    const collectionRange = 1.5; // Distance de collecte
    
    for (let i = woodPiles.length - 1; i >= 0; i--) {
        const wood = woodPiles[i];
        const distance = Math.sqrt(
            Math.pow(player.x - wood.x, 2) + 
            Math.pow(player.y - wood.y, 2)
        );
        
        if (distance < collectionRange) {
            // Ramasser le bois !
            player.wood += wood.amount;
            SOUNDS.collect();
            spawnPopup(`+${wood.amount} Bois`, wood.x, wood.y);
            woodPiles.splice(i, 1); // Retirer la pile de la carte
            updateWoodDisplay();
        }
    }
}

// Vérifie si le joueur est assez proche du rocher pour collecter de la pierre
// Le rocher est illimité : il ne disparaît jamais, mais un cooldown empêche
// de collecter en continu (CONFIG.stoneCollectCooldown frames entre chaque collecte)
function checkStoneCollection() {
    for (const stone of stonePiles) {
        // Décrémenter le cooldown indépendamment de la distance
        if (stone.collectCooldown > 0) {
            stone.collectCooldown--;
            continue;
        }
        const dx = player.x - stone.x, dy = player.y - stone.y;
        if (Math.sqrt(dx * dx + dy * dy) < 1.5) {
            player.stone += CONFIG.stonePerVisit;
            spawnPopup(`+${CONFIG.stonePerVisit} 🪨 Pierre`, stone.x, stone.y);
            stone.collectCooldown = CONFIG.stoneCollectCooldown;
            updateStoneDisplay();
        }
    }
}

// Dessine le rocher unique avec le sprite saisonnier correspondant
function drawStonePile(stone) {
    const pos = gridToIso(stone.x, stone.y);
    const x = pos.x + canvas.width / 2;
    const y = pos.y + 100 + CONFIG.tileSize / 4;

    const sprite = getSprite('rocher');

    if (sprite) {
        // Sprite disponible : affichage centré, hauteur proportionnelle à tileSize
        const spriteH = CONFIG.tileSize * 1.1;
        const spriteW = sprite.width * (spriteH / sprite.height);
        ctx.drawImage(sprite, x - spriteW / 2, y - spriteH + 10, spriteW, spriteH);
    } else {
        // Fallback canvas : rochers gris si le sprite n'est pas chargé
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); ctx.ellipse(x, y + 2, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
        const rocks = [{ ox: -6, oy: 0, r: 9 }, { ox: 6, oy: 2, r: 8 }, { ox: 0, oy: -6, r: 7 }];
        for (const rock of rocks) {
            ctx.fillStyle = '#8a8a9a';
            ctx.beginPath(); ctx.arc(x + rock.ox, y + rock.oy, rock.r, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#aaaabc';
            ctx.beginPath(); ctx.arc(x + rock.ox - 2, y + rock.oy - 2, rock.r * 0.45, 0, Math.PI * 2); ctx.fill();
        }
    }

    // Indicateur de cooldown : petite icône "⏳" si on vient de collecter
    if (stone.collectCooldown > 0) {
        ctx.fillStyle = 'rgba(20,10,5,0.65)';
        ctx.beginPath();
        ctx.roundRect(x - 20, y - 50, 40, 18, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('⏳ ' + Math.ceil(stone.collectCooldown / 60) + 's', x, y - 41);
    }
}

// Vérifie si le joueur est assez proche pour couper son arbre cible
function checkTreeCutting() {
    if (!player.cuttingTarget) return;

    const tree = player.cuttingTarget;

    // Sécurité : la cible a déjà été coupée
    if (tree.chopped) {
        player.cuttingTarget = null;
        return;
    }

    // Calculer la distance entre le joueur et l'arbre
    const dx = player.x - tree.x;
    const dy = player.y - tree.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 1.5) {
        // Joueur assez proche : arrêter le déplacement et couper
        player.targetX = player.x;
        player.targetY = player.y;

        tree.cuttingProgress++;

        if (tree.cuttingProgress >= CONFIG.treeCutDuration) {
            // Arbre coupé !
            tree.chopped = true;
            tree.cuttingProgress = 0;
            tree.regrowTimer = CONFIG.treeRegrowTime;
            player.wood += CONFIG.woodPerTree;
            SOUNDS.chop();
            player.cuttingTarget = null;
            spawnPopup(`+${CONFIG.woodPerTree} 🪵 Bois`, tree.x, tree.y);
            updateWoodDisplay();
        }
    }
}

// Vérifie si une tuile est libre (aucun élément du jeu dessus)
function isTileFree(x, y) {
    const hasTree     = trees.some(t     => !t.chopped && t.x === x && t.y === y);
    const hasShelter  = shelters.some(s  => s.x === x && s.y === y);
    const hasField    = fields.some(f    => f.x === x && f.y === y);
    const hasPalisade = palisades.some(p => p.x === x && p.y === y);
    const hasMill     = mills.some(m      => m.x === x && m.y === y);
    const hasBakery   = bakeries.some(b   => b.x === x && b.y === y);
    const hasCampfire = campfires.some(c  => c.x === x && c.y === y);
    const isRiver     = riverTileSet.has(`${x},${y}`);
    return !hasTree && !hasShelter && !hasField && !hasPalisade && !hasMill && !hasBakery && !hasCampfire && !isRiver;
}

// Gère la repoussée des arbres coupés (appelé chaque frame)
function updateTreeRegrowth() {
    for (const tree of trees) {
        if (!tree.chopped || tree.regrowTimer <= 0) continue;

        tree.regrowTimer--;

        if (tree.regrowTimer === 0) {
            // Chercher une tuile libre (jusqu'à 20 tentatives)
            let newX, newY, attempts = 0;
            do {
                newX = Math.floor(Math.random() * CONFIG.worldWidth);
                newY = Math.floor(Math.random() * CONFIG.worldHeight);
                attempts++;
            } while (!isTileFree(newX, newY) && attempts < 20);

            if (attempts < 20) {
                tree.x = newX;
                tree.y = newY;
                tree.type = Math.random() > 0.5 ? 'pine' : 'dead';
                tree.chopped = false;
                spawnPopup('🌲 Nouveau sapin !', tree.x, tree.y);
            } else {
                // Pas de tuile libre trouvée : réessayer dans 5 secondes
                tree.regrowTimer = 300;
            }
        }
    }
}

// Trace le chemin entre deux points et retourne le dernier tile atteignable
// avant une rivière sans pont. blocked=true si le chemin est coupé.
function findLastSafeTarget(fromX, fromY, toX, toY) {
    const steps = Math.max(Math.abs(Math.round(toX) - Math.round(fromX)),
                           Math.abs(Math.round(toY) - Math.round(fromY)));
    if (steps === 0) return { x: Math.round(toX), y: Math.round(toY), blocked: false };
    let lastSafeX = Math.round(fromX);
    let lastSafeY = Math.round(fromY);
    for (let i = 1; i <= steps; i++) {
        const cx = Math.round(fromX + (toX - fromX) * i / steps);
        const cy = Math.round(fromY + (toY - fromY) * i / steps);
        const hasBridge = bridges.some(b => b.x === cx && b.y === cy);
        if (riverTileSet.has(`${cx},${cy}`) && !hasBridge) {
            return { x: lastSafeX, y: lastSafeY, blocked: true };
        }
        lastSafeX = cx;
        lastSafeY = cy;
    }
    return { x: Math.round(toX), y: Math.round(toY), blocked: false };
}

// Vérifie si le joueur est adjacent à une tuile de rivière sans pont
function isAdjacentToRiver() {
    const px = Math.round(player.x);
    const py = Math.round(player.y);
    const neighbors = [
        { x: px + 1, y: py }, { x: px - 1, y: py },
        { x: px, y: py + 1 }, { x: px, y: py - 1 }
    ];
    return neighbors.some(n => {
        const isRiver  = riverTileSet.has(`${n.x},${n.y}`);
        const hasBridge = bridges.some(b => b.x === n.x && b.y === n.y);
        return isRiver && !hasBridge;
    });
}

// Gère la pêche automatique quand le joueur s'arrête près de la rivière
function checkFishing() {
    // Décrémenter le cooldown de pêche
    if (player.fishingCooldown > 0) {
        player.fishingCooldown--;
        return;
    }

    // Conditions pour pêcher : immobile, adjacent à la rivière
    if (player.isMoving || !isAdjacentToRiver()) {
        player.fishingTimer = 0; // réinitialiser si le joueur bouge ou s'éloigne
        return;
    }

    // Incrémenter le timer de pêche
    player.fishingTimer++;

    if (player.fishingTimer >= CONFIG.fishingDuration) {
        // Poisson attrapé !
        player.fish++;
        SOUNDS.fishCatch();
        player.fishingTimer   = 0;
        player.fishingCooldown = CONFIG.fishingCooldown;
        spawnPopup('🐟 +1 Poisson !', Math.round(player.x), Math.round(player.y));
        updateFishDisplay();
    }
}

// Vérifie si le joueur est assez proche d'un champ mûr pour le récolter
function checkWheatHarvest() {
    for (let i = fields.length - 1; i >= 0; i--) {
        const field = fields[i];
        if (field.stage < 3) continue; // Pas encore mûr

        const dx = player.x - field.x;
        const dy = player.y - field.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 1.5) {
            player.wheat += CONFIG.wheatPerHarvest;
            spawnPopup(`+${CONFIG.wheatPerHarvest} 🌾 Blé`, field.x, field.y);
            fields.splice(i, 1); // Retirer le champ récolté
            updateWheatDisplay();
        }
    }
}

// Gère le timer de saison et les transitions
function updateSeason() {
    seasonTimer++;

    // Décrémenter le fondu de transition
    if (seasonTransitionAlpha > 0) {
        seasonTransitionAlpha = Math.max(0, seasonTransitionAlpha - 0.018);
    }

    // Changer de saison après SEASON_DURATION frames
    if (seasonTimer >= CONFIG.seasonDuration) {
        seasonTimer = 0;
        currentSeasonIndex = (currentSeasonIndex + 1) % SEASONS.length;
        seasonTransitionAlpha = 1.0; // déclencher le fondu

        const icon  = SEASON_ICONS[currentSeasonIndex];
        const label = SEASON_LABELS[currentSeasonIndex];
        // Popup au centre de l'écran (position approximative de la caméra)
        spawnPopup(`${icon} ${label} !`, Math.round(player.x), Math.round(player.y));
        updateSeasonDisplay();
    }
}

// Fait avancer la croissance de tous les champs chaque frame
function updateFieldGrowth() {
    // En hiver, le sol est gelé : la croissance est suspendue
    if (SEASONS[currentSeasonIndex] === 'hiver') return;

    for (const field of fields) {
        if (field.stage >= 3) continue; // Déjà mûr, pas besoin d'avancer

        field.growTimer--;

        if (field.growTimer <= 0) {
            field.stage++;
            field.growTimer = CONFIG.growthStageTime;

            if (field.stage === 3) {
                spawnPopup('🌾 Blé mûr !', field.x, field.y);
            }
        }
    }
}

// Met à jour la production de tous les moulins (rotation, mouture)
function updateMills() {
    for (const mill of mills) {
        if (mill.isWorking) {
            // Faire tourner les ailes pendant la mouture
            mill.angle += 0.025;
            mill.millProgress++;

            if (mill.millProgress >= CONFIG.millDuration) {
                // Fournée terminée !
                mill.wheatStored -= CONFIG.millWheatPerBatch;
                mill.flourReady  += CONFIG.millFlourPerBatch;
                mill.isWorking    = false;
                mill.millProgress = 0;
                spawnPopup('✨ Farine prête !', mill.x, mill.y);
            }
        } else {
            // Lancer une nouvelle fournée si assez de blé stocké
            if (mill.wheatStored >= CONFIG.millWheatPerBatch) {
                mill.isWorking    = true;
                mill.millProgress = 0;
            }
            // Ralentir les ailes doucement quand le moulin s'arrête
            if (mill.angle % (Math.PI * 2) > 0.01) {
                mill.angle += 0.005;
            }
        }
    }
}

// Gère les interactions joueur ↔ moulin (dépôt blé, récupération farine)
function checkMillInteraction() {
    for (const mill of mills) {
        const dx = player.x - mill.x;
        const dy = player.y - mill.y;
        if (Math.sqrt(dx * dx + dy * dy) > 1.5) continue;

        // Récupérer la farine si prête
        if (mill.flourReady > 0) {
            player.flour += mill.flourReady;
            spawnPopup(`+${mill.flourReady} Farine !`, mill.x, mill.y);
            mill.flourReady = 0;
            updateFlourDisplay();
        }

        // Déposer du blé si le joueur en a et que le moulin a de la place
        // Un cooldown évite de déposer chaque frame sans arrêt
        if (player.wheat > 0 && mill.wheatStored < CONFIG.millMaxWheat && mill.depositCooldown <= 0) {
            const toDeposit = Math.min(
                player.wheat,
                CONFIG.millWheatPerBatch,
                CONFIG.millMaxWheat - mill.wheatStored
            );
            mill.wheatStored   += toDeposit;
            player.wheat       -= toDeposit;
            mill.depositCooldown = 300; // ~5s avant de pouvoir redéposer
            spawnPopup(`🌾 +${toDeposit} déposé`, mill.x, mill.y);
            updateWheatDisplay();
        }

        // Décrémenter le cooldown de dépôt
        if (mill.depositCooldown > 0) mill.depositCooldown--;
    }
}

// ========================================
// HABITANTS
// ========================================

// Crée un habitant lié à l'abri donné, placé sur une tuile adjacente libre
function spawnHabitant(shelter) {
    const offsets = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
    let sx = shelter.x + 1, sy = shelter.y; // position par défaut
    for (const [dx, dy] of offsets) {
        const nx = shelter.x + dx, ny = shelter.y + dy;
        if (nx >= 0 && nx < CONFIG.worldWidth && ny >= 0 && ny < CONFIG.worldHeight
            && isTileFree(nx, ny)) {
            sx = nx; sy = ny; break;
        }
    }
    const color = HABITANT_COLORS[habitants.length % HABITANT_COLORS.length];
    // Alternance homme/femme selon l'index
    const gender = habitants.length % 2 === 0 ? 'homme' : 'femme';
    habitants.push({
        x: sx, y: sy,
        targetX: sx, targetY: sy,
        shelter,
        gender,
        walkCycle: Math.random() * Math.PI * 2,
        isMoving: false,
        waitTimer: 60 + Math.floor(Math.random() * 120),
        // Décaler le timer de nourriture pour éviter que tous mangent en même temps
        foodTimer: Math.floor(Math.random() * CONFIG.habitantFoodInterval),
        color,
        gatherCooldown: 0
    });
    updateHabitantDisplay();
}

// Supprime l'habitant associé à un abri démoli
function removeHabitantOfShelter(shelter) {
    const idx = habitants.findIndex(h => h.shelter === shelter);
    if (idx !== -1) habitants.splice(idx, 1);
    updateHabitantDisplay();
}

// Met à jour le déplacement, la collecte et la nourriture de chaque habitant
function updateHabitants() {
    for (let i = habitants.length - 1; i >= 0; i--) {
        const h = habitants[i];

        // --- Mouvement ---
        const dx = h.targetX - h.x;
        const dy = h.targetY - h.y;
        h.isMoving = Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05;

        if (h.isMoving) {
            h.x += dx * CONFIG.playerSpeed * 0.55;
            h.y += dy * CONFIG.playerSpeed * 0.55;
            if (Math.abs(h.x - h.targetX) < 0.1) h.x = h.targetX;
            if (Math.abs(h.y - h.targetY) < 0.1) h.y = h.targetY;
            h.walkCycle += 0.12;
        } else {
            h.walkCycle *= 0.85;
            h.waitTimer--;
            if (h.waitTimer <= 0) {
                // Choisir une nouvelle destination dans le rayon de vagabondage
                const r = CONFIG.habitantWanderRadius;
                const nx = Math.round(h.shelter.x + (Math.random() * 2 - 1) * r);
                const ny = Math.round(h.shelter.y + (Math.random() * 2 - 1) * r);
                if (nx >= 0 && nx < CONFIG.worldWidth && ny >= 0 && ny < CONFIG.worldHeight) {
                    const hasBridge = bridges.some(b => b.x === nx && b.y === ny);
                    if (!riverTileSet.has(`${nx},${ny}`) || hasBridge) {
                        h.targetX = nx;
                        h.targetY = ny;
                    }
                }
                h.waitTimer = 120 + Math.floor(Math.random() * 200);
            }
        }

        // --- Collecte passive de ressources ---
        if (h.gatherCooldown > 0) {
            h.gatherCooldown--;
        } else {
            // Pile de bois proche ?
            const woodIdx = woodPiles.findIndex(w =>
                Math.sqrt((h.x - w.x) ** 2 + (h.y - w.y) ** 2) < 1.5
            );
            if (woodIdx !== -1) {
                const w = woodPiles[woodIdx];
                player.wood += w.amount;
                woodPiles.splice(woodIdx, 1);
                spawnPopup(`+${w.amount}🪵`, h.x, h.y);
                updateWoodDisplay();
                h.gatherCooldown = CONFIG.habitantGatherCooldown;
                continue;
            }
            // Champ mûr proche ?
            const matureField = fields.find(f =>
                f.stage >= 3 && Math.sqrt((h.x - f.x) ** 2 + (h.y - f.y) ** 2) < 1.5
            );
            if (matureField) {
                player.wheat += CONFIG.wheatPerHarvest;
                matureField.stage = 0;
                matureField.growTimer = CONFIG.growthStageTime;
                spawnPopup(`+${CONFIG.wheatPerHarvest}🌾`, h.x, h.y);
                updateWheatDisplay();
                h.gatherCooldown = CONFIG.habitantGatherCooldown;
            }
        }

        // --- Consommation de nourriture ---
        h.foodTimer++;
        if (h.foodTimer >= CONFIG.habitantFoodInterval) {
            h.foodTimer = 0;
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
                // Plus de nourriture : l'habitant quitte l'abri
                spawnPopup('😢 Un habitant est parti !', h.shelter.x, h.shelter.y);
                habitants.splice(i, 1);
                updateHabitantDisplay();
            }
        }
    }
}

// Dessine un habitant avec le sprite PNG homme ou femme
function drawHabitant(h) {
    const pos = gridToIso(h.x, h.y);
    const ox = canvas.width / 2, oy = 100;
    const x = pos.x + ox;
    const baseY = pos.y + oy + CONFIG.tileSize / 4;

    const bob = h.isMoving ? Math.sin(h.walkCycle * 2) * 2 : 0;

    // Ombre au sol
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(x, baseY, 9, 3.5, 0, 0, Math.PI * 2); ctx.fill();

    // Sprite PNG si disponible
    const sprite = habitantSprites[h.gender];
    if (sprite) {
        const hSprite = 64;
        const wSprite = sprite.width * (hSprite / sprite.height);
        const facingLeft = h.targetX < h.x - 0.1;
        ctx.save();
        if (facingLeft) {
            ctx.scale(-1, 1);
            ctx.drawImage(sprite, -x - wSprite / 2, baseY - hSprite + bob, wSprite, hSprite);
        } else {
            ctx.drawImage(sprite, x - wSprite / 2, baseY - hSprite + bob, wSprite, hSprite);
        }
        ctx.restore();
        return;
    }

    // Fallback canvas si le sprite n'est pas chargé
    ctx.fillStyle = h.color;
    ctx.fillRect(x - 6, baseY - 26 + bob, 12, 14);
    ctx.fillStyle = '#f5c8a0';
    ctx.beginPath(); ctx.arc(x, baseY - 31 + bob, 7, 0, Math.PI * 2); ctx.fill();
}

// Met à jour l'affichage du nombre d'habitants
function updateHabitantDisplay() {
    const el = document.getElementById('habitants');
    if (el) el.textContent = habitants.length;
}

// Diminue la faim chaque frame et déclenche le game over à 0
function updateHunger() {
    if (gameOver) return;
    player.hunger = Math.max(0, player.hunger - CONFIG.hungerDecayRate);
    if (player.hunger <= 0) {
        gameOver = true;
        gameOverCause = 'hunger';
    }
}

// Met à jour la jauge de froid : diminue avec le temps, remonte près d'un feu ou d'un abri
function updateCold() {
    if (gameOver) return;

    // La perte de chaleur dépend de la saison :
    // - Été    : aucune perte (il fait chaud, jauge reste à 100)
    // - Printemps / Automne : perte très légère (x0.25)
    // - Hiver  : perte forte (x3)
    const saison = SEASONS[currentSeasonIndex];
    let decay = 0;
    if (saison === 'hiver') {
        decay = CONFIG.coldDecayRate * CONFIG.coldWinterMultiplier;
    } else if (saison === 'printemps' || saison === 'automne') {
        decay = CONFIG.coldDecayRate * CONFIG.coldSpringAutumnMultiplier;
    }
    // Été : decay reste à 0, la jauge ne bouge pas

    // En été, remonter doucement la jauge vers 100 (le soleil réchauffe)
    if (saison === 'été') {
        player.cold = Math.min(100, player.cold + 0.005);
    } else {
        player.cold = Math.max(0, player.cold - decay);
    }

    // Vérifier si le joueur est près d'un feu de camp (réchauffe vite)
    for (const campfire of campfires) {
        const dx = player.x - campfire.x;
        const dy = player.y - campfire.y;
        if (Math.sqrt(dx * dx + dy * dy) <= 2) {
            player.cold = Math.min(100, player.cold + CONFIG.coldFromCampfire);
            // Crépitement aléatoire (~1 fois/seconde en moyenne)
            if (Math.random() < 0.016) SOUNDS.crackle();
            break; // Un seul feu suffit
        }
    }

    // Vérifier si le joueur est près d'un abri (réchauffe doucement)
    for (const shelter of shelters) {
        const dx = player.x - shelter.x;
        const dy = player.y - shelter.y;
        if (Math.sqrt(dx * dx + dy * dy) <= 1.5) {
            player.cold = Math.min(100, player.cold + CONFIG.coldFromShelter);
            break;
        }
    }

    // Game over si complètement gelé
    if (player.cold <= 0) {
        gameOver = true;
        gameOverCause = 'cold'; // Pour afficher le bon message
    }
}

// Gère la cuisson automatique du poisson près d'un feu de camp
function updateCampfireCooking() {
    for (const campfire of campfires) {
        if (campfire.cookingFish) {
            campfire.cookProgress++;
            if (campfire.cookProgress >= CONFIG.fishCookDuration) {
                player.cookedFish++;
                campfire.cookingFish  = false;
                campfire.cookProgress = 0;
                spawnPopup('🍳 Poisson cuit !', campfire.x, campfire.y);
                updateCookedFishDisplay();
            }
        }
    }
}

// Dépose automatiquement un poisson cru dans un feu proche pour le cuire
function checkCampfireInteraction() {
    for (const campfire of campfires) {
        if (campfire.cookingFish) continue; // déjà en train de cuire
        const dx = player.x - campfire.x;
        const dy = player.y - campfire.y;
        if (Math.sqrt(dx * dx + dy * dy) > 1.5) continue;
        if (player.fish > 0) {
            player.fish--;
            campfire.cookingFish  = true;
            campfire.cookProgress = 0;
            spawnPopup('🔥 Poisson mis à cuire !', campfire.x, campfire.y);
            updateFishDisplay();
        }
    }
}

// Mange la meilleure nourriture disponible (poisson cuit > pain > poisson cru)
function eatFood() {
    if (player.hunger >= 100) {
        spawnPopup('Tu n\'as pas faim !', player.x, player.y);
        return;
    }
    if (player.cookedFish > 0) {
        player.cookedFish--;
        player.hunger = Math.min(100, player.hunger + CONFIG.hungerFromCookedFish);
        SOUNDS.eat();
        spawnPopup(`+${CONFIG.hungerFromCookedFish} 🐟 Savoureux !`, player.x, player.y);
        updateCookedFishDisplay();
    } else if (player.bread > 0) {
        player.bread--;
        player.hunger = Math.min(100, player.hunger + CONFIG.hungerFromBread);
        SOUNDS.eat();
        spawnPopup(`+${CONFIG.hungerFromBread} 🍞 Délicieux !`, player.x, player.y);
        updateBreadDisplay();
    } else if (player.fish > 0) {
        player.fish--;
        player.hunger = Math.min(100, player.hunger + CONFIG.hungerFromRawFish);
        SOUNDS.eat();
        spawnPopup(`+${CONFIG.hungerFromRawFish} 🐟 Bof, c'était cru...`, player.x, player.y);
        updateFishDisplay();
    } else {
        spawnPopup('❌ Plus rien à manger !', player.x, player.y);
    }
}

// Dessine la jauge de faim en haut à gauche du canvas
function drawHungerBar() {
    const barW = 160, barH = 18;
    const bx = 16, by = 16;
    const pct = player.hunger / 100;

    // Couleur selon le niveau de faim
    let color;
    if (pct > 0.6)      color = '#44cc44';
    else if (pct > 0.3) color = '#ffaa00';
    else                color = '#dd2222';

    // Fond
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.roundRect(bx - 2, by - 2, barW + 4, barH + 4, 5); ctx.fill();

    // Barre de fond vide
    ctx.fillStyle = 'rgba(80,40,40,0.8)';
    ctx.beginPath(); ctx.roundRect(bx, by, barW, barH, 4); ctx.fill();

    // Barre remplie
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(bx, by, barW * pct, barH, 4); ctx.fill();

    // Texte
    ctx.fillStyle = 'white';
    ctx.font = 'bold 11px Cabin, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🍖 Faim : ${Math.ceil(player.hunger)}%`, bx + 6, by + 13);

    // Clignotement rouge si faim critique
    if (pct <= 0.2 && Math.floor(frameCount / 20) % 2 === 0) {
        ctx.strokeStyle = 'rgba(255,50,50,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(bx - 2, by - 2, barW + 4, barH + 4, 5); ctx.stroke();
    }
}

// Dessine la jauge de froid en haut à gauche, sous la barre de faim
function drawColdBar() {
    const barW = 160, barH = 18;
    const bx = 16, by = 42; // décalée de 26px sous la barre de faim

    const pct = player.cold / 100;

    // Couleur selon le niveau de chaleur corporelle
    let color;
    if (pct > 0.6)      color = '#44aaff'; // bleu clair = ok
    else if (pct > 0.3) color = '#2266cc'; // bleu moyen = attention
    else                color = '#8822ff'; // violet = critique

    // Fond
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.roundRect(bx - 2, by - 2, barW + 4, barH + 4, 5); ctx.fill();

    // Barre de fond vide
    ctx.fillStyle = 'rgba(20,20,60,0.8)';
    ctx.beginPath(); ctx.roundRect(bx, by, barW, barH, 4); ctx.fill();

    // Barre remplie
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(bx, by, barW * pct, barH, 4); ctx.fill();

    // Texte
    ctx.fillStyle = 'white';
    ctx.font = 'bold 11px Cabin, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`❄️ Froid : ${Math.ceil(player.cold)}%`, bx + 6, by + 13);

    // Clignotement bleu si froid critique
    if (pct <= 0.2 && Math.floor(frameCount / 20) % 2 === 0) {
        ctx.strokeStyle = 'rgba(100,100,255,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(bx - 2, by - 2, barW + 4, barH + 4, 5); ctx.stroke();
    }
}

// Dessine l'écran de game over
function drawGameOver() {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2, cy = canvas.height / 2;

    ctx.fillStyle = '#cc2222';
    ctx.font = 'bold 56px "Permanent Marker", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', cx, cy - 30);

    ctx.fillStyle = '#f4f9fc';
    ctx.font = '22px Cabin, sans-serif';
    const causeMsg = gameOverCause === 'cold' ? 'Tu es mort de froid...' : 'Tu es mort de faim...';
    ctx.fillText(causeMsg, cx, cy + 15);

    // Bouton Recommencer
    ctx.fillStyle = '#2c5f77';
    ctx.beginPath(); ctx.roundRect(cx - 100, cy + 45, 200, 48, 12); ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Cabin, sans-serif';
    ctx.fillText('▶ Recommencer', cx, cy + 75);
}

// Met à jour la production de toutes les boulangeries (cuisson du pain)
function updateBakeries() {
    for (const bakery of bakeries) {
        if (bakery.isWorking) {
            bakery.bakeryProgress++;
            if (bakery.bakeryProgress >= CONFIG.bakeryDuration) {
                bakery.flourStored    -= CONFIG.bakeryFlourPerBatch;
                bakery.breadReady     += CONFIG.breadPerBatch;
                bakery.isWorking       = false;
                bakery.bakeryProgress  = 0;
                spawnPopup('🍞 Pain prêt !', bakery.x, bakery.y);
            }
        } else if (bakery.flourStored >= CONFIG.bakeryFlourPerBatch) {
            bakery.isWorking      = true;
            bakery.bakeryProgress = 0;
        }
        if (bakery.depositCooldown > 0) bakery.depositCooldown--;
    }
}

// Gère les interactions joueur ↔ boulangerie (dépôt farine, récupération pain)
function checkBakeryInteraction() {
    for (const bakery of bakeries) {
        const dx = player.x - bakery.x;
        const dy = player.y - bakery.y;
        if (Math.sqrt(dx * dx + dy * dy) > 1.5) continue;

        // Récupérer le pain prêt
        if (bakery.breadReady > 0) {
            player.bread += bakery.breadReady;
            spawnPopup(`+${bakery.breadReady} 🍞 Pain !`, bakery.x, bakery.y);
            bakery.breadReady = 0;
            updateBreadDisplay();
        }

        // Déposer de la farine si la boulangerie a de la place
        if (player.flour > 0 && bakery.flourStored < CONFIG.bakeryMaxFlour && bakery.depositCooldown <= 0) {
            const toDeposit = Math.min(
                CONFIG.bakeryFlourPerBatch,
                CONFIG.bakeryMaxFlour - bakery.flourStored,
                player.flour
            );
            bakery.flourStored  += toDeposit;
            player.flour        -= toDeposit;
            bakery.depositCooldown = 300;
            spawnPopup(`🌾 +${toDeposit} Farine déposée`, bakery.x, bakery.y);
            updateFlourDisplay();
        }
    }
}

// ========================================
// POPUPS (messages flottants)
// ========================================

// Crée un message popup flottant à une position de grille
function spawnPopup(text, gridX, gridY) {
    popups.push({
        text: text,
        gridX: gridX,
        gridY: gridY,
        offsetY: -30,   // Décalage vertical en pixels (négatif = au-dessus)
        alpha: 1.0,
        lifetime: 90    // Durée de vie en frames (~1.5 secondes à 60fps)
    });
}

// Met à jour et dessine tous les popups actifs
function updateAndDrawPopups() {
    for (let i = popups.length - 1; i >= 0; i--) {
        const popup = popups[i];

        // Faire monter le popup et diminuer son opacité
        popup.offsetY -= 0.7;
        popup.lifetime--;
        popup.alpha = popup.lifetime / 90;

        // Calculer la position à l'écran
        const pos = gridToIso(popup.gridX, popup.gridY);
        const screenX = pos.x + canvas.width / 2;
        const screenY = pos.y + 100 + popup.offsetY;

        ctx.save();
        ctx.globalAlpha = popup.alpha;

        // Fond semi-transparent arrondi
        ctx.fillStyle = 'rgba(20, 10, 5, 0.65)';
        ctx.beginPath();
        ctx.roundRect(screenX - 32, screenY - 13, 64, 22, 8);
        ctx.fill();

        // Texte blanc centré
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(popup.text, screenX, screenY);

        ctx.restore();

        // Supprimer quand la durée de vie est écoulée
        if (popup.lifetime <= 0) {
            popups.splice(i, 1);
        }
    }
}

// ========================================
// JAUGES HTML OVERLAY (PWA)
// ========================================

// Cache les éléments DOM pour éviter querySelector à chaque frame
const _hungerFill = document.getElementById('hungerFill');
const _hungerPct  = document.getElementById('hungerPct');
const _coldFill   = document.getElementById('coldFill');
const _coldPct    = document.getElementById('coldPct');
const _hungerBar  = document.getElementById('hungerBarEl');
const _coldBar    = document.getElementById('coldBarEl');

// Met à jour les barres HTML faim/froid à chaque frame (remplace le dessin canvas)
function updateHTMLBars() {
    if (!_hungerFill) return; // éléments absents (version desktop sans overlay HTML)

    const hPct = player.hunger / 100;
    const cPct = player.cold   / 100;

    // Couleur faim
    const hColor = hPct > 0.6 ? '#44cc44' : hPct > 0.3 ? '#ffaa00' : '#dd2222';
    // Couleur froid
    const cColor = cPct > 0.6 ? '#44aaff' : cPct > 0.3 ? '#2266cc' : '#8822ff';

    _hungerFill.style.width      = (hPct * 100) + '%';
    _hungerFill.style.background = hColor;
    _hungerPct.textContent       = Math.ceil(player.hunger) + '%';

    _coldFill.style.width        = (cPct * 100) + '%';
    _coldFill.style.background   = cColor;
    _coldPct.textContent         = Math.ceil(player.cold) + '%';

    // Clignotement CSS si état critique (< 20%)
    const isBlinkFrame = Math.floor(frameCount / 20) % 2 === 0;
    if (_hungerBar) _hungerBar.classList.toggle('critical', hPct <= 0.2 && isBlinkFrame);
    if (_coldBar)   _coldBar.classList.toggle('critical',   cPct <= 0.2 && isBlinkFrame);
}

// ========================================
// BOUCLE DE JEU
// ========================================

function gameLoop() {
    // Auto-réparation : si le canvas est encore 0×0 (layout pas prêt),
    // on réessaie au prochain frame sans rien dessiner.
    if (canvas.width === 0 || canvas.height === 0) {
        resizeCanvas();
        requestAnimationFrame(gameLoop);
        return;
    }

    // Incrémenter le compteur de frames (pour les animations)
    frameCount++;

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Si game over : afficher l'écran et arrêter la logique
    if (gameOver) {
        ctx.save();
        ctx.translate(canvas.width / 2 * (1 - currentZoom), 0);
        ctx.scale(currentZoom, currentZoom);
        drawGround();
        ctx.restore();
        drawGameOver(); // overlay plein écran, pas zoomé
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Déplacer le joueur progressivement vers sa cible
    player.isMoving = Math.abs(player.x - player.targetX) > 0.05 || Math.abs(player.y - player.targetY) > 0.05;

    if (player.isMoving) {
        player.x += (player.targetX - player.x) * CONFIG.playerSpeed;
        player.y += (player.targetY - player.y) * CONFIG.playerSpeed;

        // Arrondir quand on est très proche
        if (Math.abs(player.x - player.targetX) < 0.1) player.x = player.targetX;
        if (Math.abs(player.y - player.targetY) < 0.1) player.y = player.targetY;

        // Avancer le cycle de marche
        player.walkCycle += 0.18;

        // Mettre à jour l'affichage de la position
        updatePositionDisplay();
    } else {
        // Revenir doucement à la pose neutre (jambes ensemble)
        player.walkCycle *= 0.85;
    }
    
    // Vérifier si on peut ramasser du bois
    checkWoodCollection();

    // Vérifier si on peut ramasser de la pierre
    checkStoneCollection();

    // Pêche automatique si le joueur est immobile près de la rivière
    checkFishing();

    // Vérifier si on est en train de couper un arbre
    checkTreeCutting();

    // Gérer la repoussée des arbres
    updateTreeRegrowth();

    // Faire croître les champs de blé
    updateFieldGrowth();

    // Vérifier si on peut récolter du blé
    checkWheatHarvest();

    // Mettre à jour les moulins (rotation + production)
    updateMills();

    // Mettre à jour les habitants (déplacement, collecte, nourriture)
    updateHabitants();

    // Mettre à jour la faim
    updateHunger();

    // Mettre à jour le froid
    updateCold();

    // Cuisson du poisson au feu de camp
    updateCampfireCooking();

    // Interaction joueur ↔ feu de camp (dépôt poisson cru)
    checkCampfireInteraction();

    // Vérifier les interactions joueur ↔ moulin
    checkMillInteraction();

    // Mettre à jour les boulangeries (cuisson)
    updateBakeries();

    // Vérifier les interactions joueur ↔ boulangerie
    checkBakeryInteraction();

    // Mettre à jour les poissonneries (cuisson poisson)
    updatePoissonneries();

    // Vérifier les interactions joueur ↔ poissonnerie
    checkPoissonnierieInteraction();

    // Mettre à jour les lapins
    updateRabbits();

    // Mettre à jour les loups (attaques hivernales)
    updateWolves();

    // Mettre à jour la saison
    updateSeason();

    // ── RENDU ZOOMÉ : tout ce qui est ancré dans la grille ──
    ctx.save();
    ctx.translate(canvas.width / 2 * (1 - currentZoom), 0);
    ctx.scale(currentZoom, currentZoom);

    drawGround();
    drawRiver();     // Rivière par-dessus la neige
    drawAllFields(); // Champs dessinés sur le sol, avant les entités

    // Trier tous les objets par profondeur (x + y) pour un rendu isométrique correct
    const entities = [
        ...trees.map(t      => ({ type: 'tree',     data: t, depth: t.x + t.y })),
        ...woodPiles.map(w  => ({ type: 'wood',     data: w, depth: w.x + w.y })),
        ...stonePiles.map(s => ({ type: 'stone',    data: s, depth: s.x + s.y })),
        ...poissonneries.map(p => ({ type: 'poissonnerie', data: p, depth: p.x + p.y })),
        ...shelters.map(s   => ({ type: 'shelter',  data: s, depth: s.x + s.y })),
        ...palisades.map(p  => ({ type: 'palisade', data: p, depth: p.x + p.y })),
        ...towers.map(t     => ({ type: 'tower',    data: t, depth: t.x + t.y })),
        ...mills.map(m      => ({ type: 'mill',      data: m, depth: m.x + m.y })),
        ...bakeries.map(b   => ({ type: 'bakery',   data: b, depth: b.x + b.y })),
        ...campfires.map(c  => ({ type: 'campfire', data: c, depth: c.x + c.y })),
        ...bridges.map(b    => ({ type: 'bridge',   data: b, depth: b.x + b.y - 0.1 })),
        ...habitants.map(h  => ({ type: 'habitant',  data: h, depth: h.x + h.y })),
        ...rabbits.map(r    => ({ type: 'rabbit',    data: r, depth: r.x + r.y })),
        ...wolves.map(w     => ({ type: 'wolf',      data: w, depth: w.x + w.y })),
        { type: 'player', data: player, depth: player.x + player.y }
    ].sort((a, b) => a.depth - b.depth);

    entities.forEach(entity => {
        if      (entity.type === 'tree')     drawTree(entity.data);
        else if (entity.type === 'wood')     drawWood(entity.data);
        else if (entity.type === 'shelter')  drawShelter(entity.data);
        else if (entity.type === 'palisade') drawPalisade(entity.data);
        else if (entity.type === 'tower')    drawTower(entity.data);
        else if (entity.type === 'mill')      drawMill(entity.data);
        else if (entity.type === 'bakery')   drawBakery(entity.data);
        else if (entity.type === 'campfire') drawCampfire(entity.data);
        else if (entity.type === 'stone')    drawStonePile(entity.data);
        else if (entity.type === 'poissonnerie') drawPoissonnerie(entity.data);
        else if (entity.type === 'bridge')   drawBridge(entity.data);
        else if (entity.type === 'habitant')  drawHabitant(entity.data);
        else if (entity.type === 'rabbit')   drawRabbit(entity.data);
        else if (entity.type === 'wolf')     drawWolf(entity.data);
        else if (entity.type === 'player')   drawPlayer();
    });

    // Indicateur de pêche et overlay démolition (ancrés dans la grille → zoomés)
    drawFishingIndicator();
    drawDemolishOverlay();
    updateAndDrawPopups();

    ctx.restore();
    // ── FIN DU RENDU ZOOMÉ ──

    // Effets plein écran (pas zoomés : couvrent tout le canvas)
    drawSeasonParticles(); // neige, feuilles, pétales
    drawSeasonOverlay();   // teinte saisonnière légère

    // Fondu blanc lors d'un changement de saison
    if (seasonTransitionAlpha > 0) {
        ctx.fillStyle = `rgba(255,255,255,${seasonTransitionAlpha * 0.35})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Mise à jour des jauges HTML overlay
    updateHTMLBars();

    // Continuer la boucle
    requestAnimationFrame(gameLoop);
}

// ========================================
// SUPPORT TACTILE (mobile / tablette)
// ========================================

// Convertit un événement touch en clic simulé sur le canvas
// Cela permet d'utiliser le même gestionnaire de clic pour souris et doigt
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // empêche le scroll et le zoom de la page
    const touch = e.changedTouches[0];
    // Créer un MouseEvent synthétique avec les coordonnées du doigt
    const simulatedClick = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(simulatedClick);
}, { passive: false }); // passive:false nécessaire pour que preventDefault() fonctionne

// Empêche le scroll élastique sur iOS quand on glisse sur le canvas
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// ========================================
// GESTION DES CLICS
// ========================================

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Clic sur le bouton "Recommencer" en game over
    if (gameOver) {
        const cx = canvas.width / 2, cy = canvas.height / 2;
        if (clickX >= cx - 100 && clickX <= cx + 100 &&
            clickY >= cy + 45  && clickY <= cy + 93) {
            location.reload();
        }
        return;
    }

    const gridPos = isoToGrid(clickX, clickY);

    // Vérifier que le clic est dans les limites du monde
    if (gridPos.x >= 0 && gridPos.x < CONFIG.worldWidth &&
        gridPos.y >= 0 && gridPos.y < CONFIG.worldHeight) {
        
        if (buildBridgeMode) {
            // Mode pont : la tuile cible DOIT être une tuile de rivière
            const isRiver = riverTileSet.has(`${gridPos.x},${gridPos.y}`);
            const alreadyBridge = bridges.some(b => b.x === gridPos.x && b.y === gridPos.y);

            if (!isRiver) {
                spawnPopup('⚠️ Posez le pont sur la rivière !', gridPos.x, gridPos.y);
            } else if (alreadyBridge) {
                spawnPopup('Un pont existe déjà ici', gridPos.x, gridPos.y);
            } else if (player.wood >= CONFIG.bridgeCost) {
                bridges.push({ x: gridPos.x, y: gridPos.y, orientation: bridgeOrientation });
                player.wood -= CONFIG.bridgeCost;
                SOUNDS.build();
                spawnPopup('🌉 Pont construit !', gridPos.x, gridPos.y);
                updateWoodDisplay();
            } else {
                spawnPopup('Pas assez de bois !', gridPos.x, gridPos.y);
            }
            buildBridgeMode = false;
            updateBridgeButton();

        } else if (buildPoissonnierieMode) {
            if (!isTileFree(gridPos.x, gridPos.y)) {
                spawnPopup('⚠️ Tuile occupée !', gridPos.x, gridPos.y);
            } else if (player.wood >= CONFIG.poissonerieCostWood) {
                poissonneries.push({
                    x: gridPos.x, y: gridPos.y,
                    fishStored: 0, cookedReady: 0,
                    isWorking: false, cookProgress: 0,
                    depositCooldown: 0
                });
                player.wood -= CONFIG.poissonerieCostWood;
                SOUNDS.build();
                spawnPopup('🐟 Poissonnerie construite !', gridPos.x, gridPos.y);
                updateWoodDisplay();
            } else {
                spawnPopup('Pas assez de bois !', gridPos.x, gridPos.y);
            }
            buildPoissonnierieMode = false;
            updatePoissonnierieButton();

        } else if (buildBakeryMode) {
            if (!isTileFree(gridPos.x, gridPos.y)) {
                spawnPopup('⚠️ Tuile occupée !', gridPos.x, gridPos.y);
            } else if (player.wood >= CONFIG.bakeryCostWood) {
                bakeries.push({
                    x: gridPos.x, y: gridPos.y,
                    flourStored: 0, breadReady: 0,
                    isWorking: false, bakeryProgress: 0,
                    depositCooldown: 0
                });
                player.wood -= CONFIG.bakeryCostWood;
                SOUNDS.build();
                spawnPopup('🥖 Boulangerie construite !', gridPos.x, gridPos.y);
                updateWoodDisplay();
            } else {
                spawnPopup('Pas assez de bois !', gridPos.x, gridPos.y);
            }
            buildBakeryMode = false;
            updateBakeryButton();

        } else if (buildCampfireMode) {
            if (!isTileFree(gridPos.x, gridPos.y)) {
                spawnPopup('⚠️ Tuile occupée !', gridPos.x, gridPos.y);
            } else if (player.wood >= CONFIG.campfireCost) {
                campfires.push({ x: gridPos.x, y: gridPos.y, cookingFish: false, cookProgress: 0 });
                player.wood -= CONFIG.campfireCost;
                SOUNDS.build();
                spawnPopup('🔥 Feu de camp allumé !', gridPos.x, gridPos.y);
                updateWoodDisplay();
            } else {
                spawnPopup('Pas assez de bois !', gridPos.x, gridPos.y);
            }
            buildCampfireMode = false;
            updateCampfireButton();

        } else if (buildMillMode) {
            // Mode moulin : placer le moulin si assez de ressources
            if (player.wood >= CONFIG.millCostWood && player.wheat >= CONFIG.millCostWheat) {
                const occupied = mills.some(m => m.x === gridPos.x && m.y === gridPos.y)
                              || shelters.some(s => s.x === gridPos.x && s.y === gridPos.y);
                if (!occupied) {
                    mills.push({
                        x: gridPos.x, y: gridPos.y,
                        wheatStored: 0, flourReady: 0,
                        isWorking: false, millProgress: 0,
                        angle: 0, depositCooldown: 0
                    });
                    player.wood  -= CONFIG.millCostWood;
                    player.wheat -= CONFIG.millCostWheat;
                    SOUNDS.build();
                    spawnPopup('⚙️ Moulin construit !', gridPos.x, gridPos.y);
                    updateWoodDisplay();
                    updateWheatDisplay();
                }
            } else {
                spawnPopup('Ressources insuffisantes !', gridPos.x, gridPos.y);
            }
            buildMillMode = false;
            updateMillButton();

        } else if (demolishMode) {
            let demolished = false;

            // Chercher une palissade sur cette tuile
            const palIdx = palisades.findIndex(p => p.x === gridPos.x && p.y === gridPos.y);
            if (palIdx !== -1) { palisades.splice(palIdx, 1); demolished = true; }

            // Chercher un champ
            if (!demolished) {
                const fieldIdx = fields.findIndex(f => f.x === gridPos.x && f.y === gridPos.y);
                if (fieldIdx !== -1) { fields.splice(fieldIdx, 1); demolished = true; }
            }

            // Chercher un abri
            if (!demolished) {
                const shelterIdx = shelters.findIndex(s => s.x === gridPos.x && s.y === gridPos.y);
                if (shelterIdx !== -1) {
                    removeHabitantOfShelter(shelters[shelterIdx]);
                    shelters.splice(shelterIdx, 1);
                    updateShelterDisplay();
                    demolished = true;
                }
            }

            // Chercher un moulin
            if (!demolished) {
                const millIdx = mills.findIndex(m => m.x === gridPos.x && m.y === gridPos.y);
                if (millIdx !== -1) { mills.splice(millIdx, 1); demolished = true; }
            }

            // Chercher une boulangerie
            if (!demolished) {
                const bakeryIdx = bakeries.findIndex(b => b.x === gridPos.x && b.y === gridPos.y);
                if (bakeryIdx !== -1) { bakeries.splice(bakeryIdx, 1); demolished = true; }
            }

            // Chercher un feu de camp
            if (!demolished) {
                const campfireIdx = campfires.findIndex(c => c.x === gridPos.x && c.y === gridPos.y);
                if (campfireIdx !== -1) { campfires.splice(campfireIdx, 1); demolished = true; }
            }

            // Chercher un pont
            if (!demolished) {
                const bridgeIdx = bridges.findIndex(b => b.x === gridPos.x && b.y === gridPos.y);
                if (bridgeIdx !== -1) { bridges.splice(bridgeIdx, 1); demolished = true; }
            }

            // Chercher une poissonnerie
            if (!demolished) {
                const poissIdx = poissonneries.findIndex(p => p.x === gridPos.x && p.y === gridPos.y);
                if (poissIdx !== -1) { poissonneries.splice(poissIdx, 1); demolished = true; }
            }

            // Chercher une tour
            if (!demolished) {
                const towerIdx = towers.findIndex(t => t.x === gridPos.x && t.y === gridPos.y);
                if (towerIdx !== -1) { towers.splice(towerIdx, 1); demolished = true; }
            }

            spawnPopup(demolished ? '💥 Démoli !' : '❓ Rien ici', gridPos.x, gridPos.y);

        } else if (buildTowerMode) {
            // Mode tour : construire une tour de guet
            if (player.wood >= CONFIG.towerCostWood && player.stone >= CONFIG.towerCostStone) {
                const occupied = towers.some(t => t.x === gridPos.x && t.y === gridPos.y)
                              || shelters.some(s => s.x === gridPos.x && s.y === gridPos.y);
                if (!occupied) {
                    towers.push({ x: gridPos.x, y: gridPos.y });
                    player.wood  -= CONFIG.towerCostWood;
                    player.stone -= CONFIG.towerCostStone;
                    SOUNDS.build();
                    spawnPopup('🗼 Tour construite !', gridPos.x, gridPos.y);
                    updateWoodDisplay();
                    updateStoneDisplay();
                }
            } else {
                spawnPopup(`${CONFIG.towerCostWood}🪵 + ${CONFIG.towerCostStone}🪨 requis`, gridPos.x, gridPos.y);
            }
            buildTowerMode = false;
            updateTowerButton();

        } else if (buildPalisadeMode) {
            // Mode palissade : poser un segment
            if (player.wood >= CONFIG.palisadeCost) {
                const alreadyThere = palisades.some(p => p.x === gridPos.x && p.y === gridPos.y);
                if (!alreadyThere) {
                    palisades.push({ x: gridPos.x, y: gridPos.y });
                    player.wood -= CONFIG.palisadeCost;
                    SOUNDS.build();
                    spawnPopup('🛡️ Palissade !', gridPos.x, gridPos.y);
                    updateWoodDisplay();
                }
            } else {
                spawnPopup('Pas assez de bois !', gridPos.x, gridPos.y);
                buildPalisadeMode = false;
                updatePalisadeButton();
            }

        } else if (buildFieldMode) {
            // Mode plantation : poser un champ de blé
            if (player.wood >= CONFIG.fieldCost) {
                // Vérifier qu'il n'y a pas déjà un champ ici
                const occupied = fields.some(f => f.x === gridPos.x && f.y === gridPos.y);
                if (!occupied) {
                    fields.push({
                        x: gridPos.x,
                        y: gridPos.y,
                        stage: 0,
                        growTimer: CONFIG.growthStageTime
                    });
                    player.wood -= CONFIG.fieldCost;
                    SOUNDS.build();
                    spawnPopup('🌾 Champ planté !', gridPos.x, gridPos.y);
                    updateWoodDisplay();
                }
            } else {
                spawnPopup('Pas assez de bois !', gridPos.x, gridPos.y);
            }
            buildFieldMode = false;
            updateFieldButton();

        } else if (buildMode) {
            // Mode construction : placer un abri
            if (player.wood >= SHELTER_COST) {
                const newShelter = { x: gridPos.x, y: gridPos.y, level: 1 };
                shelters.push(newShelter);
                player.wood -= SHELTER_COST;
                SOUNDS.build();
                spawnPopup('🏠 Abri construit !', gridPos.x, gridPos.y);
                updateWoodDisplay();
                updateShelterDisplay();
                spawnHabitant(newShelter);
                spawnPopup('👤 Un habitant arrive !', gridPos.x, gridPos.y - 1);

                // Désactiver le mode construction
                buildMode = false;
                updateBuildButton();
            } else {
                console.log('❌ Pas assez de bois ! Il faut ' + SHELTER_COST + ' bois.');
                buildMode = false;
                updateBuildButton();
            }
        } else {
            // Mode normal : vérifier si on clique sur un abri existant pour l'améliorer
            const clickedShelter = shelters.find(s => s.x === gridPos.x && s.y === gridPos.y);
            if (clickedShelter) {
                if (clickedShelter.level >= 2) {
                    spawnPopup('🏰 Déjà au niveau max !', gridPos.x, gridPos.y);
                } else if (player.wood >= CONFIG.shelterUpgradeWood && player.stone >= CONFIG.shelterUpgradeStone) {
                    clickedShelter.level = 2;
                    player.wood  -= CONFIG.shelterUpgradeWood;
                    player.stone -= CONFIG.shelterUpgradeStone;
                    spawnPopup('🏰 Maison en pierre !', gridPos.x, gridPos.y);
                    updateWoodDisplay();
                    updateStoneDisplay();
                } else {
                    spawnPopup(`${CONFIG.shelterUpgradeWood}🪵 + ${CONFIG.shelterUpgradeStone}🪨 requis`, gridPos.x, gridPos.y);
                }
                return;
            }

            // Mode normal : vérifier si on clique sur un arbre
            const clickedTree = trees.find(t =>
                !t.chopped &&
                Math.abs(t.x - gridPos.x) <= 1 &&
                Math.abs(t.y - gridPos.y) <= 1
            );

            if (clickedTree) {
                // Se diriger vers l'arbre pour le couper
                player.targetX = clickedTree.x;
                player.targetY = clickedTree.y;
                player.cuttingTarget = clickedTree;
                spawnPopup('🪓 Couper...', clickedTree.x, clickedTree.y);
            } else {
                // Vérifier que le chemin entier ne traverse pas la rivière sans pont
                const safeTarget = findLastSafeTarget(player.x, player.y, gridPos.x, gridPos.y);

                player.cuttingTarget = null;
                player.fishingTimer = 0;

                if (safeTarget.blocked) {
                    spawnPopup('🌊 Rivière ! Construisez un pont 🌉', gridPos.x, gridPos.y);
                    // Avancer quand même jusqu'au bord de la rivière si on n'y est pas déjà
                    if (safeTarget.x !== Math.round(player.x) || safeTarget.y !== Math.round(player.y)) {
                        player.targetX = safeTarget.x;
                        player.targetY = safeTarget.y;
                    }
                } else {
                    // Déplacement normal
                    player.targetX = safeTarget.x;
                    player.targetY = safeTarget.y;
                }
            }
        }
    }
});

// ========================================
// MISE À JOUR DE L'INTERFACE
// ========================================

function updatePositionDisplay() {
    const posDisplay = document.getElementById('position');
    posDisplay.textContent = `X: ${Math.round(player.x)}, Y: ${Math.round(player.y)}`;
}

function updateStoneDisplay() {
    const el = document.getElementById('stone');
    if (el) el.textContent = player.stone;
}

function updateWoodDisplay() {
    const woodDisplay = document.getElementById('wood');
    if (woodDisplay) woodDisplay.textContent = player.wood;
    updateBuildButton();
    updateFieldButton();
    updatePalisadeButton();
    updateBridgeButton();
    updateMillButton();
}

function updateWheatDisplay() {
    const el = document.getElementById('wheat');
    if (el) el.textContent = player.wheat;
    updateMillButton();
}

function updateShelterDisplay() {
    const shelterDisplay = document.getElementById('shelters');
    if (shelterDisplay) {
        shelterDisplay.textContent = shelters.length;
    }
}


function updateSeasonDisplay() {
    const el = document.getElementById('season');
    if (el) el.textContent = `${SEASON_ICONS[currentSeasonIndex]} ${SEASON_LABELS[currentSeasonIndex]}`;
}

function updateFishDisplay() {
    const el = document.getElementById('fish');
    if (el) el.textContent = player.fish;
}

function updateCookedFishDisplay() {
    const el = document.getElementById('cookedFish');
    if (el) el.textContent = player.cookedFish;
}

function updateBridgeButton() {
    const btn = document.getElementById('bridgeBtn');
    if (!btn) return;
    if (buildBridgeMode) {
        btn.classList.add('active');
        btn.textContent = '🎯 Clique sur la rivière pour poser le pont';
    } else {
        btn.classList.remove('active');
        btn.textContent = `🌉 Pont (${CONFIG.bridgeCost} bois)`;
        btn.disabled = player.wood < CONFIG.bridgeCost;
    }
}

function updateFlourDisplay() {
    const el = document.getElementById('flour');
    if (el) el.textContent = player.flour;
}

function updateMillButton() {
    const btn = document.getElementById('millBtn');
    if (!btn) return;
    const canBuild = player.wood >= CONFIG.millCostWood && player.wheat >= CONFIG.millCostWheat;
    if (buildMillMode) {
        btn.classList.add('active');
        btn.textContent = '🎯 Clique pour placer le moulin';
    } else {
        btn.classList.remove('active');
        btn.textContent = `⚙️ Moulin (${CONFIG.millCostWood}🪵 + ${CONFIG.millCostWheat}🌾)`;
        btn.disabled = !canBuild;
    }
}

function updatePoissonnierieButton() {
    const btn = document.getElementById('poissonnierieBtn');
    if (!btn) return;
    if (buildPoissonnierieMode) {
        btn.classList.add('active');
        btn.textContent = '🎯 Clique pour placer la poissonnerie';
    } else {
        btn.classList.remove('active');
        btn.textContent = `🐟 Poissonnerie (${CONFIG.poissonerieCostWood}🪵)`;
        btn.disabled = player.wood < CONFIG.poissonerieCostWood;
    }
}

function updateBridgeOrientationButton() {
    const btn = document.getElementById('bridgeOrientBtn');
    if (!btn) return;
    btn.textContent = bridgeOrientation === 0 ? '🌉 Orient. A' : '🌉 Orient. B';
}

function updateBakeryButton() {
    const btn = document.getElementById('bakeryBtn');
    if (!btn) return;
    if (buildBakeryMode) {
        btn.classList.add('active');
        btn.textContent = '🎯 Clique pour placer la boulangerie';
    } else {
        btn.classList.remove('active');
        btn.textContent = `🥖 Boulangerie (${CONFIG.bakeryCostWood}🪵)`;
        btn.disabled = player.wood < CONFIG.bakeryCostWood;
    }
}

function updateCampfireButton() {
    const btn = document.getElementById('campfireBtn');
    if (!btn) return;
    if (buildCampfireMode) {
        btn.classList.add('active');
        btn.textContent = '🎯 Clique pour placer le feu';
    } else {
        btn.classList.remove('active');
        btn.textContent = `🔥 Feu de camp (${CONFIG.campfireCost}🪵)`;
        btn.disabled = player.wood < CONFIG.campfireCost;
    }
}

function updateBreadDisplay() {
    const el = document.getElementById('bread');
    if (el) el.textContent = player.bread;
}

function updateDemolishButton() {
    const btn = document.getElementById('demolishBtn');
    if (!btn) return;
    if (demolishMode) {
        btn.classList.add('active');
        btn.textContent = '🎯 Clique sur un élément pour le supprimer';
    } else {
        btn.classList.remove('active');
        btn.textContent = '🗑️ Démolir';
    }
}

function updatePalisadeButton() {
    const btn = document.getElementById('palisadeBtn');
    if (!btn) return;
    if (buildPalisadeMode) {
        btn.classList.add('active');
        btn.textContent = '🎯 Clique pour poser une palissade';
    } else {
        btn.classList.remove('active');
        btn.textContent = `🛡️ Palissade (${CONFIG.palisadeCost} bois)`;
        btn.disabled = player.wood < CONFIG.palisadeCost;
    }
}

function updateFieldButton() {
    const fieldBtn = document.getElementById('fieldBtn');
    if (!fieldBtn) return;
    if (buildFieldMode) {
        fieldBtn.classList.add('active');
        fieldBtn.textContent = '🎯 Clique sur la carte pour planter';
        canvas.style.cursor = 'crosshair';
    } else {
        fieldBtn.classList.remove('active');
        fieldBtn.textContent = `🌾 Planter un champ (${CONFIG.fieldCost} bois)`;
        fieldBtn.disabled = player.wood < CONFIG.fieldCost;
    }
}

function updateBuildButton() {
    const buildBtn = document.getElementById('buildBtn');
    if (buildBtn) {
        if (buildMode) {
            buildBtn.classList.add('active');
            buildBtn.textContent = '🎯 Clique sur la carte pour placer l\'abri';
            canvas.style.cursor = 'crosshair';
        } else {
            buildBtn.classList.remove('active');
            buildBtn.textContent = '🏠 Construire un abri (5 bois)';
            buildBtn.disabled = player.wood < SHELTER_COST;
            canvas.style.cursor = 'crosshair';
        }
    }
}

// ========================================
// DÉMARRAGE DU JEU
// ========================================

// Gestion du bouton de construction
const buildBtn = document.getElementById('buildBtn');
buildBtn.addEventListener('click', () => {
    if (player.wood >= SHELTER_COST) {
        buildMode = !buildMode;
        updateBuildButton();
        
        if (buildMode) {
            console.log('🏗️ Mode construction activé ! Clique sur la carte pour placer ton abri.');
        } else {
            console.log('❌ Mode construction annulé.');
        }
    }
});

// Gestion du bouton de plantation
const fieldBtn = document.getElementById('fieldBtn');
fieldBtn.addEventListener('click', () => {
    if (player.wood >= CONFIG.fieldCost) {
        buildFieldMode = !buildFieldMode;
        deactivateAllModes('field');
        updateFieldButton();
    }
});

// Gestion du bouton de palissade
const palisadeBtn = document.getElementById('palisadeBtn');
palisadeBtn.addEventListener('click', () => {
    if (player.wood >= CONFIG.palisadeCost) {
        buildPalisadeMode = !buildPalisadeMode;
        deactivateAllModes('palisade');
        updatePalisadeButton();
    }
});

// Met à jour le bouton de tour de guet selon l'état du mode
function updateTowerButton() {
    const btn = document.getElementById('towerBtn');
    if (!btn) return;
    if (buildTowerMode) {
        btn.classList.add('active');
        btn.textContent = '🎯 Clique sur la carte pour placer la tour';
    } else {
        btn.classList.remove('active');
        btn.textContent = `🗼 Tour (${CONFIG.towerCostWood}🪵 + ${CONFIG.towerCostStone}🪨)`;
        btn.disabled = player.wood < CONFIG.towerCostWood || player.stone < CONFIG.towerCostStone;
    }
}

// Helper : désactive tous les modes de construction sauf celui passé en paramètre
function deactivateAllModes(except) {
    if (except !== 'build')    { buildMode         = false; updateBuildButton();    }
    if (except !== 'field')    { buildFieldMode    = false; updateFieldButton();    }
    if (except !== 'palisade') { buildPalisadeMode = false; updatePalisadeButton(); }
    if (except !== 'tower')    { buildTowerMode    = false; updateTowerButton();    }
    if (except !== 'bridge')   { buildBridgeMode   = false; updateBridgeButton();   }
    if (except !== 'mill')      { buildMillMode      = false; updateMillButton();      }
    if (except !== 'bakery')   { buildBakeryMode   = false; updateBakeryButton();   }
    if (except !== 'campfire')      { buildCampfireMode      = false; updateCampfireButton();       }
    if (except !== 'poissonnerie') { buildPoissonnierieMode = false; updatePoissonnierieButton(); }
    if (except !== 'demolish')     { demolishMode           = false; updateDemolishButton();       }
}

// Gestion du bouton de pont
const bridgeBtn = document.getElementById('bridgeBtn');
bridgeBtn.addEventListener('click', () => {
    if (player.wood >= CONFIG.bridgeCost) {
        buildBridgeMode = !buildBridgeMode;
        deactivateAllModes('bridge');
        updateBridgeButton();
    }
});

// Gestion du bouton de moulin
const millBtn = document.getElementById('millBtn');
millBtn.addEventListener('click', () => {
    if (player.wood >= CONFIG.millCostWood && player.wheat >= CONFIG.millCostWheat) {
        buildMillMode = !buildMillMode;
        deactivateAllModes('mill');
        updateMillButton();
    }
});

// Gestion du bouton de boulangerie
const bakeryBtn = document.getElementById('bakeryBtn');
bakeryBtn.addEventListener('click', () => {
    if (player.wood >= CONFIG.bakeryCostWood) {
        buildBakeryMode = !buildBakeryMode;
        deactivateAllModes('bakery');
        updateBakeryButton();
    }
});

// Gestion du bouton de feu de camp
const campfireBtn = document.getElementById('campfireBtn');
campfireBtn.addEventListener('click', () => {
    if (player.wood >= CONFIG.campfireCost) {
        buildCampfireMode = !buildCampfireMode;
        deactivateAllModes('campfire');
        updateCampfireButton();
    }
});

// Gestion du bouton de poissonnerie
const poissonnierieBtn = document.getElementById('poissonnierieBtn');
if (poissonnierieBtn) {
    poissonnierieBtn.addEventListener('click', () => {
        if (player.wood >= CONFIG.poissonerieCostWood) {
            buildPoissonnierieMode = !buildPoissonnierieMode;
            deactivateAllModes('poissonnerie');
            updatePoissonnierieButton();
        }
    });
}

// Gestion du bouton de tour de guet
const towerBtn = document.getElementById('towerBtn');
if (towerBtn) {
    towerBtn.addEventListener('click', () => {
        if (player.wood >= CONFIG.towerCostWood && player.stone >= CONFIG.towerCostStone) {
            buildTowerMode = !buildTowerMode;
            deactivateAllModes('tower');
            updateTowerButton();
        } else {
            spawnPopup(`${CONFIG.towerCostWood}🪵 + ${CONFIG.towerCostStone}🪨 requis`, player.x, player.y);
        }
    });
}

// Gestion du bouton d'orientation de pont
const bridgeOrientBtn = document.getElementById('bridgeOrientBtn');
if (bridgeOrientBtn) {
    bridgeOrientBtn.addEventListener('click', () => {
        bridgeOrientation = bridgeOrientation === 0 ? 1 : 0;
        updateBridgeOrientationButton();
    });
}

// Gestion du bouton Manger
const eatBtn = document.getElementById('eatBtn');
eatBtn.addEventListener('click', () => { eatFood(); });

// Gestion du bouton de démolition
const demolishBtn = document.getElementById('demolishBtn');
demolishBtn.addEventListener('click', () => {
    demolishMode = !demolishMode;
    deactivateAllModes('demolish');
    updateDemolishButton();
});

updatePositionDisplay();
updateWoodDisplay();
updateShelterDisplay();
updateBuildButton();
updateWheatDisplay();
updateFieldButton();
updatePalisadeButton();
updateBridgeButton();
updateMillButton();
updateBakeryButton();
updateCampfireButton();
updateFlourDisplay();
updateBreadDisplay();
updateFishDisplay();
updateCookedFishDisplay();
updateStoneDisplay();
updatePoissonnierieButton();
updateBridgeOrientationButton();
updateHabitantDisplay();
updateSeasonDisplay();
updateDemolishButton();
updateTowerButton();

// ========================================
// DÉMARRAGE PWA : écran de chargement
// ========================================
// Le loading screen est un overlay position:fixed par-dessus le jeu.
// Le canvas est TOUJOURS dans le DOM → offsetWidth/offsetHeight corrects dès le départ.
// Quand les sprites sont chargés, on fait disparaître l'overlay et on lance la boucle.
(function startWithLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingBar    = document.getElementById('loadingBar');

    if (loadingScreen && loadingBar) {
        // Animer la barre pendant le chargement réel des sprites
        let fakeProgress = 0;
        const progressInterval = setInterval(() => {
            fakeProgress = Math.min(fakeProgress + Math.random() * 14, 90);
            loadingBar.style.width = fakeProgress + '%';
        }, 150);

        loadSprites().then(() => {
            clearInterval(progressInterval);
            loadingBar.style.width = '100%';

            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => { loadingScreen.style.display = 'none'; }, 500);

                // Attendre le prochain frame pour que le navigateur ait fini
                // de calculer le layout, puis mesurer le canvas et démarrer.
                requestAnimationFrame(() => {
                    resizeCanvas();
                    requestAnimationFrame(() => {
                        // Double-frame : garantie absolue que le layout est stable
                        resizeCanvas();
                        gameLoop();
                        console.log('🎮 Jeu PWA démarré ! Canvas :', canvas.width, '×', canvas.height);
                    });
                });
            }, 300);
        });
    } else {
        // Pas d'écran de chargement (autre contexte) : démarrage direct
        loadSprites().then(() => gameLoop());
    }
})();

console.log('🎮 Jeu chargé avec succès !');
console.log('👆 Clique sur la carte pour déplacer ton personnage');
console.log('🪵 Approche-toi des piles de bois pour les ramasser !');
console.log('🏠 Utilise 5 bois pour construire un abri !');
