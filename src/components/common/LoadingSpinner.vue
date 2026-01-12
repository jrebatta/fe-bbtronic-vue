<template>
  <div v-if="show" :class="['loading-spinner-overlay', { inline }]">
    <div class="spinner" :style="{ width: size, height: size }"></div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup>
/**
 * LoadingSpinner - Componente de spinner de carga
 */

defineProps({
  show: {
    type: Boolean,
    default: true
  },
  message: {
    type: String,
    default: ''
  },
  inline: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: '60px'
  }
})
</script>

<style scoped>
.loading-spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  gap: 20px;
}

.loading-spinner-overlay.inline {
  position: relative;
  background: transparent;
  height: auto;
  padding: 20px;
}

.spinner {
  border: 6px solid rgba(187, 0, 255, 0.3);
  border-top-color: #bb00ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-message {
  color: #fff;
  font-size: 18px;
  text-align: center;
  text-shadow: 0 0 10px rgba(187, 0, 255, 0.8);
}
</style>
