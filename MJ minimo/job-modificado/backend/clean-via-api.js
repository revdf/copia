#!/usr/bin/env node

/**
 * Script para limpar duplicatas e URLs do Firebase via API local
 * - Usa o servidor que já está rodando na porta 5000
 * - Remove URLs do Firebase Storage
 * - Mantém apenas referências do MongoDB/GridFS
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function cleanDuplicatesAndFirebaseUrlsViaAPI() {
  try {
    console.log('🧹 LIMPEZA VIA API LOCAL');
    console.log('========================\n');

    // 1. BUSCAR TODOS OS ANÚNCIOS
    console.log('1️⃣ Buscando anúncios...');
    const response = await axios.get(`${API_BASE}/advertisements?limit=1000`);
    const advertisements = response.data.data;
    
    console.log(`📊 Total de anúncios encontrados: ${advertisements.length}`);

    // 2. IDENTIFICAR DUPLICATAS
    console.log('\n2️⃣ Identificando duplicatas...');
    
    const firebaseDocIds = new Map();
    const firebaseIds = new Map();
    const duplicates = [];

    advertisements.forEach((ad, index) => {
      // Verificar duplicatas por firebaseDocId
      if (ad.firebaseDocId) {
        if (firebaseDocIds.has(ad.firebaseDocId)) {
          duplicates.push({
            type: 'firebaseDocId',
            id: ad.firebaseDocId,
            original: firebaseDocIds.get(ad.firebaseDocId),
            duplicate: index
          });
        } else {
          firebaseDocIds.set(ad.firebaseDocId, index);
        }
      }

      // Verificar duplicatas por firebaseId
      if (ad.firebaseId) {
        if (firebaseIds.has(ad.firebaseId)) {
          duplicates.push({
            type: 'firebaseId',
            id: ad.firebaseId,
            original: firebaseIds.get(ad.firebaseId),
            duplicate: index
          });
        } else {
          firebaseIds.set(ad.firebaseId, index);
        }
      }
    });

    console.log(`🔍 Encontradas ${duplicates.length} duplicatas`);

    // 3. IDENTIFICAR URLs DO FIREBASE
    console.log('\n3️⃣ Identificando URLs do Firebase...');
    
    function isFirebaseStorageUrl(url) {
      return url && (
        url.includes('storage.googleapis.com') ||
        url.includes('firebasestorage.app') ||
        url.includes('GoogleAccessId') ||
        url.includes('Signature=')
      );
    }

    const adsWithFirebaseUrls = advertisements.filter(ad => {
      return isFirebaseStorageUrl(ad.foto_capa) ||
             isFirebaseStorageUrl(ad.coverImage) ||
             isFirebaseStorageUrl(ad.galeria_1) ||
             isFirebaseStorageUrl(ad.galeria_2) ||
             isFirebaseStorageUrl(ad.galeria_3) ||
             isFirebaseStorageUrl(ad.galeria_4) ||
             isFirebaseStorageUrl(ad.galeria_5) ||
             isFirebaseStorageUrl(ad.galeria_6) ||
             isFirebaseStorageUrl(ad.galeria_7) ||
             isFirebaseStorageUrl(ad.galeria_8) ||
             (ad.galeria_fotos && ad.galeria_fotos.some(url => isFirebaseStorageUrl(url)));
    });

    console.log(`🔍 Encontrados ${adsWithFirebaseUrls.length} anúncios com URLs do Firebase`);

    // 4. MOSTRAR ESTATÍSTICAS
    console.log('\n4️⃣ ESTATÍSTICAS ATUAIS');
    console.log('----------------------');
    
    const adsWithPhotos = advertisements.filter(ad => 
      ad.foto_capa || ad.coverImage || ad.galeria_1 || ad.mediaFiles?.foto_capa
    );
    
    const adsWithoutPhotos = advertisements.filter(ad => 
      !ad.foto_capa && !ad.coverImage && !ad.galeria_1 && !ad.mediaFiles?.foto_capa
    );

    console.log(`📊 Total de anúncios: ${advertisements.length}`);
    console.log(`📸 Anúncios com fotos: ${adsWithPhotos.length}`);
    console.log(`❌ Anúncios sem fotos: ${adsWithoutPhotos.length}`);
    console.log(`🔄 Duplicatas encontradas: ${duplicates.length}`);
    console.log(`🔥 URLs do Firebase: ${adsWithFirebaseUrls.length}`);

    // 5. MOSTRAR EXEMPLOS DE PROBLEMAS
    console.log('\n5️⃣ EXEMPLOS DE PROBLEMAS');
    console.log('------------------------');

    if (duplicates.length > 0) {
      console.log('\n🔄 Duplicatas:');
      duplicates.slice(0, 3).forEach((dup, index) => {
        const original = advertisements[dup.original];
        const duplicate = advertisements[dup.duplicate];
        console.log(`   ${index + 1}. ${dup.type}: ${dup.id}`);
        console.log(`      Original: ${original.nome} (${original._id})`);
        console.log(`      Duplicata: ${duplicate.nome} (${duplicate._id})`);
      });
    }

    if (adsWithFirebaseUrls.length > 0) {
      console.log('\n🔥 URLs do Firebase:');
      adsWithFirebaseUrls.slice(0, 3).forEach((ad, index) => {
        console.log(`   ${index + 1}. ${ad.nome}`);
        if (isFirebaseStorageUrl(ad.foto_capa)) {
          console.log(`      foto_capa: ${ad.foto_capa.substring(0, 80)}...`);
        }
        if (ad.galeria_fotos && ad.galeria_fotos.some(url => isFirebaseStorageUrl(url))) {
          const firebaseUrls = ad.galeria_fotos.filter(url => isFirebaseStorageUrl(url));
          console.log(`      galeria_fotos: ${firebaseUrls.length} URLs do Firebase`);
        }
      });
    }

    // 6. RECOMENDAÇÕES
    console.log('\n6️⃣ RECOMENDAÇÕES');
    console.log('----------------');
    
    if (duplicates.length > 0) {
      console.log('🔄 Para remover duplicatas:');
      console.log('   1. Identificar qual versão manter (geralmente a mais recente)');
      console.log('   2. Remover as versões duplicadas do banco de dados');
      console.log('   3. Verificar se não há referências quebradas');
    }

    if (adsWithFirebaseUrls.length > 0) {
      console.log('\n🔥 Para limpar URLs do Firebase:');
      console.log('   1. Remover ou limpar campos com URLs do Firebase Storage');
      console.log('   2. Manter apenas referências do MongoDB/GridFS');
      console.log('   3. Implementar fallback para imagens padrão');
      console.log('   4. Verificar processo de sincronização Firebase → MongoDB');
    }

    console.log('\n📋 CAMPOS QUE DEVEM SER LIMPOS:');
    console.log('   - foto_capa (se contém URL do Firebase)');
    console.log('   - coverImage (se contém URL do Firebase)');
    console.log('   - galeria_1 até galeria_8 (se contém URL do Firebase)');
    console.log('   - galeria_fotos array (remover URLs do Firebase)');
    console.log('   - Manter apenas mediaFiles (GridFS)');

    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('   1. Executar limpeza no banco de dados MongoDB');
    console.log('   2. Verificar processo de sincronização');
    console.log('   3. Implementar validação para evitar URLs do Firebase');
    console.log('   4. Testar página premium após limpeza');

  } catch (error) {
    console.error('❌ Erro durante a análise:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Executar análise
cleanDuplicatesAndFirebaseUrlsViaAPI();

