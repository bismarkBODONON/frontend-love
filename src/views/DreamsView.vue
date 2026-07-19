<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

interface Dream {
  id: number
  title: string
  description: string | null
  category: string
  target_date: string | null
  is_achieved: boolean
  image: string | null
}

const dreams = ref<Dream[]>([])
const isLoading = ref(true)
const showAddForm = ref(false)
const isAdding = ref(false)

const newTitle = ref('')
const newDescription = ref('')
const newCategory = ref('autre')
const newTargetDate = ref('')

const storageBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api').replace(/\/api\/?$/, '')

function imageUrl(path: string) {
  return `${storageBaseUrl}/storage/${path}`
}

const categoryLabels: Record<string, string> = {
  voyage: '✈️ Voyage',
  maison: '🏡 Maison',
  projet: '🎯 Projet',
  autre: '💫 Autre',
}

const pending = computed(() => dreams.value.filter((d) => !d.is_achieved))
const achieved = computed(() => dreams.value.filter((d) => d.is_achieved))

async function loadDreams() {
  isLoading.value = true
  try {
    const { data } = await api.get<Dream[]>('/dreams')
    dreams.value = data
  } finally {
    isLoading.value = false
  }
}

async function addDream() {
  if (!newTitle.value.trim()) return

  isAdding.value = true
  try {
    const { data } = await api.post<Dream>('/dreams', {
      title: newTitle.value,
      description: newDescription.value || null,
      category: newCategory.value,
      target_date: newTargetDate.value || null,
    })
    dreams.value.push(data)
    newTitle.value = ''
    newDescription.value = ''
    newCategory.value = 'autre'
    newTargetDate.value = ''
    showAddForm.value = false
  } finally {
    isAdding.value = false
  }
}

async function toggleAchieved(dream: Dream) {
  dream.is_achieved = !dream.is_achieved
  await api.put(`/dreams/${dream.id}`, { is_achieved: dream.is_achieved })
}

