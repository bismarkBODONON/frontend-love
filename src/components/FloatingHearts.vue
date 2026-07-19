<script setup lang="ts">
import { computed } from 'vue'

interface Heart {
  id: number
  left: number
  size: number
  duration: number
  delay: number
  opacity: number
}

// Générés une seule fois à la création du composant (pas besoin de les recalculer)
const hearts = computed<Heart[]>(() => {
  const count = 14
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 12 + Math.random() * 18,
    duration: 9 + Math.random() * 8,
    delay: Math.random() * 10,
    opacity: 0.15 + Math.random() * 0.35,
  }))
})
</script>

<template>
  <div class="floating-hearts" aria-hidden="true">
    <span
      v-for="heart in hearts"
      :key="heart.id"
      class="floating-hearts__heart"
      :style="{
        left: heart.left + '%',
        fontSize: heart.size + 'px',
        animationDuration: heart.duration + 's',
        animationDelay: heart.delay + 's',
        opacity: heart.opacity,
      }"
    >
      ❤
    </span>
  </div>
</template>

<style scoped>
.floating-hearts {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.floating-hearts__heart {
  position: absolute;
  bottom: -40px;
  color: var(--pink-deep);
  animation-name: float-up;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes float-up {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
  }
  50% {
    transform: translateY(-50vh) translateX(12px) rotate(10deg);
  }
  100% {
    transform: translateY(-105vh) translateX(-12px) rotate(-8deg);
  }
}
</style>