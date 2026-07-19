import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Une seule instance axios partagée dans toute l'app.
// Pourquoi centraliser ici plutôt que d'appeler axios.get(...) partout ?
// -> Un seul endroit à changer si l'URL du backend change (comme tu l'as
//    vécu avec StockMaster/Railway). Un seul endroit pour injecter le
//    token automatiquement sur CHAQUE requête.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  timeout: 10000,
})

// Intercepteur de requête : ajoute automatiquement le token Bearer
// s'il existe, sans avoir à y penser dans chaque store/vue.
api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// Intercepteur de réponse : si le token est invalide/expiré (401),
// on renvoie automatiquement l'utilisateur à l'écran de verrouillage
// plutôt que de laisser chaque composant gérer cette erreur lui-même.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
    }
    return Promise.reject(error)
  }
)

export default api
