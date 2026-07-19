<script setup lang="ts">
import { ref, watch, onBeforeUnmount, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import AppHeader from '@/components/AppHeader.vue'

interface GalleryItem {
  id: number
  type: 'photo' | 'video'
  path: string
  caption: string | null
  is_favorite: boolean
}

interface Album {
  id: number
  title: string
  description: string | null
  gallery_items: GalleryItem[]
}

const route = useRoute()
const albumId = route.params.id as string

const album = ref<Album | null>(null)
const isLoading = ref(true)
const isUploading = ref(false)
const viewerIndex = ref<number | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const storageBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api').replace(/\/api\/?$/, '')

function fileUrl(path: string) {
  return `${storageBaseUrl}/storage/${path}`
}

async function loadAlbum() {
  isLoading.value = true
  try {
    const { data } = await api.get<Album>(`/albums/${albumId}`)
    album.value = data
  } finally {
    isLoading.value = false
  }
}

function triggerUpload() {
  fileInput.value?.click()
}

async function handleFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  isUploading.value = true
  try {
    const formData = new FormData()
    Array.from(input.files).forEach((file) => {
      if (file.type.startsWith('video/')) {
        formData.append('videos[]', file)
      } else {
        formData.append('photos[]', file)
      }
    })

    const { data } = await api.post<GalleryItem[]>(`/albums/${albumId}/items`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (album.value) {
      album.value.gallery_items.unshift(...data)
    }
  } finally {
    isUploading.value = false
    input.value = ''
  }
}

async function toggleFavorite(item: GalleryItem) {
  item.is_favorite = !item.is_favorite
  await api.put(`/gallery-items/${item.id}`, { is_favorite: item.is_favorite })
}

async function deleteItem(item: GalleryItem) {
  if (!album.value) return
  album.value.gallery_items = album.value.gallery_items.filter((i) => i.id !== item.id)
  viewerIndex.value = null
  await api.delete(`/gallery-items/${item.id}`)
}

function openViewer(index: number) {
  viewerIndex.value = index
}

function closeViewer() {
  stopSlideshow()
  viewerIndex.value = null
}

function nextItem() {
  if (viewerIndex.value === null || !album.value) return
  viewerIndex.value = (viewerIndex.value + 1) % album.value.gallery_items.length
  if (isSlideshow.value) rescheduleSlideshow()
}

function prevItem() {
  if (viewerIndex.value === null || !album.value) return
  viewerIndex.value =
    (viewerIndex.value - 1 + album.value.gallery_items.length) % album.value.gallery_items.length
  if (isSlideshow.value) rescheduleSlideshow()
}

/* ─────────────── ZOOM ─────────────── */

const scale = ref(1)
const posX = ref(0)
const posY = ref(0)
const isPanning = ref(false)

const activePointers = new Map<number, { x: number; y: number }>()
let pinchStartDistance = 0
let pinchStartScale = 1
let dragStart = { x: 0, y: 0 }
let panStart = { x: 0, y: 0 }

const MIN_SCALE = 1
const MAX_SCALE = 4

function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}

function resetZoom() {
  scale.value = 1
  posX.value = 0
  posY.value = 0
}

function clampScale(value: number) {
  return Math.min(Math.max(value, MIN_SCALE), MAX_SCALE)
}

function onPointerDown(e: PointerEvent) {
  ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

  if (activePointers.size === 2) {
    const [p1, p2] = [...activePointers.values()]
    pinchStartDistance = getDistance(p1, p2)
    pinchStartScale = scale.value
  } else if (activePointers.size === 1 && scale.value > 1) {
    isPanning.value = true
    dragStart = { x: e.clientX, y: e.clientY }
    panStart = { x: posX.value, y: posY.value }
  }
}

function onPointerMove(e: PointerEvent) {
  if (!activePointers.has(e.pointerId)) return
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

  if (activePointers.size === 2) {
    const [p1, p2] = [...activePointers.values()]
    const distance = getDistance(p1, p2)
    const newScale = clampScale(pinchStartScale * (distance / pinchStartDistance))
    scale.value = newScale
    if (newScale === 1) {
      posX.value = 0
      posY.value = 0
    }
  } else if (isPanning.value && scale.value > 1) {
    posX.value = panStart.x + (e.clientX - dragStart.x)
    posY.value = panStart.y + (e.clientY - dragStart.y)
  }
}

