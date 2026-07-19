<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

interface Reason {
  id: number
  content: string
  is_favorite: boolean
}

const dailyReason = ref<Reason | null>(null)
const reasons = ref<Reason[]>([])
const isLoading = ref(true)
const newContent = ref('')
const isAdding = ref(false)
const showAddForm = ref(false)

async function loadAll() {
  isLoading.value = true
  try {
    const [dailyRes, listRes] = await Promise.all([
      api.get<Reason>('/reasons/daily'),
      api.get<Reason[]>('/reasons'),
    ])
    dailyReason.value = dailyRes.data
    reasons.value = listRes.data
  } finally {
    isLoading.value = false
  }
}

async function addReason() {
  if (!newContent.value.trim()) return

  isAdding.value = true
  try {
    const { data } = await api.post<Reason>('/reasons', { content: newContent.value })
    reasons.value.unshift(data)
    newContent.value = ''
    showAddForm.value = false
  } finally {
    isAdding.value = false
  }
}

async function toggleFavorite(reason: Reason) {
  reason.is_favorite = !reason.is_favorite
  await api.put(`/reasons/${reason.id}`, { is_favorite: reason.is_favorite })
}

async function deleteReason(id: number) {
  reasons.value = reasons.value.filter((r) => r.id !== id)
  await api.delete(`/reasons/${id}`)
}

onMounted(loadAll)
</script>

<template>
  <div class="reasons">
    <header class="reasons__header">
      <router-link to="/" class="reasons__back">←</router-link>
      <h1>Pourquoi je t'aime</h1>
    </header>

    <div v-if="isLoading" class="reasons__loading">
      <div class="reasons__spinner" />
    </div>

    <template v-else>
      <div v-if="dailyReason" class="reasons__daily">
        <span class="reasons__daily-label">Raison du jour</span>
        <p class="reasons__daily-content">{{ dailyReason.content }}</p>
      </div>

      <div v-if="showAddForm" class="reasons__form">
        <textarea
          v-model="newContent"
          rows="3"
          placeholder="Parce que tu..."
          class="reasons__textarea"
        />
        <div class="reasons__form-actions">
          <button class="reasons__btn reasons__btn--ghost" @click="showAddForm = false">
            Annuler
          </button>
          <button
            class="reasons__btn reasons__btn--primary"
            :disabled="isAdding || !newContent.trim()"
            @click="addReason"
          >
            {{ isAdding ? 'Ajout...' : 'Ajouter' }}
          </button>
        </div>
      </div>

      <div v-if="reasons.length === 0" class="reasons__empty">
        <p>Aucune raison pour l'instant.</p>
        <p class="reasons__empty-sub">Ajoute la première ci-dessous.</p>
      </div>

      <div v-else class="reasons__list">
        <div v-for="reason in reasons" :key="reason.id" class="reasons__card">
          <p class="reasons__card-content">{{ reason.content }}</p>
          <div class="reasons__card-actions">
            <button
              class="reasons__icon-btn"
              :class="{ 'reasons__icon-btn--active': reason.is_favorite }"
              @click="toggleFavorite(reason)"
            >
              ★
            </button>
            <button class="reasons__icon-btn" @click="deleteReason(reason.id)">
              🗑
            </button>
          </div>
        </div>
      </div>
    </template>

    <button
      v-if="!showAddForm"
      class="reasons__fab"
      aria-label="Ajouter une raison"
      @click="showAddForm = true"
    >
      +
    </button>
  </div>
</template>

<style scoped>
.reasons { min-height: 100vh; padding: 24px 20px 80px; background: var(--bg); color: var(--text); }
.reasons__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.reasons__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.reasons__loading { display: flex; justify-content: center; padding: 60px 0; }
.reasons__spinner { width: 32px; height: 32px; border: 3px solid var(--pink-pale); border-top-color: var(--pink-deep); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.reasons__daily { background: linear-gradient(135deg, var(--pink-deep), #c9819e); border-radius: 20px; padding: 24px; margin-bottom: 24px; box-shadow: 0 12px 30px var(--shadow-pink); }
.reasons__daily-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.85); font-weight: 700; }
.reasons__daily-content { font-size: 1.15rem; font-weight: 600; line-height: 1.5; margin-top: 8px; color: #fff; }
.reasons__form { background: var(--surface); border-radius: 16px; padding: 16px; margin-bottom: 20px; box-shadow: 0 4px 16px var(--shadow-pink); }
.reasons__textarea { width: 100%; background: var(--surface-soft); border: 1px solid var(--pink-pale); border-radius: 12px; padding: 12px; color: var(--text); font-family: inherit; font-size: 0.9rem; resize: none; }
.reasons__form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }
.reasons__btn { border: none; border-radius: 12px; padding: 10px 18px; font-weight: 600; font-size: 0.85rem; }
.reasons__btn--ghost { background: transparent; color: var(--text-soft); }
.reasons__btn--primary { background: var(--pink-deep); color: #fff; }
.reasons__btn--primary:disabled { opacity: 0.5; }
.reasons__empty { text-align: center; padding: 60px 20px; color: var(--text-soft); }
.reasons__empty-sub { font-size: 0.85rem; margin-top: 6px; }
.reasons__list { display: flex; flex-direction: column; gap: 12px; }
.reasons__card { background: var(--surface); border-radius: 16px; padding: 16px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; box-shadow: 0 4px 16px var(--shadow-pink); }
.reasons__card-content { font-size: 0.9rem; line-height: 1.5; flex: 1; }
.reasons__card-actions { display: flex; gap: 8px; flex-shrink: 0; }
.reasons__icon-btn { background: var(--surface-soft); border: none; border-radius: 10px; width: 34px; height: 34px; color: var(--text-soft); font-size: 0.95rem; }
.reasons__icon-btn--active { color: #c9a227; }
.reasons__fab { position: fixed; bottom: 28px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: var(--pink-deep); color: #fff; font-size: 1.8rem; border: none; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px var(--shadow-pink); }
</style>