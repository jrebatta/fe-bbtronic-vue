# 🔧 Mejora Backend - Enviar Estado al Reconectar WebSocket

## 🎯 Problema Adicional Detectado

Aunque el frontend ahora verifica el estado del juego al reconectarse, hay un escenario donde el backend puede ayudar:

**Escenario:**

1. Usuario 2 bloquea su celular en el lobby
2. Usuario 1 inicia el juego → envía evento `gameStarted` por WebSocket
3. Usuario 2 NO recibe el evento (desconectado)
4. Usuario 2 desbloquea → Frontend consulta HTTP y redirige ✅

Esto ya funciona con la solución frontend, PERO podemos hacerlo más robusto con ayuda del backend.

## ✅ Solución Backend (OPCIONAL pero Recomendada)

### Opción 1: Enviar Estado al Suscribirse (Recomendada)

Cuando un usuario se suscribe a un canal WebSocket, enviarle inmediatamente el estado actual del juego.

**Ventaja:** El usuario recibe el estado actualizado sin necesidad de consultar HTTP.

**Implementación en Spring Boot:**

```java
@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private GameSessionRepository sessionRepository;

    /**
     * Detectar cuando un usuario se suscribe a un canal
     */
    @EventListener
    public void handleSessionSubscribeEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = headerAccessor.getDestination();

        // Verificar si es suscripción a un canal de sesión
        if (destination != null && destination.startsWith("/topic/")) {
            String sessionCode = destination.replace("/topic/", "");

            // Buscar sesión
            GameSession session = sessionRepository.findBySessionCode(sessionCode);

            if (session != null && session.getCurrentGame() != null) {
                // Si hay un juego activo, notificar al usuario que se acaba de suscribir
                String sessionId = headerAccessor.getSessionId();

                // Crear mensaje de sincronización
                Map<String, Object> syncMessage = new HashMap<>();
                syncMessage.put("event", getEventForGame(session.getCurrentGame()));
                syncMessage.put("sync", true); // Indicar que es sincronización

                // Enviar solo a este usuario específico
                messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/sync",
                    syncMessage,
                    createHeaders(sessionId)
                );

                log.info("📤 Estado del juego enviado a usuario en sesión {}: {}",
                         sessionCode, session.getCurrentGame());
            }
        }
    }

    /**
     * Mapear currentGame a nombre de evento
     */
    private String getEventForGame(String currentGame) {
        Map<String, String> gameEvents = Map.of(
            "preguntas-directas", "gameStarted",
            "yo-nunca-nunca", "yoNuncaNuncaStarted",
            "preguntas-incomodas", "preguntasIncomodasStarted",
            "quien-es-mas-probable", "quienEsMasProbableStarted",
            "cultura-pendeja", "culturaPendejaStarted"
        );
        return gameEvents.getOrDefault(currentGame, "gameStarted");
    }

    /**
     * Crear headers para mensaje específico de usuario
     */
    private MessageHeaders createHeaders(String sessionId) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE);
        headerAccessor.setSessionId(sessionId);
        headerAccessor.setLeaveMutable(true);
        return headerAccessor.getMessageHeaders();
    }
}
```

### Opción 2: Endpoint de Sincronización (Más Simple)

Agregar un endpoint que el frontend puede llamar para obtener el estado y recibir eventos perdidos:

```java
@RestController
@RequestMapping("/api/game-sessions")
public class GameSessionController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Sincronizar estado de un usuario en la sesión
     * El frontend llama esto después de reconectar
     */
    @PostMapping("/{sessionCode}/sync")
    public ResponseEntity<Map<String, Object>> syncUserState(
            @PathVariable String sessionCode,
            @RequestParam String username
    ) {
        GameSession session = sessionRepository.findBySessionCode(sessionCode);

        if (session == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("currentGame", session.getCurrentGame());
        response.put("users", session.getUsers());

        // Si hay un juego activo, enviar evento por WebSocket también
        if (session.getCurrentGame() != null) {
            String event = getEventForGame(session.getCurrentGame());
            Map<String, Object> wsMessage = new HashMap<>();
            wsMessage.put("event", event);
            wsMessage.put("sync", true);

            messagingTemplate.convertAndSend("/topic/" + sessionCode, wsMessage);
        }

        return ResponseEntity.ok(response);
    }
}
```

