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

const auth = admin.auth();
const db = admin.firestore();

// Senha padrão para todos os usuários
const DEFAULT_PASSWORD = 'AAaa!!11';

// Função para gerar email baseado no nome
function generateEmail(name) {
  // Remover acentos e caracteres especiais
  const cleanName = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '');
  
  // Gerar email único
  const email = `${cleanName}@mansaodojob.com`;
  return email;
}

// Função para gerar UID baseado no nome
function generateUID(name) {
  const cleanName = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '');
  
  return `user_${cleanName}_${Date.now()}`;
}

async function createAuthUsers() {
  try {
    console.log('🚀 Iniciando criação de usuários de autenticação...');
    
    // Buscar todos os anúncios
    const snapshot = await db.collection('advertisements').get();
    console.log(`📊 Encontrados ${snapshot.size} anúncios`);
    
    let createdCount = 0;
    let errorCount = 0;
    const userCredentials = [];
    
    for (const doc of snapshot.docs) {
      const adData = doc.data();
      const adId = doc.id;
      const name = adData.nome || adData.name;
      
      if (!name) {
        console.log(`⚠️ Anúncio ${adId} sem nome, pulando...`);
        continue;
      }
      
      try {
        console.log(`👤 Criando usuário para: ${name}`);
        
        // Gerar email e UID
        const email = generateEmail(name);
        const uid = generateUID(name);
        
        // Criar usuário no Firebase Authentication
        const userRecord = await auth.createUser({
          uid: uid,
          email: email,
          password: DEFAULT_PASSWORD,
          displayName: name,
          emailVerified: true, // Marcar como verificado
          disabled: false
        });
        
        console.log(`✅ Usuário criado: ${email} (UID: ${uid})`);
        
        // Salvar credenciais para referência
        userCredentials.push({
          adId: adId,
          name: name,
          email: email,
          uid: uid,
          password: DEFAULT_PASSWORD
        });
        
        // Atualizar o anúncio com informações do usuário
        await doc.ref.update({
          userId: uid,
          userEmail: email,
          authCreated: true,
          authCreatedAt: new Date()
        });
        
        createdCount++;
        
        // Pequena pausa para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Erro ao criar usuário para ${name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Criação de usuários concluída!');
    console.log(`📊 Resumo:`);
    console.log(`   ✅ Usuários criados: ${createdCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    console.log(`   📊 Taxa de sucesso: ${((createdCount / (createdCount + errorCount)) * 100).toFixed(1)}%`);
    
    // Salvar credenciais em arquivo para referência
    const fs = require('fs');
    const credentialsFile = '/Users/troll/Downloads/mansaodojob-main/backend/user-credentials.json';
    fs.writeFileSync(credentialsFile, JSON.stringify(userCredentials, null, 2));
    console.log(`\n📄 Credenciais salvas em: ${credentialsFile}`);
    
    // Verificar resultado
    const userCount = await auth.listUsers();
    console.log(`\n🔍 Verificação: ${userCount.users.length} usuários no Firebase Auth`);
    
    // Mostrar alguns exemplos
    console.log('\n📋 Exemplos de credenciais criadas:');
    userCredentials.slice(0, 5).forEach((cred, index) => {
      console.log(`${index + 1}. ${cred.name}`);
      console.log(`   Email: ${cred.email}`);
      console.log(`   Senha: ${cred.password}`);
      console.log(`   UID: ${cred.uid}`);
      console.log('');
    });
    
    if (userCredentials.length > 5) {
      console.log(`... e mais ${userCredentials.length - 5} usuários`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    process.exit(0);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createAuthUsers();
}

module.exports = { createAuthUsers, generateEmail, generateUID };
