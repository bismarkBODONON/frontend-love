<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRelationshipStore } from '@/stores/relationship'
import { getRandomQuote } from '@/data/homeQuotes'
import {
  BookHeart,
  Mail,
  Image,
  Heart,
  Calendar,
  Hourglass,
  Music,
  Target,
  NotebookPen,
  Settings,
  Quote,
} from 'lucide-vue-next'

// Import des composants
import FloralNameColumn from '@/components/FloralNameColumn.vue'
import AnniversaryCounter from '@/components/AnniversaryCounter.vue'
import FeatureCard from '@/components/FeatureCard.vue'
import BottomNav from '@/components/BottomNav.vue'

const router = useRouter()
const relationship = useRelationshipStore()
const currentQuote = ref(getRandomQuote())

// Gestion de l'intro
const showIntro = ref(false)
const INTRO_STORAGE_KEY = 'app_intro_seen'

onMounted(() => {
  window.scrollTo(0, 0)
  if (!relationship.isLoaded) relationship.fetch()
  const alreadySeen = localStorage.getItem(INTRO_STORAGE_KEY)
  if (!alreadySeen) {
    showIntro.value = true
    setTimeout(() => {
      showIntro.value = false
      localStorage.setItem(INTRO_STORAGE_KEY, 'true')
    }, 2200)
  }
})

// Liste des 10 fonctionnalités
const features = [
  { icon: BookHeart, title: 'Notre Histoire', subtitle: 'Revivez nos plus beaux moments', to: '/timeline' },
  { icon: Mail, title: 'Lettres', subtitle: 'Des mots rien que pour toi', to: '/letters' },
  { icon: Image, title: 'Galerie', subtitle: 'Photos, vidéos et souvenirs', to: '/gallery' },
  { icon: Heart, title: 'Pourquoi je t\'aime', subtitle: 'Des raisons infinies de t\'aimer', to: '/reasons' },
  { icon: Calendar, title: 'Calendrier', subtitle: 'Nos dates importantes', to: '/calendar' },
  { icon: Hourglass, title: 'Capsule temporelle', subtitle: 'Des lettres pour le futur', to: '/time-capsule' },
  { icon: Music, title: 'Musique', subtitle: 'Notre playlist d\'amour', to: '/music' },
  { icon: Target, title: 'Objectifs', subtitle: 'Nos rêves, nos projets', to: '/dreams' },
  { icon: NotebookPen, title: 'Journal', subtitle: 'Nos pensées et émotions', to: '/journal' },
  { icon: Settings, title: 'Paramètres', subtitle: 'Personnalise ton univers', to: '/settings' },
]

// Navigation header
const isMenuOpen = ref(false)

