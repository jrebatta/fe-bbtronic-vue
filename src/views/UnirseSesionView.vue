<template>
  <div class="unirse-sesion-view">
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
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </div>

        <h1 class="card-title">Unirse</h1>
        <p class="card-subtitle">Ingresa el código de sesión</p>

        <form @submit.prevent="handleSubmit" novalidate>
          <!-- Code input with large display -->
          <div class="field-group">
            <label class="field-label" for="sessionCode">Código</label>
            <input
              id="sessionCode"
              v-model="sessionCode"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              class="input-field code-input"
              placeholder="1234"
              maxlength="4"
              autocomplete="off"
              spellcheck="false"
              required
              :disabled="loading"
              @input="validateSessionCode"
            />
          </div>

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
            variant="success"
            :disabled="loading"
            :loading="loading"
            :full-width="true"
          >
            Entrar a la Sala
          </BaseButton>

          <ErrorMessage v-if="error" :message="error" />
        </form>
      </div>
    </div>

    <LoadingSpinner :show="loading" message="Uniéndose..." />
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

const sessionCode = ref('')
const username    = ref('')

function validateSessionCode() {
  sessionCode.value = sessionCode.value.replace(/[^0-9]/g, '').slice(0, 4)
}

async function handleSubmit() {
  if (!sessionCode.value.trim() || !username.value.trim()) {
    error.value = 'El código de sesión y el nombre son obligatorios.'
    return
  }

  try {
    await execute(async () => {
      const sessionData = await apiService.joinSession(
        sessionCode.value.trim(),
        username.value.trim()
      )
      sessionStore.setSession(sessionData.sessionToken, username.value.trim())
      sessionStore.setSessionCode(sessionCode.value.trim())
      router.push({ name: 'lobby' })
    })
  } catch (err) {
    console.error('Error al unirse a sesión:', err)
  }
}
</script>

<style scoped>
.unirse-sesion-view {
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
}
.back-link:hover {
  color: #bb00ff;
}

.form-card {
  width: 100%;
  background: rgba(12, 8, 28, 0.82);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(46, 213, 115, 0.22);
  border-radius: 22px;
  padding: 36px 32px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(46, 213, 115, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
}

.form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 25%;
  right: 25%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #2ed573, transparent);
  border-radius: 0 0 2px 2px;
}

.card-icon {
  width: 56px;
  height: 56px;
  background: rgba(46, 213, 115, 0.1);
  border: 1px solid rgba(46, 213, 115, 0.28);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2ed573;
  margin-bottom: 6px;
}

.card-title {
  font-family: 'Righteous', sans-serif;
  font-size: 28px;
  font-weight: 400;
  color: #f0e6ff;
  text-shadow: 0 0 20px rgba(46, 213, 115, 0.4);
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

.input-field {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1.5px solid rgba(187, 0, 255, 0.22);
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
  color: rgba(240, 230, 255, 0.3);
  font-weight: 300;
}

.input-field:focus {
  background: rgba(187, 0, 255, 0.07);
  border-color: #bb00ff;
  box-shadow: 0 0 0 3px rgba(187, 0, 255, 0.13), 0 0 16px rgba(187, 0, 255, 0.16);
}

.input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Code input — larger, centered, spaced letters */
.code-input {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 10px;
  text-align: center;
  text-transform: uppercase;
  padding: 16px 18px 16px 28px;
  border-color: rgba(46, 213, 115, 0.3);
}

.code-input:focus {
  border-color: #2ed573;
  box-shadow: 0 0 0 3px rgba(46, 213, 115, 0.12), 0 0 16px rgba(46, 213, 115, 0.15);
  background: rgba(46, 213, 115, 0.05);
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
