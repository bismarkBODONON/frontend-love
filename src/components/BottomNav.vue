<template>
  <div class="bottom-nav">
    <div class="bottom-nav__bar">
      <div class="bottom-nav__glossy" />

      <router-link to="/" class="bottom-nav__item bottom-nav__item--active">
        <Home class="bottom-nav__icon" :size="22" :stroke-width="2" />
        <span class="bottom-nav__label">Accueil</span>
      </router-link>

      <router-link to="/quotes" class="bottom-nav__item">
        <BookOpen class="bottom-nav__icon" :size="22" :stroke-width="2" />
        <span class="bottom-nav__label">Citations</span>
      </router-link>

      <div class="bottom-nav__center">
        <router-link to="/reasons" class="bottom-nav__heart-btn" aria-label="Pourquoi je t'aime">
          <div class="bottom-nav__glow" />
          <Heart class="bottom-nav__heart-icon" :size="30" :stroke-width="2" fill="currentColor" />
          <Sparkles class="bottom-nav__sparkle" :size="16" :stroke-width="2" />
        </router-link>
      </div>

      <router-link to="/quiz" class="bottom-nav__item">
        <HelpCircle class="bottom-nav__icon" :size="22" :stroke-width="2" />
        <span class="bottom-nav__label">Quiz</span>
      </router-link>

      <router-link to="/settings" class="bottom-nav__item">
        <User class="bottom-nav__icon" :size="22" :stroke-width="2" />
        <span class="bottom-nav__label">Profil</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Home, BookOpen, Heart, HelpCircle, User, Sparkles } from 'lucide-vue-next'
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0 16px;
  z-index: 50;
}

.bottom-nav__bar {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr auto 1fr 1fr;
  align-items: center;
  width: 100%;
  max-width: 460px;
  background: linear-gradient(135deg, var(--color-bordeaux), var(--color-rose-fonce) 55%, var(--color-rose));
  backdrop-filter: blur(14px) saturate(160%);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 44px;
  padding: 14px 20px;
  box-shadow: 0 12px 36px rgba(124, 23, 74, 0.35);
  overflow: hidden;
}

/* effet glossy : reflet clair en haut de la barre */
.bottom-nav__glossy {
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 40%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.28), transparent);
  border-radius: 999px;
  pointer-events: none;
}

.bottom-nav__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.65);
  padding: 6px 8px;
  transition: color 0.2s ease;
  flex: 1;
}

.bottom-nav__item--active {
  color: #fff;
}

.bottom-nav__item--active .bottom-nav__icon {
  background: rgba(255, 255, 255, 0.22);
  padding: 4px 12px;
  border-radius: 999px;
  box-sizing: content-box;
}

.bottom-nav__icon {
  color: currentColor;
}

.bottom-nav__label {
  font-size: 0.64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 3px;
}

.bottom-nav__center {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -34px;
}

.bottom-nav__heart-btn {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-rose), var(--color-rose-fonce));
  border: 4px solid var(--color-blanc-casse);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 28px rgba(245, 91, 165, 0.55);
  text-decoration: none;
  transition: transform 0.15s ease;
}

.bottom-nav__heart-btn:active {
  transform: scale(0.92);
}

.bottom-nav__heart-icon {
  position: relative;
  z-index: 1;
  color: #fff;
  filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.35));
}

.bottom-nav__glow {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: rgba(245, 91, 165, 0.45);
  filter: blur(16px);
  animation: pulse-glow 2s ease-in-out infinite;
}

.bottom-nav__sparkle {
  position: absolute;
  top: -2px;
  right: 2px;
  color: #fff;
  animation: sparkle 1.8s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}
@keyframes sparkle {
  0%, 100% { opacity: 0.4; transform: scale(0.8) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.2) rotate(20deg); }
}

@media (max-width: 480px) {
  .bottom-nav__bar {
    padding: 10px 14px;
    border-radius: 36px;
  }
  .bottom-nav__heart-btn {
    width: 60px;
    height: 60px;
  }
  .bottom-nav__heart-icon {
    width: 24px;
    height: 24px;
  }
  .bottom-nav__label {
    font-size: 0.56rem;
  }
}
</style>