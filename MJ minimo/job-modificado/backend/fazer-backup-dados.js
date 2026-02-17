#!/usr/bin/env node

/**
 * Script para fazer backup dos dados antes de limpar
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './config-firebase-mongodb.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function fazerBackup() {
    let client;
    
    try {
        console.log('🔗 Conectando ao MongoDB Atlas...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        
        const db = client.db('mansao_do_job');
        console.log('✅ Conectado ao database mansao_do_job');
        
        // Criar pasta de backup
        const backupDir = path.join(__dirname, 'backup-dados');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
        
        console.log(`📁 Criando backup em: ${backupFile}`);
        
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
        
        const backupData = {};
        
        for (const collectionName of collections) {
            try {
                const collection = db.collection(collectionName);
                const documents = await collection.find({}).toArray();
                backupData[collectionName] = documents;
                console.log(`   📄 ${collectionName}: ${documents.length} documentos`);
            } catch (error) {
                console.log(`   ❌ Erro ao fazer backup de ${collectionName}: ${error.message}`);
            }
        }
        
        // Salvar backup
        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
        
        console.log(`\n🎉 Backup criado com sucesso!`);
        console.log(`📁 Arquivo: ${backupFile}`);
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Conexão fechada');
        }
    }
}

fazerBackup();
