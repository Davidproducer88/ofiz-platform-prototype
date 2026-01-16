# Sistema de Pagos - OFIZ

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
├─────────────────────────────────────────────────────────────────────┤
│  PaymentService (centralizado)                                       │
│  ├── PaymentDialog (reservas)                                       │
│  ├── RemainingPaymentDialog (pago 50% restante)                     │
│  ├── BookingCheckoutBrick (MercadoPago Bricks)                      │
│  ├── CheckoutBrick (marketplace)                                    │
│  ├── ContractPaymentCheckoutBrick (contratos B2B)                   │
│  └── SubscriptionCheckoutBricks (suscripciones)                     │
├─────────────────────────────────────────────────────────────────────┤
│                      EDGE FUNCTIONS (Deno)                           │
├─────────────────────────────────────────────────────────────────────┤
│  Pagos Transaccionales:                                             │
│  ├── create-booking-payment        → Pago de reservas               │
│  ├── create-marketplace-payment    → Pago de productos              │
│  ├── create-contract-payment       → Pago de contratos B2B          │
│  └── create-payment-preference     → Crear preferencias MP          │
│                                                                      │
│  Suscripciones:                                                      │
│  ├── create-master-subscription         → Crear suscripción maestro │
│  ├── create-master-subscription-payment → Pagar suscripción         │
│  ├── create-business-subscription       → Crear suscripción empresa │
│  ├── create-business-subscription-payment → Pagar suscripción       │
│  ├── manage-subscription                → Gestionar suscripción     │
│  └── manage-user-subscription           → Cancelar/Reembolsar       │
│                                                                      │
│  Utilidades:                                                         │
│  ├── mercadopago-webhook          → Recibir notificaciones MP       │
│  ├── verify-payment-status        → Verificar estado de pago        │
│  └── release-escrow               → Liberar fondos al profesional   │
├─────────────────────────────────────────────────────────────────────┤
│                        MERCADOPAGO API                               │
├─────────────────────────────────────────────────────────────────────┤
│  • Bricks SDK (frontend)                                            │
│  • Payments API (backend)                                           │
│  • Preapprovals API (suscripciones recurrentes)                     │
│  • Webhook notifications                                            │
└─────────────────────────────────────────────────────────────────────┘
```

## Flujos de Pago

### 1. Pago de Reserva (Booking)

```
Cliente → PaymentDialog → Selecciona método y tipo (100%/50%)
       → PaymentCalculatorCard muestra desglose
       → BookingCheckoutBrick (MercadoPago Bricks)
       → create-booking-payment (edge function)
       → MercadoPago API → Webhook → Base de datos
       → Notificaciones a cliente y maestro
```

**Opciones de Pago:**
- **100% adelantado**: 5% descuento, hasta 6 cuotas
- **50% adelantado**: Sin descuento, hasta 3 cuotas por pago

### 2. Pago Restante (50%)

```
Cliente completa servicio → RemainingPaymentDialog
       → BookingCheckoutBrick
       → create-booking-payment (is_remaining_payment: true)
       → Actualiza pago existente
```

### 3. Liberación de Escrow

```
Servicio completado → EscrowReleaseManager
       → Cliente confirma satisfacción
       → release-escrow (edge function)
       → Fondos liberados al profesional
       → Comisiones procesadas
```

### 4. Marketplace

```
Comprador → CheckoutBrick
         → create-marketplace-payment
         → Actualiza orden, stock, balance vendedor
         → Notificaciones
```

### 5. Contratos B2B

```
Empresa acepta propuesta → ContractPaymentCheckoutBrick
       → create-contract-payment
       → Actualiza contrato y aplicación
       → Notifica a empresa y maestro
```

### 6. Suscripciones

```
Usuario selecciona plan → SubscriptionCheckoutBrick
       → create-[master|business]-subscription-payment
       → Activa suscripción en base de datos
       → Notificación de activación
