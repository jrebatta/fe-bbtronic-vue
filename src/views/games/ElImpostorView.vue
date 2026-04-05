<template>
  <div class="impostor-view">
    <BackgroundVideo />

    <Transition name="phase-fade" mode="out-in">

      <!-- ── COUNTDOWN ── -->
      <div v-if="phase === 'countdown'" key="countdown" class="phase-screen">
        <Transition name="number-pop" mode="out-in">
          <div :key="countdownNumber" class="countdown-number">{{ countdownNumber }}</div>
        </Transition>
        <p class="countdown-label">Preparando la partida...</p>
      </div>

      <!-- ── ROLE REVEAL ── -->
      <div v-else-if="phase === 'role-reveal'" key="role" class="phase-screen phase-role">
        <div v-if="myRole === 'impostor'" class="role-card role-card--impostor">
          <div class="role-icon">🕵️</div>
          <h1 class="role-title">IMPOSTOR</h1>
          <p class="role-desc">Convence a todos de que sabes de qué hablan</p>
        </div>
        <div v-else class="role-card role-card--civil">
          <p class="role-hint">La palabra de esta ronda es</p>
          <h1 class="role-word">{{ myWord }}</h1>
          <p class="role-desc">Descríbela sin decirla directamente</p>
        </div>
        <BaseButton variant="primary" class="role-ready-btn" @click="phase = 'description'">
          Entendido
        </BaseButton>
      </div>

      <!-- ── DESCRIPTION ── -->
      <div v-else-if="phase === 'description'" key="desc" class="phase-screen phase-description">
        <header class="game-header">
          <span class="game-title">El Impostor</span>
          <span class="session-code-badge">{{ sessionStore.sessionCode }}</span>
        </header>

        <div class="players-panel">
          <div class="players-group">
            <p class="players-label">
              <span class="label-dot label-dot--alive"></span>
              Vivos ({{ alivePlayers.length }})
            </p>
            <div class="players-chips">
              <div v-for="p in alivePlayers" :key="p" class="player-chip player-chip--alive">
                <span class="chip-av">{{ p.slice(0,2).toUpperCase() }}</span>
                <span class="chip-name">{{ p }}</span>
                <span
                  class="chip-dot"
                  :class="reconnectingUsers.has(p) ? 'chip-dot--warn' : 'chip-dot--green'"
                ></span>
              </div>
            </div>
          </div>

          <div v-if="eliminatedPlayers.length" class="players-group">
            <p class="players-label">
              <span class="label-dot label-dot--dead"></span>
              Eliminados ({{ eliminatedPlayers.length }})
            </p>
            <div class="players-chips">
              <div v-for="p in eliminatedPlayers" :key="p" class="player-chip player-chip--dead">
                <span class="chip-av chip-av--dead">{{ p.slice(0,2).toUpperCase() }}</span>
                <span class="chip-name chip-name--dead">{{ p }}</span>
                <span class="chip-dot chip-dot--dead">✕</span>
              </div>
            </div>
          </div>
        </div>

        <div class="role-reminder">
          <span v-if="myRole === 'impostor'" class="reminder--impostor">Tú eres el IMPOSTOR 🕵️</span>
          <span v-else class="reminder--civil">Tu palabra: <strong>{{ myWord }}</strong></span>
        </div>

        <div v-if="isAlive" class="call-vote-wrap">
          <button
            class="call-vote-btn"
            :class="{ 'call-vote-btn--disabled': callVoteCooldown > 0 }"
            :disabled="callVoteCooldown > 0"
            @click="callVote"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            <span v-if="callVoteCooldown > 0">Cooldown: {{ formatTime(callVoteCooldown) }}</span>
            <span v-else>Llamar a votación</span>
          </button>
        </div>

        <div v-else class="spectator-badge">
          Eres espectador — la partida sigue
        </div>

      </div>

      <!-- ── VOTING ── -->
      <div v-else-if="phase === 'voting' || phase === 'voting-expired'" key="voting" class="phase-screen phase-voting">
        <div class="voting-header">
          <h2 class="voting-title">Votación</h2>
          <div class="voting-timer" :class="{ 'voting-timer--warn': votingTimeLeft <= 15 && phase === 'voting' }">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ phase === 'voting-expired' ? '—' : `${votingTimeLeft}s` }}
          </div>
        </div>

        <div v-if="phase === 'voting-expired' && pendingVoters.length" class="pending-notice">
          <p class="pending-title">Faltan por votar:</p>
          <div class="pending-chips">
            <span v-for="p in pendingVoters" :key="p" class="pending-chip">{{ p }}</span>
          </div>
        </div>

        <div class="vote-progress-wrap">
          <div class="vote-progress-bar">
            <div class="vote-progress-fill" :style="{ width: `${totalVoters ? (votedCount / totalVoters) * 100 : 0}%` }"></div>
          </div>
          <span class="vote-progress-label">{{ votedCount }} / {{ totalVoters }} votaron</span>
        </div>

        <template v-if="isAlive && !hasVoted">
          <p class="vote-hint">¿Quién crees que es el impostor?</p>
          <div class="vote-grid">
            <button
              v-for="p in votablePlayers"
              :key="p"
              class="vote-chip"
              :class="{ 'vote-chip--selected': selectedVote === p }"
              @click="selectedVote = p"
            >
              <span class="chip-av">{{ p.slice(0,2).toUpperCase() }}</span>
              <span class="chip-name">{{ p }}</span>
              <svg v-if="selectedVote === p" class="chip-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
          <BaseButton variant="primary" :disabled="!selectedVote" @click="submitVote">
            Confirmar voto
          </BaseButton>
        </template>

        <div v-else-if="isAlive && hasVoted" class="voted-notice">
          Voto registrado. Esperando a los demás...
        </div>

        <div v-else class="spectator-badge">
          Eres espectador — solo observas
        </div>
      </div>

      <!-- ── VOTING RESULT ── -->
      <div v-else-if="phase === 'voting-result'" key="result" class="phase-screen phase-result">
        <div v-if="votingResult?.tie" class="result-card result-card--tie">
          <div class="result-icon">🤝</div>
          <h2 class="result-title result-title--tie">¡Empate!</h2>
          <p class="result-sub result-sub--tie">Los votos quedaron igualados</p>
          <p class="tie-notice">Nadie fue eliminado — el juego continúa</p>
        </div>
        <div v-else class="result-card result-card--elim">
          <div class="result-icon">💀</div>
          <h2 class="result-title">{{ votingResult?.eliminatedPlayer }}</h2>
          <p class="result-sub">fue eliminado</p>
          <div class="vote-breakdown">
            <div v-for="(count, player) in votingResult?.votes" :key="player" class="vb-row">
              <span class="vb-name">{{ player }}</span>
              <div class="vb-bar-wrap">
                <div class="vb-bar-fill" :style="{ width: totalVoters ? `${(count / totalVoters) * 100}%` : '0%' }"></div>
              </div>
              <span class="vb-count">{{ count }}</span>
            </div>
          </div>
        </div>

        <!-- Botón para continuar: aparece cuando el backend ya mandó el siguiente estado -->
        <BaseButton
          v-if="pendingRoundContinues && votingResult?.eliminatedPlayer !== sessionStore.username"
          variant="primary"
          @click="applyRoundContinues"
        >
          Continuar jugando
        </BaseButton>
        <BaseButton
          v-if="votingResult?.eliminatedPlayer === sessionStore.username"
          variant="primary"
          @click="phase = 'eliminated'"
        >
          Ver mi resultado
        </BaseButton>
      </div>

      <!-- ── ELIMINATED ── -->
      <div v-else-if="phase === 'eliminated'" key="elim" class="phase-screen phase-eliminated">
        <div v-if="snitchChoice === null" class="elim-question">
          <div class="elim-icon">💀</div>
          <h2 class="elim-title">Te eliminaron</h2>
          <p class="elim-sub">¿Quieres saber quiénes son los impostores?</p>
          <div class="elim-choices">
            <BaseButton variant="primary" @click="snitchChoice = true">Sí, quiero saber</BaseButton>
            <BaseButton variant="ghost" @click="snitchChoice = false">No, espero</BaseButton>
          </div>
        </div>
        <div v-else-if="snitchChoice === true" class="elim-snitch">
          <div class="snitch-icon">🐸</div>
          <h1 class="snitch-title">SAPOOOOO</h1>
          <div class="snitch-impostors">
            <span v-for="imp in revealedImpostors" :key="imp" class="impostor-chip">🕵️ {{ imp }}</span>
          </div>
        </div>
        <div v-else class="elim-silent">
          <div class="silent-icon">🤐</div>
          <h2 class="silent-title">Espera a que terminen la ronda</h2>
          <p class="silent-sub">No arruines el juego</p>
        </div>
      </div>

      <!-- ── GAME OVER ── -->
      <div v-else-if="phase === 'game-over'" key="gameover" class="phase-screen phase-gameover">
        <div v-if="gameOver?.winner === 'civilians'" class="gameover-card gameover-card--win">
          <div class="gameover-icon">🎉</div>
          <h1 class="gameover-title">¡Ganaron los civiles!</h1>
          <p class="gameover-sub">{{ gameOver.message }}</p>
        </div>
        <div v-else class="gameover-card gameover-card--lose">
          <div class="gameover-icon">🕵️</div>
          <h1 class="gameover-title">¡Ganaron los impostores!</h1>
          <p class="gameover-sub">{{ gameOver?.message }}</p>
        </div>

        <div class="impostors-reveal">
          <p class="reveal-label">Los impostores eran:</p>
          <div class="reveal-chips">
            <span v-for="imp in gameOver?.impostors" :key="imp" class="impostor-chip">🕵️ {{ imp }}</span>
          </div>
        </div>

        <div v-if="sessionStore.isCreator" class="gameover-actions">
          <BaseButton variant="primary" @click="playAgain">Jugar de nuevo</BaseButton>
          <BaseButton variant="ghost" @click="returnToLobby">Volver al lobby</BaseButton>
        </div>
        <p v-else class="waiting-host">Esperando al anfitrión...</p>
      </div>

    </Transition>

    <!-- Botón flotante: solo el creador, en cualquier fase excepto game-over -->
    <button
      v-if="sessionStore.isCreator && phase !== 'game-over'"
      class="end-game-fab"
      @click="returnToLobby"
    >
      ⏹ Terminar juego
    </button>

    <!-- Overlay: el anfitrión terminó el juego (para no-creadores) -->
    <Transition name="phase-fade">
      <div v-if="hostEndedGame" class="host-ended-overlay">
        <div class="host-ended-card">
          <div class="host-ended-icon">🏠</div>
          <p class="host-ended-title">El anfitrión terminó el juego</p>
          <BaseButton variant="primary" @click="router.push({ name: 'lobby' })">
            Ir al lobby
          </BaseButton>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session.store'
