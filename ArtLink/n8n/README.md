# ArtLink - Agente IA de Arte y Comisiones (N8N + Google Gemini)

Este directorio contiene el workflow oficial de automatización para el **Agente IA de ArtLink**, adaptado a partir de la arquitectura técnica de agentes LangChain en N8N.

> **Nota Arquitectónica:**
> El workflow de ejemplo (Sonar) se utilizó **únicamente como plantilla arquitectónica técnica** (Webhook, Validación, Contexto, LangChain Agent, Memoria Buffer, Modelo Gemini, Formateo y Respond). Se han eliminado por completo todas las referencias musicales, nombres de Sonar, credenciales, IDs de instancia y configuraciones privadas.

---

## 1. Arquitectura del Agente LangChain en N8N

```text
React Chatbot (Frontend)
    │
    ▼ HTTP POST (Sin API keys en React)
1. Webhook ArtLink (/webhook/artlink-chatbot)
    │
    ▼
2. Validar Mensaje (1-2000 chars, tipo string, anti-datos sensibles, rol)
    ├── [Inválido] ──► 3. Respond Error (HTTP 400)
    │
    ▼ [Válido]
4. Preparar Contexto (Contexto seguro, rol, idioma, página, historial max 10)
    │
    ▼
5. ArtLink Agente IA (@n8n/n8n-nodes-langchain.agent)
    ├── 6. Memoria de Conversación (Buffer Window: 10 mensajes)
    └── 9. Google Gemini Chat Model (models/gemini-1.5-flash)
    │
    ▼
7. Formatear Respuesta (Extrae intent, suggestions, quickReplies, actions, confirmation)
    │
    ▼
8. Respond Webhook (HTTP 200 con cabeceras CORS unificadas)
    │
    ▼
React Chatbot muestra respuesta, sugerencias, respuestas rápidas y botones de acción
```

---

## 2. Nodos del Workflow (`n8n/flujo-agente-artlink-gemini.json`)

| # | Nombre del Nodo | Tipo de Nodo | Función |
|---|---|---|---|
| **1** | **Webhook ArtLink** | `n8n-nodes-base.webhook` | Escucha peticiones `POST /webhook/artlink-chatbot` con `responseMode: responseNode`. |
| **2** | **Validar Mensaje** | `n8n-nodes-base.if` | Verifica que el mensaje exista, sea texto, no esté vacío, no exceda 2000 caracteres y no contenga contraseñas ni datos de tarjetas. |
| **3** | **Respond Error** | `n8n-nodes-base.respondToWebhook` | Devuelve `400 Bad Request` con mensaje de error controlado y cabeceras CORS. |
| **4** | **Preparar Contexto** | `n8n-nodes-base.code` | Prepara `sessionId`, `conversationId`, `userId`, `userName`, `role`, `page`, `language`, `preferences` e `history` (recortado a 10). |
| **5** | **ArtLink Agente IA** | `@n8n/n8n-nodes-langchain.agent` | Agente inteligente con el prompt oficial de ArtLink (asistencia de la plataforma + conocimiento educativo de arte). |
| **6** | **Memoria de Conversación** | `@n8n/n8n-nodes-langchain.memoryBufferWindow` | Ventana de contexto para recordar los últimos 10 turnos de la sesión. |
| **7** | **Google Gemini Chat Model** | `@n8n/n8n-nodes-langchain.lmChatGoogleGemini` | Conector oficial del modelo Gemini con credencial propia de ArtLink. |
| **8** | **Formatear Respuesta** | `n8n-nodes-base.code` | Normaliza el output a la estructura de ArtLink (intención, acciones, sugerencias, sin campos musicales). |
| **9** | **Respond Webhook** | `n8n-nodes-base.respondToWebhook` | Retorna el JSON estructurado al Frontend con cabeceras CORS. |

---

## 3. Modelo Gemini y Credenciales en N8N

- **Nodo:** Google Gemini Chat Model (`@n8n/n8n-nodes-langchain.lmChatGoogleGemini`).
- **Modelo Configurado:** `models/gemini-1.5-flash` (alta velocidad, excelente seguimiento de instrucciones y amplia cuota disponible en Google AI Studio). Si tu cuenta tiene habilitado `gemini-2.0-flash`, puedes seleccionarlo en el desplegable del nodo.
- **Credencial de Gemini:**
  1. En N8N (`http://localhost:5678`), ve a **Credentials** -> **Add Credential**.
  2. Busca **Google Gemini(PaLM) Api**.
  3. Ingresa tu API Key de Google AI Studio.
  4. Nombra la credencial como `Google Gemini ArtLink API`.
  5. En el nodo **Google Gemini Chat Model**, selecciona esta credencial.

