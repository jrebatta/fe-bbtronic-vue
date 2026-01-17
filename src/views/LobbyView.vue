<template>
  <div class="lobby-view">
    <BackgroundVideo />

    <div class="container">
      <div class="content-wrapper">
        <!-- Sección izquierda: lista de usuarios -->
        <div class="left-section">
          <UserList :users="sessionStore.users" title="Usuarios en la Sesión" />
        </div>

        <!-- Sección derecha: botones -->
        <div class="right-section">
          <h1 class="session-title">
            Código de Sesión: <span class="session-code">{{ sessionStore.sessionCode }}</span>
          </h1>

          <!-- Botones solo para el creador -->
          <template v-if="sessionStore.isCreator">
            <BaseButton variant="primary" @click="startGame('preguntas-directas')">
              Preguntas Directas
            </BaseButton>

            <BaseButton variant="primary" @click="startGame('preguntas-incomodas')">
              Preguntas Incómodas
            </BaseButton>

            <BaseButton variant="primary" @click="startGame('yo-nunca-nunca')">
              Yo Nunca Nunca
            </BaseButton>

            <BaseButton variant="primary" @click="startGame('quien-es-mas-probable')">
              Quién Es Más Probable
            </BaseButton>

            <BaseButton variant="primary" @click="startGame('cultura-pendeja')">
              Cultura Pendeja
            </BaseButton>

            <BaseButton variant="warning" @click="showKickModal = true">
              Expulsar Jugador
            </BaseButton>
          </template>

          <BaseButton variant="danger" @click="handleLogout"> Salir de la Sesión </BaseButton>

          <ErrorMessage v-if="error" :message="error" />
        </div>
      </div>
    </div>

    <!-- Modal para elegir usuario a expulsar -->
    <BaseModal v-model="showKickModal" title="Seleccionar Usuario para Expulsar">
      <UserList :users="otherUsers" title="" clickable @user-click="confirmKickUser" />
    </BaseModal>
  </div>
</template>

<script setup>
/**
 * LobbyView - Sala de espera de sesión
 * Migrado desde sesion_menu.html y sesion_menu.js
 */

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

// State
const error = ref('')
const showKickModal = ref(false)

// Computed
const otherUsers = computed(() => {
  return sessionStore.users.filter((u) => u.username !== sessionStore.username)
})

/**
 * Event handlers de WebSocket
 */
const { send } = useWebSocket({
  preguntasDirectasStarted: () => {
    console.log('Preguntas Directas iniciado, redirigiendo...')
    router.push({ name: 'preguntas-directas' })
  },
  yoNuncaNuncaStarted: () => {
    console.log('Yo Nunca Nunca iniciado, redirigiendo...')
    router.push({ name: 'yo-nunca-nunca' })
  },
  preguntasIncomodasStarted: () => {
    console.log('Preguntas Incómodas iniciado, redirigiendo...')
    router.push({ name: 'preguntas-incomodas' })
  },
  quienEsMasProbableStarted: () => {
    console.log('Quién Es Más Probable iniciado, redirigiendo...')
    router.push({ name: 'quien-es-mas-probable' })
  },
  culturaPendejaStarted: () => {
    console.log('Cultura Pendeja iniciado, redirigiendo...')
    router.push({ name: 'cultura-pendeja' })
  },
  userUpdate: (message) => {
    if (Array.isArray(message.users)) {
      console.log('Lista de usuarios actualizada:', message.users)
      sessionStore.setUsers(message.users)
    }
  },
  userLeft: (message) => {
    if (message.username) {
      console.log(`Usuario ${message.username} salió de la sesión.`)
      sessionStore.removeUser(message.username)
    }
  },
  sessionEnded: () => {
    console.log('Sesión terminada, redirigiendo...')
    sessionStore.clearSession()
    router.push('/')
  },
})

/**
 * Cargar datos iniciales de la sesión
 */
onMounted(async () => {
  try {
    console.log('🔄 LobbyView montado, sessionCode:', sessionStore.sessionCode)

    if (!sessionStore.sessionCode) {
      console.error('❌ No hay sessionCode disponible')
      error.value = 'No se encontró código de sesión'
      return
    }

    const data = await apiService.getSessionDetails(sessionStore.sessionCode)
    console.log('✅ Detalles de sesión cargados:', data)

    sessionStore.setCreator(data.creator)
    sessionStore.setUsers(data.users)

    // NO verificar estado del juego aquí - solo cuando reconecta después de bloqueo
  } catch (err) {
    console.error('❌ Error al cargar sesión:', err)
    error.value = 'Error al cargar usuarios en la sesión.'
  }

  // Configurar callback de reconexión
  websocketService.setReconnectCallback(async () => {
    console.log('🔄 WebSocket reconectado, sincronizando estado...')
    await syncSessionState()
  })
})

/**
 * Sincronizar estado completo de la sesión después de reconexión
 * Usa el endpoint /sync optimizado que devuelve toda la información en una sola llamada
 */
