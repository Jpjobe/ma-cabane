// ==========================================
// SERVICE WORKER — Ma Cabane PWA
// Stratégie : cache-first pour tous les assets
// Version : incrementer à chaque mise à jour du jeu
// ==========================================

const CACHE_NAME = 'ma-cabane-v2';

// Liste de tous les fichiers à mettre en cache pour le mode offline
const FILES_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './game.js',
    './manifest.json',
    // Icônes PWA
    './icons/icon-192.png',
    './icons/icon-512.png',
    // Personnages
    './assets/player_printemps.png',
    './assets/player_été.png',
    './assets/player_automne.png',
    './assets/player_hiver.png',
    './assets/Perosnnage_secondaire_homme.png',
    './assets/Perosnnage_secondaire_femme.png',
    // Arbres
    './assets/tree_printemps.png',
    './assets/tree_été.png',
    './assets/tree_automne.png',
    './assets/tree_hiver.png',
    // Bois
    './assets/wood_printemps.png',
    './assets/wood_été.png',
    './assets/wood_automne.png',
    './assets/wood_hiver.png',
    // Abris niveau 1
    './assets/shelter_printemps_niveau1.png',
    './assets/shelter_été_niveau1.png',
    './assets/shelter_automne_niveau1.png',
    './assets/shelter_hiver_niveau1.png',
    // Abris niveau 2
    './assets/shelter_printemps_niveau2.png',
    './assets/shelter_été_niveau2.png',
    './assets/shelter_automne_niveau2.png',
    './assets/shelter_hiver_niveau2.png',
    // Rochers
    './assets/Rocher_printemps.png',
    './assets/Rocher_été.png',
    './assets/Rocher_automne.png',
    './assets/Rocher_hiver.png',
    // Moulin
    './assets/Moulin_printemps.png',
    './assets/Moulin_été.png',
    './assets/Moulin_automne.png',
    './assets/Moulin_hiver.png',
    // Boulangerie
    './assets/Boulangerie_printemps.png',
    './assets/Boulangerie_été.png',
    './assets/Boulangerie_automne.png',
    './assets/Boulangerie_hiver.png',
    // Poissonnerie
    './assets/Poissonerie_printemps.png',
    './assets/Poissonerie_été.png',
    './assets/Poissonerie_automne.png',
    './assets/Poissonerie_hiver.png',
    // Ponts
    './assets/Pont.png',
    './assets/Pont_2.png',
    // Charbonnerie
    './assets/charbonnerie_printemps.png',
    './assets/charbonnerie_ete.png',
    './assets/charbonnerie_automne.png',
    './assets/charbonnerie_hiver.png',
    // Forge
    './assets/forge_printemps.png',
    './assets/forge_ete.png',
    './assets/forge_automne.png',
    './assets/forge_hiver.png',
    // Grenier
    './assets/grenier_printemps.png',
    './assets/grenier_ete.png',
    './assets/grenier_automne.png',
    './assets/grenier_hiver.png',
    // Séchoir
    './assets/sechoir_printemps.png',
    './assets/sechoir_ete.png',
    './assets/sechoir_automne.png',
    './assets/sechoir_hiver.png',
    // Ferme
    './assets/ferme_printemps.png',
    './assets/ferme_ete.png',
    './assets/ferme_automne.png',
    './assets/ferme_hiver.png',
    // Marché
    './assets/marche_printemps.png',
    './assets/marche_ete.png',
    './assets/marche_automne.png',
    './assets/marche_hiver.png',
    // Animaux et structures uniques
    './assets/loup.png',
    './assets/tour.png'
];

// ==========================================
// INSTALL : mise en cache de tous les fichiers
// ==========================================
self.addEventListener('install', (event) => {
    console.log('[SW] Installation — mise en cache des assets...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Cache ouvert :', CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE).then(() => {
                console.log('[SW] Tous les fichiers mis en cache avec succès !');
            }).catch((err) => {
                console.warn('[SW] Erreur lors de la mise en cache :', err);
            });
        })
    );
    // Activer immédiatement sans attendre la fermeture des onglets existants
    self.skipWaiting();
});

// ==========================================
// ACTIVATE : nettoyage des anciens caches
// ==========================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activation — nettoyage des anciens caches...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Suppression de l\'ancien cache :', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    // Prendre le contrôle immédiatement de tous les onglets ouverts
    self.clients.claim();
});

// ==========================================
// FETCH : stratégie cache-first
// Si le fichier est en cache → on le sert directement (offline ok)
// Sinon → on va chercher sur le réseau et on met en cache
// ==========================================
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Fichier trouvé dans le cache : servi instantanément
                return cachedResponse;
            }

            // Pas en cache : fetch réseau
            return fetch(event.request).then((networkResponse) => {
                // Ne mettre en cache que les réponses valides
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Offline et pas en cache : retourner une page d'erreur simple
                console.warn('[SW] Ressource non disponible offline :', event.request.url);
            });
        })
    );
});
