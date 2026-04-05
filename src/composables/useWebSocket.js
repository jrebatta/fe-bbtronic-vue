/**
 * Composable useWebSocket
 * Maneja la conexión y eventos de WebSocket de forma reutilizable
 */

import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import websocketService from '@/services/websocket.service'
import { useSessionStore } from '@/stores/session.store'
import { useToastStore } from '@/stores/toast.store'


/**
 * Hook para manejar WebSocket en componentes
 * @param {Object} eventHandlers - Objeto con handlers para cada evento
 * @returns {Object} - Retorna función send para enviar mensajes
 *
 * @example
 * const { send } = useWebSocket({
 *   gameStarted: (message) => router.push('/game'),
 *   userUpdate: (message) => updateUsers(message.users)
 * })
 */
export function useWebSocket(eventHandlers = {}) {
  const sessionStore = useSessionStore()
  const toastStore = useToastStore()
  const router = useRouter()

  /**
   * Conectar y suscribirse al montar el componente
   */
  onMounted(async () => {
    try {
      // Conectar con headers STOMP para que el backend identifique al usuario
      await websocketService.connect({
        username: sessionStore.username,
        sessionCode: sessionStore.sessionCode,
      })

      // Suscribirse al canal de la sesión
      if (sessionStore.sessionCode) {
        websocketService.subscribe(sessionStore.sessionCode, (message) => {
          // HANDLER GLOBAL: Si el creador salió, expulsar a todos
          if (message.event === 'creatorLeft') {
            toastStore.show(
              message.message || 'El anfitrión ha salido. Volviendo al inicio...',
              'warning',
              5000
            )
            setTimeout(() => {
              sessionStore.clearSession()
              websocketService.disconnect()
              router.push('/')
            }, 2000)
            return
          }

          // HANDLER GLOBAL: Usuario salió (desconexión involuntaria detectada por el backend)
          if (message.event === 'userLeft') {
            if (Array.isArray(message.users)) {
              sessionStore.setUsers(message.users)
            } else if (message.username) {
              sessionStore.removeUser(message.username)
            }
            if (message.username) {
              toastStore.show(`${message.username} salió de la sesión`, 'info', 3000)
            }
          }

          // HANDLER GLOBAL: Lista de usuarios actualizada (reconexión de un jugador)
          if (message.event === 'userUpdate') {
            if (Array.isArray(message.users)) {
              sessionStore.setUsers(message.users)
            }
          }

          // HANDLER GLOBAL: Jugador reconectando (ventana de gracia del backend)
          if (message.event === 'userReconnecting') {
            if (message.username) {
              sessionStore.setUserReconnecting(message.username, true)
            }
          }

          // HANDLER GLOBAL: Jugador expulsado por el creador
          if (message.event === 'kicked') {
            if (message.username === sessionStore.username) {
              toastStore.show('Fuiste expulsado de la sesión', 'warning', 2000)
              setTimeout(() => {
                sessionStore.clearSession()
                websocketService.disconnect()
                router.push('/')
              }, 2500)
              return
            }
          }

          // Feedback háptico al recibir pregunta nueva
          const questionEvents = [
            'newYoNuncaNuncaQuestion',
            'newCulturaPendejaQuestion',
            'newQuienEsMasProbableQuestion',
            'nextQuestion',
            'update',
          ]
          if (questionEvents.includes(message.event) && navigator.vibrate) {
            navigator.vibrate(60)
          }

          // Buscar handler local para este evento
          const handler = eventHandlers[message.event]
          if (handler && typeof handler === 'function') {
            handler(message)
          }
        })
      } else {
        console.warn('No hay sessionCode disponible para suscribirse')
      }
    } catch (error) {
      console.error('Error al conectar WebSocket en composable:', error)
    }
  })

  /**
   * Desuscribirse y limpiar antes de desmontar el componente
   */
  onBeforeUnmount(() => {
    // Limpiar reconnectCallback para evitar fugas entre vistas
    websocketService.setReconnectCallback(null)

    if (sessionStore.sessionCode) {
      websocketService.unsubscribe(sessionStore.sessionCode)
    }
  })

  /**
   * Función para enviar mensajes
   * @param {string} event - Nombre del evento
   * @param {Object} data - Datos adicionales
   */
  const send = (event, data = {}) => {
    if (!sessionStore.sessionCode) {
      console.error('No se puede enviar mensaje: sessionCode no disponible')
      return
    }

    try {
      websocketService.send(sessionStore.sessionCode, event, data)
    } catch (error) {
      console.error('Error al enviar mensaje WebSocket:', error)
    }
  }

  return {
    send
  }
}
