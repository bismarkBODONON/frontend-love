<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRelationshipStore } from '@/stores/relationship'
import { getElapsedTime } from '@/utils/dateElapsed'
import AppHeader from '@/components/AppHeader.vue'

const relationship = useRelationshipStore()

const now = ref(new Date())
let timer: number | undefined

const startDate = computed(() => {
  return relationship.startDate ? new Date(relationship.startDate) : null
})

const elapsed = computed(() => {
  if (!startDate.value) return null
  return getElapsedTime(startDate.value, now.value)
})

const formattedStartDate = computed(() => {
  if (!startDate.value) return ''
  return startDate.value.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

onMounted(async () => {
  if (!relationship.isLoaded) {
    await relationship.fetch()
  }
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="counter">
    <AppHeader title="Notre temps ensemble" fallback="/" />

    <div v-if="!startDate" class="counter__empty">
      <p>Aucune date de départ définie.</p>
      <p class="counter__empty-sub">Ajoutez-la dans les paramètres pour activer le compteur.</p>
    </div>

    <template v-else-if="elapsed">
      <p class="counter__since">Depuis le {{ formattedStartDate }}</p>

      <div class="counter__grid">
        <div class="counter__unit">
          <span class="counter__value">{{ elapsed.years }}</span>
          <span class="counter__label">{{ elapsed.years > 1 ? 'ans' : 'an' }}</span>
        </div>
        <div class="counter__unit">
          <span class="counter__value">{{ elapsed.months }}</span>
          <span class="counter__label">mois</span>
        </div>
        <div class="counter__unit">
          <span class="counter__value">{{ elapsed.days }}</span>
          <span class="counter__label">{{ elapsed.days > 1 ? 'jours' : 'jour' }}</span>
        </div>
        <div class="counter__unit">
          <span class="counter__value">{{ elapsed.hours }}</span>
          <span class="counter__label">{{ elapsed.hours > 1 ? 'heures' : 'heure' }}</span>
        </div>
        <div class="counter__unit">
          <span class="counter__value">{{ elapsed.minutes }}</span>
          <span class="counter__label">{{ elapsed.minutes > 1 ? 'minutes' : 'minute' }}</span>
        </div>
        <div class="counter__unit">
          <span class="counter__value">{{ elapsed.seconds }}</span>
          <span class="counter__label">{{ elapsed.seconds > 1 ? 'secondes' : 'seconde' }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.counter { min-height: 100vh; padding: 24px 20px 80px; background: var(--bg); color: var(--text); }
.counter__empty { text-align: center; padding: 60px 20px; color: var(--text-soft); }
.counter__empty-sub { font-size: 0.85rem; margin-top: 6px; }
.counter__since { text-align: center; font-size: 0.9rem; color: var(--text-soft); margin-bottom: 28px; }
.counter__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.counter__unit { background: var(--surface); border-radius: 16px; padding: 20px 10px; display: flex; flex-direction: column; align-items: center; gap: 6px; box-shadow: 0 4px 16px var(--shadow-pink); }
.counter__value { font-size: 2rem; font-weight: 700; color: var(--pink-deep); font-variant-numeric: tabular-nums; }
.counter__label { font-size: 0.75rem; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.05em; }
</style>