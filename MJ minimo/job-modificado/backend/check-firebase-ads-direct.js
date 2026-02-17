require('dotenv').config({ path: './config.env' });
const admin = require('firebase-admin');

async function checkFirebaseAds() {
  try {
    console.log('🔍 Verificando anúncios no Firebase...');
    
    // Inicializar Firebase Admin
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    const firestore = admin.firestore();
    console.log('✅ Firebase conectado!');
    
    // Verificar coleção advertisements
    const adsSnapshot = await firestore.collection('advertisements').get();
    console.log(`📊 Total de anúncios na coleção 'advertisements': ${adsSnapshot.size}`);
    
    if (adsSnapshot.size > 0) {
      console.log('\n📋 Anúncios encontrados:');
      adsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ID: ${doc.id}`);
        console.log(`     - Nome: ${data.nome || 'N/A'}`);
        console.log(`     - Email: ${data.email || 'N/A'}`);
        console.log(`     - Cidade: ${data.cidade || 'N/A'}`);
        console.log(`     - Estado: ${data.estado || 'N/A'}`);
        console.log(`     - Status: ${data.status || 'N/A'}`);
        console.log(`     - Criado em: ${data.createdAt || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ Nenhum anúncio encontrado na coleção "advertisements"');
    }
    
    // Verificar outras coleções possíveis
    const collections = ['advertisers', 'users', 'clients'];
    
    for (const collectionName of collections) {
      try {
        const snapshot = await firestore.collection(collectionName).get();
        console.log(`📊 Coleção '${collectionName}': ${snapshot.size} documentos`);
        
        if (snapshot.size > 0) {
          snapshot.forEach((doc, index) => {
            const data = doc.data();
            if (data.email === 'bebelboquetequente@gmail.com') {
              console.log(`  ✅ Usuário encontrado em '${collectionName}':`);
              console.log(`     - ID: ${doc.id}`);
              console.log(`     - Nome: ${data.nome || 'N/A'}`);
              console.log(`     - Email: ${data.email}`);
              console.log(`     - Cidade: ${data.cidade || 'N/A'}`);
              console.log(`     - Estado: ${data.estado || 'N/A'}`);
            }
          });
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar coleção '${collectionName}': ${error.message}`);
      }
    }
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar Firebase:', error);
  }
}

checkFirebaseAds();
