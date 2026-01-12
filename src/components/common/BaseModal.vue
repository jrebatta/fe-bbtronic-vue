<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <button class="close-button" @click="close">&times;</button>

        <h2 v-if="title" class="modal-title">{{ title }}</h2>

        <div class="modal-body">
          <slot />
        </div>

        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * BaseModal - Componente modal reutilizable
 */

defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  padding: 40px;
  border-radius: 20px;
  border: 2px solid rgba(187, 0, 255, 0.5);
  box-shadow: 0 8px 32px rgba(187, 0, 255, 0.4);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-button {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.3s;
  padding: 0;
  line-height: 1;
}

.close-button:hover {
  color: #bb00ff;
}

.modal-title {
  color: #fff;
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 0 0 10px rgba(187, 0, 255, 0.8);
  font-size: 24px;
}

.modal-body {
  color: #fff;
}

.modal-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(187, 0, 255, 0.3);
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
