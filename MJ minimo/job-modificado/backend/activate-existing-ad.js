require('dotenv').config({ path: './config.env' });
const admin = require('firebase-admin');

async function activateExistingAd() {
  try {
    console.log('🔄 Ativando anúncio existente no Firebase...');
    
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
    
    // Buscar anúncio existente
    const adsSnapshot = await firestore.collection('advertisements').get();
    console.log(`📊 Encontrados ${adsSnapshot.size} anúncios`);
    
    if (adsSnapshot.size > 0) {
      for (const doc of adsSnapshot.docs) {
        const data = doc.data();
        console.log(`🔄 Atualizando anúncio: ${doc.id} (${data.nome || 'Sem nome'})`);
        
        // Atualizar status para active
        await doc.ref.update({
          status: 'active',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          activatedAt: admin.firestore.FieldValue.serverTimestamp(),
          activatedBy: 'system_auto_activation'
        });
        
        console.log(`✅ Anúncio ${doc.id} ativado com sucesso!`);
      }
    } else {
      console.log('❌ Nenhum anúncio encontrado para ativar');
    }
    
    console.log('\n✅ Processo de ativação concluído!');
    
  } catch (error) {
    console.error('❌ Erro ao ativar anúncios:', error);
  }
}

activateExistingAd();
