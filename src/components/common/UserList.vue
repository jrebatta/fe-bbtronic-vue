<template>
  <div class="user-list-container">
    <h2 v-if="title" class="list-title">{{ title }}</h2>
    <ul class="user-list">
      <li
        v-for="user in users"
        :key="user.username"
        :class="['user-item', { clickable: clickable }]"
        @click="handleUserClick(user)"
      >
        <span class="username">{{ user.username }}</span>
        <slot name="user-actions" :user="user" />
      </li>
      <li v-if="users.length === 0" class="empty-state">No hay usuarios en la sesión</li>
    </ul>
  </div>
</template>

<script setup>
/**
 * UserList - Componente de lista de usuarios
 * Reutilizable para lobby y otras vistas
 */

defineProps({
  users: {
    type: Array,
    required: true,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Usuarios en la Sesión',
  },
  clickable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['user-click'])

function handleUserClick(user) {
  emit('user-click', user)
}
</script>

<style scoped>
.user-list-container {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(187, 0, 255, 0.3);
  box-shadow: 0 8px 32px rgba(187, 0, 255, 0.2);
}

.list-title {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  color: #fff;
  text-shadow: 0 0 10px rgba(187, 0, 255, 0.8);
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(187, 0, 255, 0.3);
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(187, 0, 255, 0.5);
  transform: translateX(5px);
}

.user-item.clickable {
  cursor: pointer;
}

.user-item.clickable:active {
  transform: translateX(3px);
}

.username {
  font-weight: 600;
}

.badge {
  background: rgba(40, 167, 69, 0.3);
  border: 1px solid #28a745;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}
</style>
