<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

interface Question {
  question: string
  choices: string[]
  correct_index: number
}

interface Quiz {
  id: number
  title: string
  questions: Question[]
}

const route = useRoute()
const quiz = ref<Quiz | null>(null)
const isLoading = ref(true)
const currentIndex = ref(0)
const answers = ref<number[]>([])
const result = ref<{ score: number; total: number; percentage: number } | null>(null)

const currentQuestion = computed(() => quiz.value?.questions[currentIndex.value] ?? null)
const isLastQuestion = computed(() => quiz.value ? currentIndex.value === quiz.value.questions.length - 1 : false)

async function loadQuiz() {
  isLoading.value = true
  const { data } = await api.get<Quiz>(`/quizzes/${route.params.id}`)
  quiz.value = data
  answers.value = new Array(data.questions.length).fill(null)
  isLoading.value = false
}

function selectAnswer(choiceIndex: number) {
  answers.value[currentIndex.value] = choiceIndex
}

function next() {
  if (isLastQuestion.value) {
    submitQuiz()
  } else {
    currentIndex.value++
  }
}

async function submitQuiz() {
  if (!quiz.value) return
  const { data } = await api.post(`/quizzes/${quiz.value.id}/submit`, {
    answers: answers.value,
  })
  result.value = data
}

function restart() {
  currentIndex.value = 0
  answers.value = new Array(quiz.value?.questions.length ?? 0).fill(null)
  result.value = null
}

onMounted(loadQuiz)
</script>

<template>
  <div class="quiz-play">
    <header class="quiz-play__header">
      <router-link to="/quiz" class="quiz-play__back">←</router-link>
      <h1>{{ quiz?.title ?? 'Quiz' }}</h1>
    </header>

    <div v-if="isLoading" class="quiz-play__loading">
      <div class="quiz-play__spinner" />
    </div>

    <div v-else-if="result" class="quiz-play__result quiz-play__result--enter">
      <div class="quiz-play__result-emoji">
        {{ result.percentage >= 80 ? '🏆' : result.percentage >= 50 ? '🎉' : '💛' }}
      </div>
      <h2 class="quiz-play__result-score">{{ result.score }} / {{ result.total }}</h2>
      <p class="quiz-play__result-percentage">{{ result.percentage }}% de bonnes réponses</p>
      <button class="quiz-play__restart" @click="restart">Recommencer</button>
    </div>

    <div v-else-if="currentQuestion" class="quiz-play__question">
      <p class="quiz-play__progress">Question {{ currentIndex + 1 }} / {{ quiz!.questions.length }}</p>
      <h2 class="quiz-play__question-text">{{ currentQuestion.question }}</h2>

      <div class="quiz-play__choices">
        <button
          v-for="(choice, i) in currentQuestion.choices"
          :key="i"
          class="quiz-play__choice"
          :class="{ 'quiz-play__choice--selected': answers[currentIndex] === i }"
          @click="selectAnswer(i)"
        >
          {{ choice }}
        </button>
      </div>

      <button
        class="quiz-play__next"
        :disabled="answers[currentIndex] === null || answers[currentIndex] === undefined"
        @click="next"
      >
        {{ isLastQuestion ? 'Terminer' : 'Suivant' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.quiz-play { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.quiz-play__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.quiz-play__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.quiz-play__loading { display: flex; justify-content: center; padding: 60px 0; }
.quiz-play__spinner { width: 32px; height: 32px; border: 3px solid var(--pink-pale); border-top-color: var(--pink-deep); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.quiz-play__progress { font-size: 0.8rem; color: var(--text-soft); margin-bottom: 10px; }
.quiz-play__question-text { font-size: 1.2rem; margin-bottom: 24px; }
.quiz-play__choices { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.quiz-play__choice { background: var(--surface); border: 2px solid transparent; border-radius: 14px; padding: 14px; color: var(--text); text-align: left; font-size: 0.95rem; box-shadow: 0 4px 16px var(--shadow-pink); }
.quiz-play__choice--selected { border-color: var(--pink-deep); background: rgba(228, 98, 155, 0.12); }
.quiz-play__next { width: 100%; background: var(--pink-deep); color: #fff; border: none; border-radius: 14px; padding: 14px; font-size: 1rem; font-weight: 600; }
.quiz-play__next:disabled { opacity: 0.4; }
.quiz-play__result { text-align: center; padding: 60px 20px; }
.quiz-play__result--enter { animation: popIn 0.5s ease; }
@keyframes popIn { 0% { transform: scale(0.6); opacity: 0; } 70% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
.quiz-play__result-emoji { font-size: 4rem; margin-bottom: 16px; }
.quiz-play__result-score { font-size: 2rem; margin-bottom: 8px; }
.quiz-play__result-percentage { color: var(--text-soft); margin-bottom: 28px; }
.quiz-play__restart { background: var(--surface); color: var(--text); border: 1px solid var(--pink-pale); border-radius: 14px; padding: 12px 24px; font-size: 0.95rem; font-weight: 600; }
</style>