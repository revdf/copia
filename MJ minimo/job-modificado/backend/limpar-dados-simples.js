#!/usr/bin/env node

/**
 * Script SIMPLES para limpar dados do MongoDB Atlas
 * Executa a limpeza imediatamente
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: './config-firebase-mongodb.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function limparDados() {
    let client;
    
    try {
        console.log('🔗 Conectando ao MongoDB Atlas...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        
        const db = client.db('mansao_do_job');
        console.log('✅ Conectado ao database mansao_do_job');
        
        // Lista de collections para limpar
        const collections = [
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
        
        console.log('\n🗑️  Iniciando limpeza dos dados...');
        
        for (const collectionName of collections) {
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
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Conexão fechada');
        }
    }
}

limparDados();
