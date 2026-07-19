<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

interface JournalEntry {
  id: number
  content: string
  mood: string | null
  photo: string | null
  entry_date: string
}

const entries = ref<JournalEntry[]>([])
const isLoading = ref(true)

async function loadEntries() {
  isLoading.value = true
  try {
    const { data } = await api.get<JournalEntry[]>('/journal')
    entries.value = data
  } finally {
    isLoading.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function photoUrl(path: string) {
  return `${import.meta.env.VITE_API_URL ?? ''}/storage/${path}`
}

onMounted(loadEntries)
</script>

<template>
  <div class="journal">
    <header class="journal__header">
      <router-link to="/" class="journal__back">←</router-link>
      <h1>Journal</h1>
    </header>

    <div v-if="isLoading" class="journal__loading">
      <div class="journal__spinner" />
    </div>

    <div v-else-if="entries.length === 0" class="journal__empty">
      <p>Votre journal est encore vide.</p>
      <p class="journal__empty-sub">Écrivez votre première entrée.</p>
    </div>

    <div v-else class="journal__list">
      <article v-for="entry in entries" :key="entry.id" class="journal__card">
        <div class="journal__card-header">
          <span class="journal__date">{{ formatDate(entry.entry_date) }}</span>
          <span v-if="entry.mood" class="journal__mood">{{ entry.mood }}</span>
        </div>
        <img
          v-if="entry.photo"
          :src="photoUrl(entry.photo)"
          class="journal__photo"
          alt=""
        />
        <p class="journal__content">{{ entry.content }}</p>
      </article>
    </div>

    <router-link to="/journal/new" class="journal__fab" aria-label="Nouvelle entrée">
      +
    </router-link>
  </div>
</template>

<style scoped>
.journal { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.journal__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.journal__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.journal__loading { display: flex; justify-content: center; padding: 60px 0; }
.journal__spinner { width: 32px; height: 32px; border: 3px solid var(--pink-pale); border-top-color: var(--pink-deep); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.journal__empty { text-align: center; padding: 80px 20px; color: var(--text-soft); }
.journal__empty-sub { font-size: 0.85rem; margin-top: 6px; }
.journal__list { display: flex; flex-direction: column; gap: 16px; }
.journal__card { background: var(--surface); border-radius: 18px; padding: 16px; box-shadow: 0 4px 16px var(--shadow-pink); }
.journal__card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.journal__date { font-size: 0.8rem; color: var(--text-soft); }
.journal__mood { font-size: 1.3rem; }
.journal__photo { width: 100%; border-radius: 12px; margin-bottom: 10px; object-fit: cover; max-height: 240px; }
.journal__content { font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap; }
.journal__fab { position: fixed; bottom: 28px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: var(--pink-deep); color: #fff; font-size: 1.8rem; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 8px 20px var(--shadow-pink); }
</style>