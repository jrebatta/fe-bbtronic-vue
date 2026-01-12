/**
 * Configuración de la API
 * Maneja las URLs del backend según el ambiente
 */

// Obtener la URL base de la API desde las variables de entorno
// Si no existe, usar la URL de producción por defecto
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  'https://be-bbtronic-production.up.railway.app'

// Endpoint de WebSocket
export const WS_ENDPOINT = `${API_BASE_URL}/websocket`

// Exportar por defecto para compatibilidad
export default API_BASE_URL
