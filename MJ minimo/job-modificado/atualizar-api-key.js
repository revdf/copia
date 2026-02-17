#!/usr/bin/env node

/**
 * Script para atualizar a API Key do Firebase em todos os arquivos de configuração
 * 
 * Uso:
 *   1. Obtenha a API key do Firebase Console
 *   2. Execute: node atualizar-api-key.js SUA_API_KEY_AQUI
 * 
 * Exemplo:
 *   node atualizar-api-key.js AIzaSyCCU3l-J-7JrlWXKVlQJAit9VypIi7hn38
 */

const fs = require('fs');
const path = require('path');

// Verificar se a API key foi fornecida
const apiKey = process.argv[2];

if (!apiKey) {
    console.error('❌ Erro: API Key não fornecida!');
    console.log('\n📝 Uso:');
    console.log('   node atualizar-api-key.js SUA_API_KEY_AQUI');
    console.log('\n📋 Exemplo:');
    console.log('   node atualizar-api-key.js AIzaSyCCU3l-J-7JrlWXKVlQJAit9VypIi7hn38');
    console.log('\n🔗 Obtenha a API key em:');
    console.log('   https://console.firebase.google.com/project/copia-do-job/settings/general');
    process.exit(1);
}

// Validar formato da API key
if (!apiKey.startsWith('AIzaSy') || apiKey.length < 35) {
    console.warn('⚠️  Aviso: A API key pode estar incorreta!');
    console.warn('   Formato esperado: AIzaSy... (aproximadamente 39 caracteres)');
    console.log('\n❓ Deseja continuar mesmo assim? (s/n)');
    // Em produção, você poderia usar readline para confirmar
}

// Lista de arquivos que precisam ser atualizados
const arquivos = [
    'frontend/src/firebase-config.js',
    'frontend/src/js/firebase-config.js',
    'frontend/js/firebase-config.js',
    'frontend/src/firebase-config-teste.js',
    'frontend/src/luxo.html',
    'frontend/src/register.html'
];

let atualizados = 0;
let erros = 0;

console.log('🔄 Iniciando atualização da API Key...\n');

arquivos.forEach(arquivo => {
    const caminhoCompleto = path.join(__dirname, arquivo);
    
    try {
        // Verificar se o arquivo existe
        if (!fs.existsSync(caminhoCompleto)) {
            console.log(`⚠️  Arquivo não encontrado: ${arquivo}`);
            return;
        }

        // Ler o arquivo
        let conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
        
        // Verificar se contém o placeholder
        if (!conteudo.includes('AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')) {
            console.log(`⏭️  Pulando ${arquivo} (não contém placeholder)`);
            return;
        }

        // Substituir o placeholder pela API key real
        const conteudoAtualizado = conteudo.replace(
            /AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/g,
            apiKey
        );

        // Salvar o arquivo atualizado
        fs.writeFileSync(caminhoCompleto, conteudoAtualizado, 'utf8');
        
        console.log(`✅ Atualizado: ${arquivo}`);
        atualizados++;
        
    } catch (error) {
        console.error(`❌ Erro ao atualizar ${arquivo}:`, error.message);
        erros++;
    }
});

console.log('\n' + '='.repeat(50));
console.log(`✅ Arquivos atualizados: ${atualizados}`);
if (erros > 0) {
    console.log(`❌ Erros: ${erros}`);
}
console.log('='.repeat(50));

if (atualizados > 0) {
    console.log('\n🎉 API Key atualizada com sucesso!');
    console.log('📝 Próximos passos:');
    console.log('   1. Recarregue as páginas no navegador');
    console.log('   2. Teste o cadastro novamente');
    console.log('   3. O erro de API key deve estar resolvido!');
} else {
    console.log('\n⚠️  Nenhum arquivo foi atualizado.');
    console.log('   Verifique se a API key foi fornecida corretamente.');
}





