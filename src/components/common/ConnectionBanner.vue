<template>
  <Transition name="banner">
    <div v-if="!wsState.isConnected && wsState.isReconnecting" class="connection-banner" role="status" aria-live="polite">
      <span class="banner-spinner" aria-hidden="true"></span>
      <span>Reconectando...</span>
    </div>
  </Transition>
</template>

<script setup>
import websocketService from '@/services/websocket.service'

const wsState = websocketService.state
</script>

<style scoped>
.connection-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(255, 165, 2, 0.15);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 165, 2, 0.35);
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 210, 80, 0.95);
  letter-spacing: 0.3px;
}

.banner-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 165, 2, 0.3);
  border-top-color: rgba(255, 210, 80, 0.9);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.banner-enter-active,
.banner-leave-active {
  transition: transform 300ms ease, opacity 300ms ease;
}
.banner-enter-from,
.banner-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
