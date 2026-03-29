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
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #ff4757;
  background: rgba(255, 71, 87, 0.12);
  border: 1px solid rgba(255, 71, 87, 0.35);
  padding: 11px 16px;
  border-radius: 10px;
  text-align: center;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-8px); }
  60%       { transform: translateX(8px); }
  80%       { transform: translateX(-4px); }
}
</style>
