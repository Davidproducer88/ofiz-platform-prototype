/**
 * Valida un RUT uruguayo
 * Formato esperado: 12345678-1234 (8 dígitos + guion + 4 dígitos verificadores)
 */
export const validateUruguayanRUT = (rut: string): boolean => {
  // Remover espacios y guiones
  const cleanRUT = rut.replace(/[\s-]/g, '');
  
  // Verificar formato: 12 dígitos totales
  if (!/^\d{12}$/.test(cleanRUT)) {
    return false;
  }
  
  // El RUT debe tener al menos 8 dígitos + 4 verificadores
  const mainDigits = cleanRUT.substring(0, 8);
  const checkDigits = cleanRUT.substring(8, 12);
  
  // Validar que son números válidos
  if (isNaN(Number(mainDigits)) || isNaN(Number(checkDigits))) {
    return false;
  }
  
  // Validación básica del dígito verificador
  const calculatedCheck = calculateRUTCheckDigit(mainDigits);
  
  return calculatedCheck === checkDigits;
};

/**
 * Calcula el dígito verificador de un RUT uruguayo
 * Algoritmo simplificado para validación
 */
const calculateRUTCheckDigit = (digits: string): string => {
  const weights = [2, 9, 8, 7, 6, 3, 4];
  let sum = 0;
  
  // Calcular suma ponderada
  for (let i = 0; i < digits.length; i++) {
    const digit = parseInt(digits[i], 10);
    const weight = weights[i % weights.length];
    sum += digit * weight;
  }
  
  // El check es el módulo 10000
  const check = sum % 10000;
  
  return check.toString().padStart(4, '0');
};

/**
 * Formatea un RUT para mostrar con el guion
 * Ejemplo: 123456781234 -> 12345678-1234
 */
export const formatRUT = (rut: string): string => {
  const cleanRUT = rut.replace(/[\s-]/g, '');
  
  if (cleanRUT.length !== 12) {
    return rut;
  }
  
  return `${cleanRUT.substring(0, 8)}-${cleanRUT.substring(8, 12)}`;
};

/**
 * Valida formato de RUT mientras el usuario escribe
 */
export const isValidRUTFormat = (rut: string): boolean => {
  // Permite formato con o sin guion
  return /^(\d{8}-?\d{0,4})$/.test(rut.replace(/\s/g, ''));
};
