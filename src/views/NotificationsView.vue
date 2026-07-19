<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { requestNotificationPermission, initScheduledNotifications } from '@/services/notificationScheduler'

interface NotificationSchedule {
  id: number
  message: string
  send_time: string
  frequency: 'once' | 'daily' | 'weekly'
  days_of_week: number[] | null
  send_date: string | null
  is_active: boolean
}

const schedules = ref<NotificationSchedule[]>([])
const isLoading = ref(true)
const permissionGranted = ref(Notification.permission === 'granted')

const dayNames = ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

async function loadSchedules() {
  isLoading.value = true
  try {
    const { data } = await api.get<NotificationSchedule[]>('/notification-schedules')
    schedules.value = data
  } finally {
    isLoading.value = false
  }
}

async function enablePermission() {
  permissionGranted.value = await requestNotificationPermission()
  if (permissionGranted.value) initScheduledNotifications()
}

async function toggleActive(schedule: NotificationSchedule) {
  await api.put(`/notification-schedules/${schedule.id}`, { is_active: !schedule.is_active })
  schedule.is_active = !schedule.is_active
  initScheduledNotifications()
}

async function deleteSchedule(id: number) {
  if (!confirm('Supprimer cette notification ?')) return
  await api.delete(`/notification-schedules/${id}`)
  schedules.value = schedules.value.filter((s) => s.id !== id)
}

function frequencyLabel(s: NotificationSchedule) {
  if (s.frequency === 'once') return `Une fois le ${s.send_date}`
  if (s.frequency === 'daily') return 'Tous les jours'
  return (s.days_of_week ?? []).map((d) => dayNames[d]).join(', ')
}

onMounted(loadSchedules)
</script>

<template>
  <div class="notif">
    <header class="notif__header">
      <router-link to="/" class="notif__back">←</router-link>
      <h1>Notifications</h1>
    </header>

    <div v-if="!permissionGranted" class="notif__permission">
      <p>Active les notifications pour recevoir tes messages programmés.</p>
      <button class="notif__permission-btn" @click="enablePermission">Activer les notifications</button>
    </div>

    <div v-if="isLoading" class="notif__loading">
      <div class="notif__spinner" />
    </div>

    <div v-else-if="schedules.length === 0" class="notif__empty">
      <p>Aucune notification programmée.</p>
    </div>

    <div v-else class="notif__list">
      <article v-for="s in schedules" :key="s.id" class="notif__card" :class="{ 'notif__card--inactive': !s.is_active }">
        <div class="notif__card-header">
          <span class="notif__time">{{ s.send_time.slice(0, 5) }}</span>
          <button class="notif__delete" @click="deleteSchedule(s.id)">✕</button>
        </div>
        <p class="notif__message">{{ s.message }}</p>
        <div class="notif__card-footer">
          <span class="notif__frequency">{{ frequencyLabel(s) }}</span>
          <label class="notif__toggle">
            <input type="checkbox" :checked="s.is_active" @change="toggleActive(s)" />
            <span class="notif__toggle-slider" />
          </label>
        </div>
      </article>
    </div>

    <router-link to="/notifications/new" class="notif__fab" aria-label="Nouvelle notification">
      +
    </router-link>
  </div>
</template>

<style scoped>
.notif { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.notif__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.notif__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.notif__permission { background: rgba(228, 98, 155, 0.1); border-radius: 14px; padding: 16px; margin-bottom: 20px; }
.notif__permission p { font-size: 0.9rem; margin-bottom: 10px; }
.notif__permission-btn { background: var(--pink-deep); color: #fff; border: none; border-radius: 10px; padding: 10px 16px; font-size: 0.85rem; font-weight: 600; }
.notif__loading { display: flex; justify-content: center; padding: 60px 0; }
.notif__spinner { width: 32px; height: 32px; border: 3px solid var(--pink-pale); border-top-color: var(--pink-deep); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.notif__empty { text-align: center; padding: 80px 20px; color: var(--text-soft); }
.notif__list { display: flex; flex-direction: column; gap: 14px; }
.notif__card { background: var(--surface); border-radius: 18px; padding: 16px; box-shadow: 0 4px 16px var(--shadow-pink); }
.notif__card--inactive { opacity: 0.55; }
.notif__card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.notif__time { font-size: 1.1rem; font-weight: 600; }
.notif__delete { background: none; border: none; color: var(--pink-deep); font-size: 1rem; }
.notif__message { font-size: 0.95rem; margin-bottom: 10px; }
.notif__card-footer { display: flex; justify-content: space-between; align-items: center; }
.notif__frequency { font-size: 0.75rem; color: var(--text-soft); }
.notif__toggle { position: relative; display: inline-block; width: 40px; height: 22px; }
.notif__toggle input { opacity: 0; width: 0; height: 0; }
.notif__toggle-slider { position: absolute; inset: 0; background: var(--pink-pale); border-radius: 22px; transition: 0.2s; }
.notif__toggle-slider::before { content: ''; position: absolute; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.2s; }
.notif__toggle input:checked + .notif__toggle-slider { background: var(--pink-deep); }
.notif__toggle input:checked + .notif__toggle-slider::before { transform: translateX(18px); }
.notif__fab { position: fixed; bottom: 28px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: var(--pink-deep); color: #fff; font-size: 1.8rem; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 8px 20px var(--shadow-pink); }
</style>