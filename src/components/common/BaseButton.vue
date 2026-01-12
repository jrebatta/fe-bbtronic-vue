<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="['base-button', variantClass]"
    @click="handleClick"
  >
    <span v-if="loading" class="spinner-small"></span>
    <slot v-else />
  </button>
</template>

<script setup>
/**
 * BaseButton - Componente de botón reutilizable
 * Soporta diferentes variantes: primary, danger, warning, success
 */

import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'danger', 'warning', 'success', 'secondary'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const variantClass = computed(() => `btn-${props.variant}`)

function handleClick(event) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  padding: 15px 30px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 10px;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Roboto', sans-serif;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Primary */
.btn-primary {
  background: linear-gradient(135deg, rgba(187, 0, 255, 0.8), rgba(80, 0, 180, 0.8));
  border-color: #bb00ff;
  color: #fff;
  box-shadow: 0 4px 15px rgba(187, 0, 255, 0.4);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(187, 0, 255, 1), rgba(80, 0, 180, 1));
  border-color: #ff00ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(187, 0, 255, 0.6);
}

/* Danger */
.btn-danger {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.8), rgba(200, 35, 51, 0.8));
  border-color: #dc3545;
  color: #fff;
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(220, 53, 69, 1), rgba(200, 35, 51, 1));
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(220, 53, 69, 0.6);
}

/* Warning */
.btn-warning {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.8), rgba(255, 152, 0, 0.8));
  border-color: #ffc107;
  color: #000;
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4);
}

.btn-warning:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(255, 193, 7, 1), rgba(255, 152, 0, 1));
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 193, 7, 0.6);
}

/* Success */
.btn-success {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.8), rgba(25, 135, 84, 0.8));
  border-color: #28a745;
  color: #fff;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(40, 167, 69, 1), rgba(25, 135, 84, 1));
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(40, 167, 69, 0.6);
}

/* Secondary */
.btn-secondary {
  background: linear-gradient(135deg, rgba(108, 117, 125, 0.8), rgba(90, 98, 104, 0.8));
  border-color: #6c757d;
  color: #fff;
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.4);
}

.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(108, 117, 125, 1), rgba(90, 98, 104, 1));
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(108, 117, 125, 0.6);
}

.base-button:active:not(:disabled) {
  transform: translateY(0);
}

/* Spinner pequeño */
.spinner-small {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .base-button {
    font-size: 16px;
    padding: 12px 20px;
  }
}
</style>
