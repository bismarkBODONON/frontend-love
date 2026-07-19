<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import AppHeader from '@/components/AppHeader.vue'

interface GalleryItem {
  id: number
  type: 'photo' | 'video'
  path: string
}

interface Album {
  id: number
  title: string
  description: string | null
  gallery_items_count: number
  gallery_items: GalleryItem[]
}

const albums = ref<Album[]>([])
const isLoading = ref(true)
const showAddForm = ref(false)
const isAdding = ref(false)
const newTitle = ref('')
const newDescription = ref('')

const storageBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api').replace(/\/api\/?$/, '')

function fileUrl(path: string) {
  return `${storageBaseUrl}/storage/${path}`
}

async function loadAlbums() {
  isLoading.value = true
  try {
    const { data } = await api.get<Album[]>('/albums')
    albums.value = data
  } finally {
    isLoading.value = false
  }
}

async function addAlbum() {
  if (!newTitle.value.trim()) return

  isAdding.value = true
  try {
    const { data } = await api.post<Album>('/albums', {
      title: newTitle.value,
      description: newDescription.value || null,
    })
    albums.value.unshift({ ...data, gallery_items_count: 0, gallery_items: [] })
    newTitle.value = ''
    newDescription.value = ''
    showAddForm.value = false
  } finally {
    isAdding.value = false
  }
}

onMounted(loadAlbums)
</script>

<template>
  <div class="albums">
    <AppHeader title="Galerie" fallback="/" />

    <div v-if="isLoading" class="albums__loading">
      <div class="albums__spinner" />
    </div>

    <template v-else>
      <div v-if="showAddForm" class="albums__form">
        <input v-model="newTitle" type="text" placeholder="Nom de l'album" class="albums__input" />
        <input v-model="newDescription" type="text" placeholder="Description (optionnel)" class="albums__input" />
        <div class="albums__form-actions">
          <button class="albums__btn albums__btn--ghost" @click="showAddForm = false">
            Annuler
          </button>
          <button
            class="albums__btn albums__btn--primary"
            :disabled="isAdding || !newTitle.trim()"
            @click="addAlbum"
          >
            {{ isAdding ? 'Création...' : 'Créer' }}
          </button>
        </div>
      </div>

      <div v-if="albums.length === 0" class="albums__empty">
        <p>Aucun album pour l'instant.</p>
        <p class="albums__empty-sub">Créez votre premier album souvenir.</p>
      </div>

      <div v-else class="albums__grid">
        <router-link
          v-for="album in albums"
          :key="album.id"
          :to="`/gallery/${album.id}`"
          class="albums__card"
        >
          <div class="albums__cover">
            <img
              v-if="album.gallery_items[0]?.type === 'photo'"
              :src="fileUrl(album.gallery_items[0].path)"
              class="albums__cover-media"
              alt=""
            />
            <video
              v-else-if="album.gallery_items[0]?.type === 'video'"
              :src="fileUrl(album.gallery_items[0].path)"
              class="albums__cover-media"
            />
            <div v-else class="albums__cover-placeholder">📷</div>
          </div>
          <div class="albums__card-info">
            <h3 class="albums__card-title">{{ album.title }}</h3>
            <p class="albums__card-count">{{ album.gallery_items_count }} élément(s)</p>
          </div>
        </router-link>
      </div>
    </template>

    <button
      v-if="!showAddForm"
      class="albums__fab"
      aria-label="Créer un album"
      @click="showAddForm = true"
    >
      +
    </button>
  </div>
</template>

<style scoped>
.albums { min-height: 100vh; padding: 24px 20px 80px; background: var(--bg); color: var(--text); }
.albums__loading { display: flex; justify-content: center; padding: 60px 0; }
.albums__spinner { width: 32px; height: 32px; border: 3px solid var(--pink-pale); border-top-color: var(--pink-deep); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.albums__form { background: var(--surface); border-radius: 16px; padding: 16px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 4px 16px var(--shadow-pink); }
.albums__input { background: var(--surface-soft); border: 1px solid var(--pink-pale); border-radius: 12px; padding: 10px 14px; color: var(--text); font-size: 0.9rem; font-family: inherit; }
.albums__form-actions { display: flex; justify-content: flex-end; gap: 10px; }
.albums__btn { border: none; border-radius: 12px; padding: 10px 18px; font-weight: 600; font-size: 0.85rem; }
.albums__btn--ghost { background: transparent; color: var(--text-soft); }
.albums__btn--primary { background: var(--pink-deep); color: #fff; }
.albums__btn--primary:disabled { opacity: 0.5; }
.albums__empty { text-align: center; padding: 60px 20px; color: var(--text-soft); }
.albums__empty-sub { font-size: 0.85rem; margin-top: 6px; }
.albums__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.albums__card { text-decoration: none; color: var(--text); background: var(--surface); border-radius: 16px; overflow: hidden; display: block; box-shadow: 0 4px 16px var(--shadow-pink); }
.albums__cover { width: 100%; aspect-ratio: 1; background: var(--surface-soft); }
.albums__cover-media { width: 100%; height: 100%; object-fit: cover; }
.albums__cover-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--pink-pale); }
.albums__card-info { padding: 10px 12px; }
.albums__card-title { font-size: 0.9rem; font-weight: 700; }
.albums__card-count { font-size: 0.75rem; color: var(--text-soft); margin-top: 2px; }
.albums__fab { position: fixed; bottom: 28px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: var(--pink-deep); color: #fff; font-size: 1.8rem; border: none; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px var(--shadow-pink); }
</style>