function onPointerUp(e: PointerEvent) {
  activePointers.delete(e.pointerId)
  if (activePointers.size < 2) pinchStartDistance = 0
  if (activePointers.size === 0) isPanning.value = false
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.2 : 0.2
  const newScale = clampScale(scale.value + delta)
  scale.value = newScale
  if (newScale === 1) {
    posX.value = 0
    posY.value = 0
  }
}

function toggleZoom() {
  if (scale.value > 1) {
    resetZoom()
  } else {
    scale.value = 2.5
  }
}

watch(viewerIndex, resetZoom)

/* ─────────────── SLIDESHOW ─────────────── */

const isSlideshow = ref(false)
const SLIDESHOW_DELAY = 4000
let slideshowTimer: number | undefined

function scheduleNext() {
  clearTimeout(slideshowTimer)
  slideshowTimer = window.setTimeout(() => {
    if (!isSlideshow.value) return
    nextItem()
  }, SLIDESHOW_DELAY)
}

function rescheduleSlideshow() {
  scheduleNext()
}

function startSlideshow(fromIndex = 0) {
  if (!album.value || album.value.gallery_items.length === 0) return
  viewerIndex.value = fromIndex
  isSlideshow.value = true
  scheduleNext()
}

function stopSlideshow() {
  isSlideshow.value = false
  clearTimeout(slideshowTimer)
}

function toggleSlideshow() {
  if (isSlideshow.value) {
    stopSlideshow()
  } else {
    isSlideshow.value = true
    scheduleNext()
  }
}

onBeforeUnmount(() => {
  clearTimeout(slideshowTimer)
})

onMounted(loadAlbum)
</script>

