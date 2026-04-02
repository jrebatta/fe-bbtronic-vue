<template>
  <GameLayout
    title="Quién Es Más Probable"
    :show-next-button="false"
    :show-lobby-button="false"
    @logout="handleLogout"
  >
    <div class="game-wrapper">
      <QuestionCard :question-text="questionText" />

      <!-- Sección de votación -->
      <div v-if="!showResults" class="voting-section">
        <p class="voting-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          Elige a quién le aplica más
        </p>

        <div class="vote-grid">
          <button
            v-for="user in sessionStore.users"
            :key="user.username"
            class="vote-chip"
            :class="{
              'vote-chip--selected': selectedVote === user.username,
              'vote-chip--disabled': hasVoted && selectedVote !== user.username,
              'vote-chip--voted': hasVoted
            }"
            :disabled="hasVoted"
            @click="vote(user.username)"
          >
            <span class="chip-avatar">{{ user.username.slice(0, 2).toUpperCase() }}</span>
            <span class="chip-name">{{ user.username }}</span>
            <svg v-if="selectedVote === user.username" class="chip-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        </div>

        <p v-if="hasVoted" class="voted-hint">Voto registrado. Esperando al anfitrión...</p>
      </div>

      <!-- Sección de resultados -->
      <div v-if="showResults" class="results-section">
        <div class="results-crown" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 20h20v2H2zM4 17l4-8 4 4 4-6 4 10H4z"/>
          </svg>
        </div>
        <p class="results-label">Más probable</p>
        <p class="results-winner">{{ winner }}</p>
      </div>
    </div>

    <!-- Controles del creador personalizados -->
    <template #creator-controls>
      <BaseButton
        variant="success"
        :disabled="!canShowResults"
        @click="showVoteResults"
      >
        Ver resultados
      </BaseButton>
      <BaseButton
        variant="primary"
        :disabled="!canNextQuestion"
        @click="fetchNext"
      >
        Siguiente
      </BaseButton>
      <BaseButton variant="ghost" @click="returnToLobby">
        Lobby
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
const selectedVote = ref('')
const showResults = ref(false)
const winner = ref('')
const canShowResults = ref(true)
const canNextQuestion = ref(false)

const { send } = useWebSocket({
  newQuienEsMasProbableQuestion: (message) => {
    questionText.value = message.data
    showResults.value = false
    hasVoted.value = false
    selectedVote.value = ''
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
  // Validar que existe un sessionCode antes de sincronizar
  if (!sessionStore.sessionCode) {
    console.warn('⚠️ No hay sessionCode, redirigiendo al home')
    router.push('/')
    return
  }

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
  selectedVote.value = votedUser
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
.game-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}

/* ── Voting section ── */
.voting-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.voting-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(240, 230, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

/* ── Vote grid ── */
.vote-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.vote-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(187, 0, 255, 0.22);
  border-radius: 12px;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  color: rgba(240, 230, 255, 0.85);
  transition: all 200ms ease;
  min-height: 52px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.vote-chip:hover:not(:disabled) {
  background: rgba(187, 0, 255, 0.12);
  border-color: rgba(187, 0, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(187, 0, 255, 0.2);
}

.vote-chip:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.vote-chip--selected {
  background: rgba(187, 0, 255, 0.18) !important;
  border-color: #bb00ff !important;
  box-shadow: 0 0 0 1px rgba(187, 0, 255, 0.4), 0 4px 20px rgba(187, 0, 255, 0.3);
}

.vote-chip--disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.vote-chip--voted {
  cursor: default;
}

.chip-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(187, 0, 255, 0.25);
  border: 1px solid rgba(187, 0, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #cc44ff;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.vote-chip--selected .chip-avatar {
  background: rgba(187, 0, 255, 0.4);
  border-color: #bb00ff;
}

.chip-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-check {
  color: #bb00ff;
  flex-shrink: 0;
  filter: drop-shadow(0 0 4px rgba(187, 0, 255, 0.8));
}

.voted-hint {
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  color: rgba(240, 230, 255, 0.4);
  text-align: center;
  font-style: italic;
}

/* ── Results section ── */
.results-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 20px;
  background: rgba(12, 8, 28, 0.75);
  border: 1px solid rgba(187, 0, 255, 0.4);
  border-radius: 18px;
  box-shadow: 0 0 32px rgba(187, 0, 255, 0.2), inset 0 1px 0 rgba(255,255,255,0.05);
  animation: resultReveal 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes resultReveal {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.results-crown {
  color: #ffa502;
  filter: drop-shadow(0 0 10px rgba(255, 165, 2, 0.7));
  margin-bottom: 4px;
}

.results-label {
  font-family: 'Poppins', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(240, 230, 255, 0.45);
}

.results-winner {
  font-family: 'Righteous', sans-serif;
  font-size: 32px;
  color: #f0e6ff;
  text-shadow: 0 0 24px rgba(187, 0, 255, 0.9), 0 0 48px rgba(187, 0, 255, 0.5);
  letter-spacing: 1px;
  animation: winnerGlow 2s ease-in-out infinite;
}

@keyframes winnerGlow {
  0%, 100% { text-shadow: 0 0 24px rgba(187, 0, 255, 0.9), 0 0 48px rgba(187, 0, 255, 0.5); }
  50%       { text-shadow: 0 0 32px rgba(187, 0, 255, 1),   0 0 64px rgba(187, 0, 255, 0.7); }
}

/* ── Responsive ── */
@media (max-width: 400px) {
  .vote-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .chip-name {
    font-size: 13px;
  }

  .results-winner {
    font-size: 26px;
  }
}
</style>
