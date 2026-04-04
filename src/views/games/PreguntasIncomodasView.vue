<template>
  <GameLayout
    title="Preguntas Incómodas"
    @next="fetchNext"
    @return-to-lobby="returnToLobby"
    @logout="handleLogout"
  >
    <QuestionCard
      :question-text="questionText"
      :to-user="toUser"
    />
  </GameLayout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session.store'
import { useSession } from '@/composables/useSession'
import { useWebSocket } from '@/composables/useWebSocket'
import apiService from '@/services/api.service'
import websocketService from '@/services/websocket.service'
import { GameLayout, QuestionCard } from '@/components/common'

const router = useRouter()
const sessionStore = useSessionStore()
const { logout } = useSession()

const questionText = ref('')
const toUser = ref('')

const { send } = useWebSocket({
  nextQuestion: (message) => {
    questionText.value = message.question
    toUser.value = message.toUser
  },
  returnToLobby: () => router.push({ name: 'lobby' })
})

onMounted(async () => {
  const data = await apiService.getSessionDetails(sessionStore.sessionCode)
  sessionStore.setCreator(data.creator)

  if (sessionStore.isCreator) fetchNext()

  // Configurar callback de reconexión para verificar si el juego sigue activo
  websocketService.setReconnectCallback(async () => {
    console.log('🔄 Reconectando en PreguntasIncómodas, verificando estado del juego...')
    await checkGameStatus()
  })
})

/**
 * Verificar si el juego sigue activo después de reconexión y restaurar pregunta
 */
async function checkGameStatus() {
  if (!sessionStore.sessionCode) {
    router.push('/')
    return
  }

  try {
    const syncData = await apiService.syncSession(sessionStore.sessionCode)

    if (!syncData.currentGame || syncData.currentGame !== 'preguntas-incomodas') {
      router.push({ name: 'lobby' })
      return
    }

    // Restaurar la última pregunta mostrada
    const currentQuestion = syncData.gameState?.currentQuestionData?.currentQuestion
    if (currentQuestion) {
      questionText.value = currentQuestion.question
      toUser.value = currentQuestion.toUser
    }
  } catch (err) {
    console.error('❌ Error al verificar estado del juego:', err)
    router.push({ name: 'lobby' })
  }
}

onBeforeUnmount(() => {
  websocketService.setReconnectCallback(null)
})

async function fetchNext() {
  // Solo el creador puede obtener la siguiente pregunta
  if (!sessionStore.isCreator) {
    console.warn('⚠️ Solo el creador puede obtener la siguiente pregunta')
    return
  }

  const data = await apiService.getNextPreguntasIncomodas(sessionStore.sessionCode)
  send('nextQuestion', { question: data.question, toUser: data.toUser })
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
