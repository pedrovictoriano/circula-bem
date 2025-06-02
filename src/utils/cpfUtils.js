/**
 * Máscara um CPF para exibição segura
 * Formato original: XXX.XXX.XXX-XX
 * Formato mascarado: ***.{dígito6}{dígito7}{dígito8}-**
 * Exemplo: 123.456.789-10 → ***.456.789-**
 * 
 * @param {string} cpf - CPF no formato XXX.XXX.XXX-XX ou apenas números
 * @returns {string} CPF mascarado
 */
export const maskCPF = (cpf) => {
  if (!cpf || typeof cpf !== 'string') {
    return 'CPF não disponível';
  }

  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return 'CPF inválido';
  }

  // Extrai os dígitos 5, 6, 7 (posições 4, 5, 6 no array) para mostrar
  const visibleDigits = cleanCPF.substring(4, 7);
  
  // Retorna no formato ***.XXX.XXX-**
  return `***.${visibleDigits.charAt(0)}${visibleDigits.charAt(1)}${visibleDigits.charAt(2)}-**`;
};

/**
 * Formata um CPF completo (usado apenas em contextos seguros)
 * @param {string} cpf - CPF apenas com números
 * @returns {string} CPF formatado XXX.XXX.XXX-XX
 */
export const formatCPF = (cpf) => {
  if (!cpf || typeof cpf !== 'string') {
    return '';
  }

  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) {
    return cpf;
  }

  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}; 
