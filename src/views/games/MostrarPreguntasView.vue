<template>
  <GameLayout
    title="Preguntas"
    @next="fetchNext"
    @return-to-lobby="returnToLobby"
    @logout="handleLogout"
  >
    <QuestionCard
      :question-text="currentQuestion.question"
      :question-number="questionNumber"
      :from-user="currentQuestion.fromUser || 'Anónimo'"
      :to-user="currentQuestion.toUser"
    />
  </GameLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session.store'
import { useSession } from '@/composables/useSession'
import { useWebSocket } from '@/composables/useWebSocket'
import apiService from '@/services/api.service'
import { GameLayout, QuestionCard } from '@/components/common'

const router = useRouter()
const sessionStore = useSessionStore()
const { logout } = useSession()

const currentQuestion = ref({})
const questionNumber = ref(0)

const { send } = useWebSocket({
  update: (message) => {
    currentQuestion.value = message.question
    questionNumber.value = message.numeroDePregunta
  },
  returnToLobby: () => router.push({ name: 'lobby' })
})

onMounted(async () => {
  try {
    const data = await apiService.getSessionDetails(sessionStore.sessionCode)
    sessionStore.setCreator(data.creator)

    const response = await apiService.getCurrentQuestion(sessionStore.sessionCode)
    currentQuestion.value = response.question
    questionNumber.value = response.numeroDePregunta
  } catch (err) {
    console.error('Error:', err)
  }
})

async function fetchNext() {
  try {
    const response = await apiService.getNextRandomQuestion(
      sessionStore.sessionCode,
      currentQuestion.value.toUser || ''
    )
    send('update', {
      question: response.question,
      numeroDePregunta: response.numeroDePregunta
    })
  } catch (err) {
    console.error('Error al obtener siguiente pregunta:', err)
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
