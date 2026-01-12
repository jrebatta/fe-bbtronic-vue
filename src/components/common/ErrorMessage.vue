<template>
  <div v-if="message" class="error-message">
    {{ message }}
  </div>
</template>

<script setup>
/**
 * ErrorMessage - Componente para mostrar mensajes de error
 */

defineProps({
  message: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.error-message {
  color: #ff4757;
  background: rgba(255, 71, 87, 0.2);
  border: 1px solid rgba(255, 71, 87, 0.5);
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  margin: 10px 0;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
</style>
