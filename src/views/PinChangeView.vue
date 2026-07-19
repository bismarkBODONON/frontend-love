<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const currentPin = ref('')
const newPin = ref('')
const confirmPin = ref('')
const error = ref('')
const success = ref('')
const router = useRouter()

async function changePin() {
  error.value = ''
  success.value = ''

  if (newPin.value !== confirmPin.value) {
    error.value = 'Les nouveaux PIN ne correspondent pas'
    return
  }
  if (newPin.value.length !== 4 || !/^\d{4}$/.test(newPin.value)) {
    error.value = 'Le PIN doit être composé de 4 chiffres'
    return
  }

  try {
    await api.post('/auth/change-pin', {
      current_pin: currentPin.value,
      new_pin: newPin.value,
      new_pin_confirmation: confirmPin.value,
    })
    success.value = 'PIN modifié avec succès'
    setTimeout(() => router.push('/settings/security'), 1500)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du changement'
  }
}
</script>

<template>
  <div class="pin-change">
    <header class="pin-change__header">
      <router-link to="/settings/security" class="pin-change__back">←</router-link>
      <h1>Changer le code PIN</h1>
    </header>

    <div class="pin-change__form">
      <div class="pin-change__field">
        <label>PIN actuel</label>
        <input v-model="currentPin" type="password" maxlength="4" inputmode="numeric" pattern="[0-9]*" />
      </div>
      <div class="pin-change__field">
        <label>Nouveau PIN</label>
        <input v-model="newPin" type="password" maxlength="4" inputmode="numeric" pattern="[0-9]*" />
      </div>
      <div class="pin-change__field">
        <label>Confirmer le nouveau PIN</label>
        <input v-model="confirmPin" type="password" maxlength="4" inputmode="numeric" pattern="[0-9]*" />
      </div>

      <p v-if="error" class="pin-change__error">{{ error }}</p>
      <p v-if="success" class="pin-change__success">{{ success }}</p>

      <button class="pin-change__button" @click="changePin">Changer le PIN</button>
    </div>
  </div>
</template>

<style scoped>
.pin-change { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.pin-change__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.pin-change__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.pin-change__form { max-width: 360px; margin: 0 auto; }
.pin-change__field { margin-bottom: 18px; }
.pin-change__field label { display: block; font-size: 0.85rem; color: var(--text-soft); margin-bottom: 6px; }
.pin-change__field input { width: 100%; background: var(--surface-soft); border: none; border-radius: 12px; padding: 14px; color: var(--text); font-size: 1.2rem; text-align: center; letter-spacing: 12px; }
.pin-change__error { color: #c0392b; font-size: 0.9rem; margin: 10px 0; }
.pin-change__success { color: #2e8b57; font-size: 0.9rem; margin: 10px 0; }
.pin-change__button { width: 100%; background: var(--pink-deep); color: #fff; border: none; border-radius: 14px; padding: 14px; font-size: 1rem; font-weight: 600; margin-top: 10px; }
</style>