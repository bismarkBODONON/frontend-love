<template>
  <div class="floral-column">
    <!-- Bouquets de fleurs -->
    <img
      src="/assets/flower-bouquet.png"
      alt=""
      class="floral-column__overlay floral-column__overlay--top"
    />
    <img
      src="/assets/flower-bouquet.png"
      alt=""
      class="floral-column__overlay floral-column__overlay--bottom"
    />

    <!-- Papillons -->
    <img
      src="/assets/butterfly-1.png"
      alt=""
      class="floral-column__butterfly floral-column__butterfly--top"
    />
    <img
      src="/assets/butterfly-2.png"
      alt=""
      class="floral-column__butterfly floral-column__butterfly--middle"
    />
    <img
      src="/assets/butterfly-1.png"
      alt=""
      class="floral-column__butterfly floral-column__butterfly--bottom"
    />

    <!-- Pétales tombants -->
    <div class="floral-column__petals">
      <div
        v-for="i in 12"
        :key="i"
        class="petal"
        :style="{
          left: (i * 9) % 100 + '%',
          animationDelay: (i * 0.4) + 's',
          width: (8 + i * 2) + 'px',
          height: (8 + i * 2) + 'px',
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.floral-column {
  flex-shrink: 0;
  width: 35%;
  min-width: 220px;
  align-self: stretch;
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 0;

  background-image: url('/assets/christelle-main.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Fondu sur le bord droit pour fusionner avec .home__main, symétrique au fondu de HomeView */
.floral-column::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, rgba(255,255,255,0) 80%, rgba(255,255,255,0.55) 92%, rgba(255,255,255,0.98) 100%);
  z-index: 3;
  pointer-events: none;
}

.floral-column__overlay {
  position: absolute;
  z-index: 4;
  pointer-events: none;
  opacity: 0.9;
  filter: drop-shadow(0 4px 20px rgba(156, 15, 82, 0.25));
}
.floral-column__overlay--top {
  top: 2%;
  right: -25px;
  width: 55%;
  transform: rotate(12deg);
}
.floral-column__overlay--bottom {
  bottom: 4%;
  left: -30px;
  width: 60%;
  transform: rotate(-18deg) scaleX(-1);
}

.floral-column__butterfly {
  position: absolute;
  z-index: 5;
  filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.18));
  animation: float 7s ease-in-out infinite;
}
.floral-column__butterfly--top {
  top: 5%;
  left: 8%;
  width: 22%;
  animation-delay: 0s;
  transform: rotate(-8deg);
}
.floral-column__butterfly--middle {
  top: 40%;
  right: 4%;
  width: 26%;
  animation-delay: 2.2s;
  transform: rotate(12deg);
}
.floral-column__butterfly--bottom {
  bottom: 16%;
  left: 10%;
  width: 20%;
  animation-delay: 4.4s;
  transform: rotate(-5deg);
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-14px) rotate(4deg); }
}

.floral-column__petals {
  position: absolute;
  inset: 0;
  z-index: 6;
  pointer-events: none;
  overflow: hidden;
}
.petal {
  position: absolute;
  top: -30px;
  border-radius: 50% 0 50% 50%;
  background: radial-gradient(circle at 40% 40%, #ffb3c6, #fce4ee);
  opacity: 0.5;
  animation: fall 9s linear infinite;
}
@keyframes fall {
  0% { transform: translateY(-30px) rotate(0deg) scale(0.5); opacity: 0.6; }
  100% { transform: translateY(calc(100vh + 60px)) rotate(720deg) scale(1.1); opacity: 0; }
}

@media (max-width: 640px) {
  .floral-column {
    width: 28%;
    min-width: 90px;
  }
  .floral-column__overlay { display: none; }
}
</style>