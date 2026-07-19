<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

interface QuestionForm {
  question: string
  choices: string[]
  correct_index: number
}

const title = ref('')
const questions = ref<QuestionForm[]>([{ question: '', choices: ['', ''], correct_index: 0 }])
const isSaving = ref(false)
const error = ref<string | null>(null)

function addQuestion() {
  questions.value.push({ question: '', choices: ['', ''], correct_index: 0 })
}

function removeQuestion(index: number) {
  questions.value.splice(index, 1)
}

function addChoice(qIndex: number) {
  questions.value[qIndex].choices.push('')
}

function removeChoice(qIndex: number, cIndex: number) {
  const q = questions.value[qIndex]
  if (q.choices.length <= 2) return
  q.choices.splice(cIndex, 1)
  if (q.correct_index >= q.choices.length) q.correct_index = 0
}

async function submit() {
  if (!title.value.trim()) {
    error.value = 'Donne un titre au quiz.'
    return
  }
  for (const q of questions.value) {
    if (!q.question.trim() || q.choices.some((c) => !c.trim())) {
      error.value = 'Complète toutes les questions et leurs choix.'
      return
    }
  }

  isSaving.value = true
  error.value = null

  try {
    await api.post('/quizzes', {
      title: title.value,
      questions: questions.value,
    })

    router.push('/quiz')
  } catch (e) {
    error.value = 'Une erreur est survenue, réessaie.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="quiz-form">
    <header class="quiz-form__header">
      <router-link to="/quiz" class="quiz-form__back">←</router-link>
      <h1>Nouveau quiz</h1>
    </header>

    <div class="quiz-form__field">
      <label>Titre du quiz</label>
      <input v-model="title" type="text" class="quiz-form__input" placeholder="Ex: Est-ce que tu me connais bien ?" />
    </div>

    <div v-for="(q, qIndex) in questions" :key="qIndex" class="quiz-form__question">
      <div class="quiz-form__question-header">
        <span>Question {{ qIndex + 1 }}</span>
        <button v-if="questions.length > 1" type="button" class="quiz-form__remove" @click="removeQuestion(qIndex)">✕</button>
      </div>

      <input v-model="q.question" type="text" class="quiz-form__input" placeholder="Ta question" />

      <div v-for="(choice, cIndex) in q.choices" :key="cIndex" class="quiz-form__choice">
        <input
          type="radio"
          :name="`correct-${qIndex}`"
          :checked="q.correct_index === cIndex"
          @change="q.correct_index = cIndex"
        />
        <input v-model="q.choices[cIndex]" type="text" class="quiz-form__input" :placeholder="`Choix ${cIndex + 1}`" />
        <button v-if="q.choices.length > 2" type="button" class="quiz-form__remove-choice" @click="removeChoice(qIndex, cIndex)">✕</button>
      </div>

      <button type="button" class="quiz-form__add-choice" @click="addChoice(qIndex)">+ Ajouter un choix</button>
    </div>

    <button type="button" class="quiz-form__add-question" @click="addQuestion">+ Ajouter une question</button>

    <p v-if="error" class="quiz-form__error">{{ error }}</p>

    <button class="quiz-form__submit" :disabled="isSaving" @click="submit">
      {{ isSaving ? 'Sauvegarde...' : 'Créer le quiz' }}
    </button>
  </div>
</template>

<style scoped>
.quiz-form { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.quiz-form__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.quiz-form__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.quiz-form__field { margin-bottom: 20px; }
.quiz-form__field label { display: block; font-size: 0.85rem; color: var(--text-soft); margin-bottom: 8px; }
.quiz-form__input { width: 100%; background: var(--surface-soft); border: none; border-radius: 12px; padding: 12px 14px; color: var(--text); font-size: 0.95rem; font-family: inherit; margin-bottom: 10px; }
.quiz-form__question { background: var(--surface); border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 16px var(--shadow-pink); }
.quiz-form__question-header { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-soft); margin-bottom: 10px; }
.quiz-form__remove { background: none; border: none; color: var(--pink-deep); }
.quiz-form__choice { display: flex; align-items: center; gap: 8px; }
.quiz-form__choice .quiz-form__input { margin-bottom: 8px; }
.quiz-form__remove-choice { background: none; border: none; color: var(--pink-deep); font-size: 0.85rem; }
.quiz-form__add-choice, .quiz-form__add-question { background: var(--surface-soft); border: none; border-radius: 10px; padding: 8px 12px; color: var(--text); font-size: 0.8rem; margin-bottom: 12px; }
.quiz-form__add-question { width: 100%; margin-bottom: 20px; }
.quiz-form__error { color: #c0392b; font-size: 0.85rem; margin-bottom: 14px; }
.quiz-form__submit { width: 100%; background: var(--pink-deep); color: #fff; border: none; border-radius: 14px; padding: 14px; font-size: 1rem; font-weight: 600; }
.quiz-form__submit:disabled { opacity: 0.6; }
</style>