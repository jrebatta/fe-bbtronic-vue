<template>
  <GameLayout
    title="Preguntas"
    @next="fetchNext"
    @return-to-lobby="returnToLobby"
    @logout="handleLogout"
  >
    <QuestionCard
      :question-text="currentQuestion.question"
      :question-number="questionNumber"
      :from-user="currentQuestion.fromUser || 'Anónimo'"
      :to-user="currentQuestion.toUser"
    />
  </GameLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

const currentQuestion = ref({})
const questionNumber = ref(0)

const { send } = useWebSocket({
  update: (message) => {
    currentQuestion.value = message.question
    questionNumber.value = message.numeroDePregunta
  },
  returnToLobby: () => router.push({ name: 'lobby' })
})

onMounted(async () => {
  try {
    const data = await apiService.getSessionDetails(sessionStore.sessionCode)
    sessionStore.setCreator(data.creator)

    const response = await apiService.getCurrentQuestion(sessionStore.sessionCode)
    currentQuestion.value = response.question
    questionNumber.value = response.numeroDePregunta
  } catch (err) {
    console.error('Error:', err)
  }

  // Configurar callback de reconexión para verificar si el juego sigue activo
  websocketService.setReconnectCallback(async () => {
    console.log('🔄 Reconectando en MostrarPreguntas, verificando estado del juego...')
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
    } else {
      console.log('✅ Juego activo, continuando en MostrarPreguntas')
    }
  } catch (err) {
    console.error('❌ Error al verificar estado del juego:', err)
  }
}

async function fetchNext() {
  // Solo el creador puede obtener la siguiente pregunta
  if (!sessionStore.isCreator) {
    console.warn('⚠️ Solo el creador puede obtener la siguiente pregunta')
    return
  }

  try {
    const response = await apiService.getNextRandomQuestion(
      sessionStore.sessionCode,
      currentQuestion.value.toUser || ''
    )
    send('update', {
      question: response.question,
      numeroDePregunta: response.numeroDePregunta
    })
  } catch (err) {
    console.error('Error al obtener siguiente pregunta:', err)
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

    // Marcar que ya se jugó una ronda de Preguntas Directas
    sessionStore.markPreguntasDirectasPlayed()
    console.log('✅ Ronda completada, volviendo al lobby')

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