## 🔄 Flujo Completo con Backend Mejorado

### Con Opción 1 (Auto-sync al suscribirse):

```
1. Usuario 2 bloquea celular en lobby
2. Usuario 1 inicia "Yo Nunca Nunca"
   → Backend guarda: currentGame = "yo-nunca-nunca"
   → Backend envía: gameStarted por WebSocket
3. Usuario 2 desbloquea celular
   → Frontend reconecta WebSocket
   → Frontend se suscribe a /topic/{sessionCode}
   → ✅ Backend detecta suscripción nueva
   → ✅ Backend envía automáticamente: yoNuncaNuncaStarted
   → ✅ Frontend recibe evento y redirige
```

### Con Opción 2 (Endpoint sync):

```
1. Usuario 2 bloquea celular en lobby
2. Usuario 1 inicia "Yo Nunca Nunca"
3. Usuario 2 desbloquea celular
   → Frontend reconecta WebSocket
   → Frontend llama: POST /api/game-sessions/{code}/sync
   → Backend responde con currentGame y envía evento
   → ✅ Frontend redirige
```

## 📝 Qué Usar y Cuándo

| Solución                    | Complejidad | Robustez         | Recomendado        |
| --------------------------- | ----------- | ---------------- | ------------------ |
| Solo Frontend (actual)      | ⭐ Baja     | ⭐⭐ Buena       | ✅ Suficiente      |
| Frontend + Backend Opción 1 | ⭐⭐⭐ Alta | ⭐⭐⭐ Excelente | Si tienes recursos |
| Frontend + Backend Opción 2 | ⭐⭐ Media  | ⭐⭐⭐ Excelente | ✅ Ideal           |

## 🎯 Recomendación

**Para tu caso:** La solución Frontend actual es **suficiente y funcional**.

**Si quieres más robustez:** Implementa la **Opción 2** (endpoint sync) porque:

- Es más simple que detectar suscripciones
- El frontend tiene control sobre cuándo sincronizar
- Más fácil de debuggear
- Compatible con la lógica actual

## ⚡ Implementación Rápida (Opción 2)

**1. Backend - Agregar endpoint:**

```java
@PostMapping("/{sessionCode}/sync")
public ResponseEntity<SessionDTO> syncSession(@PathVariable String sessionCode) {
    GameSession session = sessionRepository.findBySessionCode(sessionCode);

    if (session == null) {
        return ResponseEntity.notFound().build();
    }

    SessionDTO dto = new SessionDTO();
    dto.setSessionCode(session.getSessionCode());
    dto.setCreator(session.getCreator());
    dto.setUsers(session.getUsers());
    dto.setCurrentGame(session.getCurrentGame());

    return ResponseEntity.ok(dto);
}
```

**2. Frontend - Ya está implementado** ✅

El `checkGameStatus()` ya consulta el estado y redirige. No necesitas cambiar nada más.

## 🧪 Probar

1. Usuario 1 crea sesión
2. Usuario 2 se une
3. Usuario 2 bloquea celular (esperar 10 seg)
4. Usuario 1 inicia juego
5. Usuario 2 desbloquea celular
6. ✅ Usuario 2 debe ser redirigido automáticamente al juego

Mira la consola del navegador, deberías ver:

```
📱 App visible de nuevo, verificando conexión...
🔄 Reconectando WebSocket después de visibilidad...
✅ WebSocket conectado exitosamente.
🔄 Re-suscribiendo a todos los canales...
🔄 WebSocket reconectado, verificando estado del juego...
🎮 Juego en curso detectado: yo-nunca-nunca
```
