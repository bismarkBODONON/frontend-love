<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicStore, fileUrl } from '@/stores/music'

const store = useMusicStore()
const router = useRouter()
const searchQuery = ref('')
const favoritesOnly = ref(false)

onMounted(() => {
  if (store.tracks.length === 0) store.loadTracks()
})

function filteredTracks() {
  return store.tracks.filter((t) => {
    const matchesSearch =
      !searchQuery.value ||
      t.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (t.artist || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesFav = !favoritesOnly.value || t.is_favorite
    return matchesSearch && matchesFav
  })
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="music">
    <header class="music__header">
      <h1>Notre Musique</h1>
      <button class="music__add-btn" @click="router.push('/music/new')">+</button>
    </header>

    <input
      v-model="searchQuery"
      type="text"
      placeholder="Rechercher un titre, un artiste..."
      class="music__search"
    />

    <button
      class="music__fav-toggle"
      :class="{ 'music__fav-toggle--active': favoritesOnly }"
      @click="favoritesOnly = !favoritesOnly"
    >
      ★ Favoris uniquement
    </button>

    <div v-if="filteredTracks().length === 0" class="music__empty">
      <p>Aucune chanson trouvée.</p>
    </div>

    <div v-else class="music__list">
      <div
        v-for="(track, index) in store.tracks"
        v-show="filteredTracks().includes(track)"
        :key="track.id"
        class="music__row"
        :class="{ 'music__row--active': store.currentTrack?.id === track.id }"
        @click="store.playTrackAt(store.tracks.indexOf(track))"
      >
        <div
          class="music__cover"
          :style="track.cover_path ? `background-image: url(${fileUrl(track.cover_path)})` : ''"
        >
          <span v-if="!track.cover_path">🎵</span>
        </div>
        <div class="music__info">
          <p class="music__title">{{ track.title }}</p>
          <p class="music__artist">{{ track.artist || 'Artiste inconnu' }}</p>
        </div>
        <span class="music__duration">{{ formatDuration(track.duration) }}</span>
        <button class="music__fav-btn" :class="{ 'music__fav-btn--active': track.is_favorite }" @click.stop="store.toggleFavorite(track)">
          ★
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.music { min-height: 100vh; padding: 24px 20px 160px; background: var(--bg); color: var(--text); }
.music__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.music__header h1 { font-size: 1.4rem; font-weight: 700; }
.music__add-btn { background: var(--pink-deep); color: #fff; border: none; width: 34px; height: 34px; border-radius: 50%; font-size: 1.2rem; line-height: 1; }
.music__search { width: 100%; background: var(--surface-soft); border: 1px solid var(--pink-pale); border-radius: 14px; padding: 12px 16px; color: var(--text); font-size: 0.9rem; margin-bottom: 12px; }
.music__fav-toggle { background: var(--surface-soft); border: 1px solid var(--pink-pale); color: var(--text); border-radius: 20px; padding: 8px 14px; font-size: 0.8rem; margin-bottom: 18px; }
.music__fav-toggle--active { background: rgba(228, 98, 155, 0.15); border-color: var(--pink-deep); color: var(--pink-deep); }
.music__empty { text-align: center; padding: 60px 20px; color: var(--text-soft); }
.music__list { display: flex; flex-direction: column; gap: 8px; }
.music__row { display: flex; align-items: center; gap: 12px; background: var(--surface); border: 1px solid var(--pink-pale); border-radius: 14px; padding: 10px 12px; cursor: pointer; }
.music__row--active { border-color: var(--pink-deep); background: rgba(228, 98, 155, 0.08); }
.music__cover { width: 46px; height: 46px; border-radius: 10px; background-size: cover; background-position: center; background-color: var(--surface-soft); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.music__info { flex: 1; min-width: 0; }
.music__title { font-size: 0.88rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.music__artist { font-size: 0.75rem; color: var(--text-soft); }
.music__duration { font-size: 0.75rem; color: var(--text-soft); }
.music__fav-btn { background: transparent; border: none; color: var(--pink-pale); font-size: 1rem; }
.music__fav-btn--active { color: #c9a227; }
</style>