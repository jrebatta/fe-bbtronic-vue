<template>
  <GameLayout
    title="Quién Es Más Probable"
    :show-next-button="false"
    :show-lobby-button="false"
    @logout="handleLogout"
  >
    <QuestionCard :question-text="questionText" />

    <!-- Sección de votación -->
    <div v-if="!showResults" class="voting-section">
      <h3 class="voting-title">Vota por un usuario:</h3>
      <div class="user-buttons">
        <BaseButton
          v-for="user in sessionStore.users"
          :key="user.username"
          variant="secondary"
          :disabled="hasVoted"
          @click="vote(user.username)"
        >
          {{ user.username }}
        </BaseButton>
      </div>
    </div>

    <!-- Sección de resultados -->
    <div v-if="showResults" class="results-section">
      <h2 class="results-title">Ganador: <span class="winner-name">{{ winner }}</span></h2>
    </div>

    <!-- Controles del creador personalizados -->
    <template #creator-controls>
      <BaseButton
        variant="success"
        :disabled="!canShowResults"
        @click="showVoteResults"
      >
        Mostrar Resultados
      </BaseButton>
      <BaseButton
        variant="primary"
        :disabled="!canNextQuestion"
        @click="fetchNext"
      >
        Siguiente Pregunta
      </BaseButton>
      <BaseButton variant="warning" @click="returnToLobby">
        Volver al Lobby
      </BaseButton>
    </template>
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
import { GameLayout, QuestionCard, BaseButton } from '@/components/common'

const router = useRouter()
const sessionStore = useSessionStore()
const { logout } = useSession()

const questionText = ref('')
const hasVoted = ref(false)
const showResults = ref(false)
const winner = ref('')
const canShowResults = ref(true)
const canNextQuestion = ref(false)

const { send } = useWebSocket({
  newQuienEsMasProbableQuestion: (message) => {
    questionText.value = message.data
    showResults.value = false
    hasVoted.value = false
    canShowResults.value = true
    canNextQuestion.value = false
  },
  votingResults: (message) => {
    winner.value = message.winner || 'Empate'
    showResults.value = true
    canShowResults.value = false
    canNextQuestion.value = true
  },
  returnToLobby: () => router.push({ name: 'lobby' })
})

onMounted(async () => {
  const data = await apiService.getSessionDetails(sessionStore.sessionCode)
  sessionStore.setCreator(data.creator)
  sessionStore.setUsers(data.users)

  if (sessionStore.isCreator) fetchNext()

  // Configurar callback de reconexión para verificar si el juego sigue activo
  websocketService.setReconnectCallback(async () => {
    console.log('🔄 Reconectando en QuienEsMasProbable, verificando estado del juego...')
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
    if (!syncData.currentGame || syncData.currentGame !== 'quien-es-mas-probable') {
      console.log('⚠️ Juego no activo o cambió, volviendo al lobby')
      router.push({ name: 'lobby' })
      return
    }

    console.log('✅ Juego activo, continuando en QuienEsMasProbable')
  } catch (err) {
    console.error('❌ Error al verificar estado del juego:', err)
    // Si hay error al sincronizar, asumir que el juego no está activo y volver al lobby
    console.warn('⚠️ Error al sincronizar, volviendo al lobby por seguridad')
    router.push({ name: 'lobby' })
  }
}

async function vote(votedUser) {
  await apiService.sendVote(sessionStore.sessionCode, sessionStore.username, votedUser)
  hasVoted.value = true
}

async function showVoteResults() {
  // Solo el creador puede mostrar resultados
  if (!sessionStore.isCreator) {
    console.warn('⚠️ Solo el creador puede mostrar resultados')
    return
  }

  const response = await apiService.checkAllVoted(sessionStore.sessionCode)
  if (response.allVoted) {
    const results = await apiService.getVoteResults(sessionStore.sessionCode)
    send('votingResults', { winner: results.winner })
  } else {
    alert('Aún no todos los usuarios han votado.')
  }
}

async function fetchNext() {
  // Solo el creador puede obtener la siguiente pregunta
  if (!sessionStore.isCreator) {
    console.warn('⚠️ Solo el creador puede obtener la siguiente pregunta')
    return
  }

  canNextQuestion.value = false
  await apiService.clearVotes(sessionStore.sessionCode)
  const data = await apiService.getNextQuienEsMasProbable(sessionStore.sessionCode)
  send('newQuienEsMasProbableQuestion', { data })
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
    send('returnToLobby')
    router.push({ name: 'lobby' })
  } catch (err) {
    console.error('Error al terminar el juego:', err)
    // Aun con error, intentar volver al lobby
    send('returnToLobby')
    router.push({ name: 'lobby' })
  }
}

async function handleLogout() {
  await logout()
}
</script>

<style scoped>
.voting-section {
  margin: 30px 0;
  text-align: center;
}

.voting-title {
  color: #fff;
  font-size: 20px;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(187, 0, 255, 0.8);
}

.user-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
}

.results-section {
  margin: 30px 0;
  text-align: center;
  padding: 40px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 15px;
  border: 2px solid rgba(187, 0, 255, 0.4);
}

.results-title {
  color: #fff;
  font-size: 28px;
  text-shadow: 0 0 15px rgba(187, 0, 255, 0.8);
}

.winner-name {
  color: #bb00ff;
  font-weight: bold;
  text-shadow: 0 0 20px rgba(187, 0, 255, 1);
}

@media (max-width: 768px) {
  .user-buttons {
    flex-direction: column;
  }

  .results-title {
    font-size: 22px;
  }
}
</style>
