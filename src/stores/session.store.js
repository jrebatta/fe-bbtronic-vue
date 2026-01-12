/**
 * Store de Sesión
 * Maneja todo el estado relacionado con la sesión del usuario
 * Reemplaza el uso de sessionStorage disperso en los scripts originales
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSessionStore = defineStore('session', () => {
  // ========================================
  // STATE
  // ========================================

  /**
   * Token de sesión del usuario
   */
  const sessionToken = ref(sessionStorage.getItem('sessionToken') || null)

  /**
   * Nombre de usuario
   */
  const username = ref(sessionStorage.getItem('username') || null)

  /**
   * Código de sesión actual
   */
  const sessionCode = ref(sessionStorage.getItem('sessionCode') || null)

  /**
   * Lista de usuarios en la sesión
   */
  const users = ref([])

  /**
   * Nombre del creador de la sesión
   */
  const creator = ref(null)

  // ========================================
  // GETTERS (Computed)
  // ========================================

  /**
   * Verificar si el usuario está autenticado
   */
  const isAuthenticated = computed(() => {
    return !!sessionToken.value && !!username.value
  })

  /**
   * Verificar si el usuario actual es el creador de la sesión
   */
  const isCreator = computed(() => {
    return creator.value === username.value
  })

  /**
   * Obtener cantidad de usuarios en la sesión
   */
  const userCount = computed(() => {
    return users.value.length
  })

  /**
   * Verificar si todos los usuarios están listos
   */
  const allUsersReady = computed(() => {
    if (users.value.length === 0) return false
    return users.value.every((user) => user.ready === true)
  })

  // ========================================
  // ACTIONS
  // ========================================

  /**
   * Establecer datos de sesión (token y username)
   * @param {string} token - Token de sesión
   * @param {string} user - Nombre de usuario
   */
  function setSession(token, user) {
    sessionToken.value = token
    username.value = user

    // Persistir en sessionStorage
    sessionStorage.setItem('sessionToken', token)
    sessionStorage.setItem('username', user)

    console.log('✅ Sesión establecida:', { token, user })
  }

  /**
   * Establecer código de sesión
   * @param {string} code - Código de sesión
   */
  function setSessionCode(code) {
    sessionCode.value = code
    // Persistir en sessionStorage
    sessionStorage.setItem('sessionCode', code)
    console.log('✅ Código de sesión establecido:', code)
  }

  /**
   * Establecer lista de usuarios
   * @param {Array} userList - Lista de usuarios
   */
  function setUsers(userList) {
    if (!Array.isArray(userList)) {
      console.error('setUsers: se esperaba un array, recibido:', userList)
      return
    }

    users.value = userList
    console.log('✅ Lista de usuarios actualizada:', userList)
  }

  /**
   * Establecer creador de la sesión
   * @param {string} creatorName - Nombre del creador
   */
  function setCreator(creatorName) {
    creator.value = creatorName
    console.log('✅ Creador de sesión establecido:', creatorName)
  }

  /**
   * Agregar un usuario a la lista
   * @param {Object} user - Usuario a agregar
   */
  function addUser(user) {
    // Verificar que no exista ya
    const exists = users.value.find((u) => u.username === user.username)
    if (!exists) {
      users.value.push(user)
      console.log('✅ Usuario agregado:', user)
    }
  }

  /**
   * Eliminar un usuario de la lista
   * @param {string} usernameToRemove - Nombre del usuario a eliminar
   */
  function removeUser(usernameToRemove) {
    const initialLength = users.value.length
    users.value = users.value.filter((u) => u.username !== usernameToRemove)

    if (users.value.length < initialLength) {
      console.log('✅ Usuario eliminado:', usernameToRemove)
    } else {
      console.warn('⚠️ Usuario no encontrado para eliminar:', usernameToRemove)
    }
  }

  /**
   * Actualizar estado de un usuario (ej: ready)
   * @param {string} usernameToUpdate - Nombre del usuario
   * @param {Object} updates - Objeto con propiedades a actualizar
   */
  function updateUser(usernameToUpdate, updates) {
    const userIndex = users.value.findIndex((u) => u.username === usernameToUpdate)

    if (userIndex !== -1) {
      users.value[userIndex] = { ...users.value[userIndex], ...updates }
      console.log('✅ Usuario actualizado:', usernameToUpdate, updates)
    } else {
      console.warn('⚠️ Usuario no encontrado para actualizar:', usernameToUpdate)
    }
  }

  /**
   * Limpiar toda la sesión (logout)
   */
  function clearSession() {
    sessionToken.value = null
    username.value = null
    sessionCode.value = null
    users.value = []
    creator.value = null

    // Limpiar sessionStorage
    sessionStorage.clear()

    console.log('✅ Sesión limpiada completamente')
  }

  /**
   * Restaurar sesión desde sessionStorage (útil al recargar página)
   */
  function restoreSession() {
    const storedToken = sessionStorage.getItem('sessionToken')
    const storedUsername = sessionStorage.getItem('username')
    const storedSessionCode = sessionStorage.getItem('sessionCode')

    if (storedToken && storedUsername) {
      sessionToken.value = storedToken
      username.value = storedUsername
      if (storedSessionCode) {
        sessionCode.value = storedSessionCode
      }
      console.log('✅ Sesión restaurada desde sessionStorage')
      return true
    }

    console.log('ℹ️ No hay sesión para restaurar')
    return false
  }

  // ========================================
  // RETURN (exponer state, getters y actions)
  // ========================================

  return {
    // State
    sessionToken,
    username,
    sessionCode,
    users,
    creator,

    // Getters
    isAuthenticated,
    isCreator,
    userCount,
    allUsersReady,

    // Actions
    setSession,
    setSessionCode,
    setUsers,
    setCreator,
    addUser,
    removeUser,
    updateUser,
    clearSession,
    restoreSession,
  }
})
