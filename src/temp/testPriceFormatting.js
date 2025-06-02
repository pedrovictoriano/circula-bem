// Script de teste para a formatação de preços
import { formatPrice, formatTotalAmount, formatPriceFromCents } from '../utils/priceUtils';

console.log('=== Teste de Formatação de Preços ===\n');

// Teste formatPrice
console.log('formatPrice(0) =>', formatPrice(0));
console.log('formatPrice(0, true) =>', formatPrice(0, true));
console.log('formatPrice(15.99) =>', formatPrice(15.99));
console.log('formatPrice(15.99, true) =>', formatPrice(15.99, true));
console.log('formatPrice(100) =>', formatPrice(100));
console.log('formatPrice("25.50") =>', formatPrice("25.50"));

console.log('\n--- formatTotalAmount ---');
console.log('formatTotalAmount(0) =>', formatTotalAmount(0));
console.log('formatTotalAmount(15.99) =>', formatTotalAmount(15.99));
console.log('formatTotalAmount(300) =>', formatTotalAmount(300));

console.log('\n--- formatPriceFromCents ---');
console.log('formatPriceFromCents(0) =>', formatPriceFromCents(0));
console.log('formatPriceFromCents(1599) =>', formatPriceFromCents(1599)); // R$ 15,99
console.log('formatPriceFromCents(30000) =>', formatPriceFromCents(30000)); // R$ 300,00

console.log('\n=== Casos de uso prático ===');
const produtos = [
  { name: 'Livro gratuito', price: 0 },
  { name: 'Fone de ouvido', price: 25.99 },
  { name: 'Câmera', price: 150.50 },
];

produtos.forEach(produto => {
  console.log(`${produto.name}: ${formatPrice(produto.price, true)}`);
});

console.log('\n=== Aluguel de 3 dias ===');
produtos.forEach(produto => {
  const total = produto.price * 3;
  console.log(`${produto.name} (3 dias): ${formatTotalAmount(total)}`);
}); 
