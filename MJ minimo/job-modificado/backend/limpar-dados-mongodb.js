#!/usr/bin/env node

/**
 * Script para limpar dados do MongoDB Atlas
 * Mantém apenas a estrutura (collections vazias)
 * 
 * Uso: node limpar-dados-mongodb.js
 */

require('dotenv').config({ path: './config-firebase-mongodb.env' });
const { MongoClient } = require('mongodb');

// Configuração de conexão
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'mansao_do_job';

// Collections que serão limpas
const COLLECTIONS_TO_CLEAR = [
    'advertisements',
    'advertisers', 
    'clients',
    'categories',
    'favorites',
    'views',
    'contacts',
    'ratings',
    'search_logs',
    'site_stats',
    'test'
];

async function limparDadosMongoDB() {
    let client;
    
    try {
        console.log('🔗 Conectando ao MongoDB Atlas...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        
        const db = client.db(DATABASE_NAME);
        console.log(`✅ Conectado ao database: ${DATABASE_NAME}`);
        
        // Verificar collections existentes
        const existingCollections = await db.listCollections().toArray();
        console.log(`\n📋 Collections encontradas: ${existingCollections.length}`);
        
        existingCollections.forEach(col => {
            console.log(`   - ${col.name}`);
        });
        
        // Confirmar ação
        console.log('\n⚠️  ATENÇÃO: Esta ação irá DELETAR TODOS os dados das collections!');
        console.log('📝 Collections que serão limpas:');
        COLLECTIONS_TO_CLEAR.forEach(col => {
            console.log(`   - ${col}`);
        });
        
        // Simular confirmação (descomente para executar)
        console.log('\n🔒 Script em modo de simulação. Para executar realmente:');
        console.log('1. Descomente as linhas de execução');
        console.log('2. Execute novamente o script');
        
        // DESCOMENTE AS LINHAS ABAIXO PARA EXECUTAR REALMENTE
        /*
        console.log('\n🗑️  Iniciando limpeza dos dados...');
        
        for (const collectionName of COLLECTIONS_TO_CLEAR) {
            try {
                const collection = db.collection(collectionName);
                const count = await collection.countDocuments();
                
                if (count > 0) {
                    console.log(`   🗑️  Limpando ${collectionName} (${count} documentos)...`);
                    await collection.deleteMany({});
                    console.log(`   ✅ ${collectionName} limpa com sucesso!`);
                } else {
                    console.log(`   ℹ️  ${collectionName} já está vazia`);
                }
            } catch (error) {
                console.log(`   ❌ Erro ao limpar ${collectionName}: ${error.message}`);
            }
        }
        
        console.log('\n🎉 Limpeza concluída com sucesso!');
        console.log('📊 Todas as collections foram limpas, mantendo apenas a estrutura.');
        */
        
    } catch (error) {
        console.error('❌ Erro ao conectar MongoDB:', error.message);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Conexão fechada');
        }
    }
}

// Executar script
limparDadosMongoDB();
