<template>
  <video
    autoplay
    loop
    muted
    playsinline
    :class="['background-video', { 'low-opacity': lowOpacity }]"
  >
    <source src="@/assets/videos/fondo2.webm" type="video/webm">
    Tu navegador no soporta el video HTML5.
  </video>
</template>

<script setup>
/**
 * BackgroundVideo - Componente de video de fondo
 * Usado en todas las vistas para mantener consistencia
 */

defineProps({
  lowOpacity: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.background-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
  opacity: 0.7;
}

.background-video.low-opacity {
  opacity: 0.5;
}
</style>
