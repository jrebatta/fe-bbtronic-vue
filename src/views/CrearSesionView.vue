<template>
  <div class="crear-sesion-view">
    <BackgroundVideo />

    <div class="page-wrapper">
      <!-- Back link -->
      <router-link to="/" class="back-link" aria-label="Volver al inicio">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Volver
      </router-link>

      <!-- Card -->
      <div class="form-card">
        <!-- Icon -->
        <div class="card-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>

        <h1 class="card-title">Crear Sala</h1>
        <p class="card-subtitle">Serás el anfitrión de la sesión</p>

        <form @submit.prevent="handleSubmit" novalidate>
          <div class="field-group">
            <label class="field-label" for="username">Tu nombre</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="input-field"
              placeholder="¿Cómo te llamas?"
              autocomplete="nickname"
              required
              :disabled="loading"
            />
          </div>

          <BaseButton
            type="submit"
            variant="primary"
            :disabled="loading"
            :loading="loading"
            :full-width="true"
          >
            Crear Sesión
          </BaseButton>

          <ErrorMessage v-if="error" :message="error" />
        </form>
      </div>
    </div>

    <LoadingSpinner :show="loading" message="Creando sesión..." />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session.store'
import { useLoading } from '@/composables/useLoading'
import apiService from '@/services/api.service'
import { BackgroundVideo, BaseButton, ErrorMessage, LoadingSpinner } from '@/components/common'

const router = useRouter()
const sessionStore = useSessionStore()
const { loading, error, execute } = useLoading()

const username = ref('')

async function handleSubmit() {
  if (!username.value.trim()) {
    error.value = 'El nombre de usuario es obligatorio.'
    return
  }

  try {
    await execute(async () => {
      const sessionData = await apiService.createSession(username.value.trim())
      sessionStore.setSession(sessionData.sessionToken, username.value.trim())
      sessionStore.setSessionCode(sessionData.sessionCode)
      await router.push({ name: 'lobby' })
    })
  } catch (err) {
    console.error('❌ Error al crear sesión:', err)
    error.value = err.message || 'Error al crear la sesión'
  }
}
</script>

<style scoped>
.crear-sesion-view {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.page-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Back link */
.back-link {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(240, 230, 255, 0.5);
  text-decoration: none;
  transition: color 200ms ease;
  letter-spacing: 0.2px;
}
.back-link:hover {
  color: #bb00ff;
}

/* Card */
.form-card {
  width: 100%;
  background: rgba(12, 8, 28, 0.82);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(187, 0, 255, 0.28);
  border-radius: 22px;
  padding: 36px 32px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(187, 0, 255, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
}

/* Top accent */
.form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 25%;
  right: 25%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #bb00ff, transparent);
  border-radius: 0 0 2px 2px;
}

.card-icon {
  width: 56px;
  height: 56px;
  background: rgba(187, 0, 255, 0.12);
  border: 1px solid rgba(187, 0, 255, 0.3);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cc44ff;
  margin-bottom: 6px;
}

.card-title {
  font-family: 'Righteous', sans-serif;
  font-size: 28px;
  font-weight: 400;
  color: #f0e6ff;
  text-shadow: 0 0 20px rgba(187, 0, 255, 0.7);
  letter-spacing: 0.5px;
}

.card-subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  color: rgba(240, 230, 255, 0.45);
  margin-bottom: 12px;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field-label {
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: rgba(240, 230, 255, 0.6);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Use the global input-field styles */
.input-field {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1.5px solid rgba(187, 0, 255, 0.25);
  color: #f0e6ff;
  padding: 14px 18px;
  font-size: 15px;
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  border-radius: 11px;
  transition: border-color 200ms ease, box-shadow 200ms ease, background 200ms ease;
  outline: none;
}

.input-field::placeholder {
  color: rgba(240, 230, 255, 0.35);
  font-weight: 300;
}

.input-field:focus {
  background: rgba(187, 0, 255, 0.07);
  border-color: #bb00ff;
  box-shadow: 0 0 0 3px rgba(187, 0, 255, 0.14), 0 0 16px rgba(187, 0, 255, 0.18);
}

.input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .input-field {
    font-size: 16px; /* Prevent iOS auto-zoom on focus */
  }
}

@media (max-width: 480px) {
  .form-card {
    padding: 28px 20px;
  }

  .page-wrapper {
    padding: 16px 16px;
  }
}
</style>
