/**
 * Composable useLoading
 * Maneja estados de carga y errores de forma reutilizable
 */

import { ref } from 'vue'

/**
 * Hook para manejar estados de loading y errores
 * @returns {Object} - Retorna estado de loading, error y función para ejecutar acciones
 *
 * @example
 * const { loading, error, execute } = useLoading()
 * await execute(async () => {
 *   await apiService.createSession(username)
 * })
 */
export function useLoading() {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Ejecutar una función asíncrona con manejo de loading y errores
   * @param {Function} asyncFn - Función asíncrona a ejecutar
   * @returns {Promise<any>} - Retorna el resultado de la función
   */
  async function execute(asyncFn) {
    loading.value = true
    error.value = null

    try {
      const result = await asyncFn()
      return result
    } catch (err) {
      error.value = err.message || 'Error desconocido'
      console.error('Error en execute:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpiar error
   */
  function clearError() {
    error.value = null
  }

  /**
   * Establecer error manualmente
   * @param {string} message - Mensaje de error
   */
  function setError(message) {
    error.value = message
  }

  return {
    loading,
    error,
    execute,
    clearError,
    setError
  }
}