function openMusic() {
  router.push('/music')
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function goTo(path: string) {
  closeMenu()
  router.push(path)
}
</script>

<template>
  <div class="home">
    <!-- Intro -->
    <transition name="intro-fade">
      <div v-if="showIntro" class="home__intro">
        <div class="home__intro-heart">💖</div>
        <p class="home__intro-text">
          {{ relationship.partnerName ? `Pour ${relationship.partnerName}` : 'Bienvenue' }}
        </p>
      </div>
    </transition>

    <!-- Pétales flottants du fond, décoratifs uniquement -->
    <div class="home__bg-petals" aria-hidden="true">
      <span v-for="i in 8" :key="i" class="home__bg-petal" :style="{ left: (i * 12) % 100 + '%', animationDelay: (i * 1.1) + 's' }" />
    </div>

    <div class="home__content">
      <!-- Colonne décorative gauche -->
      <FloralNameColumn />

      <!-- Colonne de droite (contenu) -->
      <div class="home__main" style="background-image: url('/assets/watercolor.png');">
        <!-- Header -->
        <header class="home__header">
          <div>
            <p class="home__greeting">Bonjour, <span class="home__greeting-heart">❤</span></p>
            <h1 class="home__title">{{ relationship.partnerName || '...' }}</h1>
          </div>
          <div class="home__header-actions">
            <button class="home__icon-btn home__icon-btn--music" aria-label="Musique" @click="openMusic">
              <span>🎵</span>
            </button>
            <button class="home__icon-btn home__icon-btn--menu" aria-label="Menu" @click="toggleMenu">
              <span>☰</span>
            </button>
          </div>
        </header>

        <!-- Sous-titre -->
        <p class="home__subtitle">Tu es ma plus belle aventure.</p>

        <!-- Carte citation -->
        <div class="home__quote-card">
          <Quote class="home__quote-icon" :size="34" :stroke-width="2" fill="currentColor" />
          <svg class="home__quote-butterfly" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path d="M32 30 C20 8, 2 10, 4 26 C6 40, 22 36, 32 30 Z" fill="var(--color-rose-fonce)" opacity="0.9"/>
              <path d="M32 30 C44 8, 62 10, 60 26 C58 40, 42 36, 32 30 Z" fill="var(--color-rose)" opacity="0.9"/>
              <path d="M32 32 C22 46, 8 48, 10 58 C12 62, 24 54, 32 34 Z" fill="var(--color-rose-fonce)" opacity="0.75"/>
              <path d="M32 32 C42 46, 56 48, 54 58 C52 62, 40 54, 32 34 Z" fill="var(--color-rose)" opacity="0.75"/>
              <line x1="32" y1="24" x2="32" y2="42" stroke="var(--color-bordeaux)" stroke-width="2" stroke-linecap="round"/>
              <circle cx="32" cy="22" r="2.5" fill="var(--color-bordeaux)"/>
            </g>
          </svg>
          <p class="home__quote-text">{{ currentQuote }}</p>
          <div class="home__quote-divider">
            <span></span>
            <span class="home__quote-divider-heart">♡</span>
            <span></span>
          </div>
        </div>

        <!-- Compteur -->
        <div class="home__counter-section">
          <p class="home__counter-title">Ensemble depuis ❤️</p>
          <AnniversaryCounter :start-date="relationship.startDate" compact />
        </div>

        <!-- Grille de 10 fonctionnalités -->
        <div class="home__grid">
          <FeatureCard
            v-for="item in features"
            :key="item.title"
            :icon="item.icon"
            :title="item.title"
            :subtitle="item.subtitle"
            :to="item.to"
          />
        </div>
      </div>
    </div>

    <!-- Drawer menu -->
    <transition name="drawer-fade">
      <div v-if="isMenuOpen" class="home__drawer-overlay" @click="closeMenu"></div>
    </transition>
    <transition name="drawer-slide">
      <nav v-if="isMenuOpen" class="home__drawer">
        <button class="home__drawer-close" @click="closeMenu" aria-label="Fermer">✕</button>
        <ul class="home__drawer-list">
          <li v-for="item in features" :key="item.title">
            <button class="home__drawer-item" @click="goTo(item.to)">
              <component :is="item.icon" :size="20" />
              <span>{{ item.title }}</span>
            </button>
          </li>
        </ul>
      </nav>
    </transition>

    <!-- Navigation basse : sortie du flux de .home__main pour rester fixe au viewport -->
    <BottomNav />
  </div>
</template>

<style scoped>
/* ===== Layout général ===== */
.home {
  position: relative;
  min-height: 100vh;
  background:
    radial-gradient(circle at 15% 10%, rgba(245, 91, 165, 0.05), transparent 45%),
    radial-gradient(circle at 85% 30%, rgba(255, 217, 232, 0.3), transparent 50%),
    radial-gradient(circle at 25% 85%, rgba(245, 91, 165, 0.04), transparent 40%),
    linear-gradient(180deg, #FFFFFF, var(--color-blanc-casse) 45%, #FFF6F9 100%);
  color: var(--text);
}

.home__bg-petals {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.home__bg-petal {
  position: absolute;
  top: -20px;
  width: 10px;
  height: 10px;
  border-radius: 50% 0 50% 50%;
  background: var(--color-rose-clair);
  opacity: 0.5;
  animation: bg-fall 14s linear infinite;
}
@keyframes bg-fall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 0.5; }
  100% { transform: translateY(110vh) rotate(400deg); opacity: 0; }
}

.home__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
  min-height: 100vh;
}

.home__main {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  padding: 32px 36px 140px;
  position: relative;
  z-index: 1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Voile blanc semi-transparent, avec fondu plus fort sur le bord gauche pour fusionner avec la colonne fleurs */
.home__main::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.85) 6%, rgba(255,255,255,0.78) 14%, rgba(255,255,255,0.78) 100%);
  z-index: 0;
  pointer-events: none;
}

/* Tout le contenu passe au-dessus du voile */
.home__main > * {
  position: relative;
  z-index: 1;
}

/* ===== Header ===== */
.home__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 4px;
}

.home__greeting {
  font-family: 'Brush Script MT', 'Segoe Script', cursive;
  /* Fluide : s'adapte en continu à la largeur d'écran, ne casse jamais de palier brutalement */
  font-size: clamp(1rem, 3.5vw, 1.5rem);
  color: var(--color-rose-fonce);
  margin-bottom: 2px;
}

.home__greeting-heart {
  color: var(--color-rose);
}

