<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="['base-button', `btn-${variant}`, { 'btn-full': fullWidth }]"
    @click="handleClick"
  >
    <span v-if="loading" class="spinner-small" aria-hidden="true"></span>
    <slot v-else />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
    validator: (v) => ['button', 'submit', 'reset'].includes(v)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'danger', 'warning', 'success', 'secondary', 'ghost'].includes(v)
  },
  disabled: { type: Boolean, default: false },
  loading:  { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false }
})

const emit = defineEmits(['click'])

function handleClick(event) {
  if (!props.disabled && !props.loading) emit('click', event)
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 28px;
  font-family: 'Poppins', sans-serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 12px;
  border: 1.5px solid transparent;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 200ms ease, box-shadow 200ms ease, background 200ms ease, border-color 200ms ease;
  white-space: nowrap;
  text-transform: uppercase;
}

.btn-full {
  width: 100%;
}

/* Shimmer shine effect */
.base-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
  transition: left 0.5s ease;
  pointer-events: none;
}
.base-button:hover:not(:disabled)::after {
  left: 150%;
}

/* Disabled */
.base-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Active press */
.base-button:active:not(:disabled) {
  transform: translateY(1px) scale(0.98);
}

/* ── Primary ── */
.btn-primary {
  background: linear-gradient(135deg, #bb00ff 0%, #7700cc 100%);
  border-color: rgba(187, 0, 255, 0.6);
  color: #fff;
  box-shadow: 0 4px 16px rgba(187, 0, 255, 0.35), inset 0 1px 0 rgba(255,255,255,0.15);
}
.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #cc22ff 0%, #9900ee 100%);
  border-color: #ff00ff;
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(187, 0, 255, 0.55), 0 0 12px rgba(187, 0, 255, 0.4);
}

/* ── Danger ── */
.btn-danger {
  background: linear-gradient(135deg, #ff4757 0%, #cc2233 100%);
  border-color: rgba(255, 71, 87, 0.6);
  color: #fff;
  box-shadow: 0 4px 16px rgba(255, 71, 87, 0.3);
}
.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff6070 0%, #ee3344 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 71, 87, 0.5);
}

/* ── Warning ── */
.btn-warning {
  background: linear-gradient(135deg, #ffa502 0%, #cc7700 100%);
  border-color: rgba(255, 165, 2, 0.6);
  color: #0a0a1a;
  box-shadow: 0 4px 16px rgba(255, 165, 2, 0.3);
}
.btn-warning:hover:not(:disabled) {
  background: linear-gradient(135deg, #ffb733 0%, #ee9900 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 165, 2, 0.5);
}

/* ── Success ── */
.btn-success {
  background: linear-gradient(135deg, #2ed573 0%, #1aaa55 100%);
  border-color: rgba(46, 213, 115, 0.6);
  color: #0a0a1a;
  box-shadow: 0 4px 16px rgba(46, 213, 115, 0.3);
}
.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #5af59a 0%, #28cc66 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(46, 213, 115, 0.5);
}

/* ── Secondary ── */
.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(240, 230, 255, 0.85);
  box-shadow: none;
}
.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(187, 0, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(187, 0, 255, 0.2);
}

/* ── Ghost ── */
.btn-ghost {
  background: transparent;
  border-color: rgba(187, 0, 255, 0.4);
  color: #bb00ff;
  box-shadow: none;
}
.btn-ghost:hover:not(:disabled) {
  background: rgba(187, 0, 255, 0.1);
  border-color: #bb00ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(187, 0, 255, 0.25);
}

/* ── Spinner ── */
.spinner-small {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .base-button {
    font-size: 14px;
    padding: 13px 22px;
    min-height: 44px;
    touch-action: manipulation;
  }
}
</style>
