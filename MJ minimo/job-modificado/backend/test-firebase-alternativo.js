// ===== TESTE FIREBASE ALTERNATIVO - MANSÃO DO JOB TESTE =====
// Script para testar o Firebase como MongoDB Atlas alternativo

import dotenv from 'dotenv';
import admin from 'firebase-admin';

// Configurar ambiente
dotenv.config({ path: './config-firebase-teste.env' });

console.log('🧪 INICIANDO TESTE DO FIREBASE ALTERNATIVO');
console.log('='.repeat(50));

async function testarFirebaseAlternativo() {
    try {
        console.log('🔥 Configurando Firebase Alternativo...');
        
        // Configuração do Firebase de teste
        const firebaseTesteConfig = {
            projectId: process.env.FIREBASE_TESTE_PROJECT_ID,
            privateKey: process.env.FIREBASE_TESTE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_TESTE_CLIENT_EMAIL,
        };

        console.log(`📊 Projeto: ${process.env.FIREBASE_TESTE_PROJECT_ID}`);
        console.log(`📧 Email: ${process.env.FIREBASE_TESTE_CLIENT_EMAIL}`);

        // Inicializar Firebase Admin
        const firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(firebaseTesteConfig),
            storageBucket: process.env.FIREBASE_TESTE_STORAGE_BUCKET,
        }, 'firebase-teste');

        const db = admin.firestore(firebaseApp);
        console.log('✅ Firebase inicializado com sucesso!');

        // Teste 1: Criar documento de teste
        console.log('\n📝 Teste 1: Criando documento de teste...');
        const testDoc = {
            nome: 'Teste Firebase Alternativo',
            tipo: 'acompanhante',
            cidade: 'São Paulo',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            testId: Date.now()
        };

        const docRef = await db.collection('test_anuncios').add(testDoc);
        console.log(`✅ Documento criado com ID: ${docRef.id}`);

        // Teste 2: Ler documento
        console.log('\n📖 Teste 2: Lendo documento...');
        const doc = await docRef.get();
        if (doc.exists) {
            console.log('✅ Documento lido com sucesso:');
            console.log('   Dados:', doc.data());
        } else {
            console.log('❌ Documento não encontrado');
        }

        // Teste 3: Listar coleções
        console.log('\n📋 Teste 3: Listando coleções...');
        const collections = await db.listCollections();
        console.log(`✅ Encontradas ${collections.length} coleções:`);
        collections.forEach(collection => {
            console.log(`   - ${collection.id}`);
        });

        // Teste 4: Criar anúncio de exemplo
        console.log('\n🎯 Teste 4: Criando anúncio de exemplo...');
        const anuncioExemplo = {
            nome: 'Isabella Teste',
            idade: 25,
            cidade: 'São Paulo',
            estado: 'SP',
            telefone: '(11) 99999-9999',
            whatsapp: '5511999999999',
            categoria: 'mulher',
            tipo: 'acompanhante',
            descricao: 'Anúncio de teste criado via Firebase alternativo',
            preco_1h: 300,
            horario: '24h',
            atende_em: 'Hotel, Casa',
            formas_pagamento: 'Dinheiro, PIX',
            servicos: ['Beijo na boca', 'Oral sem preservativo', 'Sexo anal'],
            fotos: {
                capa: 'https://example.com/foto1.jpg',
                stories: 'https://example.com/foto2.jpg',
                galeria: ['https://example.com/foto3.jpg', 'https://example.com/foto4.jpg']
            },
            status: 'ativo',
            verificacao: 'pendente',
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        const anuncioRef = await db.collection('anuncios').add(anuncioExemplo);
        console.log(`✅ Anúncio criado com ID: ${anuncioRef.id}`);

        // Teste 5: Buscar anúncios
        console.log('\n🔍 Teste 5: Buscando anúncios...');
        const anunciosSnapshot = await db.collection('anuncios').get();
        console.log(`✅ Encontrados ${anunciosSnapshot.size} anúncios:`);
        
        anunciosSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`   - ${data.nome} (${data.cidade}/${data.estado}) - ID: ${doc.id}`);
        });

        // Teste 6: Criar usuário de exemplo
        console.log('\n👤 Teste 6: Criando usuário de exemplo...');
        const usuarioExemplo = {
            nome: 'João Teste',
            email: 'joao.teste@example.com',
            telefone: '(11) 88888-8888',
            tipo: 'cliente',
            status: 'ativo',
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        const usuarioRef = await db.collection('usuarios').add(usuarioExemplo);
        console.log(`✅ Usuário criado com ID: ${usuarioRef.id}`);

        // Teste 7: Estatísticas gerais
        console.log('\n📊 Teste 7: Estatísticas gerais...');
        const usuariosSnapshot = await db.collection('usuarios').get();
        const testSnapshot = await db.collection('test_anuncios').get();
        
        console.log('📈 Estatísticas do Firebase Alternativo:');
        console.log(`   - Anúncios: ${anunciosSnapshot.size}`);
        console.log(`   - Usuários: ${usuariosSnapshot.size}`);
        console.log(`   - Testes: ${testSnapshot.size}`);
        console.log(`   - Total de documentos: ${anunciosSnapshot.size + usuariosSnapshot.size + testSnapshot.size}`);

        // Limpeza (opcional)
        console.log('\n🧹 Limpando documentos de teste...');
        await docRef.delete();
        console.log('✅ Documento de teste removido');

        console.log('\n🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
        console.log('='.repeat(50));
        console.log('✅ Firebase Alternativo funcionando perfeitamente!');
        console.log('📊 Pronto para simular MongoDB Atlas');
        console.log('🚀 Pode iniciar o servidor Firebase Only');

    } catch (error) {
        console.error('\n❌ ERRO NO TESTE:', error);
        console.log('\n🔧 Possíveis soluções:');
        console.log('   1. Verificar se as credenciais do Firebase estão corretas');
        console.log('   2. Verificar se o projeto Firebase existe');
        console.log('   3. Verificar se as permissões estão configuradas');
        console.log('   4. Verificar conexão com a internet');
    }
}

// Executar teste
testarFirebaseAlternativo();
