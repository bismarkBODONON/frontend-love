import './assets/theme.css'
import '@/composables/useTheme'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// On attend que le token soit chargé depuis le stockage sécurisé
// AVANT d'afficher l'app. Sans ça, l'app pourrait brièvement croire
// qu'il n'y a pas de session (et afficher l'écran PIN) même si
// l'utilisateur est déjà connecté.
const authStore = useAuthStore(pinia)

authStore.init().finally(() => {
  app.mount('#app')
})