# 📋 Requerimientos Backend - Sistema de Reconexión

## 🎯 Problema a Resolver

Cuando un usuario bloquea su celular durante una sesión de juego:

1. La conexión WebSocket se cierra automáticamente
2. El usuario pierde la sincronización con el estado del juego
3. Cuando desbloquea el celular, está en el lobby mientras los demás están en el juego
4. El usuario queda "perdido" y no puede continuar jugando

## 💡 Solución Implementada en Frontend

El frontend ahora:

1. **Reconecta automáticamente** el WebSocket cuando vuelve la app
2. **Re-suscribe** a los canales de la sesión
3. **Consulta al backend** el estado actual de la sesión
4. **Redirige automáticamente** al juego correcto si ya empezó

## ✅ Lo que Necesita el Backend

### 1. Agregar Campo `currentGame` en la Sesión

**Modelo de Datos (Session/GameSession)**

Agregar un nuevo campo a tu modelo de sesión:

```java
public class GameSession {
    private String sessionCode;
    private String creator;
    private List<User> users;

    // ⬇️ NUEVO CAMPO
    private String currentGame;  // puede ser null

    // getters y setters
}
```

### 2. Modificar Endpoint: GET Session Details

**Endpoint:** `GET /api/game-sessions/{sessionCode}`

**Response actual:**

```json
{
  "sessionCode": "ABC123",
  "creator": "usuario1",
  "users": [
    { "username": "usuario1", "sessionToken": "token123" },
    { "username": "usuario2", "sessionToken": "token456" }
  ]
}
```

**Response modificado (agregar currentGame):**

```json
{
  "sessionCode": "ABC123",
  "creator": "usuario1",
  "users": [
    { "username": "usuario1", "sessionToken": "token123" },
    { "username": "usuario2", "sessionToken": "token456" }
  ],
  "currentGame": "yo-nunca-nunca" // ⬅️ NUEVO
}
```

**Valores posibles de `currentGame`:**

- `null` → Sesión en lobby, no ha iniciado ningún juego
- `"preguntas-directas"` → Juego activo
- `"yo-nunca-nunca"` → Juego activo
- `"preguntas-incomodas"` → Juego activo
- `"quien-es-mas-probable"` → Juego activo
- `"cultura-pendeja"` → Juego activo

### 3. Actualizar `currentGame` al Iniciar Juegos

Cada vez que se inicia un juego, actualizar el campo `currentGame` de la sesión.

**Ejemplo en código:**

```java
// Endpoint: POST /api/game-sessions/{sessionCode}/yo-nunca-nunca/start
@PostMapping("/{sessionCode}/yo-nunca-nunca/start")
public ResponseEntity<?> startYoNuncaNunca(@PathVariable String sessionCode) {
    GameSession session = sessionRepository.findBySessionCode(sessionCode);

    if (session == null) {
        return ResponseEntity.notFound().build();
    }

    // Iniciar el juego (lógica existente)
    // ... tu código actual ...

    // ⬇️ AGREGAR ESTO: Actualizar el estado del juego
    session.setCurrentGame("yo-nunca-nunca");
    sessionRepository.save(session);

    return ResponseEntity.ok().build();
}
```

**Para TODOS los endpoints de inicio de juego:**

| Endpoint                                          | Valor de `currentGame`    |
| ------------------------------------------------- | ------------------------- |
| `POST /{sessionCode}/start-game`                  | `"preguntas-directas"`    |
| `POST /{sessionCode}/yo-nunca-nunca/start`        | `"yo-nunca-nunca"`        |
| `POST /{sessionCode}/preguntas-incomodas/start`   | `"preguntas-incomodas"`   |
| `POST /{sessionCode}/quien-es-mas-probable/start` | `"quien-es-mas-probable"` |
| `POST /{sessionCode}/cultura-pendeja/start`       | `"cultura-pendeja"`       |

### 4. Limpiar `currentGame` al Terminar Juego (Opcional)

Si tienes endpoints para terminar juegos o volver al lobby:

```java
// Endpoint: POST /api/game-sessions/{sessionCode}/end-game
@PostMapping("/{sessionCode}/end-game")
public ResponseEntity<?> endGame(@PathVariable String sessionCode) {
    GameSession session = sessionRepository.findBySessionCode(sessionCode);

    // ⬇️ Limpiar el juego actual
    session.setCurrentGame(null);
    sessionRepository.save(session);

    return ResponseEntity.ok().build();
}
```

## 🔄 Flujo Completo

### Escenario: Usuario se pierde durante el juego

**Sin la solución:**

```
1. Usuario A y B están en el lobby
2. Usuario B inicia "Yo Nunca Nunca"
3. Usuario A bloquea su celular (pierde conexión)
4. Usuario A desbloquea celular
5. ❌ Usuario A sigue en el lobby (PROBLEMA)
6. ❌ Usuario A no recibe actualizaciones del juego
```

**Con la solución:**

```
1. Usuario A y B están en el lobby
2. Usuario B inicia "Yo Nunca Nunca"
   → Backend guarda: currentGame = "yo-nunca-nunca"
3. Usuario A bloquea su celular (pierde conexión)
4. Usuario A desbloquea celular
   → Frontend reconecta WebSocket automáticamente
   → Frontend hace: GET /api/game-sessions/{code}
   → Backend responde: currentGame = "yo-nunca-nunca"
   → ✅ Frontend redirige automáticamente al juego
5. ✅ Usuario A está sincronizado y puede seguir jugando
```

## 📝 Implementación Paso a Paso

### Paso 1: Modificar el Modelo

