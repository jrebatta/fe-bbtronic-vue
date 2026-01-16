<template>
  <div class="unirse-sesion-view">
    <!-- Video de fondo -->
    <video autoplay loop muted playsinline id="backgroundVideo" class="background-video">
      <source src="@/assets/videos/fondo2.webm" type="video/webm">
      Tu navegador no soporta el video HTML5.
    </video>

    <!-- Contenedor principal -->
    <div class="container vh-100 d-flex flex-column justify-content-center align-items-center">
      <h1 class="mb-4 page-title">Unirse a una Sesión</h1>

      <form id="joinSessionForm" class="w-100 session-form" @submit.prevent="handleSubmit">
        <div class="mb-3">
          <input
            v-model="sessionCode"
            id="sessionCode"
            class="form-control"
            placeholder="Código"
            required
            maxlength="4"
            :disabled="loading"
            @input="validateSessionCode"
          >
        </div>

        <div class="mb-3">
          <input
            v-model="username"
            type="text"
            id="username"
            class="form-control"
            placeholder="Nombre"
            required
            :disabled="loading"
          >
        </div>

        <button type="submit" class="btn btn-primary w-100 btn-submit" :disabled="loading">
          {{ loading ? 'Uniéndose...' : 'Unirse' }}
        </button>

        <div v-if="error" id="error" class="text-danger mt-3 error-message">
          {{ error }}
        </div>
      </form>
    </div>

    <!-- Spinner de carga -->
    <div v-if="loading" id="loadingSpinner" class="loading-spinner-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
/**
 * UnirseSesionView - Vista para unirse a una sesión existente
 * Migrado desde unirse_sesion.html y unirse_sesion.js
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session.store'
import { useLoading } from '@/composables/useLoading'
import apiService from '@/services/api.service'

const router = useRouter()
const sessionStore = useSessionStore()
const { loading, error, execute } = useLoading()

// State
const sessionCode = ref('')
const username = ref('')

/**
 * Validar código de sesión (solo alfanuméricos, máx 4 caracteres)
 */
function validateSessionCode(event) {
  const regex = /^[a-zA-Z0-9]{0,4}$/
  if (!regex.test(sessionCode.value)) {
    sessionCode.value = sessionCode.value.slice(0, 4)
  }
}

/**
 * Manejar envío del formulario
 */
async function handleSubmit() {
  // Validar que ambos campos estén llenos
  if (!sessionCode.value.trim() || !username.value.trim()) {
    error.value = 'El código de sesión y el nombre de usuario son obligatorios.'
    return
  }

  try {
    await execute(async () => {
      // Llamar al servicio para unirse a la sesión
      const sessionData = await apiService.joinSession(
        sessionCode.value.trim(),
        username.value.trim()
      )

      // Guardar sesión en el store
      sessionStore.setSession(sessionData.sessionToken, username.value.trim())
      sessionStore.setSessionCode(sessionCode.value.trim())

      // Redirigir al lobby
      router.push({ name: 'lobby' })
    })
  } catch (err) {
    // El error ya está manejado por useLoading
    console.error('Error al unirse a sesión:', err)
  }
}
</script>

<style scoped>
/* Estilos migrados de unirse_sesion.css */

.unirse-sesion-view {
  position: relative;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
  color: #fff;
  overflow: hidden;
}

.background-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
  opacity: 0.7;
}

.page-title {
  font-size: 48px;
  font-weight: 700;
  text-align: center;
  color: #fff;
  text-shadow:
    0 0 20px rgba(187, 0, 255, 0.8),
    0 0 40px rgba(187, 0, 255, 0.6),
    0 0 60px rgba(187, 0, 255, 0.4);
  animation: neonGlow 2s ease-in-out infinite alternate;
}

@keyframes neonGlow {
  from {
    text-shadow:
      0 0 20px rgba(187, 0, 255, 0.8),
      0 0 40px rgba(187, 0, 255, 0.6),
      0 0 60px rgba(187, 0, 255, 0.4);
  }
  to {
    text-shadow:
      0 0 30px rgba(187, 0, 255, 1),
      0 0 60px rgba(187, 0, 255, 0.8),
      0 0 90px rgba(187, 0, 255, 0.6);
  }
}

.session-form {
  max-width: 400px;
  padding: 40px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  border: 1px solid rgba(187, 0, 255, 0.3);
  box-shadow: 0 8px 32px rgba(187, 0, 255, 0.2);
}

.form-control {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(187, 0, 255, 0.5);
  color: #fff;
  padding: 15px;
  font-size: 16px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-control:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: #bb00ff;
  box-shadow: 0 0 20px rgba(187, 0, 255, 0.4);
  outline: none;
  color: #fff;
}

.form-control:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, rgba(187, 0, 255, 0.8), rgba(80, 0, 180, 0.8));
  border: 2px solid #bb00ff;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 10px;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(187, 0, 255, 0.4);
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(187, 0, 255, 1), rgba(80, 0, 180, 1));
  border-color: #ff00ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(187, 0, 255, 0.6);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #ff4757;
  background: rgba(255, 71, 87, 0.2);
  border: 1px solid rgba(255, 71, 87, 0.5);
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.loading-spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid rgba(187, 0, 255, 0.3);
  border-top-color: #bb00ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 36px;
  }

  .session-form {
    padding: 30px 20px;
  }
}
</style>
