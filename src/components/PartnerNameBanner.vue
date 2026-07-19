<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <div class="name-banner">
    <svg class="name-banner__butterfly name-banner__butterfly--left" viewBox="0 0 40 30" width="34">
      <path d="M20 15 C10 2, 0 5, 2 14 C0 22, 10 24, 20 15 Z" fill="#7a1636" opacity="0.85" />
      <path d="M20 15 C30 2, 40 5, 38 14 C40 22, 30 24, 20 15 Z" fill="#7a1636" opacity="0.85" />
      <line x1="20" y1="8" x2="20" y2="22" stroke="#4a0d22" stroke-width="1.5" />
    </svg>

    <h2 class="name-banner__name">
      <span v-for="(letter, i) in name.split('')" :key="i" class="name-banner__letter">
        {{ letter }}
        <svg class="name-banner__flower" viewBox="0 0 20 20" width="14">
          <g v-for="p in 5" :key="p" :transform="`rotate(${p * 72}, 10, 10)`">
            <ellipse cx="10" cy="5" rx="3.2" ry="5" fill="#fff" stroke="#d8b8c2" stroke-width="0.4" />
          </g>
          <circle cx="10" cy="10" r="2.4" fill="#c9a227" />
        </svg>
      </span>
    </h2>

    <svg class="name-banner__butterfly name-banner__butterfly--right" viewBox="0 0 40 30" width="34">
      <path d="M20 15 C10 2, 0 5, 2 14 C0 22, 10 24, 20 15 Z" fill="#7a1636" opacity="0.85" />
      <path d="M20 15 C30 2, 40 5, 38 14 C40 22, 30 24, 20 15 Z" fill="#7a1636" opacity="0.85" />
      <line x1="20" y1="8" x2="20" y2="22" stroke="#4a0d22" stroke-width="1.5" />
    </svg>
  </div>
</template>

<style scoped>
.name-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px 14px;
  border-radius: 20px;
  background: linear-gradient(160deg, #8a1f42, #c0466f 60%, #e8a1bc);
  box-shadow: 0 6px 20px var(--shadow-pink);
  margin-bottom: 24px;
}

.name-banner__name {
  display: flex;
  font-family: var(--font-display);
  font-size: 1.9rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.02em;
  margin: 0;
}

.name-banner__letter {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.name-banner__flower {
  margin-top: 2px;
}

.name-banner__butterfly {
  flex-shrink: 0;
  animation: flutter 3s ease-in-out infinite;
}
.name-banner__butterfly--right {
  animation-delay: 1.2s;
}

@keyframes flutter {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(-6deg) translateY(-3px); }
}
</style>