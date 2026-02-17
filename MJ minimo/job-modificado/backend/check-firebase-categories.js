/**
 * Script para verificar categorias no Firebase
 */

require('dotenv').config({ path: './config.env' });
const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const firebaseDb = admin.firestore();

async function checkFirebaseCategories() {
  try {
    console.log('🔍 Verificando categorias no Firebase...');
    
    // Buscar anúncios no Firebase
    const firebaseAdsSnapshot = await firebaseDb.collection('advertisements').get();
    const firebaseAds = firebaseAdsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    console.log(`📊 Total de anúncios no Firebase: ${firebaseAds.length}`);

    if (firebaseAds.length > 0) {
      console.log('\n📋 Detalhes dos anúncios no Firebase:');
      firebaseAds.forEach((ad, index) => {
        console.log(`\n${index + 1}. Nome: ${ad.nome || ad.nomeProfissional || 'N/A'}`);
        console.log(`   Cidade: ${ad.cidade || 'N/A'}`);
        console.log(`   Categoria: ${ad.categoria || ad.category || 'N/A'}`);
        console.log(`   Status: ${ad.status || 'N/A'}`);
        console.log(`   Firebase ID: ${ad.id}`);
        console.log(`   Criado em: ${ad.createdAt || ad.created_at || 'N/A'}`);
        
        // Mostrar todos os campos disponíveis
        console.log(`   Todos os campos:`, Object.keys(ad));
      });

      // Agrupar por categoria
      const categories = {};
      firebaseAds.forEach(ad => {
        const category = ad.categoria || ad.category || 'sem-categoria';
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(ad);
      });

      console.log('\n📊 Distribuição por categoria no Firebase:');
      Object.keys(categories).forEach(category => {
        console.log(`   ${category}: ${categories[category].length} anúncio(s)`);
        categories[category].forEach(ad => {
          console.log(`     - ${ad.nome || ad.nomeProfissional || 'N/A'} (${ad.cidade || 'N/A'})`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkFirebaseCategories();

