<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const pin = ref('')
const error = ref('')
const shake = ref(false)
const auth = useAuthStore()
const router = useRouter()

async function handleDigit(digit: string) {
  if (pin.value.length >= 6) return
  pin.value += digit
  error.value = ''

  if (pin.value.length === 4) {
    await submit()
  }
}

function handleDelete() {
  pin.value = pin.value.slice(0, -1)
}

async function submit() {
  try {
    await auth.verifyPin(pin.value)
    router.push({ name: 'home' })
  } catch {
    error.value = 'PIN incorrect'
    pin.value = ''
    shake.value = true
    setTimeout(() => (shake.value = false), 500)
  }
}
</script>

<template>
  <div class="lock">
    <div class="lock__bg-petals" aria-hidden="true">
      <span v-for="i in 6" :key="i" class="lock__bg-petal" :style="{ left: (i * 15) % 100 + '%', animationDelay: (i * 1.3) + 's' }" />
    </div>

    <div class="lock__card">
      <div class="lock__heart">💗</div>
      <p class="lock__title">Entre notre code secret</p>
      <p class="lock__subtitle">Juste pour nous deux</p>

      <div class="lock__dots" :class="{ 'lock__dots--shake': shake }">
        <span
          v-for="i in 4"
          :key="i"
          class="lock__dot"
          :class="{ 'lock__dot--filled': pin.length >= i }"
        />
      </div>

      <transition name="lock-error-fade">
        <p v-if="error" class="lock__error">{{ error }}</p>
      </transition>

      <div class="lock__keypad">
        <button
          v-for="n in ['1','2','3','4','5','6','7','8','9']"
          :key="n"
          class="lock__key"
          @click="handleDigit(n)"
        >
          {{ n }}
        </button>
        <span />
        <button class="lock__key" @click="handleDigit('0')">0</button>
        <button class="lock__key lock__key--delete" @click="handleDelete" aria-label="Effacer">⌫</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lock {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  color: var(--text);
  padding: 24px;
  overflow: hidden;
}

/* Pétales flottants décoratifs */
.lock__bg-petals {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.lock__bg-petal {
  position: absolute;
  top: -20px;
  width: 10px;
  height: 10px;
  border-radius: 50% 0 50% 50%;
  background: var(--pink-pale);
  opacity: 0.5;
  animation: lock-petal-fall 14s linear infinite;
}
@keyframes lock-petal-fall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 0.5; }
  100% { transform: translateY(110vh) rotate(400deg); opacity: 0; }
}

/* Carte centrale */
.lock__card {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(6px);
  border-radius: 32px;
  padding: 40px 32px;
  box-shadow: 0 16px 48px var(--shadow-pink);
  max-width: 360px;
  width: 100%;
}

.lock__heart {
  font-size: 2.8rem;
  animation: lock-pulse 1.8s ease-in-out infinite;
  margin-bottom: 8px;
}
@keyframes lock-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}

.lock__title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--pink-deep);
  text-align: center;
  margin-bottom: 4px;
}

.lock__subtitle {
  font-size: 0.85rem;
  color: var(--text-soft);
  margin-bottom: 28px;
}

.lock__dots {
  display: flex;
  gap: 18px;
  margin-bottom: 20px;
}
.lock__dots--shake {
  animation: lock-shake 0.4s ease;
}
@keyframes lock-shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

.lock__dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--pink-pale);
  background: transparent;
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.lock__dot--filled {
  background: var(--pink-deep);
  border-color: var(--pink-deep);
  box-shadow: 0 0 12px rgba(228, 17, 127, 0.45);
  transform: scale(1.1);
}

.lock__error {
  color: #c0392b;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 12px;
}
.lock-error-fade-enter-active,
.lock-error-fade-leave-active {
  transition: opacity 0.25s ease;
}
.lock-error-fade-enter-from,
.lock-error-fade-leave-to {
  opacity: 0;
}

.lock__keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 12px;
}

.lock__key {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  border: none;
  background: #ffffff;
  color: var(--pink-deep);
  font-size: 1.3rem;
  font-weight: 700;
  box-shadow: 0 6px 18px var(--shadow-pink);
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s ease, box-shadow 0.12s ease;
}
.lock__key:hover {
  box-shadow: 0 8px 22px rgba(228, 17, 127, 0.28);
}
.lock__key:active {
  transform: scale(0.92);
  background: var(--surface-soft);
}
.lock__key--delete {
  background: transparent;
  box-shadow: none;
  font-size: 1.2rem;
  color: var(--text-soft);
}
.lock__key--delete:active {
  background: var(--surface-soft);
  transform: scale(0.92);
}

@media (max-width: 400px) {
  .lock__card {
    padding: 32px 20px;
  }
  .lock__key {
    width: 60px;
    height: 60px;
  }
}
</style>