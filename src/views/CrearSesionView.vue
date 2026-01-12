<template>
  <div class="crear-sesion-view">
    <BackgroundVideo :low-opacity="false" />

    <div class="container">
      <h1 class="page-title">Crear Lobby</h1>

      <form class="session-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <input
            v-model="username"
            type="text"
            class="form-control"
            placeholder="Nombre"
            required
            aria-label="Nombre de usuario"
            :disabled="loading"
          />
        </div>

        <BaseButton type="submit" variant="primary" :disabled="loading" :loading="loading">
          Crear
        </BaseButton>

        <ErrorMessage v-if="error" :message="error" />
      </form>
    </div>

    <LoadingSpinner :show="loading" message="Creando sesión..." />
  </div>
</template>

<script setup>
/**
 * CrearSesionView - Vista para crear una nueva sesión
 * Migrado desde crear_sesion.html y crear_sesion.js
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session.store'
import { useLoading } from '@/composables/useLoading'
import apiService from '@/services/api.service'
import { BackgroundVideo, BaseButton, ErrorMessage, LoadingSpinner } from '@/components/common'

const router = useRouter()
const sessionStore = useSessionStore()
const { loading, error, execute } = useLoading()

// State
const username = ref('')

/**
 * Manejar envío del formulario
 */
async function handleSubmit() {
  // Validar que el username no esté vacío
  if (!username.value.trim()) {
    error.value = 'El nombre de usuario es obligatorio.'
    return
  }

  try {
    await execute(async () => {
      console.log('🚀 Iniciando creación de sesión...')

      // Llamar al servicio para crear la sesión
      const sessionData = await apiService.createSession(username.value.trim())
      console.log('✅ Sesión creada:', sessionData)

      // Guardar sesión en el store
      sessionStore.setSession(sessionData.sessionToken, username.value.trim())
      sessionStore.setSessionCode(sessionData.sessionCode)

      console.log('✅ Datos guardados en store, redirigiendo al lobby...')

      // Redirigir al lobby
      await router.push({ name: 'lobby' })
      console.log('✅ Navegación completada')
    })
  } catch (err) {
    // El error ya está manejado por useLoading
    console.error('❌ Error al crear sesión:', err)
    error.value = err.message || 'Error al crear la sesión'
  }
}
</script>

<style scoped>
.crear-sesion-view {
  position: relative;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
  color: #fff;
  background: linear-gradient(135deg, #0a0015 0%, #1a0033 50%, #2d0052 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.page-title {
  font-size: 48px;
  font-weight: 700;
  text-align: center;
  color: #fff;
  margin-bottom: 40px;
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
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  border: 1px solid rgba(187, 0, 255, 0.3);
  box-shadow: 0 8px 32px rgba(187, 0, 255, 0.2);
}

.form-group {
  margin-bottom: 20px;
}

.form-control {
  width: 100%;
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

@media (max-width: 768px) {
  .page-title {
    font-size: 36px;
  }

  .session-form {
    padding: 30px 20px;
  }
}
</style>
