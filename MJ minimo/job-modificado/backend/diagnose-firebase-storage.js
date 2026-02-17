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
const storage = admin.storage();

async function diagnoseFirebaseStorage() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DO FIREBASE STORAGE');
  console.log('=' .repeat(60));
  
  try {
    // 1. Verificar bucket do Storage
    const bucket = storage.bucket();
    console.log(`📦 Bucket: ${bucket.name}`);
    
    // 2. Listar TODOS os arquivos no Storage
    console.log('\n📁 LISTANDO TODOS OS ARQUIVOS NO FIREBASE STORAGE:');
    const [files] = await bucket.getFiles();
    console.log(`📊 Total de arquivos encontrados: ${files.length}`);
    
    if (files.length === 0) {
      console.log('⚠️ NENHUM ARQUIVO ENCONTRADO NO FIREBASE STORAGE!');
      return;
    }
    
    // Agrupar por estrutura de pastas
    const folderStructure = {};
    
    files.forEach((file, index) => {
      const fileName = file.name;
      const pathParts = fileName.split('/');
      const folder = pathParts.length > 1 ? pathParts[0] : 'root';
      
      if (!folderStructure[folder]) {
        folderStructure[folder] = [];
      }
      folderStructure[folder].push({
        name: fileName,
        size: file.metadata.size,
        contentType: file.metadata.contentType,
        timeCreated: file.metadata.timeCreated,
        updated: file.metadata.updated
      });
      
      console.log(`${index + 1}. ${fileName} (${file.metadata.size} bytes, ${file.metadata.contentType})`);
    });
    
    // 3. Mostrar estrutura de pastas
    console.log('\n📂 ESTRUTURA DE PASTAS:');
    Object.keys(folderStructure).forEach(folder => {
      console.log(`\n📁 ${folder}/ (${folderStructure[folder].length} arquivos)`);
      folderStructure[folder].forEach(file => {
        console.log(`   └── ${file.name.split('/').pop()} (${file.size} bytes)`);
      });
    });
    
    // 4. Verificar anúncios no Firestore
    console.log('\n🔥 VERIFICANDO ANÚNCIOS NO FIRESTORE:');
    const adsSnapshot = await firestore.collection('advertisements').get();
    console.log(`📊 Total de anúncios no Firestore: ${adsSnapshot.size}`);
    
    if (adsSnapshot.size > 0) {
      console.log('\n📋 DETALHES DOS ANÚNCIOS:');
      adsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. ID: ${doc.id}`);
        console.log(`   Nome: ${data.nome || data.title || 'Sem nome'}`);
        console.log(`   Status: ${data.status || 'Sem status'}`);
        
        // Verificar campos de fotos
        const photoFields = ['foto_capa', 'foto_stories', 'foto_perfil', 'galeria', 'photos', 'galeriaFotos'];
        photoFields.forEach(field => {
          if (data[field]) {
            if (Array.isArray(data[field])) {
              console.log(`   ${field}: [${data[field].length} fotos]`);
              data[field].forEach((url, i) => {
                console.log(`     ${i + 1}. ${url}`);
              });
            } else {
              console.log(`   ${field}: ${data[field]}`);
            }
          }
        });
      });
    }
    
    // 5. Verificar usuários no Firestore
    console.log('\n👥 VERIFICANDO USUÁRIOS NO FIRESTORE:');
    const usersSnapshot = await firestore.collection('users').get();
    console.log(`📊 Total de usuários no Firestore: ${usersSnapshot.size}`);
    
    if (usersSnapshot.size > 0) {
      console.log('\n📋 DETALHES DOS USUÁRIOS:');
      usersSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. ID: ${doc.id}`);
        console.log(`   Nome: ${data.nome || data.displayName || 'Sem nome'}`);
        console.log(`   Email: ${data.email || 'Sem email'}`);
        console.log(`   Status: ${data.status || 'Sem status'}`);
      });
    }
    
    // 6. Verificar se há fotos específicas da "mel"
    console.log('\n🔍 PROCURANDO FOTOS DA "MEL":');
    const melFiles = files.filter(file => 
      file.name.toLowerCase().includes('mel') || 
      file.name.toLowerCase().includes('bobo')
    );
    
    if (melFiles.length > 0) {
      console.log(`📸 ${melFiles.length} arquivos relacionados à "mel" encontrados:`);
      melFiles.forEach(file => {
        console.log(`   - ${file.name} (${file.metadata.size} bytes)`);
      });
    } else {
      console.log('⚠️ Nenhuma foto específica da "mel" encontrada no Storage');
    }
    
    // 7. Verificar tipos de arquivo
    console.log('\n📊 TIPOS DE ARQUIVO ENCONTRADOS:');
    const fileTypes = {};
    files.forEach(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      fileTypes[extension] = (fileTypes[extension] || 0) + 1;
    });
    
    Object.keys(fileTypes).forEach(type => {
      console.log(`   ${type}: ${fileTypes[type]} arquivos`);
    });
    
    console.log('\n✅ DIAGNÓSTICO CONCLUÍDO!');
    
  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error);
  }
}

// Executar diagnóstico
diagnoseFirebaseStorage().then(() => {
  console.log('\n🏁 Diagnóstico finalizado');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

