<template>
  <div class="question-card">
    <!-- Número de pregunta (opcional) -->
    <p v-if="questionNumber" class="question-number">
      Pregunta #{{ questionNumber }}
    </p>

    <!-- De quién (opcional) -->
    <p v-if="fromUser !== undefined" class="from-user">
      De: <strong>{{ fromUser || 'Anónimo' }}</strong>
    </p>

    <!-- Para quién (opcional) -->
    <p v-if="toUser !== undefined" class="to-user">
      Para: <strong>{{ toUser || '-' }}</strong>
    </p>

    <!-- Texto de la pregunta -->
    <p class="question-text">{{ questionText || '-' }}</p>

    <!-- Slot para contenido adicional -->
    <div v-if="$slots.default" class="card-extra">
      <slot />
    </div>
  </div>
</template>

<script setup>
/**
 * QuestionCard - Tarjeta de pregunta reutilizable
 * Muestra preguntas con formato consistente
 */

defineProps({
  questionText: {
    type: String,
    default: ''
  },
  questionNumber: {
    type: [Number, String],
    default: null
  },
  fromUser: {
    type: String,
    default: undefined
  },
  toUser: {
    type: String,
    default: undefined
  }
})
</script>

<style scoped>
.question-card {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 40px;
  border: 2px solid rgba(187, 0, 255, 0.4);
  box-shadow: 0 8px 32px rgba(187, 0, 255, 0.3);
  animation: slideUp 0.5s ease-out;
  margin: 20px auto;
  max-width: 800px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.question-number {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
  text-align: center;
}

.from-user,
.to-user {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.from-user strong,
.to-user strong {
  color: #bb00ff;
  text-shadow: 0 0 10px rgba(187, 0, 255, 0.6);
}

.question-text {
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  text-align: center;
  line-height: 1.6;
  margin: 20px 0;
  text-shadow: 0 0 15px rgba(187, 0, 255, 0.5);
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-extra {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(187, 0, 255, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .question-card {
    padding: 30px 20px;
  }

  .question-text {
    font-size: 22px;
  }
}
</style>
