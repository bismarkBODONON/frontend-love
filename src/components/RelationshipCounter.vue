<script setup lang="ts">
import { toRef } from 'vue'
import { useRelationshipCounter } from '@/composables/useRelationshipCounter'

const props = defineProps<{
  startDate: string | null
  compact?: boolean // Mode compact = utilisé sur Home, mode complet = écran dédié
}>()

// toRef garde la réactivité même si "props" est déstructuré ailleurs.
const startDate = toRef(props, 'startDate')
const { parts } = useRelationshipCounter(startDate)

const units = [
  { key: 'years', label: 'ans' },
  { key: 'months', label: 'mois' },
  { key: 'weeks', label: 'sem.' },
  { key: 'days', label: 'jours' },
  { key: 'hours', label: 'h' },
  { key: 'minutes', label: 'min' },
  { key: 'seconds', label: 'sec' },
] as const
</script>

<template>
  <div v-if="parts" class="counter" :class="{ 'counter--compact': compact }">
    <div v-for="unit in units" :key="unit.key" class="counter__unit">
      <span class="counter__value">{{ parts[unit.key] }}</span>
      <span class="counter__label">{{ unit.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.counter {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.counter__unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 56px;
  padding: 14px 8px;
  border-radius: 18px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04));
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.counter__value {
  font-size: 1.6rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums; /* évite que les chiffres "sautent" en largeur chaque seconde */
  color: var(--accent-color, #ff4d8d);
}

.counter__label {
  font-size: 0.7rem;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.counter--compact .counter__unit {
  min-width: 44px;
  padding: 10px 6px;
}

.counter--compact .counter__value {
  font-size: 1.1rem;
}
</style>
