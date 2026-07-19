<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const title = ref('')
const content = ref('')
const openDate = ref('')
const isSaving = ref(false)
const error = ref<string | null>(null)

async function submit() {
  if (!title.value.trim() || !content.value.trim()) {
    error.value = 'Ajoute un titre et un contenu.'
    return
  }
  if (!openDate.value) {
    error.value = "Choisis une date d'ouverture."
    return
  }

  isSaving.value = true
  error.value = null

  try {
    await api.post('/time-capsules', {
      title: title.value,
      content: content.value,
      open_date: openDate.value,
    })

    router.push('/time-capsule')
  } catch (e) {
    error.value = "La date d'ouverture doit être dans le futur."
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="capsule-form">
    <header class="capsule-form__header">
      <router-link to="/time-capsule" class="capsule-form__back">←</router-link>
      <h1>Nouvelle capsule</h1>
    </header>

    <div class="capsule-form__field">
      <label>Titre</label>
      <input v-model="title" type="text" class="capsule-form__input" placeholder="Ex: Pour dans 1 an" />
    </div>

    <div class="capsule-form__field">
      <label>Date d'ouverture</label>
      <input v-model="openDate" type="date" class="capsule-form__input" />
    </div>

    <div class="capsule-form__field">
      <label>Ta lettre</label>
      <textarea
        v-model="content"
        class="capsule-form__textarea"
        rows="10"
        placeholder="Écris ce que tu veux dire dans le futur..."
      />
    </div>

    <p v-if="error" class="capsule-form__error">{{ error }}</p>

    <button class="capsule-form__submit" :disabled="isSaving" @click="submit">
      {{ isSaving ? 'Sauvegarde...' : 'Sceller la capsule' }}
    </button>
  </div>
</template>

<style scoped>
.capsule-form { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.capsule-form__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.capsule-form__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.capsule-form__field { margin-bottom: 20px; }
.capsule-form__field label { display: block; font-size: 0.85rem; color: var(--text-soft); margin-bottom: 8px; }
.capsule-form__input, .capsule-form__textarea { width: 100%; background: var(--surface-soft); border: none; border-radius: 12px; padding: 12px 14px; color: var(--text); font-size: 0.95rem; font-family: inherit; }
.capsule-form__textarea { resize: vertical; }
.capsule-form__error { color: #c0392b; font-size: 0.85rem; margin-bottom: 14px; }
.capsule-form__submit { width: 100%; background: var(--pink-deep); color: #fff; border: none; border-radius: 14px; padding: 14px; font-size: 1rem; font-weight: 600; }
.capsule-form__submit:disabled { opacity: 0.6; }
</style>