<template>
  <GameLayout
    title="Preguntas Directas"
    :show-next-button="false"
    :show-session-code="true"
    @return-to-lobby="returnToLobby"
    @logout="handleLogout"
  >
    <div class="questions-wrapper">
      <div class="intro-text">
        <p>Escríbele una pregunta a cada jugador</p>
      </div>

      <div class="questions-list">
        <div
          v-for="user in otherUsers"
          :key="user.username"
          class="question-item"
        >
          <label class="question-label" :for="`q-${user.username}`">
            <span class="label-for">Para</span>
            <span class="label-name">{{ user.username }}</span>
          </label>
          <input
            :id="`q-${user.username}`"
            v-model="questions[user.username]"
            type="text"
            class="question-input"
            placeholder="Escribe tu pregunta aquí..."
            :disabled="questionsSent"
          />
        </div>
      </div>

      <div class="form-footer">
        <label class="anon-toggle" for="anonymousCheck">
          <input
            id="anonymousCheck"
            v-model="anonymousCheck"
            type="checkbox"
            class="anon-checkbox"
          />
          <span class="anon-label">Enviar de forma anónima</span>
        </label>

        <BaseButton
          variant="primary"
          :disabled="questionsSent || loading"
          :loading="loading"
          @click="submitQuestions"
        >
          {{ questionsSent ? 'Preguntas enviadas' : 'Enviar Preguntas' }}
        </BaseButton>
      </div>

      <!-- Waiting message (info, not error) -->
      <div v-if="waitingMessage" class="waiting-notice">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        {{ waitingMessage }}
      </div>

      <ErrorMessage v-if="error" :message="error" />
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session.store'
import { useSession } from '@/composables/useSession'
import { useWebSocket } from '@/composables/useWebSocket'
import apiService from '@/services/api.service'
import websocketService from '@/services/websocket.service'
import { GameLayout, BaseButton, ErrorMessage } from '@/components/common'

const router = useRouter()
const sessionStore = useSessionStore()
const { logout } = useSession()

const questions = ref({})
const anonymousCheck = ref(false)
const questionsSent = ref(false)
const loading = ref(false)
const error = ref('')
const waitingMessage = ref('')

const otherUsers = computed(() =>
  sessionStore.users.filter(u => u.username !== sessionStore.username)
)

const { send } = useWebSocket({
  allReady:      () => router.push({ name: 'mostrar-preguntas' }),
  returnToLobby: () => router.push({ name: 'lobby' })
})

onMounted(async () => {
  try {
    const data = await apiService.getSessionDetails(sessionStore.sessionCode)
    sessionStore.setCreator(data.creator)
    sessionStore.setUsers(data.users)
  } catch (err) {
    error.value = 'Error al cargar sesión'
  }

  websocketService.setReconnectCallback(async () => {
    await checkGameStatus()
  })
})

async function checkGameStatus() {
  if (!sessionStore.sessionCode) {
    router.push('/')
    return
  }
  try {
    const syncData = await apiService.syncSession(sessionStore.sessionCode)
    if (!syncData.currentGame || syncData.currentGame !== 'preguntas-directas') {
      router.push({ name: 'lobby' })
      return
    }
    const allUsersReady = syncData.users && syncData.users.every(u => u.ready === true)
    if (syncData.gameState?.roundId && allUsersReady) {
      sessionStore.setCurrentRoundId(syncData.gameState.roundId)
      router.push({ name: 'mostrar-preguntas' })
    }
  } catch (err) {
    router.push({ name: 'lobby' })
  }
}

