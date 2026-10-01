# Integración N8N con Notificaciones Gmail - ArtLink

Este directorio contiene los flujos de automatización de N8N con integración de **notificaciones por correo electrónico (Gmail)** para el proyecto ArtLink.

---

## 1. Arquitectura de Integración con Gmail

```text
[ ArtLink Frontend ]
         |
         v  HTTP POST
  [ Webhook N8N (http://localhost:5678) ]
         |
    +----+----------------------------------+
    |                                       |
    v                                       v
[ Flujo 1: Registro de Usuario ]    [ Flujo 2: Solicitud de Comisión ]
   1. Validar nombre/correo/clave      1. Validar descripción (>= 20 chars)
   2. Consultar /users en DB           2. Consultar /artistProfiles/:id
   3. ¿Correo Duplicado? -> 409        3. ¿Presupuesto < Tarifa Base? -> 400
   4. Insertar en /users de DB         4. Insertar en /requests (Escrow)
   5. Enviar Bienvenida por Gmail      5. Enviar Alerta al Artista por Gmail
   6. Responder 201 Created al Web     6. Responder 201 Created al Web
```

---

## 2. Flujos Actualizados con Notificaciones Gmail

### Flujo 1: `flujo-registro-usuario.json`
- **Ruta Webhook:** `POST /webhook-test/artlink-registro-usuario` (Modo Prueba) o `POST /webhook/artlink-registro-usuario` (Modo Producción).
- **Acción Gmail:** Al registrar exitosamente un nuevo usuario, envía un correo HTML de bienvenida con diseño de ArtLink, informando las garantías de custodia Escrow y un botón de acceso directo a la plataforma.

### Flujo 2: `flujo-solicitud-comision.json`
- **Ruta Webhook:** `POST /webhook-test/artlink-solicitud-comision` o `POST /webhook/artlink-solicitud-comision`.
- **Acción Gmail:** Al validarse que el presupuesto cumple la tarifa base del artista y guardarse en base de datos, envía una alerta al correo del artista con la tabla detallada del encargo (presupuesto retenido en custodia, fecha deseada, descripción y botón para revisar en su panel).

> **Nota de Resiliencia:** Los nodos de envío de correo cuentan con `continueOnFail: true`. Esto garantiza que los flujos siempre respondan con éxito (`201 Created`) a la aplicación web, incluso mientras se terminan de configurar las credenciales de Gmail en N8N.

---

## 3. Configuración de Credenciales de Gmail en N8N (Paso a Paso)

La forma más rápida, recomendada y libre de errores para conectar Gmail en N8N local es mediante **SMTP con Contraseña de Aplicación de Google** (no requiere configurar Google Cloud Console):

### Paso A: Generar Contraseña de Aplicación en Google
1. Ve a tu cuenta de Google: [https://myaccount.google.com/security](https://myaccount.google.com/security).
2. Asegúrate de tener activada la **Verificación en dos pasos**.
3. En la barra de búsqueda de tu cuenta de Google escribe: **Contraseñas de aplicaciones**.
4. En nombre de la aplicación escribe: `ArtLink N8N` y haz clic en **Crear**.
5. Google te mostrará una clave de 16 letras (por ejemplo: `abcd efgh ijkl mnop`). Cópiala.

### Paso B: Configurar la Credencial en N8N
1. En N8N (`http://localhost:5678`), ve a la barra lateral izquierda y haz clic en **Credentials**.
2. Haz clic en **Add Credential** y busca **SMTP**.
3. Llena los siguientes campos:
   - **User:** Tu dirección de correo de Gmail (ejemplo: `tu-correo@gmail.com`).
   - **Password:** La contraseña de 16 letras generada en el Paso A (sin espacios).
   - **Host:** `smtp.gmail.com`
   - **Port:** `465`
   - **SSL/TLS:** Activado (`ON`).
4. Haz clic en **Save**.

### Paso C: Asignar la Credencial a los Nodos del Flujo
1. Abre el workflow en N8N.
2. Haz doble clic en el nodo **Enviar Bienvenida por Gmail** (o **Enviar Alerta por Gmail**).
3. En el desplegable **Credential for SMTP**, selecciona la credencial guardada.
4. Guarda el workflow (**Save**).

---

## 4. Reimportar los Workflows Actualizados en N8N

1. Abre N8N en `http://localhost:5678`.
2. En la sección **Workflows**, selecciona **Import from File**.
3. Selecciona:
   - `n8n/flujo-registro-usuario.json`
   - `n8n/flujo-solicitud-comision.json`
4. Activa el interruptor **Active** (esquina superior derecha) para habilitar la recepción permanente de webhooks.

---

## 5. Pruebas con la Aplicación Web

Con los servidores activos:
- Frontend: `http://localhost:5173`
- JSON Server: `http://localhost:3000`
- N8N: `http://localhost:5678`

1. Ingresa a `http://localhost:5173/registro`.
2. Registra un nuevo usuario con un correo real de Gmail al que tengas acceso.
3. El frontend enviará los datos al webhook de N8N, N8N validará que no esté duplicado, lo insertará en `db.json`, enviará el correo HTML de bienvenida y responderá a la aplicación.
