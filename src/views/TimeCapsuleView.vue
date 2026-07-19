<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

interface TimeCapsule {
  id: number
  title: string
  open_date: string
  is_locked: boolean
  content: string | null
}

const capsules = ref<TimeCapsule[]>([])
const isLoading = ref(true)

async function loadCapsules() {
  isLoading.value = true
  try {
    const { data } = await api.get<TimeCapsule[]>('/time-capsules')
    capsules.value = data
  } finally {
    isLoading.value = false
  }
}

async function deleteCapsule(id: number) {
  if (!confirm('Supprimer cette capsule ?')) return
  await api.delete(`/time-capsules/${id}`)
  capsules.value = capsules.value.filter((c) => c.id !== id)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function daysRemaining(dateStr: string) {
  const diff = new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0)
  return Math.ceil(diff / 86400000)
}

onMounted(loadCapsules)
</script>

<template>
  <div class="capsule">
    <header class="capsule__header">
      <router-link to="/" class="capsule__back">←</router-link>
      <h1>Capsule temporelle</h1>
    </header>

    <div v-if="isLoading" class="capsule__loading">
      <div class="capsule__spinner" />
    </div>

    <div v-else-if="capsules.length === 0" class="capsule__empty">
      <p>Aucune capsule pour l'instant.</p>
      <p class="capsule__empty-sub">Écris une lettre pour le futur.</p>
    </div>

    <div v-else class="capsule__list">
      <article v-for="c in capsules" :key="c.id" class="capsule__card" :class="{ 'capsule__card--locked': c.is_locked }">
        <div class="capsule__card-header">
          <span class="capsule__icon">{{ c.is_locked ? '🔒' : '💌' }}</span>
          <button class="capsule__delete" @click="deleteCapsule(c.id)">✕</button>
        </div>
        <h3 class="capsule__title">{{ c.title }}</h3>
        <p v-if="c.is_locked" class="capsule__lock-info">
          S'ouvre le {{ formatDate(c.open_date) }} — dans {{ daysRemaining(c.open_date) }} jour(s)
        </p>
        <template v-else>
          <p class="capsule__opened-date">Ouverte le {{ formatDate(c.open_date) }}</p>
          <p class="capsule__content">{{ c.content }}</p>
        </template>
      </article>
    </div>

    <router-link to="/time-capsule/new" class="capsule__fab" aria-label="Nouvelle capsule">
      +
    </router-link>
  </div>
</template>

<style scoped>
.capsule { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.capsule__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.capsule__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.capsule__loading { display: flex; justify-content: center; padding: 60px 0; }
.capsule__spinner { width: 32px; height: 32px; border: 3px solid var(--pink-pale); border-top-color: var(--pink-deep); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.capsule__empty { text-align: center; padding: 80px 20px; color: var(--text-soft); }
.capsule__empty-sub { font-size: 0.85rem; margin-top: 6px; }
.capsule__list { display: flex; flex-direction: column; gap: 16px; }
.capsule__card { background: var(--surface); border-radius: 18px; padding: 16px; box-shadow: 0 4px 16px var(--shadow-pink); }
.capsule__card--locked { background: var(--surface-soft); }
.capsule__card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.capsule__icon { font-size: 1.3rem; }
.capsule__delete { background: none; border: none; color: var(--pink-deep); font-size: 1rem; }
.capsule__title { font-size: 1.05rem; margin-bottom: 6px; }
.capsule__lock-info { font-size: 0.85rem; color: var(--text-soft); }
.capsule__opened-date { font-size: 0.8rem; color: var(--text-soft); margin-bottom: 8px; }
.capsule__content { font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap; }
.capsule__fab { position: fixed; bottom: 28px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: var(--pink-deep); color: #fff; font-size: 1.8rem; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 8px 20px var(--shadow-pink); }
</style>