.home__title {
  font-family: 'Playfair Display', Georgia, serif;
  /* Fluide : évite que le prénom se casse sur 2 lignes sur petit écran (bug mobile corrigé) */
  font-size: clamp(1.4rem, 6.5vw, 2.8rem);
  font-weight: 800;
  line-height: 1.15;
  color: var(--color-rose-fonce);
  margin: 0;
  overflow-wrap: break-word;
}

.home__header-actions {
  display: flex;
  gap: 12px;
}

.home__icon-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #ffffff;
  box-shadow: 0 6px 18px var(--shadow-pink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
}

.home__icon-btn:active {
  transform: scale(0.92);
}

.home__icon-btn--music {
  background: var(--color-rose);
  color: #fff;
}

.home__icon-btn--menu {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid var(--color-rose-clair);
  color: var(--color-bordeaux);
}

/* ===== Sous-titre ===== */
.home__subtitle {
  font-size: 1rem;
  letter-spacing: 0.03em;
  font-weight: 300;
  color: var(--text-soft);
  margin: 8px 0 32px;
}

/* ===== Carte citation ===== */
.home__quote-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  border-radius: 32px;
  padding: 32px 56px;
  margin-bottom: 32px;
  text-align: center;
  box-shadow: 0 10px 32px var(--shadow-pink);
  overflow: visible;
}

.home__quote-icon {
  position: absolute;
  top: 20px;
  left: 24px;
  color: var(--color-rose-clair);
  opacity: 0.9;
  z-index: 0;
}

.home__quote-text {
  position: relative;
  z-index: 1;
  font-size: 1.15rem;
  font-weight: 500;
  line-height: 1.6;
  color: var(--color-bordeaux);
}

.home__quote-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 18px;
}

.home__quote-divider span:not(.home__quote-divider-heart) {
  width: 36px;
  height: 1px;
  background: var(--color-rose-clair);
}

.home__quote-divider-heart {
  color: var(--color-rose);
  font-size: 0.9rem;
}

.home__quote-butterfly {
  position: absolute;
  top: -18px;
  right: -16px;
  width: 46px;
  height: 46px;
  transform: rotate(12deg);
  filter: drop-shadow(0 4px 8px var(--shadow-pink));
  animation: wing 2.4s ease-in-out infinite;
}

@keyframes wing {
  0%, 100% { transform: rotate(12deg) scale(1); }
  50% { transform: rotate(4deg) scale(1.06); }
}

/* ===== Compteur ===== */
.home__counter-section {
  margin-bottom: 36px;
}

.home__counter-title {
  text-align: center;
  font-size: 0.92rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text-soft);
  margin-bottom: 14px;
}

/* ===== Grille de fonctionnalités ===== */
.home__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  width: 100%;
}

/* ===== Intro ===== */
.home__intro {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: radial-gradient(circle at center, #FDEBF1, var(--color-blanc-casse) 75%);
}

.home__intro-heart {
  font-size: 3.5rem;
  animation: pulse 1.4s ease-in-out infinite;
}

.home__intro-text {
  font-size: 1.1rem;
  font-weight: 600;
  opacity: 0.9;
  color: var(--color-bordeaux);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.intro-fade-enter-active { transition: opacity 0.4s ease; }
.intro-fade-leave-active { transition: opacity 0.6s ease; }
.intro-fade-enter-from,
.intro-fade-leave-to { opacity: 0; }

/* ===== Drawer menu ===== */
.home__drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 20;
}

.home__drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(300px, 80vw);
  background:
    radial-gradient(circle at 85% 10%, rgba(255, 217, 232, 0.4), transparent 50%),
    radial-gradient(circle at 15% 90%, rgba(245, 91, 165, 0.06), transparent 45%),
    linear-gradient(180deg, #FFFFFF, var(--color-blanc-casse) 45%, #FFF6F9 100%);
  z-index: 21;
  padding: 24px 20px;
  box-shadow: -8px 0 32px rgba(124, 23, 74, 0.2);
  overflow-y: auto;
}

.home__drawer-close {
  border: none;
  background: none;
  font-size: 1.2rem;
  color: var(--color-bordeaux);
  margin-bottom: 20px;
  cursor: pointer;
}

.home__drawer-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.home__drawer-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px;
  border: none;
  background: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  transition: background 0.15s ease;
}

.home__drawer-item:hover,
.home__drawer-item:active {
  background: var(--color-rose-clair, #ffe4ee);
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.28s ease;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .home__main {
    padding: 32px 24px 140px;
  }
  .home__quote-card {
    padding: 28px 28px;
  }
}

@media (max-width: 600px) {
  .home__grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

@media (max-width: 480px) {
  .home__main {
    padding: 20px 16px 130px;
  }
  .home__quote-card {
    padding: 22px 18px;
    border-radius: 24px;
  }
  .home__drawer {
    width: 85vw;
  }
}
</style>