<script setup lang="ts">
import { ref } from 'vue'

interface TimelineEvent {
  id: number
  title: string
  description: string | null
  event_date: string
  location: string | null
  is_favorite: boolean
  photos: string[] | null
  videos: string[] | null
}

defineProps<{ event: TimelineEvent }>()

const expanded = ref(false)

const storageBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api').replace(/\/api\/?$/, '')

function fileUrl(path: string) {
  return `${storageBaseUrl}/storage/${path}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <article class="card" @click="expanded = !expanded">
    <div class="card__header">
      <span class="card__date">{{ formatDate(event.event_date) }}</span>
      <span v-if="event.is_favorite" class="card__favorite">★</span>
    </div>

    <h3 class="card__title">{{ event.title }}</h3>

    <p v-if="event.location" class="card__location">📍 {{ event.location }}</p>

    <Transition name="expand">
      <p v-if="expanded && event.description" class="card__description">
        {{ event.description }}
      </p>
    </Transition>

    <div v-if="expanded && event.photos?.length" class="card__photos">
      <img
        v-for="(photo, index) in event.photos"
        :key="'photo-' + index"
        :src="fileUrl(photo)"
        class="card__photo"
        alt=""
      />
    </div>

    <div v-if="expanded && event.videos?.length" class="card__videos">
      <video
        v-for="(video, index) in event.videos"
        :key="'video-' + index"
        :src="fileUrl(video)"
        class="card__video"
        controls
        @click.stop
      />
    </div>
  </article>
</template>

<style scoped>
.card {
  background: var(--surface);
  border-radius: 20px;
  padding: 18px;
  margin-bottom: 16px;
  cursor: pointer;
  box-shadow: 0 4px 16px var(--shadow-pink);
  transition: background 0.2s ease;
}

.card:active {
  background: var(--surface-soft);
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.card__date {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-soft);
}

.card__favorite {
  color: #c9a227;
}

.card__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}

.card__location {
  font-size: 0.85rem;
  color: var(--text-soft);
  margin-bottom: 8px;
}

.card__description {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text);
  opacity: 0.9;
}

.card__photos {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  overflow-x: auto;
}

.card__photo {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 14px;
  flex-shrink: 0;
}

.card__videos {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.card__video {
  width: 100%;
  border-radius: 14px;
  background: #000;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 300px;
}
</style>