<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = withDefaults(
  defineProps<{
    title?: string
    fallback?: string
    transparent?: boolean
  }>(),
  {
    title: '',
    fallback: '/',
    transparent: false,
  }
)

const router = useRouter()

function goBack() {
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push(props.fallback)
  }
}
</script>

<template>
  <header class="app-header" :class="{ 'app-header--transparent': transparent }">
    <button class="app-header__back" @click="goBack" aria-label="Retour">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <h1 v-if="title" class="app-header__title">{{ title }}</h1>
    <div class="app-header__slot">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0 18px;
}

.app-header__back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--surface);
  color: var(--pink-deep);
  border: 1px solid var(--pink-pale);
  box-shadow: 0 3px 12px var(--shadow-pink);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, background 0.15s ease;
}

.app-header__back:active {
  transform: scale(0.92);
  background: var(--surface-soft);
}

.app-header__title {
  font-size: 1.18rem;
  font-weight: 700;
  color: var(--text);
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.app-header__slot {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-header--transparent {
  position: absolute;
  top: 18px;
  left: 18px;
  right: 18px;
  z-index: 10;
  padding: 0;
}

.app-header--transparent .app-header__back {
  background: rgba(0, 0, 0, 0.32);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
}

.app-header--transparent .app-header__title {
  color: #fff;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.45);
}
</style>