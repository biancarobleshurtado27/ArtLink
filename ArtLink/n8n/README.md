# Integración N8N: Agente de IA con Gemini y Herramientas - ArtLink

Este directorio contiene los flujos de automatización de N8N para el proyecto ArtLink, incluyendo el **Agente de IA Oficial con Gemini y Herramientas Controladas**, así como los flujos de registro y comisiones con notificaciones por correo Gmail.

---

## 1. Diferencia entre Chatbot y Agente de IA

| Característica | Chatbot Tradicional | Agente de IA ArtLink (Nuevo) |
|---|---|---|
| **Funcionamiento** | Solo genera texto predictivo | Clasifica intención y decide si necesita herramientas |
| **Datos reales** | Inventa o desconoce artistas actuales | Consulta en tiempo real `/artistProfiles`, `/requests`, `/commissions` |
| **Acciones en la UI** | Solo texto estático | Envía botones de acción y navegación (`/artista/:id`, `/explorar?...`) |
| **Mutaciones y seguridad** | Podría prometer compras falsas | Solicita confirmación explícita antes de crear o enviar solicitudes |
| **Datos no encontrados** | Alucina respuestas | Admite con honestidad que no hubo coincidencias y sugiere alternativas |

---

## 2. Arquitectura del Agente

```text
React Chatbot (Frontend)
    │
    ▼ HTTP POST (sin API keys en el navegador)
Webhook de N8N (/artlink/chatbot-gemini)
    │
    ▼
Validar sesión y mensaje (1-2000 chars, historial max 10, anti-datos sensibles)
    │
    ▼ HTTP Request (Gemini Paso 1)
Gemini clasifica intención y solicita herramienta
    │
    ▼ Code Node (Ejecutor seguro en N8N)
N8N valida y ejecuta la herramienta contra ArtLink (JSON Server http://localhost:3000)
    │
    ▼ HTTP Request (Gemini Paso 2)
Gemini interpreta el resultado real, genera explicación, acciones y confirmaciones
    │
    ▼ Respond to Webhook (JSON enriquecido)
React muestra texto, tarjetas de artistas, botones de acción y confirmación
```

> **Principio de Seguridad Estricta:**
> La clave `GEMINI_API_KEY` reside **únicamente en N8N**. React nunca se conecta directamente a Gemini ni contiene la API key en el código, `.env`, localStorage, `db.json` ni Git.

---

## 3. Herramientas Controladas Creadas en N8N

1. **`buscar_artistas`**:
   - Parámetros: `discipline`, `style`, `maxPrice`, `availability`, `query`.
   - Consulta: `/artistProfiles` en JSON Server.
   - Retorna: Artistas reales con nombre, tarifa base, disponibilidad, especialidad y enlace a su perfil.

2. **`consultar_perfil_artista`**:
   - Parámetros: `artistNameOrId`.
   - Consulta: `/artistProfiles` y `/commissions?artistId=...`.
   - Retorna: Biografía, portafolio, tarifas base y paquetes activos del artista.

3. **`consultar_estado_pedido`**:
   - Parámetros: `orderId`.
   - Consulta: `/requests?id=...`.
   - Retorna: Estado de la solicitud (pendiente, en progreso, finalizada), presupuesto bajo custodia Escrow Shield y detalles.

4. **`consultar_tarifas`**:
   - Parámetros: `category`, `maxPrice`.
   - Consulta: `/commissions`.
   - Retorna: Paquetes de comisiones reales en la plataforma.

5. **`solicitar_confirmacion`**:
   - Parámetros: `action`, `artistName`, `budget`.
   - Acción: Genera una tarjeta de confirmación en la UI para que el usuario apruebe formalmente antes de abrir el formulario o enviar el encargo.

---

## 4. Guía de Puesta en Marcha

### Paso 1: Configurar Variables de Entorno en N8N

Define las variables antes de iniciar o reiniciar N8N:

**En Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="TU_CLAVE_SECRETA_DE_GEMINI"
$env:GEMINI_MODEL="gemini-1.5-flash"
n8n start
```

**En Linux / macOS:**
```bash
export GEMINI_API_KEY="TU_CLAVE_SECRETA_DE_GEMINI"
export GEMINI_MODEL="gemini-1.5-flash"
n8n start
```

---

### Paso 2: Importar y Publicar el Workflow en N8N

Mediante CLI:
```powershell
n8n import:workflow --input="n8n/flujo-chatbot-gemini.json"
n8n publish:workflow --id="Kx9L2pQm8W7vR4tN"
```

O desde la interfaz web en `http://localhost:5678`:
1. Ve a **Workflows** -> **Import from File**.
2. Selecciona `n8n/flujo-chatbot-gemini.json`.
3. Activa el interruptor **Active** (arriba a la derecha).

---

## 5. Pruebas del Agente con Herramientas

Se incluyen archivos de prueba representativos en `n8n/ejemplos/`:

### Prueba 1: Búsqueda de Artistas con Filtros Reales
```powershell
$body = Get-Content n8n/ejemplos/agente-gemini-artistas.json -Raw
Invoke-RestMethod -Uri "http://localhost:5678/webhook/artlink/chatbot-gemini" -Method Post -Body $body -ContentType "application/json"
```
**Respuesta:** Retorna artistas reales (Pixel Foundry, $80 USD, cupos abiertos) junto con la acción de interfaz para ir a su perfil.

### Prueba 2: Consulta del Estado de un Pedido
```powershell
$body = Get-Content n8n/ejemplos/agente-gemini-pedido.json -Raw
Invoke-RestMethod -Uri "http://localhost:5678/webhook/artlink/chatbot-gemini" -Method Post -Body $body -ContentType "application/json"
```
**Respuesta:** Consulta `/requests?id=req-101` y describe el estado del pedido y el monto retenido en Escrow Shield.

---

## 6. Variables de Entorno en el Frontend

En tu archivo `.env`:
```env
VITE_N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook
VITE_USE_GEMINI_WORKFLOW=true
```

Si deseas probar el modo de respaldo local sin conexión externa:
```env
VITE_USE_GEMINI_WORKFLOW=false
```
El agente responderá inmediatamente:
`Respuesta local de respaldo; Gemini no está disponible.`
