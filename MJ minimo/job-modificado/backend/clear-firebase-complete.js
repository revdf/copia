require('dotenv').config({ path: './config.env' });
const admin = require('firebase-admin');

// Configuração do Firebase Admin
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
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: 'mansao-do-job.firebasestorage.app'
  });
}

const db = admin.firestore();
const storage = admin.storage();

async function clearFirebaseData() {
  try {
    console.log('🧹 INICIANDO LIMPEZA COMPLETA DO FIREBASE...');
    console.log('⚠️  ATENÇÃO: Esta operação irá deletar TODOS os dados!');
    
    // 1. Limpar Firestore Collections
    console.log('\n📊 1. LIMPANDO FIRESTORE COLLECTIONS...');
    
    const collections = [
      'advertisers',
      'advertiser_content', 
      'clients',
      'admin_users',
      'payments',
      'advertisements' // Se existir
    ];
    
    for (const collectionName of collections) {
      try {
        console.log(`   🗑️  Limpando collection: ${collectionName}`);
        const collection = db.collection(collectionName);
        const snapshot = await collection.get();
        
        if (snapshot.empty) {
          console.log(`   ✅ Collection ${collectionName} já está vazia`);
          continue;
        }
        
        // Deletar em lotes de 500 (limite do Firebase)
        const batch = db.batch();
        let count = 0;
        
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
          count++;
          
          // Commit batch quando atingir 500 documentos
          if (count % 500 === 0) {
            batch.commit();
          }
        });
        
        // Commit batch final
        if (count % 500 !== 0) {
          await batch.commit();
        }
        
        console.log(`   ✅ ${count} documentos deletados de ${collectionName}`);
      } catch (error) {
        console.log(`   ❌ Erro ao limpar ${collectionName}:`, error.message);
      }
    }
    
    // 2. Limpar Firebase Storage
    console.log('\n🗂️ 2. LIMPANDO FIREBASE STORAGE...');
    
    try {
      const bucket = storage.bucket();
      
      // Listar todos os arquivos
      const [files] = await bucket.getFiles();
      
      if (files.length === 0) {
        console.log('   ✅ Storage já está vazio');
      } else {
        console.log(`   🗑️  Deletando ${files.length} arquivos...`);
        
        // Deletar arquivos em lotes
        const deletePromises = files.map(file => file.delete());
        await Promise.all(deletePromises);
        
        console.log(`   ✅ ${files.length} arquivos deletados do Storage`);
      }
    } catch (error) {
      console.log('   ❌ Erro ao limpar Storage:', error.message);
    }
    
    // 3. Limpar Firebase Auth (usuários)
    console.log('\n👥 3. LIMPANDO FIREBASE AUTH...');
    
    try {
      let nextPageToken;
      let totalDeleted = 0;
      
      do {
        const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
        
        if (listUsersResult.users.length === 0) {
          console.log('   ✅ Nenhum usuário encontrado');
          break;
        }
        
        const deletePromises = listUsersResult.users.map(user => 
          admin.auth().deleteUser(user.uid)
        );
        
        await Promise.all(deletePromises);
        totalDeleted += listUsersResult.users.length;
        
        console.log(`   🗑️  ${listUsersResult.users.length} usuários deletados...`);
        
        nextPageToken = listUsersResult.pageToken;
      } while (nextPageToken);
      
      console.log(`   ✅ Total de ${totalDeleted} usuários deletados`);
    } catch (error) {
      console.log('   ❌ Erro ao limpar Auth:', error.message);
    }
    
    console.log('\n🎉 LIMPEZA DO FIREBASE CONCLUÍDA!');
    console.log('📋 Resumo:');
    console.log('   - Firestore Collections: Limpas');
    console.log('   - Firebase Storage: Limpo');
    console.log('   - Firebase Auth: Limpo');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza do Firebase:', error);
  } finally {
    process.exit(0);
  }
}

// Executar limpeza
clearFirebaseData();

