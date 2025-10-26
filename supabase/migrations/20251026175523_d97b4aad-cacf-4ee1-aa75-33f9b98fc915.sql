-- Agregar nuevo plan 'basic_plus' al enum subscription_plan
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'basic_plus';