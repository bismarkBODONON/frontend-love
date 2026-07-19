import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'

interface CounterParts {
  years: number
  months: number
  weeks: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

/**
 * Pourquoi un composable et pas juste du code dans le composant ?
 * -> C'est la logique la plus "réutilisable" de toute l'app : elle sera
 *    utilisée sur Home (résumé) ET sur l'écran Compteur (détail complet).
 *    Un composable = une fonction pure testable, découplée de l'UI.
 *    C'est l'équivalent Vue d'un hook React, un concept que tu retrouveras
 *    partout une fois que tu l'auras bien compris ici.
 */
export function useRelationshipCounter(startDate: Ref<string | null>) {
  const now = ref(new Date())
  let intervalId: number | undefined

  onMounted(() => {
    // On met à jour "now" chaque seconde -> tout ce qui dépend de "now"
    // via computed() se recalcule automatiquement (réactivité Vue).
    intervalId = window.setInterval(() => {
      now.value = new Date()
    }, 1000)
  })

  onUnmounted(() => {
    // Toujours nettoyer un setInterval au démontage du composant,
    // sinon on crée une fuite mémoire (le timer continue de tourner
    // même après que l'écran ait disparu).
    if (intervalId) clearInterval(intervalId)
  })

  const parts = computed<CounterParts | null>(() => {
    if (!startDate.value) return null

    const start = new Date(startDate.value)
    let diffMs = now.value.getTime() - start.getTime()
    if (diffMs < 0) diffMs = 0

    const totalSeconds = Math.floor(diffMs / 1000)

    const years = start ? yearsBetween(start, now.value) : 0
    const afterYears = new Date(start)
    afterYears.setFullYear(afterYears.getFullYear() + years)

    const months = monthsBetween(afterYears, now.value)
    const afterMonths = new Date(afterYears)
    afterMonths.setMonth(afterMonths.getMonth() + months)

    const remainingMs = now.value.getTime() - afterMonths.getTime()
    const remainingSeconds = Math.floor(remainingMs / 1000)

    const weeks = Math.floor(remainingSeconds / (7 * 24 * 3600))
    const days = Math.floor((remainingSeconds % (7 * 24 * 3600)) / (24 * 3600))
    const hours = Math.floor((remainingSeconds % (24 * 3600)) / 3600)
    const minutes = Math.floor((remainingSeconds % 3600) / 60)
    const seconds = remainingSeconds % 60

    return { years, months, weeks, days, hours, minutes, seconds }
  })

  const totalDays = computed(() => {
    if (!startDate.value) return 0
    const start = new Date(startDate.value)
    const diffMs = now.value.getTime() - start.getTime()
    return Math.floor(diffMs / (1000 * 3600 * 24))
  })

  return { parts, totalDays }
}

function yearsBetween(start: Date, end: Date): number {
  let years = end.getFullYear() - start.getFullYear()
  const anniversaryThisYear = new Date(start)
  anniversaryThisYear.setFullYear(start.getFullYear() + years)
  if (anniversaryThisYear > end) years--
  return Math.max(years, 0)
}

function monthsBetween(start: Date, end: Date): number {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  const anniversaryThisMonth = new Date(start)
  anniversaryThisMonth.setMonth(start.getMonth() + months)
  if (anniversaryThisMonth > end) months--
  return Math.max(months, 0)
}
