<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import EnvelopeLetter from '@/components/EnvelopeLetter.vue'

interface Letter {
  id: number
  title: string
  content: string
  category: string
  is_favorite: boolean
  written_at: string
}

const letters = ref<Letter[]>([])
const isLoading = ref(true)

async function loadLetters() {
  isLoading.value = true
  try {
    const { data } = await api.get<Letter[]>('/love-letters')
    letters.value = data
  } finally {
    isLoading.value = false
  }
}

onMounted(loadLetters)
</script>

<template>
  <div class="letters">
    <header class="letters__header">
      <router-link to="/" class="letters__back">←</router-link>
      <h1>Lettres d'amour</h1>
    </header>

    <div v-if="isLoading" class="letters__loading">Chargement...</div>

    <div v-else-if="letters.length === 0" class="letters__empty">
      <p>Aucune lettre pour l'instant.</p>
    </div>

    <div v-else class="letters__list">
      <EnvelopeLetter v-for="letter in letters" :key="letter.id" :letter="letter" />
    </div>
  </div>
</template>

<style scoped>
.letters { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.letters__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.letters__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.letters__loading, .letters__empty { text-align: center; padding: 60px 20px; color: var(--text-soft); }
</style>