async function submitQuestions() {
  if (questionsSent.value) return

  if (otherUsers.value.length === 0) {
    error.value = 'Necesitas al menos otro jugador para comenzar.'
    return
  }

  const allFilled = otherUsers.value.every(u => questions.value[u.username]?.trim())
  if (!allFilled) {
    error.value = 'Por favor, completa todas las preguntas.'
    return
  }

  questionsSent.value = true
  loading.value = true
  error.value = ''
  waitingMessage.value = ''

  try {
    for (const user of otherUsers.value) {
      await apiService.sendQuestion(sessionStore.sessionCode, {
        fromUser: sessionStore.username,
        toUser: user.username,
        question: questions.value[user.username].trim(),
        anonymous: anonymousCheck.value
      })
    }

    const readyResponse = await apiService.markUserReady(sessionStore.username)
    if (readyResponse.roundId) {
      sessionStore.setCurrentRoundId(readyResponse.roundId)
    }

    const checkResponse = await apiService.checkAllReady(sessionStore.sessionCode)

    if (checkResponse.roundId) {
      sessionStore.setCurrentRoundId(checkResponse.roundId)
    }

    if (checkResponse.allReady) {
      // El backend ya emitió el WS 'allReady' a todos los usuarios.
      // Navegar directamente para quien disparó el checkAllReady final.
      router.push({ name: 'mostrar-preguntas' })
    } else {
      // Mostrar mensaje de espera amigable; el WS 'allReady' llegará
      // cuando el último usuario envíe sus preguntas.
      waitingMessage.value = checkResponse.message || 'Esperando a otros jugadores...'
    }
  } catch (err) {
    error.value = 'Error al enviar preguntas'
    questionsSent.value = false
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  websocketService.setReconnectCallback(null)
})

async function returnToLobby() {
  if (!sessionStore.isCreator) return
  try {
    await apiService.endCurrentGame(sessionStore.sessionCode)
    send('returnToLobby', { isCreator: true })
    router.push({ name: 'lobby' })
  } catch (err) {
    send('returnToLobby', { isCreator: true })
    router.push({ name: 'lobby' })
  }
}

async function handleLogout() {
  await logout()
}
</script>

<style scoped>
.questions-wrapper {
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.intro-text {
  text-align: center;
}

.intro-text p {
  font-size: 15px;
  color: rgba(240, 230, 255, 0.55);
  font-weight: 400;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label-for {
  font-size: 12px;
  color: rgba(240, 230, 255, 0.45);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.label-name {
  font-size: 15px;
  font-weight: 700;
  color: #cc44ff;
  text-shadow: 0 0 8px rgba(187, 0, 255, 0.4);
}

.question-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(187, 0, 255, 0.22);
  color: #f0e6ff;
  padding: 13px 16px;
  font-size: 15px;
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  border-radius: 12px;
  transition: border-color 200ms ease, box-shadow 200ms ease, background 200ms ease;
  outline: none;
}

.question-input::placeholder {
  color: rgba(240, 230, 255, 0.3);
  font-weight: 300;
}

.question-input:focus {
  background: rgba(187, 0, 255, 0.07);
  border-color: #bb00ff;
  box-shadow: 0 0 0 3px rgba(187, 0, 255, 0.13);
}

.question-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Footer ── */
.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.anon-toggle {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  user-select: none;
}

.anon-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #bb00ff;
  cursor: pointer;
  flex-shrink: 0;
}

.anon-label {
  font-size: 14px;
  color: rgba(240, 230, 255, 0.65);
  font-weight: 400;
}

/* ── Waiting notice ── */
.waiting-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(187, 0, 255, 0.08);
  border: 1px solid rgba(187, 0, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(240, 230, 255, 0.8);
  animation: waitingPulse 2s ease-in-out infinite;
}

@keyframes waitingPulse {
  0%, 100% { border-color: rgba(187, 0, 255, 0.3); }
  50%       { border-color: rgba(187, 0, 255, 0.6); }
}

@media (max-width: 768px) {
  .question-input {
    font-size: 16px; /* Prevent iOS auto-zoom on focus */
  }
}

@media (max-width: 600px) {
  .form-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .form-footer :deep(.base-button) {
    width: 100%;
  }
}
</style>
