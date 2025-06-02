/**
 * Formata preços para exibição, mostrando "Grátis" para produtos com preço 0.00
 * @param {number|string} price - Preço a ser formatado
 * @param {boolean} showPerDay - Se deve mostrar "/dia" após o preço
 * @returns {string} Preço formatado ou "Grátis"
 */
export const formatPrice = (price, showPerDay = false) => {
  const numericPrice = parseFloat(price);
  
  if (isNaN(numericPrice) || numericPrice < 0) {
    return 'Preço inválido';
  }
  
  if (numericPrice === 0) {
    return 'Grátis';
  }
  
  const formattedPrice = `R$ ${numericPrice.toFixed(2).replace('.', ',')}`;
  return showPerDay ? `${formattedPrice}/dia` : formattedPrice;
};

/**
 * Formata valor total, mostrando "Grátis" para valores 0.00
 * @param {number|string} totalAmount - Valor total a ser formatado
 * @returns {string} Valor total formatado ou "Grátis"
 */
export const formatTotalAmount = (totalAmount) => {
  const numericAmount = parseFloat(totalAmount);
  
  if (isNaN(numericAmount) || numericAmount < 0) {
    return 'R$ 0,00';
  }
  
  if (numericAmount === 0) {
    return 'Grátis';
  }
  
  return `R$ ${numericAmount.toFixed(2).replace('.', ',')}`;
};

/**
 * Formata preço com centavos da base de dados (valor em centavos)
 * @param {number} amountInCents - Valor em centavos
 * @returns {string} Valor formatado ou "Grátis"
 */
export const formatPriceFromCents = (amountInCents) => {
  if (!amountInCents || amountInCents === 0) {
    return 'Grátis';
  }
  
  const amount = amountInCents / 100;
  return `R$ ${amount.toFixed(2).replace('.', ',')}`;
}; 
