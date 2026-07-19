<template>
  <router-link :to="to" class="feature-card">
    <div class="feature-card__icon">
      <component :is="icon" :size="24" :stroke-width="2" />
    </div>
    <div class="feature-card__text">
      <h3 class="feature-card__title">{{ title }}</h3>
      <p class="feature-card__subtitle">{{ subtitle }}</p>
    </div>
    <span class="feature-card__chevron">›</span>
  </router-link>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  title: string
  subtitle: string
  to: string
}>()
</script>

<style scoped>
.feature-card {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  padding: 20px 18px;
  background: var(--surface);
  border-radius: 28px;
  box-shadow: 0 6px 22px var(--shadow-pink);
  text-decoration: none;
  color: var(--text);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-3px) scale(1.015);
  box-shadow: 0 12px 32px rgba(124, 23, 74, 0.18);
}

.feature-card:active {
  transform: scale(0.97);
  box-shadow: 0 3px 10px var(--shadow-pink);
}

.feature-card__icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: var(--color-rose-clair);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-rose-fonce, #9C0F52);
}

.feature-card__text {
  flex: 1;
  min-width: 0;
}

.feature-card__title {
  font-size: 1rem;
  font-weight: 800;
  margin: 0;
  color: var(--color-bordeaux);
}

.feature-card__subtitle {
  font-size: 0.76rem;
  color: var(--text-soft);
  margin: 4px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feature-card__chevron {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-rose);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
}

@media (max-width: 480px) {
  .feature-card {
    padding: 14px 14px;
    gap: 12px;
    border-radius: 22px;
  }
  .feature-card__icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
  }
  .feature-card__icon svg {
    width: 20px;
    height: 20px;
  }
  .feature-card__title {
    font-size: 0.9rem;
  }
  .feature-card__subtitle {
    font-size: 0.7rem;
  }
}
</style>