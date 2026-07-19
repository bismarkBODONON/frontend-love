<script setup lang="ts">
import { ref } from 'vue'

interface Letter {
  id: number
  title: string
  content: string
  category: string
  is_favorite: boolean
  written_at: string
}

defineProps<{ letter: Letter }>()

const opened = ref(false)
</script>

<template>
  <div class="envelope" :class="{ 'envelope--opened': opened }" @click="opened = true">
    <div v-if="!opened" class="envelope__closed">
      <div class="envelope__flap" />
      <span class="envelope__seal">💌</span>
    </div>

    <Transition name="letter-reveal">
      <div v-if="opened" class="envelope__letter">
        <h3 class="envelope__title">{{ letter.title }}</h3>
        <p class="envelope__content">{{ letter.content }}</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.envelope {
  position: relative;
  min-height: 140px;
  border-radius: 18px;
  background: linear-gradient(160deg, var(--surface), var(--pink-pale));
  box-shadow: 0 4px 16px var(--shadow-pink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  margin-bottom: 16px;
}

.envelope__closed {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.envelope__seal {
  font-size: 2.2rem;
  transition: transform 0.3s ease;
}

.envelope:active .envelope__seal {
  transform: scale(0.9);
}

.envelope__letter {
  padding: 20px;
  width: 100%;
}

.envelope__title {
  color: var(--pink-deep);
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.envelope__content {
  color: var(--text);
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-line;
}

.letter-reveal-enter-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.letter-reveal-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
</style>