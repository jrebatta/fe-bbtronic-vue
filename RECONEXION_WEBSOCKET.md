# 🔄 Sistema de Reconexión WebSocket

## Problema Resuelto

Cuando un usuario bloquea su celular durante una sesión de juego, la conexión WebSocket se pierde y el usuario queda desincronizado del estado actual del juego.

## Soluciones Implementadas en Frontend

### 1. ✅ Reconexión Automática

- **Detección de pérdida de conexión**: Cuando el WebSocket se cierra inesperadamente
- **Reconexión con backoff exponencial**: Reintentos progresivos (2s, 4s, 8s, 16s, 32s)
- **Máximo 5 intentos** de reconexión automática

### 2. ✅ Detección de Visibilidad

- **`visibilitychange` event**: Detecta cuando la app vuelve a estar visible (celular desbloqueado)
- **`focus` event**: Detecta cuando la ventana vuelve a tener foco
- **Verificación automática**: Al detectar visibilidad, verifica y reconecta si es necesario

### 3. ✅ Re-suscripción Inteligente

- **Guarda callbacks**: Mantiene los event handlers para re-suscribirse después de reconectar
- **Re-suscripción automática**: Al reconectar, se suscribe automáticamente a todos los canales anteriores

### 4. ✅ Sincronización de Estado

- **Verifica estado del juego**: Al volver, solicita al backend el estado actual de la sesión
- **Redirección automática**: Si el juego ya empezó, redirige al juego correcto
- **Actualiza usuarios**: Sincroniza la lista de usuarios en la sesión

## Archivos Modificados

### `src/services/websocket.service.js`

```javascript
// Nuevas características:
- setupVisibilityListener(): Detecta cuando la app vuelve a estar visible
- handleReconnectIfNeeded(): Verifica y reconecta si es necesario
- handleAutoReconnect(): Reconexión automática con backoff exponencial
- resubscribeAll(): Re-suscribe a todos los canales guardados
- pendingSubscriptions: Map que guarda callbacks para re-suscribir
```

### `src/views/LobbyView.vue`

```javascript
// Nuevas características:
- checkGameStatus(): Verifica si el juego ya inició
- handleVisibilityChange(): Maneja cuando la app vuelve a estar visible
- Redirección automática si el juego ya empezó
```

## ⚠️ Requerimientos del Backend

Para que esto funcione completamente, el backend **DEBE** implementar:

### 1. Campo `currentGame` en Session Details

El endpoint `GET /session/{sessionCode}` debe retornar:

```json
{
  "sessionCode": "ABC123",
  "creator": "usuario1",
  "users": [...],
  "currentGame": "yo-nunca-nunca"  // ← NUEVO CAMPO
}
```

Valores posibles de `currentGame`:

- `null` o ausente: Juego no iniciado (lobby)
- `"preguntas-directas"`
- `"yo-nunca-nunca"`
- `"preguntas-incomodas"`
- `"quien-es-mas-probable"`
- `"cultura-pendeja"`

### 2. Mantener Estado de Sesión

El backend debe:

- Guardar qué juego está activo en cada sesión
- Actualizar este campo cuando se inicia un juego
- Limpiarlo cuando el juego termina

### 3. Persistencia de Mensajes (Opcional pero Recomendado)

Para casos extremos donde un usuario se desconecta por mucho tiempo:

- Guardar los últimos mensajes/eventos importantes
- Enviarlos al usuario cuando se reconecte

## Flujo de Reconexión

```
1. Usuario bloquea celular
   ↓
2. WebSocket se cierra
   ↓
3. Sistema intenta reconectar automáticamente
   ↓
4. Usuario desbloquea celular
   ↓
5. Event "visibilitychange" se dispara
   ↓
6. Verifica conexión WebSocket
   ↓
7. Si no está conectado, reconecta
   ↓
8. Re-suscribe a todos los canales
   ↓
9. Solicita estado actual al backend (GET /session/{code})
   ↓
10. Si el juego ya empezó, redirige automáticamente
```

## Ejemplo de Uso

```javascript
// En cualquier componente que use WebSocket
const { send } = useWebSocket({
  gameStarted: (message) => {
    // Este evento se recibirá incluso después de reconectar
    router.push('/game')
  },
})

// El sistema automáticamente:
// 1. Reconecta si se pierde la conexión
// 2. Re-suscribe a los eventos
// 3. Sincroniza el estado al volver
```

## Testing

### Probar Reconexión

1. Entra a una sesión en el celular
2. Bloquea el celular por 10-15 segundos
3. Desbloquea el celular
4. Verifica que siga conectado y reciba eventos

### Probar Sincronización

1. Usuario A entra al lobby
2. Usuario A bloquea su celular
3. Usuario B inicia un juego
4. Usuario A desbloquea su celular
5. Usuario A debe ser redirigido automáticamente al juego en curso

## Configuración

En `websocket.service.js` puedes ajustar:

```javascript
this.maxReconnectAttempts = 5 // Máximo de intentos
this.reconnectDelay = 2000 // Delay inicial en ms
```

## Monitoreo

Los logs en consola te ayudarán a debuggear:

- `📱 App visible de nuevo, verificando conexión...`
- `🔄 Reconectando WebSocket...`
- `✅ WebSocket conectado exitosamente.`
- `⚠️ Conexión WebSocket cerrada`
- `🎮 Juego en curso detectado: {gameName}`