import { useWebSocket } from '@/composables/useWebSocket'
import { useToastStore } from '@/stores/toast.store'
import apiService from '@/services/api.service'
import websocketService from '@/services/websocket.service'
import { BackgroundVideo, BaseButton } from '@/components/common'

const router = useRouter()
const sessionStore = useSessionStore()
const toastStore = useToastStore()

// ── Phase ──
const phase = ref('countdown')
const countdownNumber = ref(3)

// ── Role ──
const myRole = ref('')
const myWord = ref('')

// ── Players ──
const alivePlayers = ref([])
const eliminatedPlayers = ref([])
const reconnectingUsers = computed(() => {
  const set = new Set()
  sessionStore.users.forEach(u => { if (u.reconnecting) set.add(u.username) })
  return set
})

// ── Voting ──
const votingTimeLeft = ref(60)
let votingTimerInterval = null
const pendingVoters = ref([])
const votedCount = ref(0)
const totalVoters = ref(0)
const selectedVote = ref('')
const hasVoted = ref(false)
const votingResult = ref(null)

// ── Cooldowns ──
const callVoteCooldown = ref(0)
let callVoteCooldownInterval = null

// ── End game ──
const gameOver = ref(null)
const snitchChoice = ref(null)
const revealedImpostors = ref([])

