<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

interface Quiz {
  id: number
  title: string
  questions: unknown[]
}

const quizzes = ref<Quiz[]>([])
const isLoading = ref(true)

async function loadQuizzes() {
  isLoading.value = true
  try {
    const { data } = await api.get<Quiz[]>('/quizzes')
    quizzes.value = data
  } finally {
    isLoading.value = false
  }
}

async function deleteQuiz(id: number) {
  if (!confirm('Supprimer ce quiz ?')) return
  await api.delete(`/quizzes/${id}`)
  quizzes.value = quizzes.value.filter((q) => q.id !== id)
}

onMounted(loadQuizzes)
</script>

<template>
  <div class="quiz-list">
    <header class="quiz-list__header">
      <router-link to="/" class="quiz-list__back">←</router-link>
      <h1>Quiz</h1>
    </header>

    <div v-if="isLoading" class="quiz-list__loading">
      <div class="quiz-list__spinner" />
    </div>

    <div v-else-if="quizzes.length === 0" class="quiz-list__empty">
      <p>Aucun quiz créé.</p>
    </div>

    <div v-else class="quiz-list__list">
      <article v-for="q in quizzes" :key="q.id" class="quiz-list__card">
        <router-link :to="`/quiz/${q.id}/play`" class="quiz-list__card-main">
          <h3>{{ q.title }}</h3>
          <span class="quiz-list__count">{{ q.questions.length }} question(s)</span>
        </router-link>
        <button class="quiz-list__delete" @click="deleteQuiz(q.id)">✕</button>
      </article>
    </div>

    <router-link to="/quiz/new" class="quiz-list__fab" aria-label="Nouveau quiz">
      +
    </router-link>
  </div>
</template>

<style scoped>
.quiz-list { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.quiz-list__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.quiz-list__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.quiz-list__loading { display: flex; justify-content: center; padding: 60px 0; }
.quiz-list__spinner { width: 32px; height: 32px; border: 3px solid var(--pink-pale); border-top-color: var(--pink-deep); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.quiz-list__empty { text-align: center; padding: 80px 20px; color: var(--text-soft); }
.quiz-list__list { display: flex; flex-direction: column; gap: 14px; }
.quiz-list__card { background: var(--surface); border-radius: 18px; padding: 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 16px var(--shadow-pink); }
.quiz-list__card-main { color: var(--text); text-decoration: none; flex: 1; }
.quiz-list__card-main h3 { font-size: 1.05rem; margin-bottom: 4px; }
.quiz-list__count { font-size: 0.8rem; color: var(--text-soft); }
.quiz-list__delete { background: none; border: none; color: var(--pink-deep); font-size: 1rem; }
.quiz-list__fab { position: fixed; bottom: 28px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: var(--pink-deep); color: #fff; font-size: 1.8rem; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 8px 20px var(--shadow-pink); }
</style>