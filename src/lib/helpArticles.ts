export interface HelpArticle {
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  content: string;
  relatedArticles?: string[];
}

export const helpArticles: HelpArticle[] = [
  // Primeros Pasos
  {
    slug: "como-crear-una-cuenta",
    title: "Cómo crear una cuenta",
    category: "Primeros Pasos",
    categorySlug: "primeros-pasos",
    content: `
## Crear tu cuenta en Ofiz es muy fácil

Seguí estos simples pasos para comenzar a usar la plataforma:

### Paso 1: Accedé a la página de registro

Hacé clic en el botón **"Registrarse"** en la esquina superior derecha de la página principal.

### Paso 2: Elegí tu tipo de cuenta

- **Cliente**: Si necesitás contratar servicios profesionales
- **Profesional**: Si querés ofrecer tus servicios
- **Empresa**: Si representás una empresa que necesita contratar profesionales

### Paso 3: Completá tus datos

Ingresá tu información básica:
- Nombre completo
- Email (usaremos este para comunicaciones importantes)
- Teléfono de contacto
- Contraseña segura (mínimo 8 caracteres)

### Paso 4: Verificá tu email

Te enviaremos un código de verificación a tu email. Ingresalo para activar tu cuenta.

### Paso 5: ¡Listo!

Ya podés comenzar a usar Ofiz. Te recomendamos completar tu perfil para tener más visibilidad.

---

**Tip:** Podés registrarte también usando tu cuenta de Google para un proceso más rápido.
    `,
    relatedArticles: ["completar-tu-perfil", "publicar-tu-primer-encargo"]
  },
  {
    slug: "completar-tu-perfil",
    title: "Completar tu perfil",
    category: "Primeros Pasos",
    categorySlug: "primeros-pasos",
    content: `
## La importancia de un perfil completo

Un perfil completo aumenta tu credibilidad y ayuda a otros usuarios a conocerte mejor.

### Para Clientes

Tu perfil debe incluir:
- **Foto de perfil**: Genera confianza con los profesionales
- **Dirección**: Para que los profesionales sepan tu ubicación aproximada
- **Teléfono verificado**: Para comunicación directa

### Para Profesionales

Como profesional, tu perfil es tu carta de presentación:

#### Información básica
- Nombre profesional o nombre del negocio
- Descripción detallada de tus servicios
- Años de experiencia
- Zona de cobertura

#### Portafolio
- Subí fotos de trabajos anteriores
- Agregá descripciones de cada proyecto
- Mostrá el antes y después

#### Certificaciones
- Agregá cualquier certificación relevante
- Menciona cursos o capacitaciones

### Verificación de identidad

Para aumentar tu confianza en la plataforma:
1. Subí una foto de tu documento de identidad
2. Esperá la verificación (24-48 horas)
3. Obtené la insignia de "Verificado"

---

**Importante:** Los perfiles verificados reciben hasta 3 veces más contactos.
    `,
    relatedArticles: ["como-crear-una-cuenta", "postularte-a-un-trabajo"]
  },
  {
    slug: "publicar-tu-primer-encargo",
    title: "Publicar tu primer encargo",
    category: "Primeros Pasos",
    categorySlug: "primeros-pasos",
    content: `
## Cómo publicar un encargo en Ofiz

Publicar un encargo es el primer paso para encontrar al profesional ideal.

### Paso 1: Iniciá sesión

Accedé a tu cuenta de cliente en Ofiz.

### Paso 2: Hacé clic en "Publicar Encargo"

Encontrarás este botón en tu dashboard o en el menú principal.

### Paso 3: Describí tu necesidad

Sé lo más específico posible:
- **Título claro**: "Reparación de cañería en baño" es mejor que "Arreglo"
- **Descripción detallada**: Explicá qué necesitás, el estado actual, etc.
- **Fotos**: Subí imágenes del trabajo a realizar (opcional pero recomendado)

### Paso 4: Definí detalles importantes

- **Ubicación**: Dirección exacta o zona
- **Fecha preferida**: Cuándo te gustaría que se realice
- **Presupuesto estimado**: Ayuda a filtrar propuestas

### Paso 5: Publicá y esperá propuestas

Los profesionales interesados te enviarán sus presupuestos. Generalmente comenzarás a recibir propuestas en las primeras 24 horas.

### Consejos para mejores resultados

✅ Sé específico en la descripción
✅ Agregá fotos cuando sea posible
✅ Respondé rápido a las consultas
✅ Compará varias propuestas antes de decidir

---

**Tip:** Los encargos con fotos reciben 40% más propuestas.
    `,
    relatedArticles: ["como-crear-una-cuenta", "pagos-seguros-mercado-pago"]
  },
  {
    slug: "postularte-a-un-trabajo",
    title: "Postularte a un trabajo",
    category: "Primeros Pasos",
    categorySlug: "primeros-pasos",
    content: `
## Cómo postularte a trabajos en Ofiz

Como profesional, postularte a trabajos es clave para conseguir clientes.

### Encontrá trabajos disponibles

1. Accedé a tu **Dashboard de Profesional**
2. Andá a la pestaña **"Solicitudes de Trabajo"**
3. Filtrá por categoría, zona o presupuesto

### Cómo hacer una buena propuesta

#### 1. Leé bien el encargo
Entendé exactamente qué necesita el cliente antes de responder.

#### 2. Personalizá tu mensaje
Evitá respuestas genéricas. Mencioná:
- Tu experiencia en trabajos similares
- Cómo planeas abordar el trabajo
- Tiempo estimado de ejecución

#### 3. Sé competitivo con el precio
Investigá precios del mercado y sé transparente con tu cotización.

#### 4. Respondé rápido
Los primeros en responder tienen más chances de ser contratados.

### Ejemplo de buena propuesta

> "Hola, soy electricista con 10 años de experiencia. He realizado instalaciones similares en más de 50 hogares. Para tu solicitud, estimo un tiempo de 3-4 horas de trabajo. Mi presupuesto incluye materiales básicos. ¿Te gustaría que coordine una visita para evaluar el trabajo en persona?"

### Seguimiento

- Respondé consultas del cliente rápidamente
- Sé profesional en toda comunicación
- Si te contratan, confirmá fecha y hora

---

**Estadística:** Los profesionales que responden en menos de 2 horas tienen 60% más probabilidad de ser contratados.
    `,
    relatedArticles: ["completar-tu-perfil", "usar-el-chat-integrado"]
  },
  
  // Comunicación
  {
    slug: "usar-el-chat-integrado",
    title: "Usar el chat integrado",
    category: "Comunicación",
    categorySlug: "comunicacion",
    content: `
## El chat de Ofiz: Tu herramienta de comunicación segura

El chat integrado te permite comunicarte de forma segura con clientes y profesionales.

### Acceder al chat

1. Ingresá a tu dashboard
2. Hacé clic en la pestaña **"Mensajes"**
3. Seleccioná la conversación que querés ver

### Funcionalidades principales

#### Mensajes de texto
- Enviá mensajes instantáneos
- Historial completo de conversaciones
- Indicador de mensajes leídos

#### Envío de archivos
- Fotos de trabajos o presupuestos
- Documentos PDF
- Comprobantes de pago

#### Notificaciones
- Alertas en tiempo real
- Notificaciones push en tu celular
- Email para mensajes no leídos

### Beneficios del chat interno

✅ **Seguridad**: Toda comunicación queda registrada
✅ **Protección**: No compartís datos personales innecesarios
✅ **Historial**: Siempre podés consultar conversaciones anteriores
✅ **Evidencia**: En caso de disputas, los mensajes sirven como respaldo

### Reglas de uso

❌ No compartir datos de contacto externos
❌ No acordar pagos fuera de la plataforma
❌ No usar lenguaje inapropiado

---

**Importante:** La comunicación fuera de la plataforma no está protegida por nuestras garantías.
    `,
    relatedArticles: ["notificaciones-y-alertas", "compartir-archivos-y-fotos"]
  },
  {
    slug: "notificaciones-y-alertas",
    title: "Notificaciones y alertas",
    category: "Comunicación",
    categorySlug: "comunicacion",
    content: `
## Configurá tus notificaciones

Mantené el control de cómo y cuándo recibís alertas.

### Tipos de notificaciones

#### Notificaciones en la app
- Nuevos mensajes
- Propuestas recibidas
- Actualizaciones de trabajos
- Recordatorios de citas

#### Notificaciones push
Recibí alertas en tu celular incluso cuando no estás en la app.

#### Notificaciones por email
- Resumen diario de actividad
- Mensajes no leídos
- Propuestas importantes

### Configurar notificaciones

1. Andá a **Configuración** en tu perfil
2. Seleccioná **Notificaciones**
3. Elegí qué alertas querés recibir y por qué canal

### Recomendaciones

**Para clientes:**
- Activá notificaciones de nuevas propuestas
- Habilitá recordatorios de citas programadas

**Para profesionales:**
- Activá alertas de nuevos trabajos en tu área
- Habilitá notificaciones de mensajes nuevos

### Solución de problemas

Si no recibís notificaciones:
1. Verificá la configuración en la app
2. Revisá los permisos de tu navegador/celular
3. Comprobá que tu email esté verificado
4. Revisá la carpeta de spam

---

**Tip:** Los profesionales con notificaciones activas responden 5 veces más rápido.
    `,
    relatedArticles: ["usar-el-chat-integrado", "etiqueta-de-comunicacion"]
  },
  {
    slug: "compartir-archivos-y-fotos",
    title: "Compartir archivos y fotos",
    category: "Comunicación",
    categorySlug: "comunicacion",
    content: `
## Cómo compartir archivos en Ofiz

Compartir fotos y documentos es esencial para una buena comunicación.

### Tipos de archivos permitidos

#### Imágenes
- JPG, PNG, GIF, WebP
- Tamaño máximo: 10 MB por imagen
- Hasta 10 imágenes por mensaje

#### Documentos
- PDF, DOC, DOCX
- Tamaño máximo: 25 MB
- Ideal para presupuestos y contratos

### Cómo enviar archivos

1. Abrí la conversación
2. Hacé clic en el ícono de **adjuntar** 📎
3. Seleccioná el archivo desde tu dispositivo
4. Agregá un mensaje opcional
5. Enviá

### Mejores prácticas para fotos

**Para trabajos a realizar:**
- Tomá fotos con buena iluminación
- Incluí varios ángulos
- Mostrá el contexto del área

**Para mostrar trabajos terminados:**
- Fotos del antes y después
- Detalles del trabajo realizado
- Ambiente limpio y ordenado

### Privacidad y seguridad

- Los archivos solo son visibles para los participantes de la conversación
- Los archivos se almacenan de forma segura
- Podés eliminar archivos enviados

---

**Consejo:** Las conversaciones con fotos tienen 50% menos malentendidos.
    `,
    relatedArticles: ["usar-el-chat-integrado", "notificaciones-y-alertas"]
  },
  {
    slug: "etiqueta-de-comunicacion",
    title: "Etiqueta de comunicación",
    category: "Comunicación",
    categorySlug: "comunicacion",
    content: `
## Buenas prácticas de comunicación en Ofiz

Una comunicación profesional mejora tu experiencia y reputación.

### Para clientes

#### ✅ Buenas prácticas
- Describí claramente lo que necesitás
- Respondé las consultas del profesional
- Sé puntual en las citas acordadas
- Confirmá cuando el trabajo esté terminado

#### ❌ Evitá
- Cambiar los términos después de acordar
- Dejar profesionales esperando sin respuesta
- Solicitar trabajo fuera de la plataforma

### Para profesionales

#### ✅ Buenas prácticas
- Respondé rápido a las consultas
- Sé claro con los precios y tiempos
- Informá cualquier cambio o retraso
- Mantené un tono profesional siempre

#### ❌ Evitá
- Prometer lo que no podés cumplir
- Presionar para cerrar tratos
- Compartir contactos externos

### Resolución de conflictos

Si hay un desacuerdo:
1. Mantené la calma
2. Explicá tu punto de vista claramente
3. Buscá una solución mutuamente beneficiosa
4. Si no hay acuerdo, contactá a soporte

### Consecuencias de mal comportamiento

- Advertencias por comunicación inapropiada
- Suspensión temporal de la cuenta
- En casos graves, eliminación de la cuenta

---

**Recordá:** Tu reputación se construye mensaje a mensaje.
    `,
    relatedArticles: ["usar-el-chat-integrado", "notificaciones-y-alertas"]
  },
  
  // Pagos y Facturación
  {
    slug: "pagos-seguros-mercado-pago",
    title: "Pagos seguros con Mercado Pago",
    category: "Pagos y Facturación",
    categorySlug: "pagos-facturacion",
    content: `
## Sistema de pagos seguro con Mercado Pago

Ofiz utiliza Mercado Pago para garantizar transacciones seguras.

### Métodos de pago disponibles

- **Tarjeta de crédito**: Visa, Mastercard, American Express
- **Tarjeta de débito**: Todas las tarjetas bancarias
- **Transferencia bancaria**: Transferencia directa
- **Mercado Pago**: Saldo en tu cuenta MP

### Cómo funciona el proceso

1. **Acordás el precio** con el profesional
2. **Pagás a través de Ofiz** (el dinero queda en garantía)
3. **El profesional realiza el trabajo**
4. **Confirmás que estás satisfecho**
5. **El pago se libera** al profesional

### Beneficios del sistema

#### Para clientes
✅ Tu dinero está protegido hasta que confirmes el trabajo
✅ Podés reclamar si hay problemas
✅ Historial completo de pagos

#### Para profesionales
✅ Garantía de cobro por trabajo realizado
✅ Múltiples opciones de retiro
✅ Protección contra clientes que no pagan

### Tiempos de procesamiento

- **Pago inicial**: Instantáneo
- **Liberación al profesional**: Inmediata tras confirmación
- **Retiro a cuenta bancaria**: 24-48 horas hábiles

---

**Importante:** Nunca acordes pagos fuera de la plataforma. Perdés toda protección.
    `,
    relatedArticles: ["como-funciona-pago-protegido", "retiros-y-transferencias"]
  },
  {
    slug: "como-funciona-pago-protegido",
    title: "Cómo funciona el pago protegido",
    category: "Pagos y Facturación",
    categorySlug: "pagos-facturacion",
    content: `
## Sistema de Escrow (Pago Protegido)

Nuestro sistema de escrow protege tanto a clientes como a profesionales.

### ¿Qué es el escrow?

El escrow es un sistema donde un tercero (Ofiz) retiene el dinero hasta que ambas partes cumplan con lo acordado.

### Flujo del pago protegido

\`\`\`
Cliente paga → Ofiz retiene → Trabajo se realiza → Cliente confirma → Profesional cobra
\`\`\`

### Opciones de pago

#### Pago 100% adelantado
- El cliente paga el total
- El dinero queda retenido
- Se libera al confirmar el trabajo

#### Pago 50/50
- 50% al inicio (garantiza el compromiso)
- 50% al finalizar el trabajo
- Más seguridad para ambas partes

### Protecciones incluidas

#### Para el cliente
- Reembolso si el trabajo no se realiza
- Mediación en caso de disputas
- 7 días para reportar problemas

#### Para el profesional
- Garantía de pago por trabajo terminado
- Protección contra cancelaciones injustas
- Soporte en disputas

### Disputas y mediación

Si hay un problema:
1. Reportá dentro de 7 días
2. Aportá evidencia (fotos, mensajes)
3. Nuestro equipo mediará
4. Resolución en 48-72 horas

---

**Estadística:** El 99.5% de las transacciones se completan sin problemas.
    `,
    relatedArticles: ["pagos-seguros-mercado-pago", "retiros-y-transferencias"]
  },
  {
    slug: "retiros-y-transferencias",
    title: "Retiros y transferencias",
    category: "Pagos y Facturación",
    categorySlug: "pagos-facturacion",
    content: `
## Cómo retirar tu dinero

Como profesional, podés retirar tus ganancias de forma fácil y rápida.

### Balance disponible

En tu dashboard encontrarás:
- **Balance disponible**: Listo para retirar
- **Balance pendiente**: Trabajos confirmados, procesándose
- **Historial de retiros**: Todos tus movimientos

### Métodos de retiro

#### Cuenta bancaria
- Banco: Cualquier banco uruguayo
- Tiempo: 24-48 horas hábiles
- Sin costo adicional

#### Mercado Pago
- Instantáneo
- Podés usar el saldo o transferir
- Sin comisiones

### Cómo solicitar un retiro

1. Andá a **Dashboard** → **Finanzas**
2. Hacé clic en **"Retirar fondos"**
3. Ingresá el monto a retirar
4. Seleccioná el método de retiro
5. Confirmá la operación

### Mínimos y límites

- **Mínimo por retiro**: $500 UYU
- **Máximo diario**: Sin límite
- **Retiros por mes**: Ilimitados

### Comisiones

Ofiz cobra una comisión del 5% sobre cada trabajo:
- Se descuenta automáticamente
- Incluye todos los servicios de la plataforma
- Sin costos ocultos

---

**Tip:** Configurá tu cuenta bancaria una vez y retirá cuando quieras.
    `,
    relatedArticles: ["pagos-seguros-mercado-pago", "facturacion-y-comprobantes"]
  },
  {
    slug: "facturacion-y-comprobantes",
    title: "Facturación y comprobantes",
    category: "Pagos y Facturación",
    categorySlug: "pagos-facturacion",
    content: `
## Facturación y documentación fiscal

Mantené tu contabilidad al día con nuestro sistema de comprobantes.

### Comprobantes automáticos

Por cada transacción recibís:
- **Comprobante de pago**: Para clientes
- **Comprobante de cobro**: Para profesionales
- **Detalle de comisiones**: Desglose transparente

### Dónde encontrar tus comprobantes

1. Andá a **Dashboard** → **Finanzas**
2. Seleccioná **"Historial de transacciones"**
3. Hacé clic en cualquier transacción
4. Descargá el comprobante en PDF

### Información incluida

Cada comprobante detalla:
- Fecha y hora de la transacción
- Monto total del servicio
- Comisión de plataforma
- Monto neto recibido
- Datos del cliente/profesional
- Número de referencia único

### Para profesionales: Facturación

Si sos contribuyente:
- Podés emitir tu propia factura al cliente
- Usá los datos del comprobante como referencia
- Ofiz no emite facturas a nombre del profesional

### Reportes mensuales

Cada mes recibís:
- Resumen de ingresos
- Detalle de comisiones
- Comparativa con meses anteriores

### Soporte contable

¿Necesitás documentación especial?
Contactá a soporte con tu solicitud específica.

---

**Importante:** Guardá tus comprobantes para tu declaración fiscal.
    `,
    relatedArticles: ["retiros-y-transferencias", "pagos-seguros-mercado-pago"]
  },
  
  // Cuenta y Perfil
  {
    slug: "editar-informacion-personal",
    title: "Editar información personal",
    category: "Cuenta y Perfil",
    categorySlug: "cuenta-perfil",
    content: `
## Cómo editar tu información personal

Mantené tu perfil actualizado para una mejor experiencia.

### Acceder a la configuración

1. Iniciá sesión en tu cuenta
2. Hacé clic en tu foto de perfil
3. Seleccioná **"Mi Perfil"** o **"Configuración"**

### Información que podés editar

#### Datos básicos
- Nombre completo
- Foto de perfil
- Teléfono de contacto
- Dirección

#### Para profesionales
- Nombre del negocio
- Descripción de servicios
- Categorías de trabajo
- Zona de cobertura
- Años de experiencia
- Tarifas

### Cómo cambiar tu foto de perfil

1. Hacé clic en tu foto actual
2. Seleccioná **"Cambiar foto"**
3. Subí una nueva imagen
4. Ajustá el encuadre
5. Guardá los cambios

### Recomendaciones para fotos

✅ Foto clara y profesional
✅ Fondo neutro
✅ Buena iluminación
✅ Solo vos en la foto (o tu logo para negocios)

### Datos que no podés cambiar

- Email (requiere verificación de soporte)
- RUT/CI verificado

### Guardar cambios

Después de editar, hacé clic en **"Guardar cambios"**. Los cambios se reflejan inmediatamente.

---

**Tip:** Un perfil completo con buena foto aumenta la confianza de otros usuarios.
    `,
    relatedArticles: ["verificacion-de-identidad", "configuracion-de-privacidad"]
  },
  {
    slug: "verificacion-de-identidad",
    title: "Verificación de identidad",
    category: "Cuenta y Perfil",
    categorySlug: "cuenta-perfil",
    content: `
## Proceso de verificación de identidad

La verificación aumenta tu credibilidad y seguridad.

### ¿Por qué verificarse?

#### Beneficios
- Insignia de **"Verificado"** en tu perfil
- Mayor confianza de otros usuarios
- Acceso a funciones premium
- Prioridad en resultados de búsqueda
- Límites de transacción más altos

### Documentos aceptados

- Cédula de identidad uruguaya
- Pasaporte
- Documento de identidad extranjero

### Proceso de verificación

#### Paso 1: Subí tu documento
1. Andá a **Configuración** → **Verificación**
2. Hacé clic en **"Iniciar verificación"**
3. Tomá una foto clara de tu documento (frente y dorso)

#### Paso 2: Selfie de verificación
- Tomá una selfie sosteniendo tu documento
- Asegurate que se vea claramente tu cara y el documento

#### Paso 3: Esperá la revisión
- Nuestro equipo revisa tu solicitud
- Tiempo estimado: 24-48 horas hábiles
- Recibirás un email con el resultado

### Requisitos de las fotos

✅ Documento legible y sin reflejos
✅ Foto nítida y bien iluminada
✅ Información visible completamente
✅ Sin ediciones o alteraciones

### Estados de verificación

- **Pendiente**: En revisión
- **Verificado**: Aprobado ✓
- **Rechazado**: Requiere nueva solicitud

---

**Importante:** La verificación es gratuita y solo se hace una vez.
    `,
    relatedArticles: ["editar-informacion-personal", "cambiar-contrasena"]
  },
  {
    slug: "configuracion-de-privacidad",
    title: "Configuración de privacidad",
    category: "Cuenta y Perfil",
    categorySlug: "cuenta-perfil",
    content: `
## Controlá tu privacidad en Ofiz

Tu privacidad es importante. Configurá qué información compartís.

### Configuración de visibilidad

#### Información pública
- Nombre (o nombre del negocio)
- Foto de perfil
- Calificaciones y reseñas
- Categorías de servicio
- Zona de trabajo

#### Información privada
- Email (nunca se muestra)
- Teléfono (solo visible tras contratar)
- Dirección exacta (solo para trabajos confirmados)
- Datos de pago

### Cómo ajustar tu privacidad

1. Andá a **Configuración** → **Privacidad**
2. Revisá cada opción
3. Activá o desactivá según prefieras
4. Guardá los cambios

### Opciones disponibles

- **Mostrar en búsquedas**: Aparecer en resultados de búsqueda
- **Permitir contacto directo**: Recibir consultas de nuevos clientes
- **Mostrar estadísticas**: Compartir tu rendimiento
- **Historial de trabajos**: Mostrar trabajos completados

### Eliminación de datos

Podés solicitar:
- Eliminar tu cuenta
- Exportar tus datos
- Borrar historial de conversaciones

### Seguridad de datos

Cumplimos con todas las normativas de protección de datos:
- Encriptación de información sensible
- Servidores seguros
- Sin venta de datos a terceros

---

**Tip:** Revisá tu configuración de privacidad periódicamente.
    `,
    relatedArticles: ["editar-informacion-personal", "cambiar-contrasena"]
  },
  {
    slug: "cambiar-contrasena",
    title: "Cambiar contraseña",
    category: "Cuenta y Perfil",
    categorySlug: "cuenta-perfil",
    content: `
## Cómo cambiar tu contraseña

Mantené tu cuenta segura actualizando tu contraseña regularmente.

### Cambiar contraseña (desde tu cuenta)

1. Iniciá sesión en tu cuenta
2. Andá a **Configuración** → **Seguridad**
3. Hacé clic en **"Cambiar contraseña"**
4. Ingresá tu contraseña actual
5. Ingresá la nueva contraseña (dos veces)
6. Hacé clic en **"Guardar"**

### Requisitos de contraseña

Tu nueva contraseña debe tener:
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Se recomienda incluir caracteres especiales

### Olvidé mi contraseña

1. En la página de login, hacé clic en **"¿Olvidaste tu contraseña?"**
2. Ingresá tu email
3. Recibirás un link para restablecer
4. Seguí las instrucciones del email
5. Creá una nueva contraseña

### Consejos de seguridad

✅ No uses la misma contraseña en otros sitios
✅ No compartas tu contraseña con nadie
✅ Cambiala cada 3-6 meses
✅ Usá un gestor de contraseñas
✅ Activá la autenticación de dos factores si está disponible

### Cerrar sesiones activas

Si sospechás que alguien accedió a tu cuenta:
1. Cambiá tu contraseña inmediatamente
2. Andá a **Seguridad** → **Sesiones activas**
3. Cerrá todas las sesiones
4. Contactá a soporte si ves actividad sospechosa

---

**Importante:** Nunca compartas tu contraseña, ni siquiera con soporte de Ofiz.
    `,
    relatedArticles: ["verificacion-de-identidad", "configuracion-de-privacidad"]
  }
];

// Helper to find article by slug
export const getArticleBySlug = (slug: string): HelpArticle | undefined => {
  return helpArticles.find(article => article.slug === slug);
};

// Helper to get articles by category
export const getArticlesByCategory = (categorySlug: string): HelpArticle[] => {
  return helpArticles.filter(article => article.categorySlug === categorySlug);
};

// Helper to get related articles
export const getRelatedArticles = (article: HelpArticle): HelpArticle[] => {
  if (!article.relatedArticles) return [];
  return article.relatedArticles
    .map(slug => getArticleBySlug(slug))
    .filter((a): a is HelpArticle => a !== undefined);
};
