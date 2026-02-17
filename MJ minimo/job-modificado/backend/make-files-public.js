const admin = require('firebase-admin');
require('dotenv').config({ path: './config.env' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const bucket = admin.storage().bucket();

async function makeFilesPublic() {
  try {
    console.log('🔧 Tornando arquivos públicos no Firebase Storage...');
    
    // Listar todos os arquivos
    const [files] = await bucket.getFiles();
    
    console.log(`📊 Total de arquivos: ${files.length}`);
    
    let publicCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      try {
        // Tornar o arquivo público
        await file.makePublic();
        console.log(`✅ Tornado público: ${file.name}`);
        publicCount++;
      } catch (error) {
        console.log(`❌ Erro ao tornar público ${file.name}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Processo concluído!`);
    console.log(`📊 Arquivos tornados públicos: ${publicCount}`);
    console.log(`📊 Erros: ${errorCount}`);
    
    // Testar um arquivo
    if (files.length > 0) {
      const testFile = files[0];
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${testFile.name}`;
      console.log(`\n🔍 URL de teste: ${publicUrl}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

makeFilesPublic();
