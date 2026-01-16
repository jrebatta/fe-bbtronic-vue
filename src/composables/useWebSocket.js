/**
 * Composable useWebSocket
 * Maneja la conexión y eventos de WebSocket de forma reutilizable
 */

import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import websocketService from '@/services/websocket.service'
import { useSessionStore } from '@/stores/session.store'

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
  const router = useRouter()

  /**
   * Conectar y suscribirse al montar el componente
   */
  onMounted(async () => {
    try {
      // Conectar al WebSocket
      await websocketService.connect()

      // Suscribirse al canal de la sesión
      if (sessionStore.sessionCode) {
        websocketService.subscribe(sessionStore.sessionCode, (message) => {
          // HANDLER GLOBAL: Si el creador salió, expulsar a todos
          if (message.event === 'creatorLeft') {
            console.log('🚪 El creador ha salido de la sesión')
            alert(message.message || 'El creador de la sesión ha salido. Serás redirigido al inicio.')

            // Limpiar sesión y redirigir
            sessionStore.clearSession()
            websocketService.disconnect()
            router.push('/')
            return
          }

          // Buscar handler para este evento
          const handler = eventHandlers[message.event]

          if (handler && typeof handler === 'function') {
            handler(message)
          } else {
            console.warn(`No hay handler para el evento: ${message.event}`)
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
