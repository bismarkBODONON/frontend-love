<script setup lang="ts">
import { ref } from 'vue'
import { themeMode, colorTheme, fontFamily, saveTheme } from '@/composables/useTheme'
import api from '@/services/api'

const themes = [
  { key: 'pink', label: 'Rose', color: '#ff4d8d' },
  { key: 'purple', label: 'Violet', color: '#8a5cf6' },
  { key: 'teal', label: 'Emeraude', color: '#1d9e75' },
  { key: 'blue', label: 'Bleu', color: '#378add' },
]

const fonts = [
  { key: 'default', label: 'Par défaut' },
  { key: 'serif', label: 'Élégante (serif)' },
  { key: 'rounded', label: 'Arrondie' },
]

const uploading = ref(false)
const wallpaperInput = ref<HTMLInputElement | null>(null)

async function selectMode(mode: 'light' | 'dark' | 'system') {
  themeMode.value = mode
  await saveTheme()
}

async function selectColor(key: string) {
  colorTheme.value = key
  await saveTheme()
}

async function selectFont(key: string) {
  fontFamily.value = key
  await saveTheme()
}

function triggerWallpaperUpload() {
  wallpaperInput.value?.click()
}

async function onWallpaperChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  uploading.value = true
  const formData = new FormData()
  formData.append('wallpaper', file)

  try {
    await api.post('/settings/wallpaper', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    await import('@/composables/useTheme').then((m) => m.loadThemeFromServer())
  } finally {
    uploading.value = false
  }
}

async function removeWallpaper() {
  await api.delete('/settings/wallpaper')
  await import('@/composables/useTheme').then((m) => m.loadThemeFromServer())
}
</script>

<template>
  <div class="perso">
    <header class="perso__header">
      <router-link to="/settings" class="perso__back">←</router-link>
      <h1>Personnalisation</h1>
    </header>

    <section class="perso__section">
      <h2>Mode d'affichage</h2>
      <div class="perso__row">
        <button class="perso__pill" :class="{ active: themeMode === 'light' }" @click="selectMode('light')">Clair</button>
        <button class="perso__pill" :class="{ active: themeMode === 'dark' }" @click="selectMode('dark')">Sombre</button>
        <button class="perso__pill" :class="{ active: themeMode === 'system' }" @click="selectMode('system')">Auto</button>
      </div>
    </section>

    <section class="perso__section">
      <h2>Thème de couleur</h2>
      <div class="perso__swatches">
        <button
          v-for="t in themes"
          :key="t.key"
          class="perso__swatch"
          :class="{ active: colorTheme === t.key }"
          :style="{ background: t.color }"
          @click="selectColor(t.key)"
        >
          <span v-if="colorTheme === t.key" class="perso__check">✓</span>
        </button>
      </div>
    </section>

    <section class="perso__section">
      <h2>Police</h2>
      <div class="perso__row perso__row--wrap">
        <button
          v-for="f in fonts"
          :key="f.key"
          class="perso__pill"
          :class="{ active: fontFamily === f.key }"
          @click="selectFont(f.key)"
        >
          {{ f.label }}
        </button>
      </div>
    </section>

    <section class="perso__section">
      <h2>Fond d'écran</h2>
      <input ref="wallpaperInput" type="file" accept="image/*" hidden @change="onWallpaperChange" />
      <div class="perso__row">
        <button class="perso__pill" :disabled="uploading" @click="triggerWallpaperUpload">
          {{ uploading ? 'Envoi...' : 'Choisir une image' }}
        </button>
        <button class="perso__pill perso__pill--danger" @click="removeWallpaper">Retirer</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.perso { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.perso__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.perso__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.perso__section { margin-bottom: 28px; }
.perso__section h2 { font-size: 0.9rem; color: var(--text-soft); margin-bottom: 12px; }
.perso__row { display: flex; gap: 10px; }
.perso__row--wrap { flex-wrap: wrap; }
.perso__pill { background: var(--surface-soft); border: 2px solid transparent; border-radius: 12px; padding: 10px 16px; color: var(--text); font-size: 0.85rem; }
.perso__pill.active { border-color: var(--pink-deep); background: rgba(228, 98, 155, 0.12); }
.perso__pill--danger { color: #c0392b; }
.perso__swatches { display: flex; gap: 12px; }
.perso__swatch { width: 44px; height: 44px; border-radius: 50%; border: 3px solid transparent; display: flex; align-items: center; justify-content: center; }
.perso__swatch.active { border-color: var(--text); }
.perso__check { color: #fff; font-weight: 700; }
</style>