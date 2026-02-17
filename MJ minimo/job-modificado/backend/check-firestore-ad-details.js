require('dotenv').config({ path: './config.env' });
const admin = require('firebase-admin');

// Inicializar Firebase Admin com credenciais
if (!admin.apps.length) {
  try {
    const serviceAccount = require('./firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'mansao-do-job.firebasestorage.app',
    });
    console.log('✅ Firebase Admin inicializado com credenciais');
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    process.exit(1);
  }
}

const firestore = admin.firestore();

async function checkFirestoreAdDetails() {
  console.log('🔍 VERIFICANDO DETALHES DO ANÚNCIO NO FIRESTORE');
  console.log('=' .repeat(60));
  
  try {
    // Buscar o anúncio específico
    const adId = 'QlsagBTtfRfvwn57STgP';
    const adDoc = await firestore.collection('advertisements').doc(adId).get();
    
    if (!adDoc.exists) {
      console.log('❌ Anúncio não encontrado!');
      return;
    }
    
    const adData = adDoc.data();
    console.log(`📋 DETALHES DO ANÚNCIO: ${adId}`);
    console.log(`   Nome: ${adData.nome || 'Sem nome'}`);
    console.log(`   Título: ${adData.title || 'Sem título'}`);
    console.log(`   Status: ${adData.status || 'Sem status'}`);
    console.log(`   Categoria: ${adData.categoria || 'Sem categoria'}`);
    console.log(`   Descrição: ${adData.descricao || 'Sem descrição'}`);
    
    console.log('\n📸 CAMPOS DE FOTOS NO FIRESTORE:');
    
    // Verificar todos os campos possíveis de fotos
    const photoFields = [
      'foto_capa', 'foto_stories', 'foto_perfil', 'foto_banner',
      'galeria', 'photos', 'galeriaFotos', 'imagens',
      'banner', 'capa', 'stories'
    ];
    
    photoFields.forEach(field => {
      if (adData[field]) {
        if (Array.isArray(adData[field])) {
          console.log(`   ${field}: [${adData[field].length} itens]`);
          adData[field].forEach((item, i) => {
            console.log(`     ${i + 1}. ${item}`);
          });
        } else {
          console.log(`   ${field}: ${adData[field]}`);
        }
      } else {
        console.log(`   ${field}: (não definido)`);
      }
    });
    
    console.log('\n🔍 TODOS OS CAMPOS DO ANÚNCIO:');
    Object.keys(adData).forEach(key => {
      const value = adData[key];
      if (typeof value === 'object' && value !== null) {
        console.log(`   ${key}: [objeto] ${JSON.stringify(value, null, 2)}`);
      } else {
        console.log(`   ${key}: ${value}`);
      }
    });
    
    console.log('\n✅ VERIFICAÇÃO CONCLUÍDA!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

// Executar verificação
checkFirestoreAdDetails().then(() => {
  console.log('\n🏁 Verificação finalizada');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

