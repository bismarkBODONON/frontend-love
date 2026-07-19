<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useMusicStore, fileUrl } from '@/stores/music'

const store = useMusicStore()
const router = useRouter()

function open() {
  if (store.currentTrack) router.push('/music/now-playing')
}
</script>

<template>
  <div v-if="store.currentTrack" class="mini-player" @click="open">
    <div
      class="mini-player__cover"
      :style="store.currentTrack.cover_path ? `background-image: url(${fileUrl(store.currentTrack.cover_path)})` : ''"
    >
      <span v-if="!store.currentTrack.cover_path">🎵</span>
    </div>
    <div class="mini-player__info">
      <p class="mini-player__title">{{ store.currentTrack.title }}</p>
      <p class="mini-player__artist">{{ store.currentTrack.artist || 'Artiste inconnu' }}</p>
    </div>
    <button class="mini-player__btn" @click.stop="store.togglePlay">
      {{ store.isPlaying ? '⏸' : '▶' }}
    </button>
    <div class="mini-player__progress">
      <div
        class="mini-player__progress-fill"
        :style="`width: ${store.duration ? (store.currentTime / store.duration) * 100 : 0}%`"
      />
    </div>
  </div>
</template>

<style scoped>
.mini-player {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 76px;
  z-index: 900;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(30, 12, 45, 0.92);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 8px 12px;
  overflow: hidden;
}

.mini-player__cover {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  background-color: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mini-player__info {
  flex: 1;
  min-width: 0;
}

.mini-player__title {
  font-size: 0.82rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-player__artist {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-player__btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #ff4d8d;
  color: #fff;
  border: none;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.mini-player__progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
}

.mini-player__progress-fill {
  height: 100%;
  background: #ff4d8d;
}
</style>