// ── Pending transitions (esperan botón del jugador) ──
const pendingRoundContinues = ref(null) // datos de impostorRoundContinues
const hostEndedGame = ref(false)        // creador terminó el juego mid-game

// ── Computed ──
const isAlive = computed(() => alivePlayers.value.includes(sessionStore.username))
const votablePlayers = computed(() => alivePlayers.value.filter(p => p !== sessionStore.username))

function formatTime(s) {
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

// ── WebSocket handlers ──
const { send } = useWebSocket({
  impostorCountdown: (message) => {
    // Nuevo juego iniciado: resetear sin importar la fase actual
    const resetPhases = ['game-over', 'eliminated', 'voting-result']
    if (resetPhases.includes(phase.value)) {
      resetGameState()
    }
    countdownNumber.value = message.count
    phase.value = 'countdown'
  },

  impostorGameStarted: async () => {
    try {
      const data = await apiService.getImpostorRole(sessionStore.sessionCode, sessionStore.username)
      myRole.value = data.role
      myWord.value = data.word || ''
      phase.value = 'role-reveal'
    } catch {
      toastStore.show('Error al obtener tu rol', 'error')
    }
  },

  votingStarted: (message) => {
    alivePlayers.value = message.alivePlayers
    pendingVoters.value = [...message.alivePlayers]
    votedCount.value = 0
    totalVoters.value = message.alivePlayers.length
    hasVoted.value = false
    selectedVote.value = ''
    votingResult.value = null
    phase.value = 'voting'
    startVotingTimer(message.votingDeadline)
  },

  voteUpdate: (message) => {
    votedCount.value = message.votedCount
    totalVoters.value = message.totalVoters
    pendingVoters.value = message.pendingVoters
  },

  votingTimerExpired: (message) => {
    pendingVoters.value = message.pendingVoters
    clearVotingTimer()
    phase.value = 'voting-expired'
  },

  votingResult: (message) => {
    clearVotingTimer()
    votingResult.value = message
    alivePlayers.value = message.alivePlayers
    eliminatedPlayers.value = message.eliminatedPlayers
    votingResultShownAt = Date.now()
    phase.value = 'voting-result'
    // Sin auto-transición: el jugador usa el botón para continuar
  },

  impostorPlayerEliminated: (message) => {
    alivePlayers.value = message.alivePlayers
    if (!eliminatedPlayers.value.includes(message.eliminatedPlayer)) {
      eliminatedPlayers.value.push(message.eliminatedPlayer)
    }
    if (message.eliminatedPlayer === sessionStore.username) {
      phase.value = 'eliminated'
    } else {
      toastStore.show(`${message.eliminatedPlayer} fue eliminado por desconexión`, 'info', 3000)
    }
  },

  impostorRoundContinues: (message) => {
    // Guardar datos y esperar que el jugador presione "Continuar"
    pendingRoundContinues.value = message
  },

  impostorGameOver: (message) => {
    gameOver.value = message
    revealedImpostors.value = message.impostors || []
    phase.value = 'game-over'
  },

  returnToLobby: () => {
    // Si ya estamos en game-over el jugador tiene sus propios botones
    // Si no, mostrar aviso con botón para ir al lobby
    if (phase.value !== 'game-over') {
      hostEndedGame.value = true
    }
  },
})

// ── Lifecycle ──
onMounted(async () => {
  try {
    const data = await apiService.getSessionDetails(sessionStore.sessionCode)
    sessionStore.setCreator(data.creator)
    sessionStore.setUsers(data.users)
    alivePlayers.value = data.users.map(u => u.username)
  } catch {
    toastStore.show('Error al cargar sesión', 'error')
  }

  websocketService.setReconnectCallback(async () => {
    await checkGameStatus()
  })
})

onBeforeUnmount(() => {
  clearVotingTimer()
  clearInterval(callVoteCooldownInterval)
  websocketService.setReconnectCallback(null)
})

// ── Timer helpers ──
function startVotingTimer(deadline) {
  clearVotingTimer()
  const tick = () => {
    votingTimeLeft.value = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
    if (votingTimeLeft.value <= 0) clearVotingTimer()
  }
  tick()
  votingTimerInterval = setInterval(tick, 1000)
}

function clearVotingTimer() {
  clearInterval(votingTimerInterval)
  votingTimerInterval = null
}

function startCallVoteCooldown(seconds) {
  callVoteCooldown.value = seconds
  clearInterval(callVoteCooldownInterval)
  callVoteCooldownInterval = setInterval(() => {
    callVoteCooldown.value = Math.max(0, callVoteCooldown.value - 1)
    if (callVoteCooldown.value <= 0) clearInterval(callVoteCooldownInterval)
  }, 1000)
}


// ── Actions ──
async function callVote() {
  try {
    await apiService.callImpostorVote(sessionStore.sessionCode, sessionStore.username)
    startCallVoteCooldown(120)
  } catch (err) {
    toastStore.show(err.message || 'No se puede llamar a votación ahora', 'warning', 3000)
  }
}

async function submitVote() {
  if (!selectedVote.value) return
  try {
    await apiService.sendImpostorVote(sessionStore.sessionCode, sessionStore.username, selectedVote.value)
    hasVoted.value = true
  } catch (err) {
    toastStore.show('Error al registrar voto', 'error')
  }
}

function resetGameState() {
  countdownNumber.value = 3
  myRole.value = ''
  myWord.value = ''
  alivePlayers.value = sessionStore.users.map(u => u.username)
  eliminatedPlayers.value = []
  votingResult.value = null
  gameOver.value = null
  snitchChoice.value = null
  revealedImpostors.value = []
  hasVoted.value = false
  selectedVote.value = ''
  callVoteCooldown.value = 0
  pendingRoundContinues.value = null
  hostEndedGame.value = false
  clearVotingTimer()
}

function applyRoundContinues() {
  const msg = pendingRoundContinues.value
  if (!msg) return
  alivePlayers.value = msg.alivePlayers
  votingResult.value = null
  pendingRoundContinues.value = null
  phase.value = 'description'
}

async function playAgain() {
  const impostorCount = gameOver.value?.impostors?.length || 1
  try {
    await apiService.startElImpostor(sessionStore.sessionCode, impostorCount)
    // Los demás recibirán impostorCountdown y se resetearán solos
    resetGameState()
    phase.value = 'countdown'
  } catch (err) {
    toastStore.show(err.message || 'Error al reiniciar el juego', 'error')
  }
}

async function returnToLobby() {
  try {
    await apiService.endCurrentGame(sessionStore.sessionCode)
    send('returnToLobby')
    router.push({ name: 'lobby' })
  } catch {
    send('returnToLobby')
    router.push({ name: 'lobby' })
  }
}

async function checkGameStatus() {
  if (!sessionStore.sessionCode) { router.push('/'); return }
  try {
    const syncData = await apiService.syncSession(sessionStore.sessionCode)
    if (!syncData.currentGame || syncData.currentGame !== 'el-impostor') {
      router.push({ name: 'lobby' })
      return
    }
    if (syncData.gameState) {
      alivePlayers.value = syncData.gameState.alivePlayers || alivePlayers.value
      eliminatedPlayers.value = syncData.gameState.eliminatedPlayers || eliminatedPlayers.value
    }
  } catch {
    router.push({ name: 'lobby' })
  }
}

</script>

<style scoped>
/* ── Base ── */
.impostor-view {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  color: #f0e6ff;
  overflow: hidden;
}

.phase-screen {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 560px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* ── Phase transitions ── */
.phase-fade-enter-active { transition: opacity 400ms ease, transform 400ms cubic-bezier(0.4,0,0.2,1); }
.phase-fade-leave-active { transition: opacity 250ms ease, transform 250ms ease; }
.phase-fade-enter-from   { opacity: 0; transform: translateY(20px) scale(0.98); }
.phase-fade-leave-to     { opacity: 0; transform: translateY(-10px) scale(0.99); }

/* ── Countdown ── */
.countdown-number {
  font-family: 'Righteous', sans-serif;
  font-size: 160px;
  line-height: 1;
  color: #bb00ff;
  text-shadow: 0 0 60px rgba(187,0,255,0.8), 0 0 120px rgba(187,0,255,0.4);
  animation: countPop 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes countPop {
  from { transform: scale(1.4); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
.number-pop-enter-active { animation: countPop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
.number-pop-leave-active { transition: opacity 200ms ease, transform 200ms ease; }
.number-pop-leave-to     { opacity: 0; transform: scale(0.6); }

.countdown-label {
  font-size: 15px;
  color: rgba(240,230,255,0.45);
  letter-spacing: 1px;
}

/* ── Role Reveal ── */
.role-card {
  width: 100%;
  border-radius: 24px;
  padding: 48px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: cardReveal 0.5s cubic-bezier(0.4,0,0.2,1);
}
@keyframes cardReveal {
  from { opacity: 0; transform: translateY(32px) scale(0.95); }
  to   { opacity: 1; transform: none; }
}
.role-card--civil {
  background: rgba(12,8,28,0.88);
  border: 1px solid rgba(187,0,255,0.4);
  box-shadow: 0 0 60px rgba(187,0,255,0.2), inset 0 1px 0 rgba(255,255,255,0.05);
}
.role-card--impostor {
  background: rgba(28,4,4,0.92);
  border: 1px solid rgba(255,71,87,0.5);
  box-shadow: 0 0 60px rgba(255,71,87,0.25), inset 0 1px 0 rgba(255,255,255,0.04);
}
.role-icon { font-size: 56px; }
.role-title {
  font-family: 'Righteous', sans-serif;
  font-size: 52px;
  color: #ff4757;
  text-shadow: 0 0 30px rgba(255,71,87,0.8);
  letter-spacing: 2px;
}
.role-hint { font-size: 13px; color: rgba(240,230,255,0.5); text-transform: uppercase; letter-spacing: 1px; }
.role-word {
  font-family: 'Righteous', sans-serif;
  font-size: 48px;
  color: #f0e6ff;
  text-shadow: 0 0 24px rgba(187,0,255,0.6);
}
.role-desc { font-size: 14px; color: rgba(240,230,255,0.5); text-align: center; max-width: 260px; }
.role-ready-btn { margin-top: 8px; width: 100%; }

/* ── Description ── */
.phase-description { gap: 16px; }

.game-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(10,8,25,0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(187,0,255,0.22);
  border-radius: 14px;
  padding: 12px 18px;
}
.game-title { font-family: 'Righteous', sans-serif; font-size: 18px; color: #bb00ff; text-shadow: 0 0 10px rgba(187,0,255,0.7); }
.session-code-badge { font-size: 16px; font-weight: 700; color: #bb00ff; letter-spacing: 3px; }

.players-panel {
  width: 100%;
  background: rgba(12,8,28,0.78);
  border: 1px solid rgba(187,0,255,0.2);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.players-group { display: flex; flex-direction: column; gap: 10px; }
.players-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(240,230,255,0.5);
}
.label-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.label-dot--alive { background: #2ed573; box-shadow: 0 0 6px rgba(46,213,115,0.7); }
.label-dot--dead  { background: rgba(255,255,255,0.2); }

.players-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.player-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
}
.player-chip--alive {
  background: rgba(46,213,115,0.08);
  border: 1px solid rgba(46,213,115,0.25);
}
.player-chip--dead {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  opacity: 0.5;
}
.chip-av {
  width: 28px; height: 28px; border-radius: 7px;
  background: rgba(187,0,255,0.25);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; color: #cc44ff; flex-shrink: 0;
}
.chip-av--dead { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.3); }
.chip-name { font-family: 'Poppins', sans-serif; }
.chip-name--dead { color: rgba(240,230,255,0.35); }
.chip-dot { width: 8px; height: 8px; border-radius: 50%; margin-left: auto; flex-shrink: 0; }
.chip-dot--green { background: #2ed573; box-shadow: 0 0 5px rgba(46,213,115,0.7); }
.chip-dot--warn  { background: rgba(255,165,2,0.9); animation: reconnect-blink 1s ease-in-out infinite; }
.chip-dot--dead  { font-size: 10px; color: rgba(255,255,255,0.25); width: auto; height: auto; }
@keyframes reconnect-blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

.role-reminder {
  width: 100%;
  padding: 12px 18px;
  border-radius: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}
.reminder--impostor {
  background: rgba(255,71,87,0.12);
  border: 1px solid rgba(255,71,87,0.3);
  color: rgba(255,140,150,0.95);
  display: block; padding: 12px 18px; border-radius: 12px;
}
.reminder--civil {
  background: rgba(187,0,255,0.1);
  border: 1px solid rgba(187,0,255,0.3);
  color: rgba(240,230,255,0.9);
  display: block; padding: 12px 18px; border-radius: 12px;
}
.reminder--civil strong { color: #cc44ff; }

.call-vote-wrap { width: 100%; }
.call-vote-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  border-radius: 14px;
  border: 2px solid rgba(255,165,2,0.4);
  background: rgba(255,165,2,0.1);
  color: rgba(255,210,80,0.9);
  font-family: 'Poppins', sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  min-height: 52px;
}
.call-vote-btn:hover:not(.call-vote-btn--disabled) {
  background: rgba(255,165,2,0.18);
  border-color: rgba(255,165,2,0.7);
}
.call-vote-btn--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.spectator-badge {
  padding: 10px 18px;
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  font-size: 13px;
  color: rgba(240,230,255,0.4);
  font-style: italic;
}

.footer-row { width: 100%; display: flex; justify-content: flex-end; }

/* ── Voting ── */
.voting-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.voting-title { font-family: 'Righteous', sans-serif; font-size: 28px; color: #f0e6ff; }
.voting-timer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Righteous', sans-serif;
  font-size: 22px;
  color: #2ed573;
  text-shadow: 0 0 10px rgba(46,213,115,0.6);
}
.voting-timer--warn { color: #ff4757; text-shadow: 0 0 10px rgba(255,71,87,0.7); animation: timer-pulse 0.5s ease-in-out infinite; }
@keyframes timer-pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }

.pending-notice {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255,165,2,0.08);
  border: 1px solid rgba(255,165,2,0.3);
  border-radius: 12px;
}
.pending-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,210,80,0.7); margin-bottom: 8px; }
.pending-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.pending-chip {
  padding: 4px 12px;
  border-radius: 8px;
  background: rgba(255,165,2,0.15);
  border: 1px solid rgba(255,165,2,0.35);
  font-size: 13px;
  color: rgba(255,210,80,0.9);
}

.vote-progress-wrap { width: 100%; display: flex; flex-direction: column; gap: 6px; }
.vote-progress-bar { width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
.vote-progress-fill { height: 100%; background: #bb00ff; border-radius: 3px; transition: width 400ms ease; box-shadow: 0 0 8px rgba(187,0,255,0.6); }
.vote-progress-label { font-size: 12px; color: rgba(240,230,255,0.4); text-align: right; }

.vote-hint { font-size: 13px; color: rgba(240,230,255,0.5); font-weight: 500; }
.vote-grid { width: 100%; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.vote-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(187,0,255,0.22);
  border-radius: 12px;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  color: rgba(240,230,255,0.85);
  transition: all 200ms ease;
  min-height: 52px;
}
.vote-chip:hover { background: rgba(187,0,255,0.12); border-color: rgba(187,0,255,0.5); transform: translateY(-1px); }
.vote-chip--selected { background: rgba(187,0,255,0.18) !important; border-color: #bb00ff !important; box-shadow: 0 0 0 1px rgba(187,0,255,0.4), 0 4px 20px rgba(187,0,255,0.3); }
.chip-check { color: #bb00ff; margin-left: auto; flex-shrink: 0; }

.voted-notice {
  padding: 14px 18px;
  border-radius: 12px;
  background: rgba(46,213,115,0.08);
  border: 1px solid rgba(46,213,115,0.3);
  font-size: 14px;
  color: rgba(100,240,160,0.9);
  text-align: center;
}

/* ── Voting Result ── */
.result-card {
  width: 100%;
  border-radius: 20px;
  padding: 36px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: cardReveal 0.5s cubic-bezier(0.4,0,0.2,1);
}
.result-card--tie    { background: rgba(20,14,4,0.92); border: 2px solid rgba(255,190,0,0.5); box-shadow: 0 0 40px rgba(255,190,0,0.15); }
.result-title--tie   { color: #ffd000; text-shadow: 0 0 30px rgba(255,208,0,0.6); }
.result-sub--tie     { color: rgba(255,220,100,0.6); }
.tie-notice {
  margin-top: 4px;
  padding: 10px 20px;
  border-radius: 10px;
  background: rgba(255,190,0,0.1);
  border: 1px solid rgba(255,190,0,0.25);
  color: rgba(255,220,100,0.85);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}
.result-card--elim   { background: rgba(12,8,28,0.88); border: 1px solid rgba(255,71,87,0.4); }
.result-icon { font-size: 52px; }
.result-title { font-family: 'Righteous', sans-serif; font-size: 36px; color: #f0e6ff; text-align: center; }
.result-sub { font-size: 14px; color: rgba(240,230,255,0.5); }

.vote-breakdown { width: 100%; margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.vb-row { display: flex; align-items: center; gap: 10px; }
.vb-name { font-size: 13px; font-weight: 600; width: 80px; flex-shrink: 0; color: rgba(240,230,255,0.8); }
.vb-bar-wrap { flex: 1; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
.vb-bar-fill { height: 100%; background: #bb00ff; border-radius: 4px; transition: width 600ms ease; }
.vb-count { font-size: 13px; font-weight: 700; color: #cc44ff; width: 20px; text-align: right; flex-shrink: 0; }

/* ── Eliminated ── */
.elim-question, .elim-snitch, .elim-silent {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; text-align: center; width: 100%;
  background: rgba(12,8,28,0.88);
  border: 1px solid rgba(187,0,255,0.3);
  border-radius: 20px;
  padding: 40px 28px;
  animation: cardReveal 0.5s cubic-bezier(0.4,0,0.2,1);
}
.elim-icon, .snitch-icon, .silent-icon { font-size: 56px; }
.elim-title { font-family: 'Righteous', sans-serif; font-size: 36px; color: #f0e6ff; }
.elim-sub { font-size: 15px; color: rgba(240,230,255,0.6); }
.elim-choices { display: flex; flex-direction: column; gap: 10px; width: 100%; margin-top: 8px; }

.snitch-title {
  font-family: 'Righteous', sans-serif;
  font-size: 52px;
  color: #2ed573;
  text-shadow: 0 0 30px rgba(46,213,115,0.8);
  animation: snitch-glow 1.5s ease-in-out infinite;
}
@keyframes snitch-glow {
  0%,100% { text-shadow: 0 0 30px rgba(46,213,115,0.8); }
  50%      { text-shadow: 0 0 50px rgba(46,213,115,1), 0 0 80px rgba(46,213,115,0.5); }
}
.snitch-sub { font-size: 14px; color: rgba(240,230,255,0.5); }

.silent-title { font-family: 'Righteous', sans-serif; font-size: 26px; color: #f0e6ff; }
.silent-sub { font-size: 13px; color: rgba(240,230,255,0.4); }

/* ── Game Over ── */
.gameover-card {
  width: 100%;
  border-radius: 20px;
  padding: 40px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: cardReveal 0.6s cubic-bezier(0.4,0,0.2,1);
}
.gameover-card--win  { background: rgba(4,24,12,0.92); border: 1px solid rgba(46,213,115,0.45); box-shadow: 0 0 60px rgba(46,213,115,0.15); }
.gameover-card--lose { background: rgba(28,4,4,0.92); border: 1px solid rgba(255,71,87,0.45); box-shadow: 0 0 60px rgba(255,71,87,0.15); }
.gameover-icon { font-size: 64px; }
.gameover-title { font-family: 'Righteous', sans-serif; font-size: 32px; color: #f0e6ff; text-align: center; }
.gameover-sub { font-size: 14px; color: rgba(240,230,255,0.55); text-align: center; }

.impostors-reveal {
  width: 100%;
  padding: 16px;
  background: rgba(12,8,28,0.78);
  border: 1px solid rgba(187,0,255,0.2);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.reveal-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(240,230,255,0.5); }
.reveal-chips, .snitch-impostors { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.impostor-chip {
  padding: 6px 16px;
  border-radius: 10px;
  background: rgba(255,71,87,0.15);
  border: 1px solid rgba(255,71,87,0.4);
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,140,150,0.95);
}

.waiting-host { font-size: 13px; color: rgba(240,230,255,0.4); font-style: italic; }
.gameover-actions { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }

/* ── Responsive ── */
@media (max-width: 400px) {
  .countdown-number { font-size: 120px; }
  .role-word { font-size: 36px; }
  .role-title { font-size: 40px; }
  .vote-grid { grid-template-columns: 1fr; }
}

/* ── Overlay: anfitrión terminó el juego ── */
.host-ended-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(4, 2, 12, 0.82);
  backdrop-filter: blur(8px);
}
.host-ended-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 32px;
  background: rgba(12, 8, 28, 0.95);
  border: 1px solid rgba(187, 0, 255, 0.3);
  border-radius: 24px;
  text-align: center;
}
.host-ended-icon { font-size: 48px; }
.host-ended-title { font-size: 18px; font-weight: 600; color: #f0e6ff; }

/* ── FAB: Terminar juego (solo creador) ── */
.end-game-fab {
  position: fixed;
  bottom: 24px;
  right: 20px;
  z-index: 100;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 80, 80, 0.4);
  background: rgba(30, 8, 8, 0.85);
  color: #ff6b6b;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: background 0.2s, transform 0.15s;
}
.end-game-fab:hover {
  background: rgba(200, 30, 30, 0.7);
  color: #fff;
  transform: scale(1.04);
}
.end-game-fab:active {
  transform: scale(0.97);
}
</style>