<template>
  <div class="album-detail">
    <AppHeader :title="album?.title || '...'" fallback="/gallery" />

    <div v-if="isLoading" class="album-detail__loading">
      <div class="album-detail__spinner" />
    </div>

    <template v-else-if="album">
      <p v-if="album.description" class="album-detail__description">{{ album.description }}</p>

      <input
        ref="fileInput"
        type="file"
        accept="image/*,video/*"
        multiple
        class="album-detail__hidden-input"
        @change="handleFilesSelected"
      />

      <div class="album-detail__actions-row">
        <button class="album-detail__upload-btn" :disabled="isUploading" @click="triggerUpload">
          {{ isUploading ? 'Envoi en cours...' : '+ Ajouter des photos / vidéos' }}
        </button>

        <button
          v-if="album.gallery_items.length > 0"
          class="album-detail__slideshow-btn"
          @click="startSlideshow(0)"
        >
          ▶ Diaporama
        </button>
      </div>

      <div v-if="album.gallery_items.length === 0" class="album-detail__empty">
        <p>Aucun contenu dans cet album.</p>
        <p class="album-detail__empty-sub">Ajoutez vos premières photos ou vidéos.</p>
      </div>

      <div v-else class="album-detail__grid">
        <div
          v-for="(item, index) in album.gallery_items"
          :key="item.id"
          class="album-detail__thumb"
          @click="openViewer(index)"
        >
          <img v-if="item.type === 'photo'" :src="fileUrl(item.path)" alt="" />
          <video
            v-else
            :src="fileUrl(item.path)"
            muted
            preload="metadata"
            disablepictureinpicture
            controlslist="nodownload nofullscreen noremoteplayback"
            style="pointer-events: none"
          />
          <span v-if="item.type === 'video'" class="album-detail__play-icon">▶</span>
          <span v-if="item.is_favorite" class="album-detail__fav-icon">★</span>
        </div>
      </div>
    </template>

    <!-- Visionneuse plein écran -->
    <Teleport to="body">
      <div v-if="viewerIndex !== null && album" class="viewer" @click.self="closeViewer">
        <button class="viewer__close" @click="closeViewer">✕</button>

        <button class="viewer__slideshow-toggle" @click="toggleSlideshow">
          {{ isSlideshow ? '⏸' : '▶' }}
        </button>

        <button class="viewer__nav viewer__nav--prev" @click="prevItem">‹</button>
        <button class="viewer__nav viewer__nav--next" @click="nextItem">›</button>

        <div class="viewer__content">
          <img
            v-if="album.gallery_items[viewerIndex].type === 'photo'"
            :src="fileUrl(album.gallery_items[viewerIndex].path)"
            class="viewer__media viewer__media--zoomable"
            :class="{ 'viewer__media--panning': isPanning }"
            :style="{
              transform: `translate(${posX}px, ${posY}px) scale(${scale})`,
              cursor: scale > 1 ? 'grab' : 'zoom-in',
            }"
            alt=""
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
            @wheel="onWheel"
            @dblclick="toggleZoom"
          />
          <video
            v-else
            :src="fileUrl(album.gallery_items[viewerIndex].path)"
            class="viewer__media"
            controls
            autoplay
          />
        </div>

        <div class="viewer__actions">
          <button
            class="viewer__action-btn"
            :class="{ 'viewer__action-btn--active': album.gallery_items[viewerIndex].is_favorite }"
            @click="toggleFavorite(album.gallery_items[viewerIndex])"
          >
            ★ Favori
          </button>
          <button class="viewer__action-btn" @click="deleteItem(album.gallery_items[viewerIndex])">
            🗑 Supprimer
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
<style scoped>
.album-detail { min-height: 100vh; padding: 24px 20px 80px; background: var(--bg); color: var(--text); }
.album-detail__description { font-size: 0.85rem; color: var(--text-soft); margin-bottom: 16px; }
.album-detail__loading { display: flex; justify-content: center; padding: 60px 0; }
.album-detail__spinner { width: 32px; height: 32px; border: 3px solid var(--pink-pale); border-top-color: var(--pink-deep); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.album-detail__hidden-input { display: none; }
.album-detail__actions-row { display: flex; gap: 10px; margin-bottom: 20px; }
.album-detail__upload-btn { flex: 1; background: rgba(228, 98, 155, 0.1); color: var(--pink-deep); border: 1px dashed var(--pink); border-radius: 14px; padding: 14px; font-weight: 600; font-size: 0.9rem; }
.album-detail__upload-btn:disabled { opacity: 0.6; }
.album-detail__slideshow-btn { background: var(--surface); color: var(--text); border: 1px solid var(--pink-pale); border-radius: 14px; padding: 14px 18px; font-weight: 600; font-size: 0.9rem; white-space: nowrap; }
.album-detail__empty { text-align: center; padding: 60px 20px; color: var(--text-soft); }
.album-detail__empty-sub { font-size: 0.85rem; margin-top: 6px; }
.album-detail__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.album-detail__thumb { position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; cursor: pointer; }
.album-detail__thumb img, .album-detail__thumb video { width: 100%; height: 100%; object-fit: cover; }
.album-detail__play-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.2rem; color: #fff; text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5); pointer-events: none; }
.album-detail__fav-icon { position: absolute; top: 4px; right: 4px; color: #c9a227; font-size: 0.85rem; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4); }

.viewer { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.95); z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; }
.viewer__close { position: absolute; top: 20px; right: 20px; background: rgba(255, 255, 255, 0.1); border: none; color: #fff; width: 40px; height: 40px; border-radius: 50%; font-size: 1.1rem; z-index: 3; }
.viewer__slideshow-toggle { position: absolute; top: 20px; left: 20px; background: rgba(255, 255, 255, 0.1); border: none; color: #fff; width: 40px; height: 40px; border-radius: 50%; font-size: 1rem; z-index: 3; }
.viewer__nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, 0.1); border: none; color: #fff; width: 44px; height: 44px; border-radius: 50%; font-size: 1.6rem; z-index: 2; }
.viewer__nav--prev { left: 16px; }
.viewer__nav--next { right: 16px; }
.viewer__content { max-width: 92vw; max-height: 75vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.viewer__media { max-width: 100%; max-height: 75vh; object-fit: contain; border-radius: 10px; }
.viewer__media--zoomable { touch-action: none; transition: transform 0.15s ease-out; user-select: none; }
.viewer__media--panning { transition: none; }
.viewer__actions { display: flex; gap: 12px; margin-top: 20px; }
.viewer__action-btn { background: rgba(255, 255, 255, 0.1); color: #fff; border: none; border-radius: 12px; padding: 10px 18px; font-size: 0.85rem; font-weight: 600; }
.viewer__action-btn--active { color: #ffd166; }
</style>