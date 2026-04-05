<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast" tag="div" class="toast-list">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          @click="toastStore.dismiss(toast.id)"
          role="alert"
        >
          <span class="toast-icon" aria-hidden="true">{{ icons[toast.type] }}</span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToastStore } from '@/stores/toast.store'

const toastStore = useToastStore()

const icons = {
  info:    'ℹ',
  success: '✓',
  error:   '✕',
  warning: '⚠',
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9998;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
  width: max-content;
  max-width: calc(100vw - 32px);
}

.toast-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 14px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(16px);
  pointer-events: all;
  cursor: pointer;
  max-width: 380px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.toast--info {
  background: rgba(30, 144, 255, 0.18);
  border: 1px solid rgba(30, 144, 255, 0.4);
  color: rgba(160, 210, 255, 0.95);
}
.toast--success {
  background: rgba(46, 213, 115, 0.15);
  border: 1px solid rgba(46, 213, 115, 0.4);
  color: rgba(100, 240, 160, 0.95);
}
.toast--error {
  background: rgba(255, 71, 87, 0.15);
  border: 1px solid rgba(255, 71, 87, 0.4);
  color: rgba(255, 140, 150, 0.95);
}
.toast--warning {
  background: rgba(255, 165, 2, 0.15);
  border: 1px solid rgba(255, 165, 2, 0.4);
  color: rgba(255, 210, 80, 0.95);
}

.toast-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.toast-message {
  line-height: 1.4;
}

.toast-enter-active {
  transition: all 350ms cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-leave-active {
  transition: all 250ms ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.97);
}
.toast-move {
  transition: transform 300ms ease;
}
</style>
