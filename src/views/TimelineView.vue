<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import TimelineCard from '@/components/TimelineCard.vue'
import AppHeader from '@/components/AppHeader.vue'

interface TimelineEvent {
  id: number
  title: string
  description: string | null
  event_date: string
  location: string | null
  is_favorite: boolean
  photos: string[] | null
  videos: string[] | null   // ← AJOUTÉ
}

const events = ref<TimelineEvent[]>([])
const isLoading = ref(true)

async function loadEvents() {
  isLoading.value = true
  try {
    const { data } = await api.get<TimelineEvent[]>('/timeline')
    events.value = data
  } finally {
    isLoading.value = false
  }
}

onMounted(loadEvents)
</script>

<template>
  <div class="timeline">
    <AppHeader title="Notre Histoire" fallback="/" />

    <div v-if="isLoading" class="timeline__loading">
      <div class="timeline__spinner" />
    </div>

    <div v-else-if="events.length === 0" class="timeline__empty">
      <p>Votre histoire commence ici.</p>
      <p class="timeline__empty-sub">Ajoutez votre premier souvenir.</p>
    </div>

    <div v-else class="timeline__list">
      <TimelineCard v-for="event in events" :key="event.id" :event="event" />
    </div>

    <router-link to="/timeline/new" class="timeline__fab" aria-label="Ajouter un souvenir">
      +
    </router-link>
  </div>
</template>

<style scoped>
.timeline { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.timeline__loading { display: flex; justify-content: center; padding: 60px 0; }
.timeline__spinner { width: 32px; height: 32px; border: 3px solid var(--pink-pale); border-top-color: var(--pink-deep); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.timeline__empty { text-align: center; padding: 80px 20px; color: var(--text-soft); }
.timeline__empty-sub { font-size: 0.85rem; margin-top: 6px; }
.timeline__fab { position: fixed; bottom: 28px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: var(--pink-deep); color: #fff; font-size: 1.8rem; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 8px 20px var(--shadow-pink); }
</style>