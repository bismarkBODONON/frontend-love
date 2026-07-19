<template>
  <div v-if="parts" class="counter" :class="{ 'counter--compact': compact }">
    <div v-for="unit in units" :key="unit.key" class="counter__unit">
      <component :is="unit.icon" class="counter__icon" :size="iconSize" :stroke-width="2" />
      <span class="counter__value">{{ parts[unit.key] }}</span>
      <span class="counter__label">{{ unit.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, toRef } from 'vue'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { Calendar, Moon, Sun, AlarmClock, Timer, Sparkles } from 'lucide-vue-next'

dayjs.extend(duration)

const props = defineProps<{
  startDate: string | null
  compact?: boolean
}>()

const start = toRef(props, 'startDate')
const now = ref(dayjs())
let interval: number | null = null

const units = [
  { key: 'years', label: 'ANS', icon: Calendar },
  { key: 'months', label: 'MOIS', icon: Moon },
  { key: 'days', label: 'JOURS', icon: Sun },
  { key: 'hours', label: 'HEURES', icon: AlarmClock },
  { key: 'minutes', label: 'MINUTES', icon: Timer },
  { key: 'seconds', label: 'SECONDES', icon: Sparkles },
] as const

const iconSize = computed(() => (props.compact ? 16 : 18))

const parts = computed(() => {
  if (!start.value) return null
  const diff = dayjs.duration(now.value.diff(dayjs(start.value)))
  return {
    years: diff.years(),
    months: diff.months(),
    days: diff.days(),
    hours: diff.hours(),
    minutes: diff.minutes(),
    seconds: diff.seconds(),
  }
})

onMounted(() => {
  interval = window.setInterval(() => {
    now.value = dayjs()
  }, 1000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style scoped>
.counter {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.counter__unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 18px 10px;
  border-radius: 22px;
  background: var(--surface);
  box-shadow: 0 6px 20px var(--shadow-pink);
}

.counter__icon {
  color: var(--color-rose-fonce);
  margin-bottom: 2px;
}

.counter__value {
  font-size: 1.7rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--color-rose-fonce);
  line-height: 1;
}

.counter__label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-soft);
  margin-top: 2px;
}

/* Mode compact : garde la grille 3 colonnes mais plus dense */
.counter--compact .counter__unit {
  padding: 14px 8px;
  border-radius: 18px;
}
.counter--compact .counter__value {
  font-size: 1.35rem;
}

@media (max-width: 480px) {
  .counter {
    gap: 8px;
  }
  .counter__unit {
    padding: 12px 4px;
    border-radius: 16px;
  }
  .counter__icon {
    width: 15px;
    height: 15px;
  }
  .counter__value {
    font-size: 1.15rem;
  }
  .counter__label {
    font-size: 0.58rem;
  }
}
</style>