async function deleteDream(id: number) {
  dreams.value = dreams.value.filter((d) => d.id !== id)
  await api.delete(`/dreams/${id}`)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

onMounted(loadDreams)
</script>

<template>
  <div class="dreams">
    <header class="dreams__header">
      <router-link to="/" class="dreams__back">←</router-link>
      <h1>Nos rêves</h1>
    </header>

    <div v-if="isLoading" class="dreams__loading">
      <div class="dreams__spinner" />
    </div>

    <template v-else>
      <div v-if="showAddForm" class="dreams__form">
        <input v-model="newTitle" type="text" placeholder="Titre du rêve" class="dreams__input" />
        <textarea
          v-model="newDescription"
          rows="3"
          placeholder="Décrivez ce rêve..."
          class="dreams__textarea"
        />
        <div class="dreams__form-row">
          <select v-model="newCategory" class="dreams__select">
            <option value="voyage">✈️ Voyage</option>
            <option value="maison">🏡 Maison</option>
            <option value="projet">🎯 Projet</option>
            <option value="autre">💫 Autre</option>
          </select>
          <input v-model="newTargetDate" type="date" class="dreams__input" />
        </div>
        <div class="dreams__form-actions">
          <button class="dreams__btn dreams__btn--ghost" @click="showAddForm = false">
            Annuler
          </button>
          <button
            class="dreams__btn dreams__btn--primary"
            :disabled="isAdding || !newTitle.trim()"
            @click="addDream"
          >
            {{ isAdding ? 'Ajout...' : 'Ajouter' }}
          </button>
        </div>
      </div>

      <div v-if="dreams.length === 0" class="dreams__empty">
        <p>Aucun rêve pour l'instant.</p>
        <p class="dreams__empty-sub">Ajoutez votre premier projet ensemble.</p>
      </div>

      <template v-else>
        <section v-if="pending.length" class="dreams__section">
          <h2 class="dreams__section-title">À réaliser</h2>
          <div class="dreams__list">
            <div v-for="dream in pending" :key="dream.id" class="dreams__card">
              <img v-if="dream.image" :src="imageUrl(dream.image)" class="dreams__card-image" alt="" />
              <div class="dreams__card-body">
                <div class="dreams__card-header">
                  <span class="dreams__card-category">{{ categoryLabels[dream.category] }}</span>
                  <button class="dreams__icon-btn" @click="deleteDream(dream.id)">🗑</button>
                </div>
                <h3 class="dreams__card-title">{{ dream.title }}</h3>
                <p v-if="dream.description" class="dreams__card-description">{{ dream.description }}</p>
                <p v-if="dream.target_date" class="dreams__card-date">
                  🗓 {{ formatDate(dream.target_date) }}
                </p>
                <button class="dreams__achieve-btn" @click="toggleAchieved(dream)">
                  Marquer comme réalisé ✓
                </button>
              </div>
            </div>
          </div>
        </section>

        <section v-if="achieved.length" class="dreams__section">
          <h2 class="dreams__section-title">Réalisés ✓</h2>
          <div class="dreams__list">
            <div v-for="dream in achieved" :key="dream.id" class="dreams__card dreams__card--achieved">
              <img v-if="dream.image" :src="imageUrl(dream.image)" class="dreams__card-image" alt="" />
              <div class="dreams__card-body">
                <div class="dreams__card-header">
                  <span class="dreams__card-category">{{ categoryLabels[dream.category] }}</span>
                  <button class="dreams__icon-btn" @click="deleteDream(dream.id)">🗑</button>
                </div>
                <h3 class="dreams__card-title">{{ dream.title }}</h3>
                <button class="dreams__achieve-btn dreams__achieve-btn--undo" @click="toggleAchieved(dream)">
                  Remettre en cours
                </button>
              </div>
            </div>
          </div>
        </section>
      </template>
    </template>

    <button
      v-if="!showAddForm"
      class="dreams__fab"
      aria-label="Ajouter un rêve"
      @click="showAddForm = true"
    >
      +
    </button>
  </div>
</template>

<style scoped>
.dreams { min-height: 100vh; padding: 24px 20px 80px; background: var(--bg); color: var(--text); }
.dreams__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.dreams__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.dreams__loading { display: flex; justify-content: center; padding: 60px 0; }
.dreams__spinner { width: 32px; height: 32px; border: 3px solid var(--pink-pale); border-top-color: var(--pink-deep); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.dreams__form { background: var(--surface); border-radius: 16px; padding: 16px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 4px 16px var(--shadow-pink); }
.dreams__input, .dreams__textarea, .dreams__select { background: var(--surface-soft); border: 1px solid var(--pink-pale); border-radius: 12px; padding: 10px 14px; color: var(--text); font-size: 0.9rem; font-family: inherit; }
.dreams__textarea { resize: none; }
.dreams__form-row { display: flex; gap: 10px; }
.dreams__form-row .dreams__input, .dreams__form-row .dreams__select { flex: 1; }
.dreams__form-actions { display: flex; justify-content: flex-end; gap: 10px; }
.dreams__btn { border: none; border-radius: 12px; padding: 10px 18px; font-weight: 600; font-size: 0.85rem; }
.dreams__btn--ghost { background: transparent; color: var(--text-soft); }
.dreams__btn--primary { background: var(--pink-deep); color: #fff; }
.dreams__btn--primary:disabled { opacity: 0.5; }
.dreams__empty { text-align: center; padding: 60px 20px; color: var(--text-soft); }
.dreams__empty-sub { font-size: 0.85rem; margin-top: 6px; }
.dreams__section { margin-bottom: 28px; }
.dreams__section-title { font-size: 0.9rem; color: var(--text-soft); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
.dreams__list { display: flex; flex-direction: column; gap: 14px; }
.dreams__card { background: var(--surface); border-radius: 18px; overflow: hidden; box-shadow: 0 4px 16px var(--shadow-pink); }
.dreams__card--achieved { opacity: 0.65; }
.dreams__card-image { width: 100%; height: 140px; object-fit: cover; }
.dreams__card-body { padding: 16px; }
.dreams__card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.dreams__card-category { font-size: 0.75rem; color: var(--text-soft); }
.dreams__icon-btn { background: var(--surface-soft); border: none; border-radius: 10px; width: 30px; height: 30px; color: var(--text-soft); font-size: 0.85rem; }
.dreams__card-title { font-size: 1.05rem; font-weight: 700; margin-bottom: 6px; }
.dreams__card-description { font-size: 0.85rem; opacity: 0.85; line-height: 1.5; margin-bottom: 8px; }
.dreams__card-date { font-size: 0.8rem; color: var(--text-soft); margin-bottom: 12px; }
.dreams__achieve-btn { background: var(--surface-soft); color: var(--pink-deep); border: 1px solid var(--pink-pale); border-radius: 10px; padding: 8px 14px; font-size: 0.8rem; font-weight: 600; }
.dreams__achieve-btn--undo { background: var(--surface); color: var(--text-soft); border-color: var(--pink-pale); }
.dreams__fab { position: fixed; bottom: 28px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: var(--pink-deep); color: #fff; font-size: 1.8rem; border: none; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px var(--shadow-pink); }
</style>