```java
// En tu clase GameSession o Session
private String currentGame;

public String getCurrentGame() {
    return currentGame;
}

public void setCurrentGame(String currentGame) {
    this.currentGame = currentGame;
}
```

### Paso 2: Actualizar GET /api/game-sessions/{sessionCode}

```java
@GetMapping("/{sessionCode}")
public ResponseEntity<SessionDTO> getSessionDetails(@PathVariable String sessionCode) {
    GameSession session = sessionRepository.findBySessionCode(sessionCode);

    if (session == null) {
        return ResponseEntity.notFound().build();
    }

    SessionDTO dto = new SessionDTO();
    dto.setSessionCode(session.getSessionCode());
    dto.setCreator(session.getCreator());
    dto.setUsers(session.getUsers());
    dto.setCurrentGame(session.getCurrentGame()); // ⬅️ AGREGAR ESTO

    return ResponseEntity.ok(dto);
}
```

### Paso 3: Actualizar Todos los Endpoints de Inicio

**Template para cada endpoint:**

```java
@PostMapping("/{sessionCode}/[NOMBRE-JUEGO]/start")
public ResponseEntity<?> startJuego(@PathVariable String sessionCode) {
    GameSession session = sessionRepository.findBySessionCode(sessionCode);

    // ... tu lógica existente de inicio de juego ...

    // ⬇️ AGREGAR AL FINAL
    session.setCurrentGame("[nombre-del-juego]");
    sessionRepository.save(session);

    return ResponseEntity.ok().build();
}
```

**Aplicar en:**

- `/start-game` → `currentGame = "preguntas-directas"`
- `/yo-nunca-nunca/start` → `currentGame = "yo-nunca-nunca"`
- `/preguntas-incomodas/start` → `currentGame = "preguntas-incomodas"`
- `/quien-es-mas-probable/start` → `currentGame = "quien-es-mas-probable"`
- `/cultura-pendeja/start` → `currentGame = "cultura-pendeja"`

### Paso 4: Inicializar en null al Crear Sesión

```java
@PostMapping("/create")
public ResponseEntity<?> createSession(@RequestParam String username) {
    GameSession session = new GameSession();
    session.setSessionCode(generateCode());
    session.setCreator(username);
    session.setCurrentGame(null); // ⬅️ Inicialmente sin juego

    sessionRepository.save(session);

    return ResponseEntity.ok(session);
}
```

## 🧪 Cómo Probar

### Test Manual:

1. **Crear sesión y verificar estado inicial:**

   ```bash
   GET /api/game-sessions/ABC123

   Response:
   {
     "currentGame": null  // ✓ Correcto
   }
   ```

2. **Iniciar juego y verificar actualización:**

   ```bash
   POST /api/game-sessions/ABC123/yo-nunca-nunca/start

   GET /api/game-sessions/ABC123

   Response:
   {
     "currentGame": "yo-nunca-nunca"  // ✓ Correcto
   }
   ```

3. **Simular reconexión desde frontend:**
   - Usuario entra al lobby
   - Usuario bloquea celular
   - Otro usuario inicia juego
   - Usuario desbloquea celular
   - Debe ser redirigido automáticamente al juego

### Test Automatizado (Ejemplo JUnit):

```java
@Test
public void testCurrentGameField() {
    // Crear sesión
    GameSession session = new GameSession();
    session.setSessionCode("TEST123");
    session.setCurrentGame(null);
    sessionRepository.save(session);

    // Iniciar juego
    session.setCurrentGame("yo-nunca-nunca");
    sessionRepository.save(session);

    // Verificar
    GameSession retrieved = sessionRepository.findBySessionCode("TEST123");
    assertEquals("yo-nunca-nunca", retrieved.getCurrentGame());
}
```

## ⚠️ Consideraciones Importantes

### 1. Migraciones de Base de Datos

Si usas una base de datos SQL, necesitas migración:

```sql
ALTER TABLE game_sessions
ADD COLUMN current_game VARCHAR(50) NULL;
```

### 2. Compatibilidad con Versiones Anteriores

El campo `currentGame` puede ser `null`, así que es compatible con código existente.

### 3. Sesiones sin Base de Datos

Si guardas sesiones en memoria (Map/HashMap):

```java
private Map<String, GameSession> sessions = new ConcurrentHashMap<>();

// Simplemente accede y modifica
GameSession session = sessions.get(sessionCode);
session.setCurrentGame("yo-nunca-nunca");
// No necesitas save() si es en memoria
```

## 📊 Resumen de Cambios

| Componente           | Cambio Requerido                    | Complejidad |
| -------------------- | ----------------------------------- | ----------- |
| Modelo `GameSession` | Agregar campo `currentGame`         | ⭐ Fácil    |
| GET session details  | Incluir `currentGame` en response   | ⭐ Fácil    |
| POST start game (x5) | Actualizar `currentGame` al iniciar | ⭐⭐ Media  |
| Base de datos        | Migración para agregar columna      | ⭐ Fácil    |

**Tiempo estimado:** 30-60 minutos de desarrollo + pruebas

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si no implemento esto?**  
R: Los usuarios que bloqueen sus celulares quedarán desincronizados y no podrán seguir jugando hasta reiniciar la app.

**P: ¿Debo enviar el `currentGame` por WebSocket también?**  
R: No es necesario. El frontend consulta este dato vía HTTP cuando reconecta.

**P: ¿Qué pasa si elimino una sesión?**  
R: No hay cambios, sigue funcionando igual que antes.

**P: ¿Necesito cambiar algo en el WebSocket?**  
R: No, el WebSocket sigue funcionando igual. Solo necesitas el campo `currentGame` en HTTP.
