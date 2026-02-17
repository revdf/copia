const admin = require('firebase-admin');
const fs = require('fs');
require('dotenv').config({ path: './config.env' });

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
  console.log('✅ Firebase Admin inicializado');
}

const db = admin.firestore();

// Função para verificar anúncios de sexo virtual
async function checkSexoVirtual() {
  try {
    console.log('🔍 Verificando anúncios de "sexo-virtual" no banco de dados...\n');

    // Buscar em 'advertisements'
    console.log('📂 Verificando coleção "advertisements"...');
    const adsSnapshot = await db.collection('advertisements')
      .where('type', '==', 'sexo-virtual')
      .get();
    
    const adsByCategory = await db.collection('advertisements')
      .where('category', '==', 'sexo-virtual')
      .get();
    
    const adsByCategoria = await db.collection('advertisements')
      .where('categoria', '==', 'sexo-virtual')
      .get();

    // Buscar em 'anuncios'
    console.log('📂 Verificando coleção "anuncios"...');
    const anunciosSnapshot = await db.collection('anuncios')
      .where('type', '==', 'sexo-virtual')
      .get();
    
    const anunciosByCategory = await db.collection('anuncios')
      .where('category', '==', 'sexo-virtual')
      .get();
    
    const anunciosByCategoria = await db.collection('anuncios')
      .where('categoria', '==', 'sexo-virtual')
      .get();

    // Combinar resultados únicos
    const allAds = new Map();
    
    // Processar advertisements
    adsSnapshot.docs.forEach(doc => {
      allAds.set(doc.id, { collection: 'advertisements', ...doc.data() });
    });
    
    adsByCategory.docs.forEach(doc => {
      if (!allAds.has(doc.id)) {
        allAds.set(doc.id, { collection: 'advertisements', ...doc.data() });
      }
    });
    
    adsByCategoria.docs.forEach(doc => {
      if (!allAds.has(doc.id)) {
        allAds.set(doc.id, { collection: 'advertisements', ...doc.data() });
      }
    });

    // Processar anuncios
    anunciosSnapshot.docs.forEach(doc => {
      allAds.set(doc.id, { collection: 'anuncios', ...doc.data() });
    });
    
    anunciosByCategory.docs.forEach(doc => {
      if (!allAds.has(doc.id)) {
        allAds.set(doc.id, { collection: 'anuncios', ...doc.data() });
      }
    });
    
    anunciosByCategoria.docs.forEach(doc => {
      if (!allAds.has(doc.id)) {
        allAds.set(doc.id, { collection: 'anuncios', ...doc.data() });
      }
    });

    const totalAds = allAds.size;
    console.log(`\n📊 RESULTADO DA BUSCA:`);
    console.log(`   Total de anúncios encontrados: ${totalAds}\n`);

    if (totalAds === 0) {
      console.log('❌ Nenhum anúncio de "sexo-virtual" encontrado no banco de dados.');
      console.log('\n💡 Isso significa que:');
      console.log('   - Não há anúncios salvos com type/category/categoria = "sexo-virtual"');
      console.log('   - Ou os anúncios foram criados com outro nome/valor');
      console.log('   - Ou o banco de dados ainda não foi populado com essa categoria');
    } else {
      console.log('✅ Anúncios de "sexo-virtual" encontrados:\n');
      
      // Agrupar por gênero
      const byGender = {
        mulher: [],
        trans: [],
        homem: [],
        'mulher-luxo': []
      };

      allAds.forEach((ad, id) => {
        const gender = ad.gender || 'desconhecido';
        if (byGender[gender]) {
          byGender[gender].push({ id, ...ad });
        } else {
          if (!byGender['outros']) byGender['outros'] = [];
          byGender['outros'].push({ id, ...ad });
        }
      });

      // Mostrar estatísticas por gênero
      Object.keys(byGender).forEach(gender => {
        if (byGender[gender].length > 0) {
          console.log(`   ${gender.toUpperCase()}: ${byGender[gender].length} anúncios`);
        }
      });

      console.log('\n📋 Detalhes dos anúncios:\n');
      let count = 1;
      allAds.forEach((ad, id) => {
        console.log(`${count}. ID: ${id}`);
        console.log(`   Nome: ${ad.nome || ad.name || 'N/A'}`);
        console.log(`   Gênero: ${ad.gender || 'N/A'}`);
        console.log(`   Tipo: ${ad.type || ad.category || ad.categoria || 'N/A'}`);
        console.log(`   Coleção: ${ad.collection || 'N/A'}`);
        console.log(`   Status: ${ad.status || ad.isActive !== false ? 'Ativo' : 'Inativo'}`);
        console.log('');
        count++;
      });
    }

    // Verificar também por busca parcial (caso tenha variações)
    console.log('\n🔍 Buscando variações possíveis...');
    const allCollections = ['advertisements', 'anuncios'];
    const variations = ['sexo virtual', 'sexo_virtual', 'virtual', 'webcam'];
    
    for (const collection of allCollections) {
      const snapshot = await db.collection(collection).get();
      let foundVariations = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const searchText = JSON.stringify(data).toLowerCase();
        
        variations.forEach(variation => {
          if (searchText.includes(variation.toLowerCase())) {
            foundVariations++;
          }
        });
      });
      
      if (foundVariations > 0) {
        console.log(`   ${collection}: ${foundVariations} documentos podem conter referências a "sexo virtual"`);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar:', error);
  } finally {
    process.exit(0);
  }
}

// Executar
checkSexoVirtual();















