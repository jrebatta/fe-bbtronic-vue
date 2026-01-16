<template>
  <GameLayout
    title="Preguntas Directas"
    :show-next-button="false"
    @return-to-lobby="returnToLobby"
    @logout="handleLogout"
  >
    <div class="questions-container">
      <div
        v-for="user in otherUsers"
        :key="user.username"
        class="question-item"
      >
        <label class="question-label">Pregunta para {{ user.username }}:</label>
        <input
          v-model="questions[user.username]"
          type="text"
          placeholder="Escribe tu pregunta aquí"
          class="question-input"
        >
      </div>
    </div>

    <div class="anonymous-check">
      <input
        v-model="anonymousCheck"
        type="checkbox"
        id="anonymousCheck"
      >
      <label for="anonymousCheck">
        Enviar de forma anónima
      </label>
    </div>

    <BaseButton
      variant="primary"
      :disabled="questionsSent || loading"
      :loading="loading"
      @click="submitQuestions"
    >
      Enviar Preguntas
    </BaseButton>

    <ErrorMessage v-if="error" :message="error" />
  </GameLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

const otherUsers = computed(() =>
  sessionStore.users.filter(u => u.username !== sessionStore.username)
)

const { send } = useWebSocket({
  allReady: () => router.push({ name: 'mostrar-preguntas' }),
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

  // Configurar callback de reconexión para verificar si el juego sigue activo
  websocketService.setReconnectCallback(async () => {
    console.log('🔄 Reconectando en PreguntasDirectas, verificando estado del juego...')
    await checkGameStatus()
  })
})

/**
 * Verificar si el juego sigue activo después de reconexión
 */
async function checkGameStatus() {
  try {
    const syncData = await apiService.syncSession(sessionStore.sessionCode)

    // Si ya no hay juego activo o cambió de juego, volver al lobby
    if (!syncData.currentGame || syncData.currentGame !== 'preguntas-directas') {
      console.log('⚠️ Juego no activo o cambió, volviendo al lobby')
      router.push({ name: 'lobby' })
      return
    }

    // Si el juego sigue siendo preguntas-directas, verificar si todos ya están listos
    // y el juego avanzó a la fase de mostrar preguntas
    try {
      const checkResponse = await apiService.checkAllReady(sessionStore.sessionCode)

      if (checkResponse.allReady) {
        console.log('✅ Todos los usuarios ya están listos, avanzando a mostrar preguntas')
        // Todos ya enviaron sus preguntas, redirigir a MostrarPreguntas
        router.push({ name: 'mostrar-preguntas' })
        return
      }
    } catch (checkErr) {
      console.log('ℹ️ No se pudo verificar estado de usuarios listos, continuando en PreguntasDirectas')
    }

    console.log('✅ Juego activo, continuando en PreguntasDirectas')
  } catch (err) {
    console.error('❌ Error al verificar estado del juego:', err)
    // Si hay error al sincronizar, asumir que el juego no está activo y volver al lobby
    console.warn('⚠️ Error al sincronizar, volviendo al lobby por seguridad')
    router.push({ name: 'lobby' })
  }
}

async function submitQuestions() {
  if (questionsSent.value) return

  const allFilled = otherUsers.value.every(u => questions.value[u.username]?.trim())
  if (!allFilled) {
    error.value = 'Por favor, completa todas las preguntas.'
    return
  }

  questionsSent.value = true
  loading.value = true
  error.value = ''

  try {
    // Enviar todas las preguntas
    for (const user of otherUsers.value) {
      await apiService.sendQuestion(sessionStore.sessionCode, {
        fromUser: sessionStore.username,
        toUser: user.username,
        question: questions.value[user.username].trim(),
        anonymous: anonymousCheck.value
      })
    }

    // Marcar usuario como listo y capturar roundId
    const readyResponse = await apiService.markUserReady(sessionStore.username)

    // Guardar el roundId en el store
    if (readyResponse.roundId) {
      sessionStore.setCurrentRoundId(readyResponse.roundId)
      console.log('✅ Usuario listo, roundId:', readyResponse.roundId)
    }

    // Verificar si todos están listos
    const checkResponse = await apiService.checkAllReady(sessionStore.sessionCode)

    if (checkResponse.allReady) {
      send('allReady')
    } else {
      error.value = checkResponse.message || 'Esperando a otros usuarios...'
    }
  } catch (err) {
    error.value = 'Error al enviar preguntas'
    questionsSent.value = false
  } finally {
    loading.value = false
  }
}

async function returnToLobby() {
  // Solo el creador puede volver al lobby
  if (!sessionStore.isCreator) {
    console.warn('⚠️ Solo el creador puede volver al lobby')
    return
  }

  try {
    // Terminar el juego en el backend (limpia currentGame)
    await apiService.endCurrentGame(sessionStore.sessionCode)

    // Notificar a todos los usuarios que vuelvan al lobby
    send('returnToLobby', { isCreator: true })
    router.push({ name: 'lobby' })
  } catch (err) {
    console.error('Error al terminar el juego:', err)
    // Aun con error, intentar volver al lobby
    send('returnToLobby', { isCreator: true })
    router.push({ name: 'lobby' })
  }
}

async function handleLogout() {
  await logout()
}
</script>

<style scoped>
.questions-container {
  max-width: 700px;
  margin: 30px auto;
}

.question-item {
  margin-bottom: 25px;
}

.question-label {
  display: block;
  color: #fff;
  font-size: 16px;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(187, 0, 255, 0.6);
}

.question-input {
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(187, 0, 255, 0.4);
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  transition: all 0.3s;
}

.question-input:focus {
  outline: none;
  border-color: #bb00ff;
  box-shadow: 0 0 15px rgba(187, 0, 255, 0.5);
}

.question-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.anonymous-check {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px auto;
  max-width: 700px;
  color: #fff;
  font-size: 16px;
}

.anonymous-check input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #bb00ff;
}

.anonymous-check label {
  cursor: pointer;
  user-select: none;
}

@media (max-width: 768px) {
  .questions-container {
    padding: 0 15px;
  }

  .question-label,
  .anonymous-check {
    font-size: 14px;
  }
}
</style>
