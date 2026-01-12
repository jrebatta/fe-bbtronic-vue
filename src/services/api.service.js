/**
 * Servicio de API
 * Centraliza todas las llamadas HTTP al backend
 * Mantiene la lógica exacta de los scripts originales
 */

import { API_BASE_URL } from '@/config/api.config.js'

class ApiService {
  /**
   * ========================================
   * SESIONES
   * ========================================
   */

  /**
   * Crear una nueva sesión
   * @param {string} username - Nombre de usuario
   * @returns {Promise<{sessionToken: string, sessionCode: string}>}
   */
  async createSession(username) {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/create?username=${username}`,
      { method: 'POST' }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error)
    }

    return response.json()
  }

  /**
   * Unirse a una sesión existente
   * @param {string} sessionCode - Código de sesión
   * @param {string} username - Nombre de usuario
   * @returns {Promise<{sessionToken: string}>}
   */
  async joinSession(sessionCode, username) {
    const response = await fetch(`${API_BASE_URL}/api/game-sessions/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionCode, username })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error)
    }

    return response.json()
  }

  /**
   * Obtener detalles de una sesión
   * @param {string} sessionCode - Código de sesión
   * @returns {Promise<{creator: string, users: Array, sessionCode: string}>}
   */
  async getSessionDetails(sessionCode) {
    const response = await fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}`)

    if (!response.ok) {
      throw new Error('Error al obtener detalles de la sesión.')
    }

    return response.json()
  }

  /**
   * ========================================
   * INICIAR JUEGOS
   * ========================================
   */

  /**
   * Iniciar juego de Preguntas Directas
   * @param {string} sessionCode - Código de sesión
   */
  async startGame(sessionCode) {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/start-game`,
      { method: 'POST' }
    )

    if (!response.ok) {
      throw new Error('Error al iniciar el juego.')
    }

    return response
  }

  /**
   * Iniciar juego Yo Nunca Nunca
   * @param {string} sessionCode - Código de sesión
   */
  async startYoNuncaNunca(sessionCode) {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/yo-nunca-nunca/start`,
      { method: 'POST' }
    )

    if (!response.ok) {
      throw new Error('Error al iniciar Yo Nunca Nunca.')
    }

    return response
  }

  /**
   * Iniciar juego Preguntas Incómodas
   * @param {string} sessionCode - Código de sesión
   */
  async startPreguntasIncomodas(sessionCode) {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/start-preguntas-incomodas`,
      { method: 'POST' }
    )

    if (!response.ok) {
      throw new Error('Error al iniciar Preguntas Incómodas.')
    }

    return response
  }

  /**
   * Iniciar juego Quién Es Más Probable
   * @param {string} sessionCode - Código de sesión
   */
  async startQuienEsMasProbable(sessionCode) {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/quien-es-mas-probable/start`,
      { method: 'POST' }
    )

    if (!response.ok) {
      throw new Error('Error al iniciar Quién Es Más Probable.')
    }

    return response
  }

  /**
   * Iniciar juego Cultura Pendeja
   * @param {string} sessionCode - Código de sesión
   */
  async startCulturaPendeja(sessionCode) {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/cultura-pendeja/start`,
      { method: 'POST' }
    )

    if (!response.ok) {
      throw new Error('Error al iniciar Cultura Pendeja.')
    }

    return response
  }

  /**
   * ========================================
   * USUARIOS
   * ========================================
   */

  /**
   * Cerrar sesión de usuario
   * @param {string} sessionToken - Token de sesión
   * @returns {Promise<string>}
   */
  async logout(sessionToken) {
    const response = await fetch(
      `${API_BASE_URL}/api/users/logout?sessionToken=${sessionToken}`,
      { method: 'DELETE' }
    )

    return response.text()
  }

  /**
   * Marcar usuario como listo
   * @param {string} username - Nombre de usuario
   */
  async markUserReady(username) {
    const response = await fetch(`${API_BASE_URL}/api/users/${username}/ready`, {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error('Error al marcar usuario como listo.')
    }

    return response
  }

  /**
   * ========================================
   * PREGUNTAS DIRECTAS
   * ========================================
   */

  /**
   * Enviar una pregunta
   * @param {string} sessionCode - Código de sesión
   * @param {Object} payload - {fromUser, toUser, question, anonymous}
   */
  async sendQuestion(sessionCode, payload) {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/send-question`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    )

    if (!response.ok) {
      throw new Error('Error al enviar pregunta.')
    }

    return response
  }

  /**
   * Verificar si todos los usuarios están listos
   * @param {string} sessionCode - Código de sesión
   * @returns {Promise<{allReady: boolean, message: string}>}
   */
  async checkAllReady(sessionCode) {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/check-all-ready`
    )

    if (!response.ok) {
      throw new Error('Error al verificar usuarios listos.')
    }

    return response.json()
  }

  /**
   * Obtener pregunta actual
   * @param {string} sessionCode - Código de sesión
   * @returns {Promise<{question: Object, numeroDePregunta: number}>}
   */
  async getCurrentQuestion(sessionCode) {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/current-question`
    )

    if (!response.ok) {
      throw new Error('Error al obtener la pregunta actual.')
    }

    return response.json()
  }

  /**
   * Obtener siguiente pregunta aleatoria
   * @param {string} sessionCode - Código de sesión
   * @param {string} lastToUser - Último usuario que recibió pregunta
   * @returns {Promise<{question: Object, numeroDePregunta: number}>}
   */
  async getNextRandomQuestion(sessionCode, lastToUser) {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/next-random-question`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastToUser })
      }
    )

    if (!response.ok) {
      throw new Error('Error al obtener la siguiente pregunta.')
    }

    return response.json()
  }

  /**
   * ========================================
   * YO NUNCA NUNCA
   * ========================================
   */

  /**
   * Obtener siguiente pregunta de Yo Nunca Nunca
   * @param {string} sessionCode - Código de sesión
   * @param {string} tipo - Tipo de pregunta
   * @returns {Promise<Object>}
   */
  async getNextYoNuncaNunca(sessionCode, tipo = '1') {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/next-yo-nunca-nunca?tipo=${tipo}`
    )

    if (!response.ok) {
      throw new Error('Error al obtener la siguiente pregunta')
    }

    return response.json()
  }

  /**
   * ========================================
   * PREGUNTAS INCÓMODAS
   * ========================================
   */

  /**
   * Obtener siguiente pregunta incómoda
   * @param {string} sessionCode - Código de sesión
   * @param {string} tipo - Tipo de pregunta
   * @returns {Promise<{question: string, toUser: string}>}
   */
  async getNextPreguntasIncomodas(sessionCode, tipo = 'all') {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/next-preguntas-incomodas?tipo=${tipo}`
    )

    if (!response.ok) {
      throw new Error('Error al obtener la siguiente pregunta.')
    }

    return response.json()
  }

  /**
   * ========================================
   * QUIÉN ES MÁS PROBABLE
   * ========================================
   */

  /**
   * Obtener siguiente pregunta de Quién Es Más Probable
   * @param {string} sessionCode - Código de sesión
   * @param {string} tipo - Tipo de pregunta
   * @returns {Promise<string>}
   */
  async getNextQuienEsMasProbable(sessionCode, tipo = 'all') {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/next-quien-es-mas-probable?tipo=${tipo}`
    )

    if (!response.ok) {
      throw new Error('Error al obtener la siguiente pregunta')
    }

    return response.text()
  }

  /**
   * Enviar voto
   * @param {string} sessionCode - Código de sesión
   * @param {string} votingUser - Usuario que vota
   * @param {string} votedUser - Usuario votado
   */
  async sendVote(sessionCode, votingUser, votedUser) {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/vote`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votingUser, votedUser })
      }
    )

    if (!response.ok) {
      throw new Error('Error al enviar voto.')
    }

    return response
  }

  /**
   * Obtener resultados de votación
   * @param {string} sessionCode - Código de sesión
   * @returns {Promise<{winner: string}>}
   */
  async getVoteResults(sessionCode) {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/vote-results`
    )

    if (!response.ok) {
      throw new Error('Error al obtener resultados.')
    }

    return response.json()
  }

  /**
   * Verificar si todos votaron
   * @param {string} sessionCode - Código de sesión
   * @returns {Promise<{allVoted: boolean}>}
   */
  async checkAllVoted(sessionCode) {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/check-all-voted`
    )

    if (!response.ok) {
      throw new Error('Error al verificar votos.')
    }

    return response.json()
  }

  /**
   * Limpiar votos
   * @param {string} sessionCode - Código de sesión
   */
  async clearVotes(sessionCode) {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/clear-votes`,
      { method: 'POST' }
    )

    if (!response.ok) {
      throw new Error('Error al limpiar votos.')
    }

    return response
  }

  /**
   * ========================================
   * CULTURA PENDEJA
   * ========================================
   */

  /**
   * Obtener siguiente pregunta de Cultura Pendeja
   * @param {string} sessionCode - Código de sesión
   * @param {string} tipo - Tipo de pregunta
   * @returns {Promise<Object>}
   */
  async getNextCulturaPendeja(sessionCode, tipo = 'all') {
    const response = await fetch(
      `${API_BASE_URL}/api/game-sessions/${sessionCode}/next-cultura-pendeja?tipo=${tipo}`
    )

    if (!response.ok) {
      throw new Error('Error obteniendo la siguiente pregunta')
    }

    return response.json()
  }
}

// Exportar instancia única del servicio (Singleton)
export default new ApiService()
