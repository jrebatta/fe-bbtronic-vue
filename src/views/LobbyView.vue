<template>
  <div class="lobby-view">
    <BackgroundVideo />

    <div class="lobby-wrapper">

      <!-- Header -->
      <header class="lobby-header">
        <div class="header-brand">
          <span class="brand-mark">BBTronic</span>
        </div>
        <div class="session-pill">
          <span class="session-label">Código</span>
          <span class="session-code">{{ sessionStore.sessionCode }}</span>
        </div>
      </header>

      <!-- Main content -->
      <div class="lobby-content">

        <!-- Left: Players -->
        <aside class="players-panel">
          <div class="panel-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Jugadores ({{ sessionStore.users.length }})</span>
          </div>
          <UserList :users="sessionStore.users" />
        </aside>

        <!-- Right: Games + actions -->
        <main class="games-panel">
          <!-- Creator section -->
          <template v-if="sessionStore.isCreator">
            <div class="section-label">Elegir Juego</div>
            <div class="games-grid">
              <button
                v-for="game in games"
                :key="game.id"
                class="game-card"
                @click="startGame(game.id)"
              >
                <span class="game-emoji" aria-hidden="true">{{ game.emoji }}</span>
                <span class="game-name">{{ game.name }}</span>
                <span class="game-desc">{{ game.desc }}</span>
              </button>
            </div>

            <button class="kick-btn" @click="showKickModal = true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="14" y2="14"/>
                <line x1="14" y1="8" x2="20" y2="14"/>
              </svg>
              Expulsar jugador
            </button>
          </template>

          <!-- Non-creator waiting -->
          <template v-else>
            <div class="waiting-state">
              <div class="waiting-icon" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <p class="waiting-text">Esperando al anfitrión...</p>
              <p class="waiting-sub">El anfitrión elegirá el juego pronto</p>
            </div>
          </template>

          <!-- Error -->
          <ErrorMessage v-if="error" :message="error" />

          <!-- Logout -->
          <div class="logout-row">
            <BaseButton variant="danger" @click="handleLogout">
              Salir de la Sesión
            </BaseButton>
          </div>
        </main>

      </div>
    </div>

    <!-- Kick modal -->
    <BaseModal v-model="showKickModal" title="Expulsar Jugador">
      <p class="kick-hint">Selecciona al jugador que deseas expulsar</p>
      <UserList :users="otherUsers" clickable @user-click="confirmKickUser" />
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session.store'
import { useSession } from '@/composables/useSession'
import { useWebSocket } from '@/composables/useWebSocket'
import apiService from '@/services/api.service'
import websocketService from '@/services/websocket.service'
import { BackgroundVideo, BaseButton, BaseModal, UserList, ErrorMessage } from '@/components/common'

const router = useRouter()
const sessionStore = useSessionStore()
const { logout } = useSession()

const error = ref('')
const showKickModal = ref(false)

const games = [
  { id: 'preguntas-directas',   emoji: '🎯', name: 'Preguntas Directas',    desc: 'Escríbele al resto' },
  { id: 'preguntas-incomodas',  emoji: '😳', name: 'Preguntas Incómodas',   desc: 'Preguntas atrevidas' },
  { id: 'yo-nunca-nunca',       emoji: '🙈', name: 'Yo Nunca Nunca',        desc: 'Revela tus secretos' },
  { id: 'quien-es-mas-probable',emoji: '🤔', name: 'Quién Es Más Probable', desc: 'Vota al más likely' },
  { id: 'cultura-pendeja',      emoji: '🧠', name: 'Cultura Pendeja',       desc: 'Trivia con tragos' },
]

const otherUsers = computed(() =>
  sessionStore.users.filter((u) => u.username !== sessionStore.username)
)

const { send } = useWebSocket({
  preguntasDirectasStarted: () => router.push({ name: 'preguntas-directas' }),
  yoNuncaNuncaStarted:      () => router.push({ name: 'yo-nunca-nunca' }),
  preguntasIncomodasStarted:() => router.push({ name: 'preguntas-incomodas' }),
  quienEsMasProbableStarted:() => router.push({ name: 'quien-es-mas-probable' }),
  culturaPendejaStarted:    () => router.push({ name: 'cultura-pendeja' }),
  userUpdate: (message) => {
    if (Array.isArray(message.users)) sessionStore.setUsers(message.users)
  },
  userLeft: (message) => {
    if (message.username) sessionStore.removeUser(message.username)
  },
  sessionEnded: () => {
    sessionStore.clearSession()
    router.push('/')
  },
})

onMounted(async () => {
  try {
    if (!sessionStore.sessionCode) {
      error.value = 'No se encontró código de sesión'
      return
    }
    const data = await apiService.getSessionDetails(sessionStore.sessionCode)
    sessionStore.setCreator(data.creator)
    sessionStore.setUsers(data.users)
  } catch (err) {
    error.value = 'Error al cargar usuarios en la sesión.'
  }

  websocketService.setReconnectCallback(async () => {
    await syncSessionState()
  })
})

async function syncSessionState() {
  if (!sessionStore.sessionCode) return
  try {
    const data = await apiService.syncSession(sessionStore.sessionCode)
    if (Array.isArray(data.users)) sessionStore.setUsers(data.users)
    if (data.creator) sessionStore.setCreator(data.creator)
    if (data.gameState?.roundId) sessionStore.setCurrentRoundId(data.gameState.roundId)
  } catch (err) {
    console.error('❌ Error al sincronizar estado:', err)
  }
}

