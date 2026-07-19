<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

interface CalendarEvent {
  id: number
  title: string
  description: string | null
  event_date: string
  type: 'anniversary' | 'important_date' | 'event'
  is_recurring_yearly: boolean
  notify: boolean
  notify_time: string | null
}

const events = ref<CalendarEvent[]>([])
const isLoading = ref(true)

const typeLabels: Record<string, string> = {
  anniversary: '💞 Anniversaire',
  important_date: '📌 Date importante',
  event: '🗓️ Événement',
}

const upcoming = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return events.value.filter((e) => e.event_date >= today)
})

const past = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return events.value.filter((e) => e.event_date < today)
})

async function loadEvents() {
  isLoading.value = true
  try {
    const { data } = await api.get<CalendarEvent[]>('/calendar-events')
    events.value = data
  } finally {
    isLoading.value = false
  }
}

async function deleteEvent(id: number) {
  if (!confirm('Supprimer cet événement ?')) return
  await api.delete(`/calendar-events/${id}`)
  events.value = events.value.filter((e) => e.id !== id)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

onMounted(loadEvents)
</script>

<template>
  <div class="calendar">
    <header class="calendar__header">
      <router-link to="/" class="calendar__back">←</router-link>
      <h1>Calendrier</h1>
    </header>

    <div v-if="isLoading" class="calendar__loading">
      <div class="calendar__spinner" />
    </div>

    <div v-else>
      <section v-if="upcoming.length" class="calendar__section">
        <h2 class="calendar__section-title">À venir</h2>
        <div class="calendar__list">
          <article v-for="event in upcoming" :key="event.id" class="calendar__card">
            <div class="calendar__card-header">
              <span class="calendar__type">{{ typeLabels[event.type] }}</span>
              <button class="calendar__delete" @click="deleteEvent(event.id)">✕</button>
            </div>
            <h3 class="calendar__title">{{ event.title }}</h3>
            <p class="calendar__date">{{ formatDate(event.event_date) }}</p>
            <p v-if="event.description" class="calendar__desc">{{ event.description }}</p>
            <span v-if="event.notify" class="calendar__notify-badge">🔔 Notification activée</span>
          </article>
        </div>
      </section>

      <section v-if="past.length" class="calendar__section">
        <h2 class="calendar__section-title">Passés</h2>
        <div class="calendar__list">
          <article v-for="event in past" :key="event.id" class="calendar__card calendar__card--past">
            <div class="calendar__card-header">
              <span class="calendar__type">{{ typeLabels[event.type] }}</span>
              <button class="calendar__delete" @click="deleteEvent(event.id)">✕</button>
            </div>
            <h3 class="calendar__title">{{ event.title }}</h3>
            <p class="calendar__date">{{ formatDate(event.event_date) }}</p>
          </article>
        </div>
      </section>

      <div v-if="!upcoming.length && !past.length" class="calendar__empty">
        <p>Aucun événement pour l'instant.</p>
      </div>
    </div>

    <router-link to="/calendar/new" class="calendar__fab" aria-label="Ajouter un événement">
      +
    </router-link>
  </div>
</template>

<style scoped>
.calendar { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.calendar__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.calendar__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.calendar__loading { display: flex; justify-content: center; padding: 60px 0; }
.calendar__spinner { width: 32px; height: 32px; border: 3px solid var(--pink-pale); border-top-color: var(--pink-deep); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.calendar__section { margin-bottom: 28px; }
.calendar__section-title { font-size: 0.85rem; text-transform: uppercase; color: var(--text-soft); margin-bottom: 12px; letter-spacing: 0.05em; }
.calendar__list { display: flex; flex-direction: column; gap: 14px; }
.calendar__card { background: var(--surface); border-radius: 18px; padding: 16px; box-shadow: 0 4px 16px var(--shadow-pink); }
.calendar__card--past { opacity: 0.6; }
.calendar__card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.calendar__type { font-size: 0.75rem; color: var(--text-soft); }
.calendar__delete { background: none; border: none; color: var(--pink-deep); font-size: 1rem; }
.calendar__title { font-size: 1.05rem; margin-bottom: 4px; }
.calendar__date { font-size: 0.85rem; color: var(--text-soft); margin-bottom: 6px; text-transform: capitalize; }
.calendar__desc { font-size: 0.9rem; opacity: 0.85; margin-bottom: 6px; }
.calendar__notify-badge { font-size: 0.75rem; color: var(--text-soft); }
.calendar__empty { text-align: center; padding: 80px 20px; color: var(--text-soft); }
.calendar__fab { position: fixed; bottom: 28px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: var(--pink-deep); color: #fff; font-size: 1.8rem; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 8px 20px var(--shadow-pink); }
</style>