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

async function moveSensitiveDataToAdvertisers() {
  try {
    console.log('🚀 Movendo dados sensíveis para a coleção advertisers...');
    
    // Buscar todos os anúncios com dados sensíveis
    const snapshot = await db.collection('advertisements')
      .where('hasSensitiveData', '==', true)
      .get();
    
    console.log(`📊 Encontrados ${snapshot.size} anúncios com dados sensíveis`);
    
    let movedCount = 0;
    let errorCount = 0;
    
    for (const doc of snapshot.docs) {
      const adData = doc.data();
      const adId = doc.id;
      const name = adData.nome || adData.name;
      const sensitiveData = adData.dadosSensiveis;
      
      if (!name || !sensitiveData) {
        console.log(`⚠️ Anúncio ${adId} sem dados sensíveis completos, pulando...`);
        continue;
      }
      
      try {
        console.log(`📝 Movendo dados sensíveis para: ${name}`);
        
        // Criar documento na coleção advertisers
        const advertiserData = {
          // Dados básicos
          nomeCompleto: sensitiveData.nomeCompleto,
          cpf: sensitiveData.cpf,
          nomeMae: sensitiveData.nomeMae,
          dataNascimento: sensitiveData.dataNascimento,
          email: sensitiveData.email,
          whatsapp: sensitiveData.whatsapp,
          
          // Dados do anúncio relacionado
          adId: adId,
          userId: adData.userId,
          userEmail: adData.userEmail,
          
          // Metadados
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          hasSensitiveData: true
        };
        
        // Usar o userId como ID do documento na coleção advertisers
        const advertiserId = adData.userId || `adv_${adId}`;
        
        // Salvar na coleção advertisers
        await db.collection('advertisers').doc(advertiserId).set(advertiserData);
        
        // Remover dados sensíveis da coleção advertisements
        await doc.ref.update({
          dadosSensiveis: admin.firestore.FieldValue.delete(),
          hasSensitiveData: false,
          advertiserId: advertiserId
        });
        
        console.log(`✅ Dados movidos para advertisers: ${name}`);
        console.log(`   CPF: ${sensitiveData.cpf}`);
        console.log(`   Mãe: ${sensitiveData.nomeMae}`);
        console.log(`   Nascimento: ${sensitiveData.dataNascimento}`);
        console.log(`   WhatsApp: ${sensitiveData.whatsapp}`);
        
        movedCount++;
        
        // Pequena pausa
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`❌ Erro ao mover dados para ${name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Movimentação de dados sensíveis concluída!');
    console.log(`📊 Resumo:`);
    console.log(`   ✅ Dados movidos: ${movedCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    console.log(`   📊 Taxa de sucesso: ${((movedCount / (movedCount + errorCount)) * 100).toFixed(1)}%`);
    
    // Verificar resultado
    const advertisersSnapshot = await db.collection('advertisers').get();
    const adsWithSensitiveSnapshot = await db.collection('advertisements')
      .where('hasSensitiveData', '==', true)
      .get();
    
    console.log(`\n🔍 Verificação:`);
    console.log(`   📁 Documentos na coleção 'advertisers': ${advertisersSnapshot.size}`);
    console.log(`   📁 Anúncios ainda com dados sensíveis: ${adsWithSensitiveSnapshot.size}`);
    
    // Mostrar alguns exemplos
    console.log('\n📋 Exemplos de dados na coleção advertisers:');
    advertisersSnapshot.docs.slice(0, 3).forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.nomeCompleto}`);
      console.log(`   CPF: ${data.cpf}`);
      console.log(`   Nome da Mãe: ${data.nomeMae}`);
      console.log(`   Data Nascimento: ${data.dataNascimento}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   WhatsApp: ${data.whatsapp}`);
      console.log(`   Ad ID: ${data.adId}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    process.exit(0);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  moveSensitiveDataToAdvertisers();
}

module.exports = { moveSensitiveDataToAdvertisers };