> **Seguridad Estricta:** La API key nunca se incluye en el archivo JSON del workflow ni en el código de React.

---

## 4. Payload de Entrada y Formato de Respuesta

### Entrada esperada (`POST /webhook/artlink-chatbot`):
```json
{
  "message": "Busca artistas de modelos VTuber con comisiones abiertas",
  "sessionId": "session-12345",
  "conversationId": "convo-12345",
  "userId": "client-1",
  "userName": "Cliente Prueba",
  "role": "client",
  "page": "/explorar",
  "preferences": ["VTuber", "Anime"],
  "language": "es",
  "history": []
}
```

### Respuesta normalizada:
```json
{
  "success": true,
  "message": "En ArtLink puedes encontrar creadores de modelos VTuber listos para comisiones...",
  "sessionId": "session-12345",
  "conversationId": "convo-12345",
  "intent": "search_artists",
  "knowledgeDomain": "artlink",
  "suggestions": [
    "¿Qué especificaciones requiere un modelo Live2D?",
    "Ver artistas con entrega rápida"
  ],
  "quickReplies": [
    "Explorar artistas",
    "Cómo pedir comisión"
  ],
  "actions": [
    {
      "type": "open_explore",
      "label": "Explorar artistas VTuber",
      "filters": {
        "discipline": "Modelos VTuber"
      }
    }
  ],
  "requiresConfirmation": false,
  "timestamp": "2026-10-01T19:00:00.000Z",
  "model": "gemini-1.5-flash"
}
```

---

## 5. Importación y Activación en N8N

### Mediante la CLI de N8N:
```powershell
n8n import:workflow --input="n8n/flujo-agente-artlink-gemini.json"
n8n publish:workflow --id="ArtLinkAgentGem1"
```

### Desde la Interfaz Web:
1. Abre `http://localhost:5678`.
2. En **Workflows**, haz clic en **Import from File**.
3. Selecciona `n8n/flujo-agente-artlink-gemini.json`.
4. Asigna tu credencial de Gemini en el nodo **Google Gemini Chat Model**.
5. Activa el interruptor **Active** (esquina superior derecha).

---

## 6. Pruebas y Casos de Uso Verificados

Ejecuta las pruebas desde PowerShell o cURL:

```powershell
# Probar el webhook con el payload de ejemplo
$body = Get-Content n8n/ejemplos/chatbot-gemini.json -Raw
Invoke-RestMethod -Uri "http://localhost:5678/webhook/artlink-chatbot" -Method Post -Body $body -ContentType "application/json"
```

### Matriz de Pruebas:
1. **Cómo solicitar una comisión:** El agente explica el proceso de 3 pasos (acuerdo, depósito Escrow Shield, entregas y aprobación).
2. **Buscar artistas de modelado 3D:** Provee guía y botón de acción interactivo `open_explore`.
3. **Buscar modelos VTuber:** Provee detalles sobre rig y botón para filtrar en la plataforma.
4. **Qué es el cel shading:** Explicación técnica educativa del sombreado no fotorrealista (NPR).
5. **Cómo mejorar la teoría del color:** Consejos sobre armonías cromáticas, saturación y contraste.
6. **Quién fue Frida Kahlo:** Explicación histórica y artística rigurosa distinguiéndola de los artistas de ArtLink.
7. **Diferencia entre cubismo y surrealismo:** Explicación sobre descomposición geométrica vs. libre asociación del subconsciente.
8. **Cómo comenzar con Live2D:** Guía de capas para ilustradores (separación de ojos, boca y cabello).
9. **Pregunta fuera de ArtLink y arte:** Recuerda cortésmente su función como Agente de ArtLink.
10. **Mensaje vacío:** Responde HTTP 400 (`Debes enviar un mensaje válido para el asistente de ArtLink.`).
11. **Mensaje demasiado largo (>2000 chars):** Rechazado por el nodo de validación.
12. **Gemini / N8N no disponible:** El frontend detecta la caída y muestra con honestidad:  
    *«Respuesta local de respaldo; Gemini no está disponible.»*
13. **Recargar y conservar el chat:** Persistencia automática en `localStorage` mediante `loadPersistedChatHistory()`.
14. **Diseño Responsivo:** Adaptado para 375px (móvil), 768px (tablet) y 1280px (escritorio).
