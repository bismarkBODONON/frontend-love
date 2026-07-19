<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'
import api from '@/services/api'

const router = useRouter()
const store = useMusicStore()

const title = ref('')
const artist = ref('')
const lyrics = ref('')
const coverFile = ref<File | null>(null)
const audioFile = ref<File | null>(null)
const coverPreview = ref<string | null>(null)

const isSubmitting = ref(false)
const errorMessage = ref('')

function onCoverChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  coverFile.value = file
  coverPreview.value = file ? URL.createObjectURL(file) : null
}

function onAudioChange(event: Event) {
  audioFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

async function submit() {
  errorMessage.value = ''

  if (!title.value.trim()) {
    errorMessage.value = 'Le titre est obligatoire.'
    return
  }
  if (!audioFile.value) {
    errorMessage.value = 'Le fichier audio est obligatoire.'
    return
  }

  const formData = new FormData()
  formData.append('title', title.value.trim())
  if (artist.value.trim()) formData.append('artist', artist.value.trim())
  if (lyrics.value.trim()) formData.append('lyrics', lyrics.value.trim())
  if (coverFile.value) formData.append('cover', coverFile.value)
  formData.append('audio', audioFile.value)

  isSubmitting.value = true
  try {
    await api.post('/musics', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    await store.loadTracks()
    router.push('/music')
  } catch (error) {
    errorMessage.value = "Une erreur est survenue pendant l'envoi. Réessaie."
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="music-form">
    <header class="music-form__header">
      <button class="music-form__back" @click="router.back()">←</button>
      <h1>Ajouter une chanson</h1>
    </header>

    <div class="music-form__cover-picker">
      <label for="cover-input" class="music-form__cover" :style="coverPreview ? `background-image: url(${coverPreview})` : ''">
        <span v-if="!coverPreview">🎵<br />Ajouter une cover</span>
      </label>
      <input id="cover-input" type="file" accept="image/*" class="music-form__hidden-input" @change="onCoverChange" />
    </div>

    <div class="music-form__field">
      <label>Titre *</label>
      <input v-model="title" type="text" placeholder="Titre de la chanson" />
    </div>

    <div class="music-form__field">
      <label>Artiste</label>
      <input v-model="artist" type="text" placeholder="Nom de l'artiste" />
    </div>

    <div class="music-form__field">
      <label>Fichier audio *</label>
      <input type="file" accept="audio/*" @change="onAudioChange" class="music-form__file-input" />
      <p v-if="audioFile" class="music-form__file-name">{{ audioFile.name }}</p>
    </div>

    <div class="music-form__field">
      <label>Paroles</label>
      <textarea v-model="lyrics" rows="6" placeholder="Colle les paroles ici (optionnel)"></textarea>
    </div>

    <p v-if="errorMessage" class="music-form__error">{{ errorMessage }}</p>

    <button class="music-form__submit" :disabled="isSubmitting" @click="submit">
      {{ isSubmitting ? 'Envoi en cours...' : 'Ajouter la chanson' }}
    </button>
  </div>
</template>

<style scoped>
.music-form { min-height: 100vh; padding: 20px 20px 60px; background: var(--bg); color: var(--text); }
.music-form__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.music-form__back { background: var(--surface-soft); border: none; color: var(--text); width: 36px; height: 36px; border-radius: 50%; font-size: 1.1rem; }
.music-form__header h1 { font-size: 1.2rem; font-weight: 700; }
.music-form__cover-picker { display: flex; justify-content: center; margin-bottom: 24px; }
.music-form__cover { width: 140px; height: 140px; border-radius: 20px; background: var(--surface-soft); border: 1px dashed var(--pink-pale); display: flex; align-items: center; justify-content: center; text-align: center; font-size: 0.75rem; color: var(--text-soft); background-size: cover; background-position: center; cursor: pointer; }
.music-form__hidden-input { display: none; }
.music-form__field { margin-bottom: 18px; }
.music-form__field label { display: block; font-size: 0.78rem; color: var(--text-soft); margin-bottom: 6px; }
.music-form__field input[type='text'], .music-form__field textarea { width: 100%; background: var(--surface-soft); border: 1px solid var(--pink-pale); border-radius: 12px; padding: 12px 14px; color: var(--text); font-size: 0.88rem; }
.music-form__field textarea { resize: vertical; }
.music-form__file-input { color: var(--text); font-size: 0.82rem; }
.music-form__file-name { margin-top: 6px; font-size: 0.78rem; color: var(--text-soft); }
.music-form__error { color: #c0392b; font-size: 0.82rem; margin-bottom: 14px; }
.music-form__submit { width: 100%; background: var(--pink-deep); color: #fff; border: none; border-radius: 14px; padding: 14px; font-size: 0.95rem; font-weight: 600; margin-top: 8px; }
.music-form__submit:disabled { opacity: 0.6; }
</style>