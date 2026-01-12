<template>
  <GameLayout
    title="Preguntas Incómodas"
    @next="fetchNext"
    @return-to-lobby="returnToLobby"
    @logout="handleLogout"
  >
    <QuestionCard
      :question-text="questionText"
      :to-user="toUser"
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

const questionText = ref('')
const toUser = ref('')

const { send } = useWebSocket({
  nextQuestion: (message) => {
    questionText.value = message.question
    toUser.value = message.toUser
  },
  returnToLobby: () => router.push({ name: 'lobby' })
})

onMounted(async () => {
  const data = await apiService.getSessionDetails(sessionStore.sessionCode)
  sessionStore.setCreator(data.creator)

  if (sessionStore.isCreator) fetchNext()
})

async function fetchNext() {
  const data = await apiService.getNextPreguntasIncomodas(sessionStore.sessionCode)
  send('nextQuestion', { question: data.question, toUser: data.toUser })
}

function returnToLobby() {
  send('returnToLobby', { isCreator: true })
  router.push({ name: 'lobby' })
}

async function handleLogout() {
  await logout()
}
</script>
