<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

interface Credential {
  id: number
  label: string
  created_at: string
}

const credentials = ref<Credential[]>([])
const isSupported = ref('PublicKeyCredential' in window)
const isRegistering = ref(false)
const error = ref<string | null>(null)

async function loadCredentials() {
  try {
    const { data } = await api.get<Credential[]>('/webauthn/credentials')
    credentials.value = data
    console.log('✅ Credentials chargées :', data)
  } catch (err) {
    console.error('❌ Erreur chargement credentials :', err)
  }
}

function base64ToBuffer(base64: string) {
  try {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  } catch (err) {
    console.error('❌ Erreur base64ToBuffer :', err, 'base64 reçu :', base64)
    throw err
  }
}

async function registerBiometric() {
  console.log('🔵 1. Début registerBiometric')

  if (!isSupported.value) {
    console.log('❌ WebAuthn non supporté')
    error.value = "Cet appareil ne prend pas en charge l'authentification biométrique."
    return
  }

  console.log('✅ WebAuthn supporté')

  if (credentials.value.length > 0) {
    error.value = "Un credential est déjà enregistré sur cet appareil. Retire-le d'abord pour en ajouter un nouveau."
    console.log('❌ Credential déjà existant :', credentials.value)
    return
  }

  isRegistering.value = true
  error.value = null

  try {
    console.log('🔵 2. Envoi de la requête /webauthn/register-options')
    const { data: options } = await api.post('/webauthn/register-options')
    console.log('✅ Options reçues :', options)

    console.log('🔵 3. Conversion du challenge')
    const challengeBuffer = base64ToBuffer(options.challenge)
    console.log('✅ Challenge converti :', challengeBuffer)

    const userIdBuffer = base64ToBuffer(options.user.id)
    console.log('✅ User ID converti :', userIdBuffer)

    const publicKey: PublicKeyCredentialCreationOptions = {
      ...options,
      challenge: challengeBuffer,
      user: {
        ...options.user,
        id: userIdBuffer,
      },
    }

    console.log('🔵 4. Appel de navigator.credentials.create() avec :', publicKey)

    const credential = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential

    console.log('✅ Credential créée :', credential)

    console.log('🔵 5. Envoi de la vérification au backend')
    await api.post('/webauthn/register-verify', {
      id: credential.id,
      label: 'Cet appareil',
    })

    console.log('✅ Vérification réussie')

    await loadCredentials()
    console.log('🔵 6. Terminé avec succès')
  } catch (e: any) {
    console.error('❌ ERREUR COMPLÈTE :', e)
    console.error('❌ Message :', e?.message)
    console.error('❌ Stack :', e?.stack)

    if (e?.message?.includes('Network Error')) {
      error.value = 'Erreur réseau. Vérifie que le backend Laravel est bien lancé.'
    } else if (e?.message?.includes('not allowed')) {
      error.value = "L'opération a été refusée. Peut-être qu'un credential existe déjà sur cet appareil ?"
    } else if (e?.response) {
      console.error('❌ Réponse du backend :', e.response.data)
      error.value = `Erreur backend : ${e.response?.data?.message || 'Vérifie le backend'}`
    } else {
      error.value = "Impossible d'activer la biométrie. Réessaie."
    }
  } finally {
    isRegistering.value = false
    console.log('🔵 7. Fin de la tentative')
  }
}

async function removeCredential(id: number) {
  if (!confirm('Retirer cet appareil ?')) return
  await api.delete(`/webauthn/credentials/${id}`)
  credentials.value = credentials.value.filter((c) => c.id !== id)
}

onMounted(() => {
  console.log('🔵 SecurityView montée')
  loadCredentials()
})
</script>

<template>
  <div class="security">
    <header class="security__header">
      <router-link to="/settings" class="security__back">←</router-link>
      <h1>Sécurité</h1>
    </header>

    <section class="security__section">
      <h2>Code PIN</h2>
      <router-link to="/settings/security/pin" class="security__link">Modifier le code PIN →</router-link>
    </section>

    <section class="security__section">
      <h2>Empreinte / Face ID</h2>
      <p v-if="!isSupported" class="security__warning">
        Ton navigateur ou ton appareil ne prend pas en charge cette fonctionnalité.
      </p>

      <div v-if="credentials.length" class="security__list">
        <div v-for="c in credentials" :key="c.id" class="security__item">
          <span>{{ c.label }}</span>
          <button @click="removeCredential(c.id)">Retirer</button>
        </div>
      </div>

      <button class="security__register" :disabled="isRegistering || !isSupported || credentials.length > 0" @click="registerBiometric">
        {{ isRegistering ? 'Activation...' : 'Activer sur cet appareil' }}
      </button>

      <p v-if="error" class="security__error">{{ error }}</p>
    </section>
  </div>
</template>

<style scoped>
.security { min-height: 100vh; padding: 24px 20px 60px; background: var(--bg); color: var(--text); }
.security__header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.security__back { color: var(--pink-deep); text-decoration: none; font-size: 1.4rem; }
.security__section { margin-bottom: 26px; }
.security__section h2 { font-size: 0.9rem; color: var(--text-soft); margin-bottom: 12px; }
.security__link { color: var(--pink-deep); text-decoration: none; font-size: 0.9rem; }
.security__warning { font-size: 0.85rem; color: var(--text-soft); margin-bottom: 12px; }
.security__list { margin-bottom: 12px; }
.security__item { display: flex; justify-content: space-between; background: var(--surface); border-radius: 12px; padding: 10px 14px; margin-bottom: 8px; font-size: 0.9rem; box-shadow: 0 4px 16px var(--shadow-pink); }
.security__item button { background: none; border: none; color: var(--pink-deep); font-size: 0.8rem; }
.security__register { width: 100%; background: var(--pink-deep); color: #fff; border: none; border-radius: 14px; padding: 14px; font-size: 1rem; font-weight: 600; }
.security__register:disabled { opacity: 0.5; }
.security__error { color: #c0392b; font-size: 0.85rem; margin-top: 10px; }
</style>