<template>
  <div :class="['game-layout', customClass]">
    <BackgroundVideo />

    <!-- Floating top bar -->
    <header v-if="showHeader" class="game-topbar">
      <div class="topbar-inner">
        <div class="topbar-left">
          <span class="brand-mark">BB</span>
        </div>

        <div class="topbar-center">
          <h1 class="game-title">{{ title }}</h1>
        </div>

        <div class="topbar-right">
          <span v-if="showSessionCode" class="session-badge">
            <span class="session-badge-label">Sesión</span>
            <span class="session-badge-code">{{ sessionStore.sessionCode }}</span>
          </span>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="game-content" :class="{ 'with-header': showHeader }">
      <slot />
    </main>

    <!-- Creator controls -->
    <div v-if="showCreatorControls && sessionStore.isCreator" class="controls-bar creator-bar">
      <slot name="creator-controls">
        <BaseButton
          v-if="showNextButton"
          variant="primary"
          @click="$emit('next')"
        >
          Siguiente
        </BaseButton>
        <BaseButton
          v-if="showLobbyButton"
          variant="ghost"
          @click="$emit('return-to-lobby')"
        >
          Volver al Lobby
        </BaseButton>
      </slot>
    </div>

    <!-- Logout -->
    <div v-if="showLogoutButton" class="controls-bar logout-bar">
      <BaseButton variant="danger" @click="$emit('logout')">
        Salir
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { useSessionStore } from '@/stores/session.store'
import BackgroundVideo from './BackgroundVideo.vue'
import BaseButton from './BaseButton.vue'

defineProps({
  title:               { type: String,  required: true },
  customClass:         { type: String,  default: '' },
  showHeader:          { type: Boolean, default: true },
  showSessionCode:     { type: Boolean, default: false },
  showCreatorControls: { type: Boolean, default: true },
  showNextButton:      { type: Boolean, default: true },
  showLobbyButton:     { type: Boolean, default: true },
  showLogoutButton:    { type: Boolean, default: true }
})

defineEmits(['next', 'return-to-lobby', 'logout'])

const sessionStore = useSessionStore()
</script>

<style scoped>
.game-layout {
  position: relative;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  color: #f0e6ff;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Floating top bar ── */
.game-topbar {
  position: fixed;
  top: max(12px, env(safe-area-inset-top, 12px));
  left: max(16px, env(safe-area-inset-left, 16px));
  right: max(16px, env(safe-area-inset-right, 16px));
  z-index: 100;
  animation: fadeInDown 0.5s ease;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(10, 8, 25, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(187, 0, 255, 0.25);
  border-radius: 16px;
  padding: 10px 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(187, 0, 255, 0.1);
}

.topbar-left,
.topbar-right {
  flex: 0 0 auto;
  min-width: 80px;
}

.topbar-right {
  display: flex;
  justify-content: flex-end;
}

.topbar-center {
  flex: 1;
  text-align: center;
}

.brand-mark {
  font-family: 'Righteous', sans-serif;
  font-size: 18px;
  color: #bb00ff;
  text-shadow: 0 0 10px rgba(187, 0, 255, 0.8);
  letter-spacing: 1px;
}

.game-title {
  font-family: 'Righteous', sans-serif;
  font-size: 20px;
  font-weight: 400;
  color: #f0e6ff;
  text-shadow: 0 0 12px rgba(187, 0, 255, 0.7);
  letter-spacing: 0.5px;
  margin: 0;
}

.session-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(187, 0, 255, 0.12);
  border: 1px solid rgba(187, 0, 255, 0.35);
  border-radius: 8px;
  padding: 4px 10px;
}

.session-badge-label {
  font-size: 10px;
  color: rgba(240, 230, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.session-badge-code {
  font-size: 14px;
  font-weight: 700;
  color: #bb00ff;
  letter-spacing: 2px;
  text-shadow: 0 0 8px rgba(187, 0, 255, 0.6);
}

/* ── Content area ── */
.game-content {
  flex: 1;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeInUp 0.6s ease;
}

.game-content.with-header {
  padding-top: calc(90px + env(safe-area-inset-top, 0px));
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Control bars ── */
.controls-bar {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0 20px;
}

.creator-bar {
  padding-bottom: 16px;
}

.logout-bar {
  padding-bottom: 24px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .game-topbar {
    top: 8px;
    left: 8px;
    right: 8px;
  }

  .topbar-inner {
    padding: 8px 14px;
    border-radius: 12px;
  }

  .game-title {
    font-size: 16px;
  }

  .brand-mark {
    font-size: 15px;
  }

  .topbar-left,
  .topbar-right {
    min-width: 60px;
  }

  .controls-bar {
    flex-direction: column;
    align-items: center;
  }

  .controls-bar :deep(.base-button) {
    width: 100%;
    max-width: 280px;
  }

  .game-content.with-header {
    padding-top: 80px;
  }
}

@media (max-width: 400px) {
  .topbar-left,
  .topbar-right {
    min-width: 44px;
  }

  .game-title {
    font-size: 13px;
  }

  .brand-mark {
    font-size: 13px;
  }

  .session-badge {
    padding: 3px 7px;
    gap: 4px;
  }

  .session-badge-code {
    font-size: 12px;
    letter-spacing: 1px;
  }
}
</style>
