<template>
  <div :class="['game-layout', customClass]">
    <BackgroundVideo />

    <div class="game-container">
      <!-- Header con título y código de sesión -->
      <header v-if="showHeader" class="game-header">
        <h1 class="game-title">{{ title }}</h1>
        <p v-if="showSessionCode" class="session-code">
          Sesión: <strong>{{ sessionStore.sessionCode }}</strong>
        </p>
      </header>

      <!-- Contenido principal del juego -->
      <main class="game-content">
        <slot />
      </main>

      <!-- Controles del creador (botones de navegación) -->
      <div v-if="showCreatorControls && sessionStore.isCreator" class="creator-controls">
        <slot name="creator-controls">
          <BaseButton
            v-if="showNextButton"
            @click="$emit('next')"
            variant="primary"
          >
            Siguiente
          </BaseButton>
          <BaseButton
            v-if="showLobbyButton"
            @click="$emit('return-to-lobby')"
            variant="warning"
          >
            Volver al Lobby
          </BaseButton>
        </slot>
      </div>

      <!-- Botón de salir (siempre visible) -->
      <div v-if="showLogoutButton" class="logout-section">
        <BaseButton @click="$emit('logout')" variant="danger">
          Salir
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * GameLayout - Layout común para todos los juegos
 * Proporciona estructura consistente con header, controles y logout
 */

import { useSessionStore } from '@/stores/session.store'
import BackgroundVideo from './BackgroundVideo.vue'
import BaseButton from './BaseButton.vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  customClass: {
    type: String,
    default: ''
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showSessionCode: {
    type: Boolean,
    default: false
  },
  showCreatorControls: {
    type: Boolean,
    default: true
  },
  showNextButton: {
    type: Boolean,
    default: true
  },
  showLobbyButton: {
    type: Boolean,
    default: true
  },
  showLogoutButton: {
    type: Boolean,
    default: true
  }
})

defineEmits(['next', 'return-to-lobby', 'logout'])

const sessionStore = useSessionStore()
</script>

<style scoped>
.game-layout {
  position: relative;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
  color: #fff;
  background: linear-gradient(135deg, #0a0015 0%, #1a0033 50%, #2d0052 100%);
  overflow-x: hidden;
}

.game-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.game-header {
  text-align: center;
  animation: fadeIn 0.8s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.game-title {
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  text-shadow:
    0 0 20px rgba(187, 0, 255, 0.8),
    0 0 40px rgba(187, 0, 255, 0.6);
  margin-bottom: 10px;
}

.session-code {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}

.session-code strong {
  color: #bb00ff;
  text-shadow: 0 0 10px rgba(187, 0, 255, 0.6);
}

.game-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.creator-controls,
.logout-section {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 768px) {
  .game-title {
    font-size: 32px;
  }

  .game-container {
    padding: 20px 15px;
  }

  .creator-controls,
  .logout-section {
    flex-direction: column;
  }
}
</style>
