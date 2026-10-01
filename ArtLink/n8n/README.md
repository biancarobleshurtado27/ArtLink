# Integración N8N con Chatbot Gemini e IA - ArtLink

Este directorio contiene los flujos de automatización de N8N para el proyecto ArtLink, incluyendo la integración del **Chatbot con Inteligencia Artificial Gemini** y los flujos con notificaciones por correo Gmail.

---

## 1. Arquitectura del Chatbot con Gemini

```text
React Chatbot (Frontend)
    │
    ▼ HTTP POST (sin API keys en el navegador)
Webhook de N8N (/artlink/chatbot-gemini)
    │
    ▼
Validación y Sanitización del Mensaje
(1-2000 chars, max 10 historial, anti-datos sensibles)
    │
    ▼ HTTP Request seguro
API Oficial de Google Gemini (v1beta)
(Utiliza GEMINI_API_KEY y GEMINI_MODEL desde el entorno de N8N)
    │
    ▼
Normalización y Manejo Controlado de Errores
(400, 401, 403, 429, timeout, respuesta vacía)
    │
    ▼ Respond to Webhook (JSON unificado)
React Chatbot muestra la respuesta
(o mensaje de respaldo local si N8N está apagado)
```

> **Principio de Seguridad Estricta:**
> La clave `GEMINI_API_KEY` reside **únicamente en N8N**. React nunca se conecta directamente a Gemini ni contiene la API key en el código, `.env`, localStorage, `db.json` ni Git.

---

## 2. Flujo de N8N: `flujo-chatbot-gemini.json`

- **Nombre del Workflow:** `ArtLink - Chatbot con Gemini`
- **Ruta del Webhook:** `POST /webhook/artlink/chatbot-gemini` (o `/webhook-test/artlink/chatbot-gemini` en modo ejecución de prueba interactiva).
- **Parámetros Validados:**
  - `message`: Obligatorio, longitud entre 1 y 2000 caracteres.
  - `history`: Historial previo recortado a los últimos 10 mensajes.
  - Detección y filtrado de datos sensibles (contraseñas, tokens, tarjetas de crédito).
- **Prompt del Sistema Configurado:**
  > Eres el asistente oficial de ArtLink, una plataforma para artistas digitales y clientes.
  > Responde en español claro y breve. Ayuda únicamente con: explorar artistas, filtrar comisiones, presupuestos Escrow Shield, seguimiento y soporte.
  > No inventes artistas, precios ni políticas. No solicites contraseñas ni datos bancarios.
- **Configuración de Gemini:**
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{{$env.GEMINI_MODEL}}:generateContent?key={{$env.GEMINI_API_KEY}}`
  - Temperatura: `0.4`
  - Max Output Tokens: `800`
- **Formato Normalizado de Respuesta:**
  ```json
  {
    "success": true,
    "conversationId": "artlink-chat-123",
    "message": "Respuesta del asistente.",
    "provider": "gemini",
    "model": "gemini-1.5-flash"
  }
  ```

---

## 3. Guía Paso a Paso: Configurar e Iniciar N8N

### Paso 1: Configurar Variables de Entorno en N8N

Para que N8N acceda a tu API Key de Gemini de forma segura sin exponerla en el Frontend, define las variables antes de iniciar N8N:

**En Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="TU_CLAVE_SECRETA_DE_GEMINI"
$env:GEMINI_MODEL="gemini-1.5-flash"
n8n start
```

**En Windows (CMD):**
```cmd
set GEMINI_API_KEY=TU_CLAVE_SECRETA_DE_GEMINI
set GEMINI_MODEL=gemini-1.5-flash
n8n start
```

**En Linux / macOS:**
```bash
export GEMINI_API_KEY="TU_CLAVE_SECRETA_DE_GEMINI"
export GEMINI_MODEL="gemini-1.5-flash"
n8n start
```

> **Modelo Recomendado:** Puedes usar `gemini-1.5-flash` o `gemini-2.0-flash` para respuestas rápidas y de alta calidad.

---

### Paso 2: Importar el Workflow en N8N

Tienes dos formas de importar el flujo:

#### Opción A: Desde la Interfaz Web de N8N (Recomendada)
1. Abre tu navegador en `http://localhost:5678`.
2. En el menú lateral, haz clic en **Workflows**.
3. Haz clic en **Add Workflow** -> botón de 3 puntos `...` -> **Import from File**.
4. Selecciona el archivo:
   `n8n/flujo-chatbot-gemini.json`
5. Haz clic en **Save** para guardarlo.

#### Opción B: Mediante la CLI de N8N
```powershell
n8n import:workflow --input="n8n/flujo-chatbot-gemini.json"
```

---

### Paso 3: Activar el Workflow

