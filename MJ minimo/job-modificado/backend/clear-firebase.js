const admin = require('firebase-admin');
require('dotenv').config({ path: './config.env' });

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
  console.log('✅ Firebase Admin inicializado');
}

const db = admin.firestore();

async function clearFirebaseData() {
  try {
    console.log('🗑️ Iniciando limpeza do Firebase...');
    
    // Lista de coleções para limpar
    const collections = ['advertisements', 'advertisers', 'clients'];
    
    for (const collectionName of collections) {
      console.log(`\n📋 Limpando coleção: ${collectionName}`);
      
      // Buscar todos os documentos
      const snapshot = await db.collection(collectionName).get();
      console.log(`   📊 Encontrados ${snapshot.size} documentos`);
      
      if (snapshot.size === 0) {
        console.log(`   ✅ Coleção ${collectionName} já está vazia`);
        continue;
      }
      
      // Deletar em lotes de 500 (limite do Firebase)
      const batch = db.batch();
      let count = 0;
      
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
        
        // Executar batch quando atingir 500 documentos
        if (count % 500 === 0) {
          console.log(`   🗑️ Deletando lote de ${count} documentos...`);
        }
      });
      
      // Executar batch final
      if (count > 0) {
        await batch.commit();
        console.log(`   ✅ ${count} documentos deletados da coleção ${collectionName}`);
      }
    }
    
    console.log('\n🎉 Limpeza do Firebase concluída!');
    
    // Verificar resultado
    console.log('\n📊 Verificação final:');
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      console.log(`   ${collectionName}: ${snapshot.size} documentos`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao limpar Firebase:', error);
  } finally {
    process.exit(0);
  }
}

// Executar limpeza
clearFirebaseData();
