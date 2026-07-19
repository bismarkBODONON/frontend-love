<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const firstName = ref('')
const presetMessages = ref<string[]>([])
const newMessage = ref('')
const musicEnabled = ref(true)
const notificationsEnabled = ref(true)
const isSaving = ref(false)
const isImporting = ref(false)
const importInput = ref<HTMLInputElement | null>(null)
const feedback = ref<string | null>(null)

async function loadSettings() {
  const { data } = await api.get('/settings')
  firstName.value = data.first_name ?? ''
  presetMessages.value = data.preset_messages ?? []
  musicEnabled.value = data.music_enabled
  notificationsEnabled.value = data.notifications_enabled
}

function addMessage() {
  if (!newMessage.value.trim()) return
  presetMessages.value.push(newMessage.value.trim())
  newMessage.value = ''
}

function removeMessage(index: number) {
  presetMessages.value.splice(index, 1)
}

async function save() {
  isSaving.value = true
  feedback.value = null
  try {
    await api.put('/settings', {
      first_name: firstName.value,
      preset_messages: presetMessages.value,
      music_enabled: musicEnabled.value,
      notifications_enabled: notificationsEnabled.value,
    })
    feedback.value = 'Réglages enregistrés.'
  } finally {
    isSaving.value = false
  }
}

async function exportBackup() {
  const response = await api.get('/backup/export', { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.download = `notre-histoire-backup-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  window.URL.revokeObjectURL(url)
}

function triggerImport() {
  importInput.value?.click()
}

async function onImportChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!confirm('La restauration remplace toutes les données actuelles. Continuer ?')) return

  isImporting.value = true
  const formData = new FormData()
  formData.append('backup', file)

  try {
    await api.post('/backup/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    feedback.value = 'Restauration terminée.'
    await loadSettings()
  } finally {
    isImporting.value = false
  }
}

async function handleLogout() {
  if (!confirm('Se déconnecter ?')) return
  await auth.logout()
  router.push({ name: 'lock' })
}

onMounted(loadSettings)
</script>

<template>
  <div class="settings">
    <header class="settings__header">
      <router-link to="/" class="settings__back">←</router-link>
      <h1>Paramètres</h1>
    </header>

    <section class="settings__section">
      <label>Prénom</label>
      <input v-model="firstName" type="text" class="settings__input" placeholder="Ton prénom" />
    </section>

    <section class="settings__section">
      <label>Messages personnalisés (notifications)</label>
      <div class="settings__tags">
        <span v-for="(m, i) in presetMessages" :key="i" class="settings__tag">
          {{ m }}
          <button @click="removeMessage(i)">✕</button>
        </span>
      </div>
      <div class="settings__row">
        <input v-model="newMessage" type="text" class="settings__input" placeholder="Nouveau message" @keyup.enter="addMessage" />
        <button class="settings__add" @click="addMessage">Ajouter</button>
      </div>
    </section>

    <section class="settings__section settings__section--row">
      <label>Musique</label>
      <label class="settings__toggle">
        <input v-model="musicEnabled" type="checkbox" />
        <span class="settings__toggle-slider" />
      </label>
    </section>

    <section class="settings__section settings__section--row">
      <label>Notifications</label>
      <label class="settings__toggle">
        <input v-model="notificationsEnabled" type="checkbox" />
        <span class="settings__toggle-slider" />
      </label>
    </section>

    <button class="settings__save" :disabled="isSaving" @click="save">
      {{ isSaving ? 'Sauvegarde...' : 'Enregistrer' }}
    </button>

    <section class="settings__section">
      <label>Sauvegarde des données</label>
      <div class="settings__row">
        <button class="settings__secondary" @click="exportBackup">Exporter</button>
        <button class="settings__secondary" :disabled="isImporting" @click="triggerImport">
          {{ isImporting ? 'Restauration...' : 'Restaurer' }}
        </button>
        <input ref="importInput" type="file" accept="application/json" hidden @change="onImportChange" />
      </div>
    </section>

    <router-link to="/settings/personalization" class="settings__link">Personnalisation →</router-link>
    <router-link to="/settings/security" class="settings__link">Sécurité →</router-link>

    <p v-if="feedback" class="settings__feedback">{{ feedback }}</p>

    <button class="settings__logout" @click="handleLogout">
      Se déconnecter
    </button>
  </div>
</template>

<style scoped>
.settings { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.settings__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.settings__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.settings__section { margin-bottom: 22px; }
.settings__section--row { display: flex; justify-content: space-between; align-items: center; }
.settings__section label { display: block; font-size: 0.85rem; color: var(--text-soft); margin-bottom: 8px; }
.settings__input { width: 100%; background: var(--surface-soft); border: none; border-radius: 12px; padding: 12px 14px; color: var(--text); font-size: 0.95rem; }
.settings__row { display: flex; gap: 8px; }
.settings__tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.settings__tag { background: var(--surface-soft); border-radius: 10px; padding: 6px 10px; font-size: 0.8rem; display: flex; align-items: center; gap: 6px; }
.settings__tag button { background: none; border: none; color: var(--pink-deep); }
.settings__add { background: var(--surface-soft); border: none; border-radius: 10px; padding: 0 14px; color: var(--text); font-size: 0.85rem; }
.settings__toggle { position: relative; width: 40px; height: 22px; }
.settings__toggle input { opacity: 0; }
.settings__toggle-slider { position: absolute; inset: 0; background: var(--pink-pale); border-radius: 22px; }
.settings__toggle-slider::before { content: ''; position: absolute; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.2s; }
.settings__toggle input:checked + .settings__toggle-slider { background: var(--pink-deep); }
.settings__toggle input:checked + .settings__toggle-slider::before { transform: translateX(18px); }
.settings__save { width: 100%; background: var(--pink-deep); color: #fff; border: none; border-radius: 14px; padding: 14px; font-size: 1rem; font-weight: 600; margin-bottom: 24px; }
.settings__secondary { flex: 1; background: var(--surface-soft); border: none; border-radius: 12px; padding: 12px; color: var(--text); font-size: 0.85rem; }
.settings__link { display: block; color: var(--pink-deep); text-decoration: none; font-size: 0.9rem; margin-bottom: 10px; }
.settings__feedback { font-size: 0.85rem; color: var(--text-soft); margin-top: 10px; }
.settings__logout { width: 100%; background: transparent; color: #c0392b; border: 1px solid rgba(192, 57, 43, 0.3); border-radius: 14px; padding: 14px; font-size: 0.95rem; font-weight: 600; margin-top: 28px; }
</style>