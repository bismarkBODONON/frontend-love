<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg :width="size ?? 24" :height="size ?? 24" viewBox="0 0 24 24" fill="none">
    <g stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
      <path v-for="i in 5" :key="i" :d="`M12 12 Q ${12 + 5*Math.cos((i*72)*Math.PI/180)} ${12 + 5*Math.sin((i*72)*Math.PI/180)}, ${12 + 3*Math.cos((i*72+36)*Math.PI/180)} ${12 + 3*Math.sin((i*72+36)*Math.PI/180)} Q ${12 + 5*Math.cos((i*72+72)*Math.PI/180)} ${12 + 5*Math.sin((i*72+72)*Math.PI/180)}, 12 12`" />
    </g>
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
</template>