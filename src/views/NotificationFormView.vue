<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { initScheduledNotifications } from '@/services/notificationScheduler'

const router = useRouter()

const message = ref('')
const sendTime = ref('09:00')
const frequency = ref<'once' | 'daily' | 'weekly'>('daily')
const sendDate = ref(new Date().toISOString().slice(0, 10))
const daysOfWeek = ref<number[]>([])
const isSaving = ref(false)
const error = ref<string | null>(null)

const presets = ['Bonjour ❤️', 'Bonne journée ❤️', 'Tu me manques ❤️', 'Bonne nuit ❤️']
const dayOptions = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mer' },
  { value: 4, label: 'Jeu' },
  { value: 5, label: 'Ven' },
  { value: 6, label: 'Sam' },
  { value: 7, label: 'Dim' },
]

function toggleDay(day: number) {
  const i = daysOfWeek.value.indexOf(day)
  if (i === -1) daysOfWeek.value.push(day)
  else daysOfWeek.value.splice(i, 1)
}

async function submit() {
  if (!message.value.trim()) {
    error.value = 'Écris le message de la notification.'
    return
  }
  if (frequency.value === 'weekly' && daysOfWeek.value.length === 0) {
    error.value = 'Choisis au moins un jour de la semaine.'
    return
  }

  isSaving.value = true
  error.value = null

  try {
    await api.post('/notification-schedules', {
      message: message.value,
      send_time: sendTime.value,
      frequency: frequency.value,
      days_of_week: frequency.value === 'weekly' ? daysOfWeek.value : null,
      send_date: frequency.value === 'once' ? sendDate.value : null,
      is_active: true,
    })

    await initScheduledNotifications()
    router.push('/notifications')
  } catch (e) {
    error.value = 'Une erreur est survenue, réessaie.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="notif-form">
    <header class="notif-form__header">
      <router-link to="/notifications" class="notif-form__back">←</router-link>
      <h1>Nouvelle notification</h1>
    </header>

    <div class="notif-form__field">
      <label>Message</label>
      <input v-model="message" type="text" class="notif-form__input" placeholder="Ton message..." />
      <div class="notif-form__presets">
        <button
          v-for="p in presets"
          :key="p"
          type="button"
          class="notif-form__preset-btn"
          @click="message = p"
        >
          {{ p }}
        </button>
      </div>
    </div>

    <div class="notif-form__field">
      <label>Heure</label>
      <input v-model="sendTime" type="time" class="notif-form__input" />
    </div>

    <div class="notif-form__field">
      <label>Fréquence</label>
      <select v-model="frequency" class="notif-form__input">
        <option value="once">Une seule fois</option>
        <option value="daily">Tous les jours</option>
        <option value="weekly">Certains jours de la semaine</option>
      </select>
    </div>

    <div v-if="frequency === 'once'" class="notif-form__field">
      <label>Date</label>
      <input v-model="sendDate" type="date" class="notif-form__input" />
    </div>

    <div v-if="frequency === 'weekly'" class="notif-form__field">
      <label>Jours</label>
      <div class="notif-form__days">
        <button
          v-for="d in dayOptions"
          :key="d.value"
          type="button"
          class="notif-form__day-btn"
          :class="{ 'notif-form__day-btn--active': daysOfWeek.includes(d.value) }"
          @click="toggleDay(d.value)"
        >
          {{ d.label }}
        </button>
      </div>
    </div>

    <p v-if="error" class="notif-form__error">{{ error }}</p>

    <button class="notif-form__submit" :disabled="isSaving" @click="submit">
      {{ isSaving ? 'Sauvegarde...' : 'Programmer' }}
    </button>
  </div>
</template>

<style scoped>
.notif-form { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.notif-form__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.notif-form__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.notif-form__field { margin-bottom: 20px; }
.notif-form__field label { display: block; font-size: 0.85rem; color: var(--text-soft); margin-bottom: 8px; }
.notif-form__input { width: 100%; background: var(--surface-soft); border: none; border-radius: 12px; padding: 12px 14px; color: var(--text); font-size: 0.95rem; font-family: inherit; }
.notif-form__presets { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.notif-form__preset-btn { background: var(--surface-soft); border: none; border-radius: 10px; padding: 8px 12px; color: var(--text); font-size: 0.8rem; }
.notif-form__days { display: flex; gap: 8px; flex-wrap: wrap; }
.notif-form__day-btn { background: var(--surface-soft); border: 2px solid transparent; border-radius: 10px; padding: 8px 12px; color: var(--text); font-size: 0.85rem; }
.notif-form__day-btn--active { border-color: var(--pink-deep); background: rgba(228, 98, 155, 0.12); }
.notif-form__error { color: #c0392b; font-size: 0.85rem; margin-bottom: 14px; }
.notif-form__submit { width: 100%; background: var(--pink-deep); color: #fff; border: none; border-radius: 14px; padding: 14px; font-size: 1rem; font-weight: 600; }
.notif-form__submit:disabled { opacity: 0.6; }
</style>