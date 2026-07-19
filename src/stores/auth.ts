import { defineStore } from 'pinia'
import axios from 'axios'
import { secureGet, secureSet, secureRemove } from '@/services/secureStorage'

const TOKEN_STORAGE_KEY = 'love_app_token'

interface AuthState {
  token: string | null
  partnerName: string | null
  isCheckingPin: boolean
  isInitialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    // Le token n'est plus lu de façon synchrone : le stockage sécurisé
    // natif est asynchrone. On initialise à null, puis l'action init()
    // (appelée une seule fois au démarrage, voir main.ts) charge la
    // vraie valeur avant que l'app ne s'affiche.
    token: null,
    partnerName: null,
    isCheckingPin: false,
    isInitialized: false,
  }),

  getters: {
    isUnlocked: (state) => !!state.token,
  },

  actions: {
    /**
     * À appeler une seule fois, au tout début du cycle de vie de l'app
     * (main.ts, avant app.mount()). Restaure la session si un token
     * existe déjà dans le stockage sécurisé.
     */
    async init() {
      if (this.isInitialized) return
      this.token = await secureGet(TOKEN_STORAGE_KEY)
      this.isInitialized = true
    },

    async verifyPin(pin: string) {
      this.isCheckingPin = true
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'
        const { data } = await axios.post(`${baseURL}/auth/verify-pin`, { pin })

        this.token = data.token
        this.partnerName = data.partner_name
        await secureSet(TOKEN_STORAGE_KEY, data.token)

        return true
      } finally {
        this.isCheckingPin = false
      }
    },

    async logout() {
      this.token = null
      await secureRemove(TOKEN_STORAGE_KEY)
    },
  },
})