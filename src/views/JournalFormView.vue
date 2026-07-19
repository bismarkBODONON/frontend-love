<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const content = ref('')
const entryDate = ref(new Date().toISOString().slice(0, 10))
const mood = ref<string | null>(null)
const photoFile = ref<File | null>(null)
const photoPreview = ref<string | null>(null)
const isSaving = ref(false)
const error = ref<string | null>(null)

const moods = ['😊', '🥰', '😢', '😤', '😴', '🤔']

function onPhotoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  photoFile.value = file
  photoPreview.value = URL.createObjectURL(file)
}

function selectMood(m: string) {
  mood.value = mood.value === m ? null : m
}

async function submit() {
  if (!content.value.trim()) {
    error.value = 'Écris quelque chose avant de sauvegarder.'
    return
  }

  isSaving.value = true
  error.value = null

  try {
    const formData = new FormData()
    formData.append('content', content.value)
    formData.append('entry_date', entryDate.value)
    if (mood.value) formData.append('mood', mood.value)
    if (photoFile.value) formData.append('photo', photoFile.value)

    await api.post('/journal', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    router.push('/journal')
  } catch (e) {
    error.value = 'Une erreur est survenue, réessaie.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="journal-form">
    <header class="journal-form__header">
      <router-link to="/journal" class="journal-form__back">←</router-link>
      <h1>Nouvelle entrée</h1>
    </header>

    <div class="journal-form__field">
      <label>Date</label>
      <input v-model="entryDate" type="date" class="journal-form__input" />
    </div>

    <div class="journal-form__field">
      <label>Humeur</label>
      <div class="journal-form__moods">
        <button
          v-for="m in moods"
          :key="m"
          type="button"
          class="journal-form__mood-btn"
          :class="{ 'journal-form__mood-btn--active': mood === m }"
          @click="selectMood(m)"
        >
          {{ m }}
        </button>
      </div>
    </div>

    <div class="journal-form__field">
      <label>Photo (optionnel)</label>
      <input type="file" accept="image/*" @change="onPhotoChange" />
      <img v-if="photoPreview" :src="photoPreview" class="journal-form__preview" alt="" />
    </div>

    <div class="journal-form__field">
      <label>Ton texte</label>
      <textarea
        v-model="content"
        class="journal-form__textarea"
        rows="8"
        placeholder="Écris ce que tu ressens aujourd'hui..."
      />
    </div>

    <p v-if="error" class="journal-form__error">{{ error }}</p>

    <button class="journal-form__submit" :disabled="isSaving" @click="submit">
      {{ isSaving ? 'Sauvegarde...' : 'Sauvegarder' }}
    </button>
  </div>
</template>

<style scoped>
.journal-form { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.journal-form__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.journal-form__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.journal-form__field { margin-bottom: 20px; }
.journal-form__field label { display: block; font-size: 0.85rem; color: var(--text-soft); margin-bottom: 8px; }
.journal-form__input, .journal-form__textarea { width: 100%; background: var(--surface-soft); border: none; border-radius: 12px; padding: 12px 14px; color: var(--text); font-size: 0.95rem; font-family: inherit; }
.journal-form__textarea { resize: vertical; }
.journal-form__moods { display: flex; gap: 10px; flex-wrap: wrap; }
.journal-form__mood-btn { font-size: 1.4rem; background: var(--surface-soft); border: 2px solid transparent; border-radius: 12px; padding: 8px 12px; }
.journal-form__mood-btn--active { border-color: var(--pink-deep); background: rgba(228, 98, 155, 0.12); }
.journal-form__preview { margin-top: 12px; width: 100%; max-height: 220px; object-fit: cover; border-radius: 12px; }
.journal-form__error { color: #c0392b; font-size: 0.85rem; margin-bottom: 14px; }
.journal-form__submit { width: 100%; background: var(--pink-deep); color: #fff; border: none; border-radius: 14px; padding: 14px; font-size: 1rem; font-weight: 600; }
.journal-form__submit:disabled { opacity: 0.6; }
</style>