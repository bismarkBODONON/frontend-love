<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import MiniPlayer from '@/components/MiniPlayer.vue'
import { initScheduledNotifications } from '@/services/notificationScheduler'
import { applyTheme, loadThemeFromServer } from '@/composables/useTheme'

onMounted(() => {
  applyTheme() // applique immédiatement le thème mis en cache localement
  loadThemeFromServer() // puis resynchronise avec le backend
  initScheduledNotifications()
})
</script>

<template>
  <RouterView v-slot="{ Component, route: r }">
    <Transition :name="(r.meta.transition as string) || 'slide-fade'" mode="out-in">
      <component :is="Component" :key="r.path" />
    </Transition>
  </RouterView>

  <MiniPlayer />
</template>

<style>
/* Transition par défaut : glissement + fondu, sensation "navigation avant" */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

/* Transition "retour" : glissement inverse, utilisée pour les pages de détail */
.slide-back-enter-active,
.slide-back-leave-active {
  transition: all 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-back-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}

.slide-back-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

/* Transition simple en fondu, pour les modales/pages plein écran (Now Playing, viewers) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>