async function startGame(gameType) {
  if (!sessionStore.isCreator) {
    error.value = 'Solo el creador puede iniciar juegos'
    return
  }
  try {
    error.value = ''
    switch (gameType) {
      case 'preguntas-directas':
        if (sessionStore.hasPlayedPreguntasDirectas) {
          const r = await apiService.startNewRound(sessionStore.sessionCode)
          sessionStore.setCurrentRoundId(r.roundId)
        } else {
          const r = await apiService.startPreguntasDirectas(sessionStore.sessionCode)
          sessionStore.setCurrentRoundId(r.roundId)
        }
        send('preguntasDirectasStarted')
        break
      case 'yo-nunca-nunca':
        await apiService.startYoNuncaNunca(sessionStore.sessionCode)
        send('yoNuncaNuncaStarted')
        break
      case 'preguntas-incomodas':
        await apiService.startPreguntasIncomodas(sessionStore.sessionCode)
        send('preguntasIncomodasStarted')
        break
      case 'quien-es-mas-probable':
        await apiService.startQuienEsMasProbable(sessionStore.sessionCode)
        send('quienEsMasProbableStarted')
        break
      case 'cultura-pendeja':
        await apiService.startCulturaPendeja(sessionStore.sessionCode)
        send('culturaPendejaStarted')
        break
    }
  } catch (err) {
    error.value = `Error al iniciar el juego`
  }
}

function confirmKickUser(user) {
  if (confirm(`¿Deseas expulsar a ${user.username}?`)) {
    kickUser(user.username)
    showKickModal.value = false
  }
}

async function kickUser(username) {
  if (!sessionStore.isCreator) return
  try {
    await apiService.logout(username)
    send('userLeft', { username })
    sessionStore.removeUser(username)
  } catch (err) {
    error.value = 'Error al expulsar usuario.'
  }
}

async function handleLogout() {
  websocketService.setReconnectCallback(null)
  await logout()
}

onBeforeUnmount(() => {
  websocketService.setReconnectCallback(null)
})
</script>

<style scoped>
.lobby-view {
  position: relative;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  color: #f0e6ff;
  overflow-x: hidden;
}

.lobby-wrapper {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  gap: 24px;
}

/* ── Header ── */
.lobby-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(10, 8, 25, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(187, 0, 255, 0.22);
  border-radius: 16px;
  padding: 14px 22px;
  animation: fadeInDown 0.5s ease;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.brand-mark {
  font-family: 'Righteous', sans-serif;
  font-size: 20px;
  color: #bb00ff;
  text-shadow: 0 0 10px rgba(187, 0, 255, 0.7);
  letter-spacing: 1px;
}

.session-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(187, 0, 255, 0.1);
  border: 1px solid rgba(187, 0, 255, 0.3);
  border-radius: 10px;
  padding: 6px 14px;
}

.session-label {
  font-size: 11px;
  color: rgba(240, 230, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.session-code {
  font-size: 18px;
  font-weight: 700;
  color: #bb00ff;
  letter-spacing: 3px;
  text-shadow: 0 0 8px rgba(187, 0, 255, 0.6);
}

/* ── Content layout ── */
.lobby-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  flex: 1;
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Players panel ── */
.players-panel {
  background: rgba(12, 8, 28, 0.78);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(187, 0, 255, 0.2);
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-self: start;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(240, 230, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(187, 0, 255, 0.15);
}

/* ── Games panel ── */
.games-panel {
  background: rgba(12, 8, 28, 0.78);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(187, 0, 255, 0.2);
  border-radius: 18px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(240, 230, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* ── Games grid ── */
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.game-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(187, 0, 255, 0.2);
  border-radius: 14px;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  text-align: left;
  transition: all 200ms ease;
  position: relative;
  overflow: hidden;
}

.game-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #bb00ff;
  transform: scaleX(0);
  transition: transform 200ms ease;
}

.game-card:hover {
  background: rgba(187, 0, 255, 0.1);
  border-color: rgba(187, 0, 255, 0.45);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(187, 0, 255, 0.2);
}

.game-card:hover::after {
  transform: scaleX(1);
}

.game-card:active {
  transform: translateY(0);
}

.game-emoji {
  font-size: 24px;
  margin-bottom: 4px;
}

.game-name {
  font-size: 13px;
  font-weight: 600;
  color: #f0e6ff;
  line-height: 1.3;
}

.game-desc {
  font-size: 11px;
  color: rgba(240, 230, 255, 0.45);
}

/* ── Kick button ── */
.kick-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: transparent;
  border: 1px solid rgba(255, 71, 87, 0.25);
  border-radius: 10px;
  color: rgba(255, 71, 87, 0.7);
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 14px;
  cursor: pointer;
  transition: all 200ms ease;
  align-self: flex-start;
}

.kick-btn:hover {
  background: rgba(255, 71, 87, 0.1);
  border-color: rgba(255, 71, 87, 0.5);
  color: #ff4757;
}

/* ── Waiting state ── */
.waiting-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 48px 24px;
  flex: 1;
}

.waiting-icon {
  color: rgba(187, 0, 255, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50%       { opacity: 0.9; transform: scale(1.05); }
}

.waiting-text {
  font-size: 18px;
  font-weight: 600;
  color: #f0e6ff;
}

.waiting-sub {
  font-size: 13px;
  color: rgba(240, 230, 255, 0.45);
}

/* ── Logout row ── */
.logout-row {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

/* ── Kick modal ── */
.kick-hint {
  font-size: 14px;
  color: rgba(240, 230, 255, 0.6);
  text-align: center;
  margin-bottom: 16px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .lobby-wrapper {
    padding: 12px;
    gap: 16px;
  }

  .lobby-content {
    grid-template-columns: 1fr;
  }

  .games-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .lobby-header {
    padding: 12px 16px;
  }

  .brand-mark {
    font-size: 17px;
  }
}

@media (max-width: 400px) {
  .games-grid {
    grid-template-columns: 1fr;
  }
}
</style>
