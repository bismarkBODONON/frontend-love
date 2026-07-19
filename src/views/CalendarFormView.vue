<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const title = ref('')
const description = ref('')
const eventDate = ref(new Date().toISOString().slice(0, 10))
const type = ref<'anniversary' | 'important_date' | 'event'>('event')
const isRecurringYearly = ref(false)
const notify = ref(true)
const notifyTime = ref('09:00')
const isSaving = ref(false)
const error = ref<string | null>(null)

async function submit() {
  if (!title.value.trim()) {
    error.value = "Donne un titre à l'événement."
    return
  }

  isSaving.value = true
  error.value = null

  try {
    await api.post('/calendar-events', {
      title: title.value,
      description: description.value || null,
      event_date: eventDate.value,
      type: type.value,
      is_recurring_yearly: isRecurringYearly.value,
      notify: notify.value,
      notify_time: notify.value ? notifyTime.value : null,
    })

    router.push('/calendar')
  } catch (e) {
    error.value = 'Une erreur est survenue, réessaie.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="calendar-form">
    <header class="calendar-form__header">
      <router-link to="/calendar" class="calendar-form__back">←</router-link>
      <h1>Nouvel événement</h1>
    </header>

    <div class="calendar-form__field">
      <label>Titre</label>
      <input v-model="title" type="text" class="calendar-form__input" placeholder="Ex: Anniversaire de rencontre" />
    </div>

    <div class="calendar-form__field">
      <label>Type</label>
      <select v-model="type" class="calendar-form__input">
        <option value="anniversary">💞 Anniversaire</option>
        <option value="important_date">📌 Date importante</option>
        <option value="event">🗓️ Événement</option>
      </select>
    </div>

    <div class="calendar-form__field">
      <label>Date</label>
      <input v-model="eventDate" type="date" class="calendar-form__input" />
    </div>

    <div class="calendar-form__field calendar-form__field--row">
      <label class="calendar-form__checkbox">
        <input v-model="isRecurringYearly" type="checkbox" />
        Se répète chaque année
      </label>
    </div>

    <div class="calendar-form__field">
      <label>Description (optionnel)</label>
      <textarea v-model="description" class="calendar-form__input" rows="3" />
    </div>

    <div class="calendar-form__field calendar-form__field--row">
      <label class="calendar-form__checkbox">
        <input v-model="notify" type="checkbox" />
        Activer une notification
      </label>
    </div>

    <div v-if="notify" class="calendar-form__field">
      <label>Heure de la notification</label>
      <input v-model="notifyTime" type="time" class="calendar-form__input" />
    </div>

    <p v-if="error" class="calendar-form__error">{{ error }}</p>

    <button class="calendar-form__submit" :disabled="isSaving" @click="submit">
      {{ isSaving ? 'Sauvegarde...' : 'Sauvegarder' }}
    </button>
  </div>
</template>

<style scoped>
.calendar-form { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.calendar-form__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.calendar-form__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.calendar-form__field { margin-bottom: 20px; }
.calendar-form__field--row { display: flex; align-items: center; }
.calendar-form__field label { display: block; font-size: 0.85rem; color: var(--text-soft); margin-bottom: 8px; }
.calendar-form__input { width: 100%; background: var(--surface-soft); border: none; border-radius: 12px; padding: 12px 14px; color: var(--text); font-size: 0.95rem; font-family: inherit; }
.calendar-form__checkbox { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer; }
.calendar-form__error { color: #c0392b; font-size: 0.85rem; margin-bottom: 14px; }
.calendar-form__submit { width: 100%; background: var(--pink-deep); color: #fff; border: none; border-radius: 14px; padding: 14px; font-size: 1rem; font-weight: 600; }
.calendar-form__submit:disabled { opacity: 0.6; }
</style>