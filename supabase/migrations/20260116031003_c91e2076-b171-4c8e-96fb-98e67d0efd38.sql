-- Limpiar cancelled_at para suscripciones activas
UPDATE subscriptions 
SET cancelled_at = NULL 
WHERE status = 'active' AND cancelled_at IS NOT NULL;