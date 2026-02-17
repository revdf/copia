require('dotenv').config({ path: './.env' });
const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: 'mansao-do-job.firebasestorage.app'
  });
  console.log('✅ Firebase Admin inicializado');
}

async function checkFirebaseAds() {
  try {
    console.log('🔍 Verificando anúncios no Firebase...');
    
    const db = admin.firestore();
    
    // Verificar diferentes coleções onde podem estar os anúncios
    const collections = [
      'advertisements',
      'advertisers', 
      'advertiser_content',
      'escorts',
      'profiles'
    ];
    
    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).get();
        console.log(`\n📋 Coleção '${collectionName}': ${snapshot.size} documentos`);
        
        if (snapshot.size > 0) {
          console.log('📄 Exemplos de documentos:');
          let count = 0;
          snapshot.forEach((doc) => {
            if (count < 3) { // Mostrar apenas os primeiros 3
              const data = doc.data();
              console.log(`  ${count + 1}. ID: ${doc.id}`);
              console.log(`     - Nome: ${data.nome || data.name || data.displayName || 'N/A'}`);
              console.log(`     - Email: ${data.email || 'N/A'}`);
              console.log(`     - Cidade: ${data.cidade || data.city || 'N/A'}`);
              console.log(`     - Estado: ${data.estado || data.state || 'N/A'}`);
              console.log(`     - Categoria: ${data.categoria || data.category || 'N/A'}`);
              console.log(`     - Status: ${data.status || data.isActive || 'N/A'}`);
              console.log('');
              count++;
            }
          });
        }
      } catch (error) {
        console.log(`❌ Erro ao acessar coleção '${collectionName}': ${error.message}`);
      }
    }
    
    console.log('✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar Firebase:', error);
  }
}

checkFirebaseAds();
