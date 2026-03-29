<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close" role="dialog" aria-modal="true">
        <div class="modal-content">
          <button class="close-btn" @click="close" aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <h2 v-if="title" class="modal-title">{{ title }}</h2>

          <div class="modal-body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  title:      { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])
function close() { emit('update:modelValue', false) }
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.modal-content {
  background: rgba(14, 10, 30, 0.95);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(187, 0, 255, 0.4);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(187, 0, 255, 0.2);
  padding: 36px;
  max-width: 520px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

/* Subtle top accent line */
.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #bb00ff, transparent);
  border-radius: 0 0 2px 2px;
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(240, 230, 255, 0.7);
  cursor: pointer;
  transition: all 200ms ease;
}
.close-btn:hover {
  background: rgba(187, 0, 255, 0.15);
  border-color: rgba(187, 0, 255, 0.5);
  color: #bb00ff;
}

.modal-title {
  font-family: 'Righteous', sans-serif;
  font-size: 22px;
  font-weight: 400;
  color: #f0e6ff;
  text-align: center;
  margin-bottom: 24px;
  text-shadow: 0 0 16px rgba(187, 0, 255, 0.6);
  padding-right: 24px;
}

.modal-body {
  color: #f0e6ff;
}

.modal-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(187, 0, 255, 0.2);
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* Transitions */
.modal-enter-active {
  transition: opacity 250ms ease, transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.modal-enter-from {
  opacity: 0;
  transform: scale(0.94) translateY(-16px);
}
.modal-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}

@media (max-width: 480px) {
  .modal-content {
    padding: 28px 20px;
  }
}
</style>
