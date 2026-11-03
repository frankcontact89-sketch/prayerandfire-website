# ABBA Academy — producción de correos de autenticación

## Proveedor existente confirmado: Brevo (2026-11-03)
La auditoría del proyecto Supabase `ministry-websites` encontró la Edge Function `abba-admin-email` que utiliza el API de Brevo para comunicaciones administrativas de ABBA Academy. El proyecto separado `prayer-fire` también utiliza Brevo para listas de suscriptores. Por tanto, **no es necesario contratar Resend** si la cuenta Brevo existente dispone de envío transaccional SMTP, remitente verificado y cuota suficiente.

Importante: la clave **BREVO_API_KEY** usada por Edge Functions para la API REST **no sirve como contraseña SMTP**. Debe crearse una **SMTP key** específica en la misma cuenta de Brevo, desde Settings → SMTP & API → SMTP. No copiarla en GitHub ni mensajes.

Datos SMTP oficiales de Brevo (confirmar en cuenta):
- Host: `smtp-relay.brevo.com`
- Puerto: `587` (STARTTLS) o `465` (SSL/TLS)
- Usuario: el `SMTP login` exacto indicado por Brevo (a veces dirección @smtp-brevo.com)
- Contraseña: **SMTP key**, no API key ni contraseña normal
- Remitente: una dirección validada en Brevo, preferiblemente un subdominio de autenticación separado
- Supabase: Authentication → Emails → SMTP Settings del proyecto `ministry-websites`

No se pudo verificar mediante el conector si **custom SMTP** ya está habilitado en Supabase Auth, ni obtener los secretos SMTP. **No se ha activado** desde este trabajo. La función administrativa de Brevo no demuestra que el sistema de correos de Supabase Auth use el mismo proveedor.

Documentación: https://developers.brevo.com/docs/supabase-smtp-integration

Estado al 3 de noviembre de 2026: **plantillas preparadas, SMTP externo NO activado ni probado**.

## Contexto y alcance
El proyecto Supabase es `yecywtxbuhfukergbwfc` ("ministry-websites") y es compartido por otras aplicaciones de Prayer & Fire. Las configuraciones SMTP, plantillas de Auth, límites de envío y URL base son **globales para todo este proyecto**, no exclusivas de ABBA Academy. No sustituir plantillas globales sin revisar el efecto en las otras apps.

El SMTP integrado de Supabase es solo para pruebas: aproximadamente 2 mensajes/hora por proyecto, con restricciones sobre los destinatarios. No desactivar "Confirm email" como solución. Confirmación de correo y clases privadas se mantienen activas.

## Plan seguro de habilitación (acción en servicios externos)
1. Utilizar una cuenta propia en un proveedor SMTP (Resend, Postmark, Brevo u otro). Recomendación: Resend por su soporte documentado de SMTP.
2. Agregar y verificar el dominio/subdominio de envío administrado por Prayer & Fire (preferible `auth.prayerandfire.org` para separar autenticación de marketing). Crear **exactamente** los registros DNS que devuelva el proveedor, incluidos DKIM y SPF; evaluar DMARC. No inventar registros ni alterar MX principal del correo.
3. Crear credenciales SMTP restringidas al envío. **Nunca guardar claves en GitHub, páginas web, chat público ni JavaScript del navegador**.
4. En Supabase: **Authentication → Emails → SMTP Settings** (puede cambiar de nombre). Habilitar SMTP personalizado después de tener dominio verificado y credenciales.
   - Sender name: `Prayer & Fire | ABBA Academy` (recordar que será compartido por todo el proyecto)
   - Sender email: un buzón `no-reply@` del dominio/subdominio **verificado** por el proveedor, confirmado allí antes de usarlo
   - Si se elige Resend: Host `smtp.resend.com`, puerto `465`, usuario `resend`, contraseña: clave SMTP/API de Resend creada por el propietario
5. Guardar y realizar **un solo** registro nuevo controlado y **una sola** recuperación de contraseña usando cuentas y direcciones bajo control del equipo. Verificar recepción real, destino correcto y que no se publiquen las clases.
6. En **Authentication → Rate Limits**, revisar el límite de correos tras habilitar SMTP. Supabase indica inicialmente un límite de 30 mensajes/hora para SMTP personalizado; incrementarlo **solo en función de cuotas del proveedor y capacidad real**, con medidas antiabuso.
7. Mantener en **URL Configuration** los destinos `https://prayerandfire.org/academy-portal.html`, `https://prayerandfire.org/academy.html` y `https://prayerandfire.org/academy-reset.html`.

## Plantillas listas (NO instaladas aún en Supabase)
- `ops/abba-auth-confirmation-email.html`: confirmación EN/PT/ES
- `ops/abba-auth-password-recovery-email.html`: recuperación EN/PT/ES

Los botones utilizan la variable oficial `{{ .ConfirmationURL }}` para preservar el token y destino que genera Supabase. No reemplazarla por un enlace estático.

**Atención:** Las plantillas son globales para el Auth de este proyecto. Antes de instalarlas, decidir si la marca remitente será Prayer & Fire general o si se necesita un proyecto de Auth separado para ABBA. Los archivos presentes en GitHub no activan los correos de manera automática.

## Checklist para el equipo
- [ ] Dominio de envío verificado en proveedor (DNS configurado por administrador autorizado)
- [ ] Servicio SMTP personalizado activado en Supabase sin exponer credenciales
- [ ] Límites revisados según plan y volumen
- [ ] Confirmación de cuenta recibida por un correo externo autorizado
- [ ] Recuperación de contraseña recibida y finalizada
- [ ] Enlace de confirmación lleva a portal de preinscripción y no abre las clases
- [ ] Correo genuino identificado con From y DKIM/SPF correctos
- [ ] Otras aplicaciones que comparten Supabase siguen enviando y verificando emails
- [ ] Plantillas instaladas solamente cuando se acuerde la política de marca compartida

Referencias oficiales:
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/guides/auth/rate-limits
- https://resend.com/changelog/smtp-service
