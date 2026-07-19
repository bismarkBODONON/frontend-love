<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const title = ref('')
const description = ref('')
const eventDate = ref('')
const location = ref('')
const isFavorite = ref(false)
const photoFiles = ref<File[]>([])
const isSubmitting = ref(false)
const errorMessage = ref('')

function handlePhotoChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    photoFiles.value = Array.from(input.files)
  }
}

async function submit() {
  errorMessage.value = ''

  if (!title.value || !eventDate.value) {
    errorMessage.value = 'Le titre et la date sont obligatoires.'
    return
  }

  isSubmitting.value = true
  try {
    const formData = new FormData()
    formData.append('title', title.value)
    formData.append('description', description.value)
    formData.append('event_date', eventDate.value)
    formData.append('location', location.value)
    formData.append('is_favorite', isFavorite.value ? '1' : '0')

    photoFiles.value.forEach((file) => {
      formData.append('photos[]', file)
    })

    await api.post('/timeline', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    router.push({ name: 'timeline' })
  } catch (err: any) {
    const validationErrors = err.response?.data?.errors
    if (validationErrors && typeof validationErrors === 'object') {
      const errors = Object.values(validationErrors)
      errorMessage.value = errors.length > 0 && Array.isArray(errors[0]) 
        ? errors[0][0] 
        : 'Une erreur est survenue. Réessaie.'
    } else {
      errorMessage.value = err.response?.data?.message || 'Une erreur est survenue. Réessaie.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="form-page">
    <header class="form-page__header">
      <router-link to="/timeline" class="form-page__back">←</router-link>
      <h1>Nouveau souvenir</h1>
    </header>

    <form class="form" @submit.prevent="submit">
      <label class="form__field">
        <span>Titre *</span>
        <input v-model="title" type="text" placeholder="Notre premier rendez-vous" />
      </label>

      <label class="form__field">
        <span>Date *</span>
        <input v-model="eventDate" type="date" />
      </label>

      <label class="form__field">
        <span>Lieu</span>
        <input v-model="location" type="text" placeholder="Cotonou" />
      </label>

      <label class="form__field">
        <span>Description</span>
        <textarea v-model="description" rows="4" placeholder="Racontez ce moment..." />
      </label>

      <label class="form__field">
        <span>Photos</span>
        <input type="file" accept="image/*" multiple @change="handlePhotoChange" />
      </label>

      <label class="form__checkbox">
        <input v-model="isFavorite" type="checkbox" />
        <span>Marquer comme favori ★</span>
      </label>

      <p v-if="errorMessage" class="form__error">{{ errorMessage }}</p>

      <button type="submit" class="form__submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer ce souvenir' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.form-page { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.form-page__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.form-page__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.form { display: flex; flex-direction: column; gap: 18px; }
.form__field { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: var(--text-soft); }
.form__field input, .form__field textarea { background: var(--surface-soft); border: 1px solid var(--pink-pale); border-radius: 12px; padding: 10px 14px; color: var(--text); font-size: 0.95rem; font-family: inherit; }
.form__checkbox { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
.form__error { color: #c0392b; font-size: 0.85rem; }
.form__submit { background: var(--pink-deep); color: #fff; border: none; border-radius: 14px; padding: 14px; font-weight: 700; font-size: 0.95rem; margin-top: 8px; }
.form__submit:disabled { opacity: 0.6; }
</style>