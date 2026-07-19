import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/lock',
      name: 'lock',
      component: () => import('@/views/PinLockView.vue'),
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: () => import('@/views/TimelineView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/timeline/new',
      name: 'timeline-new',
      component: () => import('@/views/TimelineFormView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/letters',
      name: 'letters',
      component: () => import('@/views/LoveLettersView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/reasons',
      name: 'reasons',
      component: () => import('@/views/ReasonsView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/dreams',
      name: 'dreams',
      component: () => import('@/views/DreamsView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/quotes',
      name: 'quotes',
      component: () => import('@/views/QuotesView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: () => import('@/views/AlbumsView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/gallery/:id',
      name: 'gallery-album',
      component: () => import('@/views/AlbumDetailView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/music',
      name: 'music',
      component: () => import('@/views/MusicView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/music/now-playing',
      name: 'now-playing',
      component: () => import('@/views/NowPlayingView.vue'),
      meta: { requiresUnlock: true, transition: 'fade' },
    },
    {
      path: '/music/new',
      name: 'music-new',
      component: () => import('@/views/MusicFormView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/counter',
      name: 'counter',
      component: () => import('@/views/CounterView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/journal',
      name: 'journal',
      component: () => import('@/views/JournalView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/journal/new',
      name: 'journal-new',
      component: () => import('@/views/JournalFormView.vue'),
      meta: { requiresUnlock: true },
    },

    // --- Nouvelles fonctionnalités ---
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/settings/personalization',
      name: 'personalization',
      component: () => import('@/views/PersonalizationView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/settings/security',
      name: 'security',
      component: () => import('@/views/SecurityView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/settings/security/pin',
      name: 'security-pin',
      component: () => import('@/views/PinChangeView.vue'),
      meta: { requiresUnlock: true },
    },

    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/views/CalendarView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/calendar/new',
      name: 'calendar-new',
      component: () => import('@/views/CalendarFormView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/NotificationsView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/notifications/new',
      name: 'notifications-new',
      component: () => import('@/views/NotificationFormView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/time-capsule',
      name: 'time-capsule',
      component: () => import('@/views/TimeCapsuleView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/time-capsule/new',
      name: 'time-capsule-new',
      component: () => import('@/views/TimeCapsuleFormView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: () => import('@/views/QuizListView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/quiz/new',
      name: 'quiz-new',
      component: () => import('@/views/QuizFormView.vue'),
      meta: { requiresUnlock: true },
    },
    {
      path: '/quiz/:id/play',
      name: 'quiz-play',
      component: () => import('@/views/QuizPlayView.vue'),
      meta: { requiresUnlock: true },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresUnlock && !authStore.isUnlocked) {
    return { name: 'lock' }
  }

  if (to.name === 'lock' && authStore.isUnlocked) {
    return { name: 'home' }
  }
})

// Détermine le sens de la transition (avant / arrière) selon la profondeur du chemin.
// Ne touche pas au transition déjà fixé manuellement (ex: "fade" pour now-playing).
let previousDepth = 0

router.beforeEach((to) => {
  const toDepth = to.path.split('/').length

  if (!to.meta.transition) {
    to.meta.transition = toDepth < previousDepth ? 'slide-back' : 'slide-fade'
  }

  previousDepth = toDepth
})

export default router