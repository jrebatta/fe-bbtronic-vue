<template>
  <Transition name="question-swap" mode="out-in">
    <div :key="questionText" class="question-card">
      <!-- Badge row -->
      <div v-if="questionNumber || fromUser !== undefined || toUser !== undefined" class="card-meta">
        <span v-if="questionNumber" class="meta-badge meta-number">#{{ questionNumber }}</span>
        <span v-if="fromUser !== undefined" class="meta-badge meta-from">
          De: <strong>{{ fromUser || 'Anónimo' }}</strong>
        </span>
        <span v-if="toUser !== undefined" class="meta-badge meta-to">
          Para: <strong>{{ toUser || '—' }}</strong>
        </span>
      </div>

      <!-- Question text -->
      <p class="question-text">{{ questionText || '—' }}</p>

      <!-- Extra slot -->
      <div v-if="$slots.default" class="card-extra">
        <slot />
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  questionText:   { type: String, default: '' },
  questionNumber: { type: [Number, String], default: null },
  fromUser:       { type: String, default: undefined },
  toUser:         { type: String, default: undefined }
})
</script>

<style scoped>
.question-card {
  background: rgba(14, 10, 30, 0.82);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(187, 0, 255, 0.35);
  border-radius: 20px;
  padding: 40px 48px;
  box-shadow:
    0 8px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(187, 0, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  animation: cardReveal 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 780px;
  width: 100%;
  margin: 0 auto;
}

@keyframes cardReveal {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Meta badges ── */
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 28px;
}

.meta-badge {
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}

.meta-number {
  background: rgba(187, 0, 255, 0.15);
  border: 1px solid rgba(187, 0, 255, 0.3);
  color: rgba(240, 230, 255, 0.7);
}

.meta-from {
  background: rgba(187, 0, 255, 0.1);
  border: 1px solid rgba(187, 0, 255, 0.25);
  color: rgba(240, 230, 255, 0.75);
}
.meta-from strong {
  color: #cc44ff;
}

.meta-to {
  background: rgba(187, 0, 255, 0.15);
  border: 1px solid rgba(187, 0, 255, 0.35);
  color: rgba(240, 230, 255, 0.75);
}
.meta-to strong {
  color: #dd77ff;
  text-shadow: 0 0 8px rgba(187, 0, 255, 0.5);
}

/* ── Question text ── */
.question-text {
  font-family: 'Poppins', sans-serif;
  font-size: 26px;
  font-weight: 500;
  color: #f0e6ff;
  text-align: center;
  line-height: 1.65;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 0 0 20px rgba(187, 0, 255, 0.25);
}

/* ── Extra slot ── */
.card-extra {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid rgba(187, 0, 255, 0.2);
}

@media (max-width: 768px) {
  .question-card {
    padding: 28px 24px;
  }
  .question-text {
    font-size: 20px;
  }
}

/* ── Question swap transition ── */
.question-swap-enter-active {
  transition: opacity 300ms ease, transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.question-swap-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.question-swap-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}
.question-swap-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.99);
}

@media (max-width: 400px) {
  .question-card {
    padding: 20px 16px;
    border-radius: 16px;
  }
  .question-text {
    font-size: 18px;
    min-height: 56px;
    line-height: 1.55;
  }
  .card-meta {
    margin-bottom: 18px;
  }
  .card-extra {
    margin-top: 18px;
    padding-top: 16px;
  }
}
</style>
