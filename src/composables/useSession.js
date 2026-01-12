/**
 * Composable useSession
 * Maneja lógica de sesión de usuario (logout, validación, etc.)
 */

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session.store'
import apiService from '@/services/api.service'
import websocketService from '@/services/websocket.service'

/**
 * Hook para manejar sesión de usuario
 * @returns {Object} - Retorna métodos y propiedades de sesión
 *
 * @example
 * const { logout, isCreator, username } = useSession()
 */
export function useSession() {
  const router = useRouter()
  const sessionStore = useSessionStore()

  /**
   * Cerrar sesión del usuario
   * - Llama al endpoint de logout
   * - Notifica por WebSocket que el usuario salió
   * - Limpia el store
   * - Redirige al home
   */
  async function logout() {
    try {
      // Llamar al endpoint de logout
      const response = await apiService.logout(sessionStore.sessionToken)

      // Notificar por WebSocket que el usuario salió
      if (sessionStore.sessionCode && websocketService.isWebSocketConnected()) {
        websocketService.send(sessionStore.sessionCode, 'userLeft', {
          username: sessionStore.username
        })
      }

      console.log('Logout exitoso:', response)
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      // Limpiar sesión y redirigir (siempre, incluso si hay error)
      sessionStore.clearSession()
      websocketService.disconnect()
      router.push('/')
    }
  }

  /**
   * Validar que el usuario tenga sesión activa
   * Si no tiene, redirige al home
   * @returns {boolean} - True si está autenticado
   */
  function validateSession() {
    if (!sessionStore.isAuthenticated) {
      console.warn('Usuario no autenticado, redirigiendo a home...')
      router.push('/')
      return false
    }
    return true
  }

  /**
   * Validar que el usuario sea el creador
   * @returns {boolean} - True si es creador
   */
  function validateCreator() {
    if (!sessionStore.isCreator) {
      console.warn('Usuario no es creador de la sesión')
      return false
    }
    return true
  }

  /**
   * Restaurar sesión desde sessionStorage (útil al recargar)
   * @returns {boolean} - True si se restauró exitosamente
   */
  function restoreSession() {
    return sessionStore.restoreSession()
  }

  // Computed properties para acceso fácil
  const isCreator = computed(() => sessionStore.isCreator)
  const isAuthenticated = computed(() => sessionStore.isAuthenticated)
  const username = computed(() => sessionStore.username)
  const sessionCode = computed(() => sessionStore.sessionCode)
  const users = computed(() => sessionStore.users)
  const userCount = computed(() => sessionStore.userCount)

  return {
    // Métodos
    logout,
    validateSession,
    validateCreator,
    restoreSession,

    // Propiedades computadas
    isCreator,
    isAuthenticated,
    username,
    sessionCode,
    users,
    userCount
  }
}