```

## Estructura de Comisiones

| Concepto | Porcentaje | Descripción |
|----------|------------|-------------|
| Comisión Ofiz | 5% | Se descuenta del profesional |
| MercadoPago (débito) | 2.5% | Acreditación inmediata |
| MercadoPago (crédito 1 cuota) | 5.3% | Acreditación inmediata |
| MercadoPago (crédito cuotas) | 7.79% | Acreditación inmediata |

### Ejemplo de Cálculo

Para un servicio de $10,000:
- Precio base: $10,000
- Descuento pago total (5%): -$500
- Total a pagar: $9,500
- Comisión Ofiz (5%): $500
- Comisión MP (2.5%): $250
- Neto profesional: $9,250

## Estados de Pago

| Estado | Descripción |
|--------|-------------|
| `pending` | Pago iniciado, esperando procesamiento |
| `approved` | Pago aprobado, en escrow |
| `released` | Fondos liberados al profesional |
| `rejected` | Pago rechazado |
| `refunded` | Pago reembolsado |

## Secretos Requeridos

```
MERCADO_PAGO_ACCESS_TOKEN    # Token de acceso (producción o sandbox)
RESEND_API_KEY               # Para emails de notificación
```

## Tablas de Base de Datos

### payments
```sql
- id (UUID)
- booking_id (UUID, nullable para contratos/marketplace)
- client_id (UUID)
- master_id (UUID)
- amount (numeric)
- commission_amount (numeric)
- master_amount (numeric)
- status (payment_status enum)
- mercadopago_payment_id (text)
- payment_method (text)
- escrow_released_at (timestamp)
- payment_percentage (integer)
- remaining_amount (numeric)
- is_partial_payment (boolean)
- incentive_discount (numeric)
- metadata (jsonb)
```

### commissions
```sql
- id (UUID)
- payment_id (UUID)
- master_id (UUID)
- amount (numeric)
- percentage (numeric)
- status (text)
- processed_at (timestamp)
```

### subscriptions (maestros)
```sql
- id (UUID)
- master_id (UUID)
- plan (text)
- status (text)
- current_period_start (timestamp)
- current_period_end (timestamp)
- cancelled_at (timestamp)
- mercadopago_payment_id (text)
```

### business_subscriptions (empresas)
```sql
- id (UUID)
- business_id (UUID)
- plan_type (text)
- price (numeric)
- status (text)
- monthly_contacts_limit (integer)
- contacts_used (integer)
- ad_impressions_limit (integer)
```

## Webhook MercadoPago

URL: `https://dexrrbbpeidcxoynkyrt.supabase.co/functions/v1/mercadopago-webhook`

Eventos manejados:
- `payment` - Pagos de reservas, marketplace, contratos
- `subscription_preapproval` - Suscripciones recurrentes
- `merchant_order` - Órdenes de marketplace

## Seguridad

1. **Autenticación**: Todas las edge functions validan JWT del usuario
2. **Autorización**: Se verifica que el usuario sea el propietario de la reserva/orden
3. **Idempotencia**: Se usa X-Idempotency-Key para evitar pagos duplicados
4. **Escrow**: Los fondos se retienen hasta confirmación del cliente
5. **Webhooks**: Se validan headers de MercadoPago

## Debugging

### Logs de Edge Functions
```
https://supabase.com/dashboard/project/dexrrbbpeidcxoynkyrt/functions/{function-name}/logs
```

### Verificar Estado de Pago
```typescript
const result = await supabase.functions.invoke('verify-payment-status', {
  body: { paymentId: 'payment-uuid' }
});
```

### Consultar Pagos
```sql
SELECT p.*, b.services
FROM payments p
LEFT JOIN bookings b ON p.booking_id = b.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;
```

## Errores Comunes

| Código | Mensaje | Solución |
|--------|---------|----------|
| `cc_rejected_insufficient_amount` | Fondos insuficientes | Usar otra tarjeta |
| `cc_rejected_bad_filled_card_number` | Número incorrecto | Verificar datos |
| `cc_rejected_high_risk` | Riesgo de fraude | Contactar banco |
| `PGRST116` | No se encontró registro | Verificar IDs |

## Mejoras Futuras

- [ ] Retiros automáticos programados
- [ ] Integración con más medios de pago
- [ ] Split payments automáticos
- [ ] Reportes financieros avanzados
- [ ] Dashboard de analytics de pagos
