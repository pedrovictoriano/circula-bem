/**
 * Utilitários para formatação e validação de telefones brasileiros
 */

/**
 * Remove todos os caracteres não numéricos do telefone
 * @param {string} phone - Telefone com ou sem formatação
 * @returns {string} Telefone apenas com números
 */
export const cleanPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  return phone.replace(/\D/g, '');
};

/**
 * Formata um número de telefone brasileiro
 * @param {string} phone - Telefone apenas com números
 * @returns {string} Telefone formatado
 */
export const formatPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  const cleanNumber = cleanPhone(phone);
  
  if (cleanNumber.length === 0) {
    return '';
  }

  // Celular com 9 dígitos (11 total com DDD)
  if (cleanNumber.length === 11) {
    return cleanNumber.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  // Telefone fixo (10 total com DDD)
  if (cleanNumber.length === 10) {
    return cleanNumber.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  // Se não tem o tamanho esperado, retorna parcialmente formatado
  if (cleanNumber.length > 2) {
    if (cleanNumber.length <= 6) {
      return cleanNumber.replace(/(\d{2})(\d+)/, '($1) $2');
    } else if (cleanNumber.length <= 10) {
      return cleanNumber.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    } else {
      return cleanNumber.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
    }
  }
  
  return cleanNumber;
};

/**
 * Valida se um telefone brasileiro é válido
 * @param {string} phone - Telefone apenas com números
 * @returns {boolean} true se válido, false caso contrário
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const cleanNumber = cleanPhone(phone);
  
  // Deve ter 10 ou 11 dígitos
  if (cleanNumber.length !== 10 && cleanNumber.length !== 11) {
    return false;
  }
  
  // Não pode ser todos os números iguais
  if (/^(\d)\1+$/.test(cleanNumber)) {
    return false;
  }
  
  // DDD deve estar entre 11 e 99
  const ddd = parseInt(cleanNumber.substring(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }
  
  // Se tem 11 dígitos, o terceiro deve ser 9 (celular)
  if (cleanNumber.length === 11 && cleanNumber[2] !== '9') {
    return false;
  }
  
  return true;
};

/**
 * Função de validação específica para uso com Yup
 * @param {string} phone - Telefone com ou sem formatação
 * @returns {boolean} true se válido, false caso contrário
 */
export const validatePhoneForYup = (phone) => {
  if (!phone) return false;
  return validatePhone(phone);
};

/**
 * Máscara um telefone para exibição (mostra apenas os últimos 4 dígitos)
 * @param {string} phone - Telefone apenas com números
 * @returns {string} Telefone mascarado (XX) XXXXX-1234
 */
export const maskPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  const cleanNumber = cleanPhone(phone);
  
  if (cleanNumber.length === 11) {
    const ddd = cleanNumber.substring(0, 2);
    const lastFour = cleanNumber.substring(7, 11);
    return `(${ddd}) XXXXX-${lastFour}`;
  }
  
  if (cleanNumber.length === 10) {
    const ddd = cleanNumber.substring(0, 2);
    const lastFour = cleanNumber.substring(6, 10);
    return `(${ddd}) XXXX-${lastFour}`;
  }
  
  return phone;
}; 