1. Abre el workflow importado **ArtLink - Chatbot con Gemini** en N8N.
2. En la esquina superior derecha, activa el interruptor **Active** (debe ponerse en verde).
3. Esto deja activo el webhook de producción permanente en:
   `http://localhost:5678/webhook/artlink/chatbot-gemini`

---

### Paso 4: Obtener y Verificar la URL del Webhook

En el nodo **Webhook Chatbot ArtLink**:
- En modo activo (producción):
  `http://localhost:5678/webhook/artlink/chatbot-gemini`
- En modo prueba interactivo (al pulsar *Test step* o *Execute workflow*):
  `http://localhost:5678/webhook-test/artlink/chatbot-gemini`

El archivo de servicio de React `src/services/n8nChatService.js` toma la base desde `.env`:
```env
VITE_N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook
VITE_USE_GEMINI_WORKFLOW=true
```

---

## 4. Pruebas del Webhook con cURL y PowerShell

Puedes probar directamente el funcionamiento del endpoint con el archivo de prueba incluido:

### Con cURL (CMD o Bash):
```bash
curl -X POST "http://localhost:5678/webhook/artlink/chatbot-gemini" \
  -H "Content-Type: application/json" \
  -d @n8n/ejemplos/chatbot-gemini.json
```

### Con PowerShell:
```powershell
$body = Get-Content n8n/ejemplos/chatbot-gemini.json -Raw
Invoke-RestMethod -Uri "http://localhost:5678/webhook/artlink/chatbot-gemini" -Method Post -Body $body -ContentType "application/json"
```

### Casos de Prueba Verificados:
1. **Mensaje válido:** Retorna `{ success: true, message: "...", provider: "gemini", model: "..." }`.
2. **Mensaje vacío:** Retorna HTTP 400 `{ success: false, error: "VALIDATION_ERROR", message: "El mensaje no puede estar vacío..." }`.
3. **Mensaje mayor a 2000 caracteres:** Retorna HTTP 400 indicando exceso de longitud.
4. **Datos sensibles (contraseña/tarjeta):** Retorna advertencia de seguridad sin enviar nada a Gemini.
5. **API Key inválida o cuota 429:** El nodo de normalización captura el error de Google y devuelve un mensaje controlado para el usuario sin exponer la clave.
6. **N8N apagado:** React captura la ausencia de red y muestra de inmediato:
   `Respuesta local de respaldo; Gemini no está disponible.`

---

## 5. Configuración de CORS y Proxy

Si tu navegador bloquea las solicitudes entre orígenes (origen `http://localhost:5173` hacia `http://localhost:5678`), puedes:

1. **Usar el Proxy de Vite ya configurado:**
   En `.env`, configura:
   ```env
   VITE_N8N_WEBHOOK_BASE_URL=/n8n-proxy/webhook
   ```
   Vite redirige automáticamente `/n8n-proxy` a `http://localhost:5678` sin problemas de CORS.
2. **Habilitar CORS en N8N:**
   Al iniciar N8N, puedes establecer:
   ```powershell
   $env:N8N_DEFAULT_BINARY_DATA_MODE="default"
   $env:WEBHOOK_URL="http://localhost:5678/"
   ```
   N8N responderá automáticamente a las solicitudes `OPTIONS` preflight del navegador.

---

## 6. Manejo de Errores y Cuotas

| Código / Escenario | Causa | Mensaje presentado al usuario |
|---|---|---|
| **400** | Modelo inválido o formato incorrecto | "La solicitud enviada no es válida para el modelo de IA o el modelo configurado no existe." |
| **401 / 403** | GEMINI_API_KEY no configurada o expirada | "Error de autenticación con la API de Gemini. Verifica la GEMINI_API_KEY en N8N." |
| **429** | Límite de cuota gratuita de Google Gemini | "Límite de cuota excedido para el servicio de IA. Intenta de nuevo en unos minutos." |
| **500 / Timeout** | Servidor de Google no responde a tiempo | "El servicio de Gemini no respondió a tiempo o no está disponible temporalmente." |
| **N8N Apagado** | Conexión rechazada (`ERR_CONNECTION_REFUSED`) | "Respuesta local de respaldo; Gemini no está disponible." |

---

## 7. Activación del Modo Respaldo (Fallback)

Si deseas forzar el modo de respaldo local para pruebas o demostraciones sin conexión:
En tu archivo `.env`:
```env
VITE_USE_GEMINI_WORKFLOW=false
```
El chatbot responderá con:
`Respuesta local de respaldo; Gemini no está disponible.`
sin realizar llamadas externas.

---

## 8. Otros Flujos Disponibles en este Directorio

- **`flujo-registro-usuario.json`:** Registro con validación anti-duplicados y envío de correo de bienvenida HTML vía Gmail.
- **`flujo-solicitud-comision.json`:** Creación de comisiones con cálculo de tarifa base, retención de fondos Escrow Shield y alerta por correo al artista.
