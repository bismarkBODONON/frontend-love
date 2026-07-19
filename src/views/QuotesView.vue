<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

interface Quote {
  id: number
  content: string
  author: string | null
  is_favorite: boolean
}

const dailyQuote = ref<Quote | null>(null)
const quotes = ref<Quote[]>([])
const isLoading = ref(true)
const newContent = ref('')
const newAuthor = ref('')
const isAdding = ref(false)
const showAddForm = ref(false)

async function loadAll() {
  isLoading.value = true
  try {
    const [dailyRes, listRes] = await Promise.all([
      api.get<Quote>('/quotes/daily'),
      api.get<Quote[]>('/quotes'),
    ])
    dailyQuote.value = dailyRes.data
    quotes.value = listRes.data
  } finally {
    isLoading.value = false
  }
}

async function addQuote() {
  if (!newContent.value.trim()) return

  isAdding.value = true
  try {
    const { data } = await api.post<Quote>('/quotes', {
      content: newContent.value,
      author: newAuthor.value || null,
    })
    quotes.value.unshift(data)
    newContent.value = ''
    newAuthor.value = ''
    showAddForm.value = false
  } finally {
    isAdding.value = false
  }
}

async function toggleFavorite(quote: Quote) {
  quote.is_favorite = !quote.is_favorite
  await api.put(`/quotes/${quote.id}`, { is_favorite: quote.is_favorite })
}

async function deleteQuote(id: number) {
  quotes.value = quotes.value.filter((q) => q.id !== id)
  await api.delete(`/quotes/${id}`)
}

onMounted(loadAll)
</script>

<template>
  <div class="quotes">
    <header class="quotes__header">
      <router-link to="/" class="quotes__back">←</router-link>
      <h1>Citations du jour</h1>
    </header>

    <div v-if="isLoading" class="quotes__loading">
      <div class="quotes__spinner" />
    </div>

    <template v-else>
      <div v-if="dailyQuote" class="quotes__daily">
        <span class="quotes__daily-label">Citation du jour</span>
        <p class="quotes__daily-content">"{{ dailyQuote.content }}"</p>
        <p v-if="dailyQuote.author" class="quotes__daily-author">— {{ dailyQuote.author }}</p>
      </div>

      <div v-if="showAddForm" class="quotes__form">
        <textarea
          v-model="newContent"
          rows="3"
          placeholder="Écris une citation..."
          class="quotes__textarea"
        />
        <input v-model="newAuthor" type="text" placeholder="Auteur (optionnel)" class="quotes__input" />
        <div class="quotes__form-actions">
          <button class="quotes__btn quotes__btn--ghost" @click="showAddForm = false">
            Annuler
          </button>
          <button
            class="quotes__btn quotes__btn--primary"
            :disabled="isAdding || !newContent.trim()"
            @click="addQuote"
          >
            {{ isAdding ? 'Ajout...' : 'Ajouter' }}
          </button>
        </div>
      </div>

      <div v-if="quotes.length === 0" class="quotes__empty">
        <p>Aucune citation pour l'instant.</p>
        <p class="quotes__empty-sub">Ajoute la première ci-dessous.</p>
      </div>

      <div v-else class="quotes__list">
        <div v-for="quote in quotes" :key="quote.id" class="quotes__card">
          <div class="quotes__card-body">
            <p class="quotes__card-content">"{{ quote.content }}"</p>
            <p v-if="quote.author" class="quotes__card-author">— {{ quote.author }}</p>
          </div>
          <div class="quotes__card-actions">
            <button
              class="quotes__icon-btn"
              :class="{ 'quotes__icon-btn--active': quote.is_favorite }"
              @click="toggleFavorite(quote)"
            >
              ★
            </button>
            <button class="quotes__icon-btn" @click="deleteQuote(quote.id)">
              🗑
            </button>
          </div>
        </div>
      </div>
    </template>

    <button
      v-if="!showAddForm"
      class="quotes__fab"
      aria-label="Ajouter une citation"
      @click="showAddForm = true"
    >
      +
    </button>
  </div>
</template>

<style scoped>
.quotes { min-height: 100vh; padding: 24px 20px 80px; background: var(--bg); color: var(--text); }
.quotes__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.quotes__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.quotes__loading { display: flex; justify-content: center; padding: 60px 0; }
.quotes__spinner { width: 32px; height: 32px; border: 3px solid var(--pink-pale); border-top-color: var(--pink-deep); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.quotes__daily { background: linear-gradient(135deg, var(--pink-deep), #c9819e); border-radius: 20px; padding: 24px; margin-bottom: 24px; box-shadow: 0 12px 30px var(--shadow-pink); }
.quotes__daily-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.85); font-weight: 700; }
.quotes__daily-content { font-size: 1.1rem; font-weight: 600; line-height: 1.5; margin-top: 10px; font-style: italic; color: #fff; }
.quotes__daily-author { font-size: 0.85rem; color: rgba(255,255,255,0.85); margin-top: 8px; }
.quotes__form { background: var(--surface); border-radius: 16px; padding: 16px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 4px 16px var(--shadow-pink); }
.quotes__textarea, .quotes__input { background: var(--surface-soft); border: 1px solid var(--pink-pale); border-radius: 12px; padding: 12px; color: var(--text); font-family: inherit; font-size: 0.9rem; resize: none; }
.quotes__form-actions { display: flex; justify-content: flex-end; gap: 10px; }
.quotes__btn { border: none; border-radius: 12px; padding: 10px 18px; font-weight: 600; font-size: 0.85rem; }
.quotes__btn--ghost { background: transparent; color: var(--text-soft); }
.quotes__btn--primary { background: var(--pink-deep); color: #fff; }
.quotes__btn--primary:disabled { opacity: 0.5; }
.quotes__empty { text-align: center; padding: 60px 20px; color: var(--text-soft); }
.quotes__empty-sub { font-size: 0.85rem; margin-top: 6px; }
.quotes__list { display: flex; flex-direction: column; gap: 12px; }
.quotes__card { background: var(--surface); border-radius: 16px; padding: 16px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; box-shadow: 0 4px 16px var(--shadow-pink); }
.quotes__card-body { flex: 1; }
.quotes__card-content { font-size: 0.9rem; line-height: 1.5; font-style: italic; }
.quotes__card-author { font-size: 0.8rem; color: var(--text-soft); margin-top: 6px; }
.quotes__card-actions { display: flex; gap: 8px; flex-shrink: 0; }
.quotes__icon-btn { background: var(--surface-soft); border: none; border-radius: 10px; width: 34px; height: 34px; color: var(--text-soft); font-size: 0.95rem; }
.quotes__icon-btn--active { color: #c9a227; }
.quotes__fab { position: fixed; bottom: 28px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: var(--pink-deep); color: #fff; font-size: 1.8rem; border: none; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px var(--shadow-pink); }
</style>