async function syncSessionState() {
  // Validar que existe un sessionCode antes de sincronizar
  if (!sessionStore.sessionCode) {
    console.warn('⚠️ No hay sessionCode, no se puede sincronizar')
    return
  }

  try {
    console.log('🔄 Sincronizando estado de la sesión...')
    const data = await apiService.syncSession(sessionStore.sessionCode)

    console.log(`📊 Sync recibido - Timestamp: ${new Date(data.timestamp).toLocaleTimeString()}`)

    // Actualizar lista de usuarios
    if (Array.isArray(data.users)) {
      console.log(`✅ Lista de usuarios actualizada: ${data.users.length} usuarios`)
      console.log('📋 Usuarios:', data.users.map(u => `${u.username} (${u.connected ? 'conectado' : 'desconectado'})`))
      sessionStore.setUsers(data.users)
    }

    // Actualizar creador
    if (data.creator) {
      sessionStore.setCreator(data.creator)
    }

    // Actualizar estado del juego si existe
    if (data.gameState && data.gameState.roundId) {
      console.log(`🎮 Round ID detectado: ${data.gameState.roundId}`)
      sessionStore.setCurrentRoundId(data.gameState.roundId)
    }

    // NO redirigir automáticamente al juego desde el lobby
    // Si el usuario está en el lobby, debe quedarse ahí
    // Solo el evento WebSocket del creador iniciando un juego debe redirigir
    if (data.currentGame) {
      console.log(`ℹ️ Juego en curso detectado: ${data.currentGame}, pero el usuario está en lobby`)
      console.log(`📊 Estado del juego: ${data.gameState?.status} - Fase: ${data.gameState?.phase}`)
    }

    console.log('✅ Estado sincronizado correctamente')
  } catch (err) {
    console.error('❌ Error al sincronizar estado:', err)
  }
}

/**
 * Verificar si el juego ya inició y redirigir
 */
async function checkGameStatus() {
  try {
    const data = await apiService.getSessionDetails(sessionStore.sessionCode)

    // Si el backend te devuelve el estado del juego actual, redirigir
    if (data.currentGame) {
      console.log(`🎮 Juego en curso detectado: ${data.currentGame}`)

      const gameRoutes = {
        'preguntas-directas': 'preguntas-directas',
        'yo-nunca-nunca': 'yo-nunca-nunca',
        'preguntas-incomodas': 'preguntas-incomodas',
        'quien-es-mas-probable': 'quien-es-mas-probable',
        'cultura-pendeja': 'cultura-pendeja',
      }

      const routeName = gameRoutes[data.currentGame]
      if (routeName) {
        router.push({ name: routeName })
      }
    }
  } catch (err) {
    console.error('Error al verificar estado del juego:', err)
  }
}

/**
 * Iniciar un juego
 */
async function startGame(gameType) {
  // Solo el creador puede iniciar juegos
  if (!sessionStore.isCreator) {
    console.warn('⚠️ Solo el creador puede iniciar juegos')
    error.value = 'Solo el creador puede iniciar juegos'
    return
  }

  try {
    error.value = ''

    switch (gameType) {
      case 'preguntas-directas':
        // Verificar si ya se jugó antes para usar el endpoint correcto
        if (sessionStore.hasPlayedPreguntasDirectas) {
          // Nueva ronda (2da, 3ra, etc.)
          console.log('🔄 Iniciando nueva ronda de Preguntas Directas...')
          const newRoundResponse = await apiService.startNewRound(sessionStore.sessionCode)
          sessionStore.setCurrentRoundId(newRoundResponse.roundId)
          console.log('✅ Nueva ronda iniciada, roundId:', newRoundResponse.roundId)
        } else {
          // Primera ronda
          console.log('🎮 Iniciando primera ronda de Preguntas Directas...')
          const firstRoundResponse = await apiService.startPreguntasDirectas(sessionStore.sessionCode)
          sessionStore.setCurrentRoundId(firstRoundResponse.roundId)
          console.log('✅ Primera ronda iniciada, roundId:', firstRoundResponse.roundId)
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
    console.error(`Error al iniciar ${gameType}:`, err)
    error.value = `Error al iniciar el juego: ${gameType}`
  }
}

/**
 * Confirmar expulsión de usuario
 */
function confirmKickUser(user) {
  const confirmed = confirm(`¿Deseas expulsar a ${user.username} de la sesión?`)
  if (confirmed) {
    kickUser(user.username)
    showKickModal.value = false
  }
}

/**
 * Expulsar usuario
 */
async function kickUser(username) {
  // Solo el creador puede expulsar usuarios
  if (!sessionStore.isCreator) {
    console.warn('⚠️ Solo el creador puede expulsar usuarios')
    error.value = 'Solo el creador puede expulsar usuarios'
    return
  }

  try {
    // Buscar el sessionToken del usuario (en el código original se usa username)
    // Como no tenemos acceso al sessionToken de otros usuarios,
    // usamos el username para buscar y expulsar
    await apiService.logout(username)

    console.log(`Usuario ${username} expulsado correctamente.`)

    // Notificar a través de WebSocket
    send('userLeft', { username })

    // Remover de la lista local
    sessionStore.removeUser(username)
  } catch (err) {
    console.error(`Error al expulsar usuario ${username}:`, err)
    error.value = 'Error al expulsar usuario.'
  }
}

/**
 * Manejar logout
 */
async function handleLogout() {
  // Limpiar callback de reconexión
  websocketService.setReconnectCallback(null)
  await logout()
}

// Cleanup al desmontar
onBeforeUnmount(() => {
  websocketService.setReconnectCallback(null)
})
</script>

<style scoped>
.lobby-view {
  position: relative;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
  color: #fff;
  overflow-x: hidden;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  width: 100%;
  animation: fadeIn 0.8s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.left-section {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(187, 0, 255, 0.3);
  box-shadow: 0 8px 32px rgba(187, 0, 255, 0.2);
}

.right-section {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(187, 0, 255, 0.3);
  box-shadow: 0 8px 32px rgba(187, 0, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.session-title {
  font-size: 32px;
  text-align: center;
  margin-bottom: 20px;
  color: #fff;
  text-shadow: 0 0 20px rgba(187, 0, 255, 0.8);
}

.session-code {
  color: #bb00ff;
  font-weight: 700;
}

@media (max-width: 968px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .session-title {
    font-size: 24px;
  }
}
</style>
