# Cahier des Charges : Prism Pong

## 1. Présentation du Projet
**Prism Pong** est un jeu vidéo sur navigateur web (HTML5 Canvas) revisitant le grand classique du jeu d'arcade "Pong". Le jeu propose une esthétique visuelle moderne (thème sombre, effets lumineux/néon "Prism") et intègre des mécaniques de progression, une économie virtuelle, ainsi que plusieurs modes de jeu pour diversifier l'expérience.

## 2. Objectifs et Public Cible
- **Objectif :** Offrir une expérience de jeu fluide, compétitive et addictive directement dans le navigateur.
- **Public :** Joueurs occasionnels (casual gamers) recherchant des parties rapides, ainsi que des joueurs plus engagés cherchant à débloquer tous les succès et à terminer le mode Aventure.

## 3. Spécifications Fonctionnelles

### 3.1. Mécaniques de Base (Gameplay)
- **Terrain :** Une zone de jeu délimitée (résolution par défaut 1280x720) avec un filet central.
- **Contrôles :** Déplacement vertical de raquettes (raquette joueur vs. raquette opposant ou joueur 2).
- **Physique :** Gestion précise des collisions avec les murs et les raquettes, augmentation dynamique de la vitesse de la balle selon la durée de l'échange (rally).

### 3.2. Modes de Jeu
1. **Mode Aventure (Campagne) :**
   - Série de niveaux de difficulté croissante (au moins 30 niveaux générés).
   - Variables d'ajustement par niveau : Vitesse de l'IA, vitesse initiale de la balle, taille de la raquette adverse, score à atteindre.
   - Niveaux "Boss" réguliers avec des environnements/couleurs spécifiques.
2. **Custom 2P (Co-op Local) :**
   - Mode classique permettant à deux joueurs de s'affronter sur le même appareil (clavier).
3. **Mode Survie (Survival) :**
   - Endurance face à des conditions de jeu de plus en plus extrêmes (échanges consécutifs).

### 3.3. Système de Progression (Profil Joueur)
- **Points d'Expérience (XP) :** Gain d'XP en jouant des matchs ou en complétant des objectifs.
- **Titres / Grades :** Progression du joueur au travers de niveaux (ex: Rookie, Amateur, Challenger, jusqu'à Pong God au niveau 50).
- **Statistiques :** Suivi du niveau et de l'XP sur un "Dashboard" principal.

### 3.4. Économie et Boutique (Store)
- **Cagnotte (Coins) :** Monnaie virtuelle (pièces) gagnable in-game.
- **Boutique de Cosmétiques :**
   - **Ball Trails (Traînées de balle) :** Différents effets visuels (ex: Standard, Gold Leaf, Blood Trail).
   - **Paddle Auras (Auras de raquette) :** Effets spécifiques sur les raquettes (ex: Void Energy, Grandmaster).
   - **Rareté :** Différents paliers de rareté (Common, Epic, Mythic) et de coûts.

### 3.5. Système de Succès (Achievements)
- Prise en charge de jalons avec récompenses :
   - **Bronze (Bases) :** Premier point marqué, première victoire.
   - **Argent (Compétences) :** Atteindre une vitesse extrême ("Lightspeed").
   - **Or (Endurance) :** Tenir un échange de 15, 30, ou 50 frappes ("Marathon", "Iron Wall", "Untouchable").
   - **Platine (Économie) :** Premier achat ("Shopper"), accumuler de la richesse ("Moneybags").
- Certains succès débloquent des cosmétiques exclusifs.

### 3.6. Paramètres et Personnalisation
- **Paramètres des matchs :** Configuration manuelle de la durée des parties (score), de la vitesse initiale, ou de la taille des modèles.
- Paramètres accessibles via un overlay intuitif et ergonomique dans le menu principal.

## 4. Spécifications Techniques
- **Client / Front-end :**
   - **HTML5 :** Structure principale via `index.html` et élément `<canvas>`.
   - **CSS3 :** Styles appliqués via `style.css` (Interfaces UI, layouts, dashboard type carte superposée).
   - **JavaScript (ES6+) :**
      - `constants.js` : Paramétrage central (niveaux, boutique, succès, tailles).
      - `renderer.js` : Rendu graphique sur le Canvas.
      - `engine.js` : Logique de la boucle de jeu et collisions.
      - `state.js` : Gestion de l'état du jeu et de la progression.
      - `ui.js` : Gestion des interactions des menus (DOM).
      - `audio.js` : Gestion des effets sonores (SFX).
      - `main.js` : Point d'entrée, initialisation globale.

- **Performances / Rendu :** Fonctionnement fluide ciblant les 60 FPS (via `requestAnimationFrame`).

## 5. Interface Utilisateur (UI/UX)
- Menu de type "Tableau de Bord" (Dashboard) incluant :
   - En-tête : Badge de profil, niveau d'XP, compteur de pièces.
   - Corps (Gauche) : Sélection des modes de jeu.
   - Corps (Droite) : Règles du match et paramètres rapides.
   - Pied de page : Boutons de la boutique et paramètres avancés.
- Typographie et éléments graphiques marqués "Arcade et Cyber" (polices rétro, couleurs néon, mode sombre).
