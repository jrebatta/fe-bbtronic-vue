import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let nextId = 0

  /**
   * @param {string} message
   * @param {'info'|'success'|'error'|'warning'} type
   * @param {number} duration - ms, 0 = no auto-dismiss
   */
  function show(message, type = 'info', duration = 4000) {
    const id = ++nextId
    toasts.value.push({ id, message, type })

    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }

    return id
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, show, dismiss }
})
