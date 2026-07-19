<script setup lang="ts">
import { useMusicStore, fileUrl } from '@/stores/music'
import AppHeader from '@/components/AppHeader.vue'

const store = useMusicStore()

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function onSeek(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  store.seek(value)
}
</script>

<template>
  <div v-if="store.currentTrack" class="now-playing">
    <AppHeader fallback="/music" transparent />

    <div
      class="now-playing__cover"
      :style="store.currentTrack.cover_path ? `background-image: url(${fileUrl(store.currentTrack.cover_path)})` : ''"
    >
      <span v-if="!store.currentTrack.cover_path">🎵</span>
    </div>

    <h2 class="now-playing__title">{{ store.currentTrack.title }}</h2>
    <p class="now-playing__artist">{{ store.currentTrack.artist || 'Artiste inconnu' }}</p>

    <input
      type="range"
      min="0"
      :max="store.duration || 0"
      :value="store.currentTime"
      class="now-playing__slider"
      @input="onSeek"
    />
    <div class="now-playing__times">
      <span>{{ formatTime(store.currentTime) }}</span>
      <span>{{ formatTime(store.duration) }}</span>
    </div>

    <div class="now-playing__controls">
      <button @click="store.prev">⏮</button>
      <button class="now-playing__play-btn" @click="store.togglePlay">
        {{ store.isPlaying ? '⏸' : '▶' }}
      </button>
      <button @click="store.next">⏭</button>
    </div>

    <div v-if="store.currentTrack.lyrics" class="now-playing__lyrics">
      <p>{{ store.currentTrack.lyrics }}</p>
    </div>
  </div>
</template>

<style scoped>
.now-playing { position: relative; min-height: 100vh; padding: 76px 24px 60px; background: linear-gradient(180deg, var(--pink-pale), var(--bg)); color: var(--text); display: flex; flex-direction: column; align-items: center; }
.now-playing__cover { width: 260px; height: 260px; border-radius: 24px; background-size: cover; background-position: center; background-color: var(--surface); display: flex; align-items: center; justify-content: center; font-size: 3rem; box-shadow: 0 20px 50px var(--shadow-pink); margin-bottom: 28px; }
.now-playing__title { font-size: 1.3rem; font-weight: 700; text-align: center; }
.now-playing__artist { font-size: 0.9rem; color: var(--text-soft); margin-bottom: 24px; }
.now-playing__slider { width: 100%; accent-color: var(--pink-deep); }
.now-playing__times { display: flex; justify-content: space-between; width: 100%; font-size: 0.72rem; color: var(--text-soft); margin-bottom: 28px; }
.now-playing__controls { display: flex; align-items: center; gap: 28px; margin-bottom: 32px; }
.now-playing__controls button { background: transparent; border: none; color: var(--text); font-size: 1.4rem; }
.now-playing__play-btn { width: 64px; height: 64px; border-radius: 50%; background: var(--pink-deep); color: #fff; font-size: 1.6rem; }
.now-playing__lyrics { width: 100%; background: var(--surface); border-radius: 16px; padding: 18px; font-size: 0.85rem; line-height: 1.7; opacity: 0.9; white-space: pre-line; box-shadow: 0 4px 16px var(--shadow-pink); }
</style>