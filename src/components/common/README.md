# Componentes Comunes Reutilizables

Componentes base creados para reutilización en toda la aplicación fe-bbtronic-vue.

## 📦 Componentes Disponibles

### 1. BaseButton

Botón reutilizable con múltiples variantes y estado de carga.

**Props:**
- `type` (String): 'button' | 'submit' | 'reset' (default: 'button')
- `variant` (String): 'primary' | 'danger' | 'warning' | 'success' | 'secondary' (default: 'primary')
- `disabled` (Boolean): Deshabilita el botón
- `loading` (Boolean): Muestra spinner de carga

**Eventos:**
- `@click`: Emitido cuando se hace click

**Ejemplo:**
```vue
<BaseButton variant="primary" @click="handleClick">
  Crear Sesión
</BaseButton>

<BaseButton variant="danger" :loading="isLoading" @click="handleLogout">
  Salir
</BaseButton>
```

---

### 2. BackgroundVideo

Video de fondo consistente para todas las vistas.

**Props:**
- `lowOpacity` (Boolean): Reduce opacidad a 0.5 (default: false)

**Ejemplo:**
```vue
<BackgroundVideo />
<!-- o con baja opacidad -->
<BackgroundVideo :low-opacity="true" />
```

---

### 3. LoadingSpinner

Spinner de carga con overlay o inline.

**Props:**
- `show` (Boolean): Muestra/oculta el spinner (default: true)
- `message` (String): Mensaje opcional debajo del spinner
- `inline` (Boolean): Modo inline sin overlay (default: false)
- `size` (String): Tamaño del spinner (default: '60px')

**Ejemplo:**
```vue
<LoadingSpinner :show="loading" message="Cargando usuarios..." />
<LoadingSpinner :show="loading" inline size="40px" />
```

---

### 4. ErrorMessage

Componente para mostrar mensajes de error con animación.

**Props:**
- `message` (String): Mensaje de error a mostrar

**Ejemplo:**
```vue
<ErrorMessage :message="error" />
```

---

### 5. BaseModal

Modal reutilizable con soporte para slots.

**Props:**
- `modelValue` (Boolean): Controla visibilidad del modal (v-model)
- `title` (String): Título opcional del modal

**Slots:**
- `default`: Contenido principal del modal
- `footer`: Contenido del footer (botones, etc.)

**Eventos:**
- `@update:modelValue`: Emitido al cerrar

**Ejemplo:**
```vue
<BaseModal v-model="showModal" title="Confirmar Acción">
  <p>¿Estás seguro de que deseas continuar?</p>

  <template #footer>
    <BaseButton @click="confirm">Confirmar</BaseButton>
    <BaseButton variant="secondary" @click="showModal = false">Cancelar</BaseButton>
  </template>
</BaseModal>
```

---

### 6. UserList

Lista de usuarios con estilos consistentes.

**Props:**
- `users` (Array): Array de objetos de usuario
- `title` (String): Título de la lista (default: 'Usuarios en la Sesión')
- `clickable` (Boolean): Hace los items clickeables (default: false)

**Slots:**
- `user-actions`: Slot con scope para acciones por usuario

**Eventos:**
- `@user-click`: Emitido al hacer click en un usuario (si clickable=true)

**Ejemplo:**
```vue
<UserList :users="sessionStore.users" title="Jugadores Conectados" />

<UserList :users="users" clickable @user-click="handleUserClick">
  <template #user-actions="{ user }">
    <button @click="kickUser(user)">Expulsar</button>
  </template>
</UserList>
```

---

### 7. GameLayout

Layout común para vistas de juegos con header, controles y estructura consistente.

**Props:**
- `title` (String): Título del juego (required)
- `customClass` (String): Clase CSS adicional
- `showHeader` (Boolean): Muestra header (default: true)
- `showSessionCode` (Boolean): Muestra código de sesión (default: false)
- `showCreatorControls` (Boolean): Muestra controles del creador (default: true)
- `showNextButton` (Boolean): Muestra botón siguiente (default: true)
- `showLobbyButton` (Boolean): Muestra botón volver al lobby (default: true)
- `showLogoutButton` (Boolean): Muestra botón salir (default: true)

**Slots:**
- `default`: Contenido principal del juego
- `creator-controls`: Controles personalizados del creador

**Eventos:**
- `@next`: Emitido al hacer click en "Siguiente"
- `@return-to-lobby`: Emitido al hacer click en "Volver al Lobby"
- `@logout`: Emitido al hacer click en "Salir"

**Ejemplo:**
```vue
<GameLayout
  title="Yo Nunca Nunca"
  :show-session-code="true"
  @next="fetchNext"
  @return-to-lobby="returnToLobby"
  @logout="handleLogout"
>
  <QuestionCard :question-text="currentQuestion" />
</GameLayout>
```

---

### 8. QuestionCard

Tarjeta para mostrar preguntas con formato consistente.

**Props:**
- `questionText` (String): Texto de la pregunta
- `questionNumber` (Number|String): Número de pregunta (opcional)
- `fromUser` (String): Usuario que hizo la pregunta (opcional)
- `toUser` (String): Usuario destinatario (opcional)

**Slots:**
- `default`: Contenido adicional en el footer de la card

**Ejemplo:**
```vue
<QuestionCard
  :question-text="question.text"
  :question-number="5"
  from-user="Juan"
  to-user="María"
/>

<QuestionCard :question-text="question">
  <BaseButton @click="vote">Votar</BaseButton>
</QuestionCard>
```

---

## 📝 Importación

### Importación Individual:
```vue
<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import GameLayout from '@/components/common/GameLayout.vue'
</script>
```

### Importación Múltiple (recomendado):
```vue
<script setup>
import { BaseButton, GameLayout, QuestionCard } from '@/components/common'
</script>
```

---

## 🎨 Estilos

Todos los componentes utilizan:
- Variables CSS consistentes con el tema de la aplicación
- Efectos neón y glassmorphism
- Animaciones suaves
- Diseño responsive
- Fuente Roboto

---

## 🔄 Actualizar Componentes

Si necesitas modificar un componente:

1. Edita el archivo en `src/components/common/`
2. Los cambios se aplicarán automáticamente en todos los lugares donde se use
3. Documenta cualquier cambio importante en este README

---

## ✨ Mejores Prácticas

1. **Siempre usa estos componentes** en lugar de crear botones/modals/etc. desde cero
2. **Props son inmutables** - no modifiques props directamente, usa eventos
3. **Usa slots** para personalización cuando sea necesario
4. **Emite eventos** en lugar de manipular estado externo directamente
5. **Mantén componentes pequeños** - si un componente crece mucho, divídelo

---

## 📊 Beneficios

✅ **Consistencia** - Mismo look & feel en toda la app
✅ **Mantenibilidad** - Cambios en un solo lugar
✅ **Reutilización** - DRY (Don't Repeat Yourself)
✅ **Productividad** - Desarrollo más rápido
✅ **Testing** - Más fácil probar componentes aislados
