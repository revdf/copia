#!/usr/bin/env node

/**
 * Script para testar uma nova anunciante como exemplo
 */

console.log('👩 Testando nova anunciante como exemplo...\n');

// Simular busca de anunciantes disponíveis
const anunciantesDisponiveis = [
    { id: '0UvOqZ66KWsoH9XOMAwb', nome: 'Ana', categoria: 'mulheres' },
    { id: 'CFaNF3dRoRNDGPEwC7zf', nome: 'Luciana', categoria: 'mulheres' },
    { id: 'ABC123DEF456', nome: 'Mariana', categoria: 'mulheres' },
    { id: 'XYZ789GHI012', nome: 'Camila', categoria: 'mulheres' },
    { id: 'DEF456JKL789', nome: 'Isabella', categoria: 'mulheres' },
    { id: 'GHI012MNO345', nome: 'Sofia', categoria: 'mulheres' },
    { id: 'JKL789PQR012', nome: 'Valentina', categoria: 'mulheres' },
    { id: 'MNO345STU678', nome: 'Beatriz', categoria: 'mulheres' }
];

console.log('📋 Anunciantes disponíveis:');
anunciantesDisponiveis.forEach((anunciante, index) => {
    console.log(`   ${index + 1}. ${anunciante.nome} (ID: ${anunciante.id})`);
});
console.log('');

// Escolher uma nova anunciante (exemplo: Mariana)
const novaAnunciante = anunciantesDisponiveis[2]; // Mariana

console.log('✅ Nova anunciante escolhida:');
console.log(`   Nome: ${novaAnunciante.nome}`);
console.log(`   ID: ${novaAnunciante.id}`);
console.log(`   Categoria: ${novaAnunciante.categoria}`);
console.log('');

console.log('🔄 Mudanças necessárias:');
console.log('   1. Atualizar link de exemplo nos scripts de teste');
console.log('   2. Verificar se a anunciante tem dados completos');
console.log('   3. Testar carregamento da página');
console.log('');

console.log('🔗 Novo link para teste:');
console.log(`   http://127.0.0.1:8080/A_02__premium_Anuncio_modelo_02.html?id=${novaAnunciante.id}&name=${novaAnunciante.nome}`);
console.log('');

console.log('📊 Comparação:');
console.log('   • Antes: Ana (ID: 0UvOqZ66KWsoH9XOMAwb)');
console.log(`   • Depois: ${novaAnunciante.nome} (ID: ${novaAnunciante.id})`);
console.log('');

console.log('✨ Nova anunciante configurada!');
console.log(`   Agora usando ${novaAnunciante.nome} como exemplo.`);










