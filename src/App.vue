<script setup>
import { RouterView } from 'vue-router'
import ConnectionBanner from '@/components/common/ConnectionBanner.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'
</script>

<template>
  <ConnectionBanner />
  <RouterView />
  <ToastContainer />
</template>

<style>
/* Estilos globales mínimos */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  /* Prevent font size scaling when rotating on iOS */
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

#app {
  width: 100%;
  min-height: 100vh;
  /* Support iPhone notch/home indicator */
  min-height: 100dvh;
}

/* Remove default tap highlight on mobile for all interactive elements */
button, a, [role="button"] {
  -webkit-tap-highlight-color: transparent;
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
