<template>
  <div class="user-list-container">
    <h2 v-if="title" class="list-title">{{ title }}</h2>

    <ul class="user-list" role="list">
      <li
        v-for="user in users"
        :key="user.username"
        :class="['user-item', { clickable }]"
        @click="handleUserClick(user)"
        :role="clickable ? 'button' : undefined"
        :tabindex="clickable ? 0 : undefined"
        @keydown.enter="clickable && handleUserClick(user)"
      >
        <!-- Avatar with initials -->
        <span class="user-avatar" :style="{ background: getAvatarColor(user.username) }">
          {{ getInitials(user.username) }}
        </span>

        <span class="username">{{ user.username }}</span>

        <!-- Online dot -->
        <span class="status-dot" :class="{ online: user.connected !== false }" aria-hidden="true"></span>

        <slot name="user-actions" :user="user" />
      </li>

      <li v-if="users.length === 0" class="empty-state">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span>Esperando jugadores...</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  users:     { type: Array,   required: true, default: () => [] },
  title:     { type: String,  default: '' },
  clickable: { type: Boolean, default: false }
})

const emit = defineEmits(['user-click'])

function handleUserClick(user) {
  emit('user-click', user)
}

function getInitials(name) {
  return (name || '?').slice(0, 2).toUpperCase()
}

// Deterministic color from username string
const AVATAR_COLORS = [
  'rgba(187,0,255,0.7)',
  'rgba(255,71,87,0.7)',
  'rgba(46,213,115,0.7)',
  'rgba(255,165,2,0.7)',
  'rgba(30,144,255,0.7)',
  'rgba(255,99,132,0.7)',
  'rgba(0,206,201,0.7)',
]
function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
</script>

<style scoped>
.user-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-title {
  font-family: 'Righteous', sans-serif;
  font-size: 18px;
  font-weight: 400;
  color: #f0e6ff;
  text-align: center;
  text-shadow: 0 0 12px rgba(187, 0, 255, 0.6);
  letter-spacing: 0.5px;
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(187, 0, 255, 0.2);
  padding: 12px 16px;
  border-radius: 12px;
  color: #f0e6ff;
  font-size: 15px;
  font-weight: 500;
  transition: background 200ms ease, border-color 200ms ease, transform 200ms ease;
}

.user-item:hover {
  background: rgba(187, 0, 255, 0.08);
  border-color: rgba(187, 0, 255, 0.4);
}

.user-item.clickable {
  cursor: pointer;
}

.user-item.clickable:hover {
  transform: translateX(4px);
  background: rgba(187, 0, 255, 0.12);
  border-color: rgba(187, 0, 255, 0.5);
}

.user-item.clickable:active {
  transform: translateX(2px);
}

/* Avatar */
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.username {
  flex: 1;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
}

/* Online status dot */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}
.status-dot.online {
  background: #2ed573;
  box-shadow: 0 0 6px rgba(46, 213, 115, 0.7);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 28px 20px;
  color: rgba(240, 230, 255, 0.4);
  font-size: 14px;
  font-style: italic;
  border: 1px dashed rgba(187, 0, 255, 0.2);
  border-radius: 12px;
}
</style>
