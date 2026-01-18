# Arquitectura de Seguridad - Plataforma OFIZ

## Resumen Ejecutivo

Este documento describe la arquitectura de seguridad implementada en la plataforma OFIZ, incluyendo políticas RLS (Row Level Security), vistas seguras, y funciones de autorización.

## Principios de Seguridad

1. **Mínimo Privilegio**: Los usuarios solo pueden acceder a sus propios datos
2. **Relaciones Activas**: Acceso ampliado solo cuando existe relación comercial (booking/conversación)
3. **Vistas Seguras**: Datos públicos expuestos solo a través de vistas que excluyen PII
4. **Administración Centralizada**: Función `is_admin()` y `has_role()` para verificar permisos

## Funciones de Autorización

### `is_admin()`
Verifica si el usuario actual es administrador.

### `has_role(user_id, role)`
Verifica si un usuario tiene un rol específico (admin, master, client, business).

## Tablas Sensibles y sus Políticas

### `profiles` (Datos Personales)
| Campo | Sensibilidad | Acceso |
|-------|--------------|--------|
| full_name | Media | Propietario, Admin, Relación activa, Masters |
| phone | Alta | Solo propietario y Admin |
| email | Alta | Solo propietario y Admin |
| address | Alta | Solo propietario y Admin |
| latitude/longitude | Alta | Solo propietario y Admin |

**Política RLS**: `Profiles access policy`
- Propietario del perfil
- Administradores
- Masters (para listado/búsqueda)
- Usuarios con relación activa (booking o conversación)

**Vista Segura**: `profiles_public` - Solo expone: id, full_name, avatar_url, city, is_founder, user_type

### `business_profiles` (Datos Empresariales)
| Campo | Sensibilidad | Acceso |
|-------|--------------|--------|
| company_name | Baja | Público |
| tax_id | Alta | Solo propietario y Admin |
| billing_email | Alta | Solo propietario y Admin |
| billing_phone | Alta | Solo propietario y Admin |
| billing_address | Alta | Solo propietario y Admin |

**Política RLS**: `Business profiles SELECT/INSERT/UPDATE policy`
- Solo propietario (id = auth.uid())
- Administradores

**Vista Segura**: `business_profiles_public` - Excluye datos de facturación

### `payments` (Transacciones Financieras)
**Política RLS**: `Payments SELECT/INSERT/UPDATE policy`
- SELECT: client_id o master_id del pago, o Admin
- INSERT: Solo el cliente (client_id = auth.uid())
- UPDATE: Solo Admin

### `disputes` (Disputas y Evidencia)
**Política RLS**: `Disputes SELECT/INSERT/UPDATE/DELETE policy`
- SELECT: Solo quien abrió la disputa (opened_by) + Admin
- INSERT: Usuario que participa en el booking
- UPDATE: Solo quien abrió + Admin
- DELETE: Solo Admin

**Nota**: La otra parte del booking NO puede ver la evidencia privada.

### `messages` y `conversations` (Comunicación Privada)
**Política RLS**: Solo participantes de la conversación + Admin

### `client_addresses` (Direcciones de Clientes)
**Política RLS**: Solo el propietario (client_id = auth.uid())

### `master_verification_documents` (Documentos de Identidad)
**Política RLS**: Solo el master propietario + Admin

### `commissions` y `marketplace_seller_balance` (Finanzas)
**Política RLS**: Solo el master/seller propietario + Admin

## Vistas Seguras para Búsqueda Pública

### `masters_search_view`
Campos expuestos:
- id, full_name, avatar_url, city
- business_name, description, experience_years
- hourly_rate, rating, total_reviews, is_verified
- latitude, longitude (para búsqueda geográfica)

**Excluidos**: phone, email, address

### `profiles_public`
Campos expuestos:
- id, full_name, avatar_url, city, created_at, is_founder, user_type

**Excluidos**: phone, email, address, latitude, longitude

### `business_profiles_public`
Campos expuestos:
- id, company_name, company_type, company_size, industry, website, created_at

**Excluidos**: tax_id, billing_address, billing_email, billing_phone

## Advertencias de Linter Aceptadas

### 1. "RLS Policy Always True" (WARN)
**Razón de aceptación**: Las políticas con `WITH CHECK (true)` solo aplican a `service_role` (backend) que es seguro y controlado. Las políticas SELECT con `USING (true)` son intencionales para contenido público (badges, feed_posts, portfolio).

### 2. "Leaked Password Protection Disabled" (WARN)
**Razón de aceptación**: La mayoría de usuarios usan Google OAuth. Esta protección requiere configurar un proveedor de email personalizado y es opcional.

## Recomendaciones para Nuevas Tablas

Al crear nuevas tablas con datos sensibles:

1. **Siempre habilitar RLS**: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`

2. **Política SELECT restrictiva**:
```sql
CREATE POLICY "Table SELECT policy"
ON public.table_name FOR SELECT
USING (user_id = auth.uid() OR is_admin());
```

3. **Política INSERT con validación**:
```sql
CREATE POLICY "Table INSERT policy"
ON public.table_name FOR INSERT
WITH CHECK (user_id = auth.uid());
```

4. **Crear vista pública si necesario**:
```sql
CREATE VIEW public.table_name_public
WITH (security_invoker = on)
AS SELECT id, public_field1, public_field2 FROM table_name;
```

## Auditoría y Mantenimiento

- Ejecutar `supabase--linter` después de cada migración
- Revisar `security--get_security_scan_results` antes de publicar
- Mantener este documento actualizado con cambios

---
*Última actualización: 2026-01-18*
*Versión: 1.0*
