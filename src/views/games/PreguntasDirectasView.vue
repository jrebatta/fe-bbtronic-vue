<template>
  <GameLayout
    title="Preguntas Directas"
    :show-next-button="false"
    @return-to-lobby="returnToLobby"
    @logout="handleLogout"
  >
    <div class="questions-container">
      <div
        v-for="user in otherUsers"
        :key="user.username"
        class="question-item"
      >
        <label class="question-label">Pregunta para {{ user.username }}:</label>
        <input
          v-model="questions[user.username]"
          type="text"
          placeholder="Escribe tu pregunta aquí"
          class="question-input"
        >
      </div>
    </div>

    <div class="anonymous-check">
      <input
        v-model="anonymousCheck"
        type="checkbox"
        id="anonymousCheck"
      >
      <label for="anonymousCheck">
        Enviar de forma anónima
      </label>
    </div>

    <BaseButton
      variant="primary"
      :disabled="questionsSent || loading"
      :loading="loading"
      @click="submitQuestions"
    >
      Enviar Preguntas
    </BaseButton>

    <ErrorMessage v-if="error" :message="error" />
  </GameLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session.store'
import { useSession } from '@/composables/useSession'
import { useWebSocket } from '@/composables/useWebSocket'
import apiService from '@/services/api.service'
import { GameLayout, BaseButton, ErrorMessage } from '@/components/common'

const router = useRouter()
const sessionStore = useSessionStore()
const { logout } = useSession()

const questions = ref({})
const anonymousCheck = ref(false)
const questionsSent = ref(false)
const loading = ref(false)
const error = ref('')

const otherUsers = computed(() =>
  sessionStore.users.filter(u => u.username !== sessionStore.username)
)

const { send } = useWebSocket({
  allReady: () => router.push({ name: 'mostrar-preguntas' }),
  returnToLobby: () => router.push({ name: 'lobby' })
})

onMounted(async () => {
  try {
    const data = await apiService.getSessionDetails(sessionStore.sessionCode)
    sessionStore.setCreator(data.creator)
    sessionStore.setUsers(data.users)
  } catch (err) {
    error.value = 'Error al cargar sesión'
  }
})

async function submitQuestions() {
  if (questionsSent.value) return

  const allFilled = otherUsers.value.every(u => questions.value[u.username]?.trim())
  if (!allFilled) {
    error.value = 'Por favor, completa todas las preguntas.'
    return
  }

  questionsSent.value = true
  loading.value = true
  error.value = ''

  try {
    for (const user of otherUsers.value) {
      await apiService.sendQuestion(sessionStore.sessionCode, {
        fromUser: sessionStore.username,
        toUser: user.username,
        question: questions.value[user.username].trim(),
        anonymous: anonymousCheck.value
      })
    }

    await apiService.markUserReady(sessionStore.username)
    const response = await apiService.checkAllReady(sessionStore.sessionCode)

    if (response.allReady) {
      send('allReady')
    } else {
      error.value = response.message || 'Esperando a otros usuarios...'
    }
  } catch (err) {
    error.value = 'Error al enviar preguntas'
    questionsSent.value = false
  } finally {
    loading.value = false
  }
}

function returnToLobby() {
  send('returnToLobby', { isCreator: true })
  router.push({ name: 'lobby' })
}

async function handleLogout() {
  await logout()
}
</script>

<style scoped>
.questions-container {
  max-width: 700px;
  margin: 30px auto;
}

.question-item {
  margin-bottom: 25px;
}

.question-label {
  display: block;
  color: #fff;
  font-size: 16px;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(187, 0, 255, 0.6);
}

.question-input {
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(187, 0, 255, 0.4);
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  transition: all 0.3s;
}

.question-input:focus {
  outline: none;
  border-color: #bb00ff;
  box-shadow: 0 0 15px rgba(187, 0, 255, 0.5);
}

.question-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.anonymous-check {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px auto;
  max-width: 700px;
  color: #fff;
  font-size: 16px;
}

.anonymous-check input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #bb00ff;
}

.anonymous-check label {
  cursor: pointer;
  user-select: none;
}

@media (max-width: 768px) {
  .questions-container {
    padding: 0 15px;
  }

  .question-label,
  .anonymous-check {
    font-size: 14px;
  }
}
</style>
