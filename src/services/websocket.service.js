/**
 * Servicio de WebSocket
 * Maneja toda la comunicación en tiempo real con SockJS y STOMP
 * Mantiene la lógica exacta de los scripts originales
 */

import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import { reactive } from 'vue'
import { WS_ENDPOINT } from '@/config/api.config.js'

class WebSocketService {
  constructor() {
    this.stompClient = null
    this.socket = null
    this.subscriptions = new Map() // Almacenar suscripciones por sessionCode
    this.isConnecting = false
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 2000
    this.pendingSubscriptions = new Map() // Guardar callbacks para re-suscribir
    this.reconnectCallback = null // Callback para ejecutar después de reconectar
    this.connectionHeaders = {} // Headers STOMP persistidos para reconexión

    // Estado reactivo expuesto para componentes Vue
    this.state = reactive({
      isConnected: false,
      isReconnecting: false,
    })

    // Detectar cuando la app vuelve al primer plano (celular desbloqueado)
    this.setupVisibilityListener()
  }

  /**
   * Establecer callback a ejecutar después de reconexión exitosa
   * @param {Function} callback - Función a ejecutar después de reconectar
   */
  setReconnectCallback(callback) {
    this.reconnectCallback = callback
  }

  /**
   * Configurar listener para detectar cuando la app vuelve a estar visible
   */
  setupVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          console.log('📱 App visible de nuevo, verificando conexión...')
          this.handleReconnectIfNeeded()
        }
      })

      // Detectar cuando la app vuelve a tener foco
      window.addEventListener('focus', () => {
        console.log('📱 App tiene foco, verificando conexión...')
        this.handleReconnectIfNeeded()
      })
    }
  }

  /**
   * Verificar conexión y reconectar si es necesario
   */
  async handleReconnectIfNeeded() {
    // Si ya está conectando, no intentar de nuevo
    if (this.isConnecting) {
      console.log('⏳ Ya hay un intento de conexión en curso...')
      return
    }

    // Si no está conectado Y hay suscripciones pendientes, reconectar
    if (!this.isWebSocketConnected() && this.pendingSubscriptions.size > 0) {
      console.log('🔄 Reconectando WebSocket después de visibilidad...')
      console.log(`📊 Suscripciones pendientes: ${this.pendingSubscriptions.size}`)

      try {
        // Resetear intentos para permitir reconexión agresiva en mobile
        this.reconnectAttempts = 0

        await this.reconnect()

        // Re-suscribir a todos los canales pendientes
        this.resubscribeAll()

        // Ejecutar callback de reconexión si existe
        if (this.reconnectCallback && typeof this.reconnectCallback === 'function') {
          console.log('🔄 Ejecutando callback de reconexión para sincronizar estado...')
          await this.reconnectCallback()
        }

        console.log('✅ Reconexión completada exitosamente')
      } catch (error) {
        console.error('❌ Error al reconectar:', error)
        // Intentar de nuevo después de un delay
        setTimeout(() => this.handleReconnectIfNeeded(), 3000)
      }
    } else if (this.isWebSocketConnected()) {
      console.log('✅ WebSocket ya está conectado')

      // Aunque esté conectado, ejecutar el callback para sincronizar estado
      if (this.reconnectCallback && typeof this.reconnectCallback === 'function') {
        console.log('🔄 Sincronizando estado aunque ya esté conectado...')
        await this.reconnectCallback()
      }
    }
  }

  /**
   * Conectar al WebSocket
   * @param {Object} headers - Headers STOMP (username, sessionCode)
   * @returns {Promise<Object>} - Retorna el cliente STOMP
   */
  connect(headers = {}) {
    // Persistir headers para reconexión automática
    if (Object.keys(headers).length > 0) {
      this.connectionHeaders = headers
    }

    return new Promise((resolve, reject) => {
      // Si ya está conectado, resolver inmediatamente
      if (this.isConnected && this.stompClient) {
        console.log('WebSocket ya está conectado.')
        resolve(this.stompClient)
        return
      }

      // Si está intentando conectar, esperar
      if (this.isConnecting) {
        console.log('WebSocket ya está conectando...')
        setTimeout(() => {
          if (this.isConnected) {
            resolve(this.stompClient)
          } else {
            reject(new Error('Timeout en conexión WebSocket'))
          }
        }, 5000)
        return
      }

      this.isConnecting = true

      try {
        // Crear conexión SockJS
        this.socket = new SockJS(WS_ENDPOINT)
        this.stompClient = Stomp.over(this.socket)

        // Deshabilitar logs de debug de STOMP (opcional)
        this.stompClient.debug = null

        // Detectar pérdida de conexión
        this.socket.onclose = () => {
          console.log('⚠️ Conexión WebSocket cerrada')
          this.isConnected = false
          this.state.isConnected = false
          this.state.isReconnecting = true
          this.handleAutoReconnect()
        }

        // Conectar con headers STOMP (username y sessionCode para el backend)
        this.stompClient.connect(
          this.connectionHeaders,
          () => {
            console.log('✅ WebSocket conectado exitosamente.')
            this.isConnected = true
            this.isConnecting = false
            this.reconnectAttempts = 0
            this.state.isConnected = true
            this.state.isReconnecting = false
            resolve(this.stompClient)
          },
          (error) => {
            console.error('❌ Error en la conexión del WebSocket:', error)
            this.isConnecting = false
            this.isConnected = false
            this.state.isConnected = false
            this.handleAutoReconnect()
            reject(error)
          },
        )
      } catch (error) {
        console.error('❌ Error al crear conexión WebSocket:', error)
        this.isConnecting = false
        this.isConnected = false
        reject(error)
      }
    })
  }

  /**
   * Manejar reconexión automática con backoff exponencial
   */
  async handleAutoReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de intentos de reconexión alcanzado')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(
      `🔄 Reconectando en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    )

    setTimeout(async () => {
      try {
        await this.reconnect()
        this.resubscribeAll()

        // Ejecutar callback de reconexión DESPUÉS de reconexión exitosa
        if (this.reconnectCallback && typeof this.reconnectCallback === 'function') {
          console.log('🔄 Ejecutando callback de reconexión automática...')
          await this.reconnectCallback()
        }

        console.log('✅ Reconexión automática completada exitosamente')
      } catch (error) {
        console.error('❌ Error en reconexión automática:', error)
      }
    }, delay)
  }

  /**
   * Suscribirse a un canal (tópico) de sesión
   * @param {string} sessionCode - Código de sesión
   * @param {Function} callback - Función callback que recibe los mensajes
   * @returns {Object} - Retorna la suscripción
   */
  subscribe(sessionCode, callback) {
    if (!this.stompClient || !this.isConnected) {
      throw new Error('WebSocket no está conectado. Llama a connect() primero.')
    }

    // Guardar callback para poder re-suscribir después de reconectar
    this.pendingSubscriptions.set(sessionCode, callback)

    // Si ya existe una suscripción para este sessionCode, desuscribirse primero
    if (this.subscriptions.has(sessionCode)) {
      console.log(`Ya existe suscripción para ${sessionCode}, reemplazando...`)
      this.unsubscribe(sessionCode)
    }

    const topic = `/topic/${sessionCode}`

    const subscription = this.stompClient.subscribe(topic, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body)
        console.log(`📨 Mensaje recibido en ${topic}:`, parsedMessage)
        callback(parsedMessage)
      } catch (error) {
        console.error('Error al parsear mensaje del WebSocket:', error)
      }
    })

    this.subscriptions.set(sessionCode, subscription)
    console.log(`✅ Suscrito a ${topic}`)

    return subscription
  }

  /**
   * Re-suscribir a todos los canales guardados
   */
  resubscribeAll() {
    console.log('🔄 Re-suscribiendo a todos los canales...')
    const callbacks = new Map(this.pendingSubscriptions)

    callbacks.forEach((callback, sessionCode) => {
      try {
        this.subscribe(sessionCode, callback)
      } catch (error) {
        console.error(`Error al re-suscribir a ${sessionCode}:`, error)
      }
    })
  }

  /**
   * Enviar mensaje a un canal específico
   * @param {string} sessionCode - Código de sesión
   * @param {string} event - Nombre del evento
   * @param {Object} data - Datos adicionales (opcional)
   */
  send(sessionCode, event, data = {}) {
    if (!this.stompClient || !this.isConnected) {
      console.error('❌ WebSocket no está conectado. No se puede enviar mensaje.')
      console.log('🔄 Intentando reconectar...')

      // Intentar reconectar automáticamente
      this.handleReconnectIfNeeded()

      throw new Error(
        `WebSocket no está conectado. Evento "${event}" no se pudo enviar. Reintentando conexión...`,
      )
    }

    const topic = `/topic/${sessionCode}`
    const payload = { event, ...data }

    try {
      this.stompClient.send(topic, {}, JSON.stringify(payload))
      console.log(`📤 Mensaje enviado a ${topic}:`, payload)
    } catch (error) {
      console.error('❌ Error al enviar mensaje por WebSocket:', error)
      // Marcar como desconectado para forzar reconexión
      this.isConnected = false
      throw error
    }
  }

  /**
   * Desuscribirse de un canal
   * @param {string} sessionCode - Código de sesión
   * @param {boolean} keepPending - Si es true, mantiene el callback para reconexión
   */
  unsubscribe(sessionCode, keepPending = false) {
    const subscription = this.subscriptions.get(sessionCode)

    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(sessionCode)
      console.log(`✅ Desuscrito de /topic/${sessionCode}`)
    } else {
      console.warn(`No hay suscripción activa para ${sessionCode}`)
    }

    // Limpiar pending subscription si no se quiere mantener
    if (!keepPending) {
      this.pendingSubscriptions.delete(sessionCode)
    }
  }

  /**
   * Desconectar del WebSocket
   */
  disconnect() {
    if (this.stompClient) {
      // Desuscribirse de todos los canales
      this.subscriptions.forEach((subscription, sessionCode) => {
        subscription.unsubscribe()
        console.log(`Desuscrito de /topic/${sessionCode}`)
      })
      this.subscriptions.clear()

      // Desconectar cliente STOMP
      this.stompClient.disconnect(() => {
        console.log('✅ WebSocket desconectado.')
      })

      this.stompClient = null
      this.socket = null
      this.isConnected = false
      this.isConnecting = false
      this.state.isConnected = false
    }
  }

  /**
   * Verificar si está conectado
   * @returns {boolean}
   */
  isWebSocketConnected() {
    return this.isConnected && this.stompClient !== null
  }

  /**
   * Reconectar al WebSocket usando los headers persistidos
   * @returns {Promise<Object>}
   */
  async reconnect() {
    console.log('🔄 Intentando reconectar WebSocket...')
    this.disconnect()
    return this.connect(this.connectionHeaders)
  }
}

// Exportar instancia única del servicio (Singleton)
export default new WebSocketService()
