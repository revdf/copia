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

// Dados sensíveis padrão (um para todos)
const SENSITIVE_DATA = {
  nomeCompleto: "Maria Silva Santos",
  cpf: "12345678901",
  nomeMae: "Ana Maria Silva",
  dataNascimento: "15/03/1990",
  email: "maria.silva@email.com",
  whatsapp: "+5511999999999"
};

// Função para gerar CPF único
function generateCPF() {
  // Gerar 9 dígitos aleatórios
  let cpf = '';
  for (let i = 0; i < 9; i++) {
    cpf += Math.floor(Math.random() * 10);
  }
  
  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  cpf += digit1;
  
  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  cpf += digit2;
  
  return cpf;
}

// Função para gerar data de nascimento aleatória
function generateBirthDate() {
  const year = 1985 + Math.floor(Math.random() * 20); // 1985-2004
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
}

// Função para gerar WhatsApp
function generateWhatsApp() {
  const ddd = ['11', '21', '31', '41', '51', '61', '71', '81', '85', '95'];
  const randomDDD = ddd[Math.floor(Math.random() * ddd.length)];
  const number = Math.floor(Math.random() * 900000000) + 100000000;
  return `+55${randomDDD}${number}`;
}

// Função para gerar nome da mãe baseado no nome
function generateMotherName(name) {
  const motherNames = [
    'Maria', 'Ana', 'Francisca', 'Antônia', 'Adriana', 'Juliana', 'Márcia', 'Fernanda',
    'Patrícia', 'Aline', 'Sandra', 'Camila', 'Amanda', 'Bárbara', 'Jéssica', 'Letícia',
    'Júlia', 'Luciana', 'Vanessa', 'Mariana', 'Gabriela', 'Alessandra', 'Vera', 'Rosa',
    'Carmen', 'Lúcia', 'Rita', 'Tereza', 'Helena', 'Isabel', 'Cristina', 'Silvia'
  ];
  
  const surnames = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
    'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes'
  ];
  
  const motherName = motherNames[Math.floor(Math.random() * motherNames.length)];
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  
  return `${motherName} ${surname}`;
}

async function addSensitiveData() {
  try {
    console.log('🚀 Adicionando dados sensíveis aos usuários...');
    
    // Buscar todos os anúncios
    const snapshot = await db.collection('advertisements').get();
    console.log(`📊 Encontrados ${snapshot.size} anúncios`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const doc of snapshot.docs) {
      const adData = doc.data();
      const adId = doc.id;
      const name = adData.nome || adData.name;
      
      if (!name) {
        console.log(`⚠️ Anúncio ${adId} sem nome, pulando...`);
        continue;
      }
      
      try {
        console.log(`📝 Adicionando dados sensíveis para: ${name}`);
        
        // Gerar dados únicos para cada usuário
        const sensitiveData = {
          nomeCompleto: name, // Usar o nome do anúncio como nome completo
          cpf: generateCPF(),
          nomeMae: generateMotherName(name),
          dataNascimento: generateBirthDate(),
          email: adData.userEmail || `${name.toLowerCase().replace(/\s+/g, '')}@mansaodojob.com`,
          whatsapp: generateWhatsApp(),
          updatedAt: new Date()
        };
        
        // Atualizar o anúncio com dados sensíveis
        await doc.ref.update({
          dadosSensiveis: sensitiveData,
          hasSensitiveData: true
        });
        
        console.log(`✅ Dados adicionados para: ${name}`);
        console.log(`   CPF: ${sensitiveData.cpf}`);
        console.log(`   Mãe: ${sensitiveData.nomeMae}`);
        console.log(`   Nascimento: ${sensitiveData.dataNascimento}`);
        console.log(`   WhatsApp: ${sensitiveData.whatsapp}`);
        
        updatedCount++;
        
        // Pequena pausa
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`❌ Erro ao adicionar dados para ${name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Adição de dados sensíveis concluída!');
    console.log(`📊 Resumo:`);
    console.log(`   ✅ Usuários atualizados: ${updatedCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    console.log(`   📊 Taxa de sucesso: ${((updatedCount / (updatedCount + errorCount)) * 100).toFixed(1)}%`);
    
    // Verificar resultado
    const updatedSnapshot = await db.collection('advertisements')
      .where('hasSensitiveData', '==', true)
      .get();
    console.log(`\n🔍 Verificação: ${updatedSnapshot.size} anúncios com dados sensíveis`);
    
    // Mostrar alguns exemplos
    console.log('\n📋 Exemplos de dados sensíveis adicionados:');
    updatedSnapshot.docs.slice(0, 3).forEach((doc, index) => {
      const data = doc.data();
      const sensitive = data.dadosSensiveis;
      console.log(`${index + 1}. ${data.nome}`);
      console.log(`   Nome Completo: ${sensitive.nomeCompleto}`);
      console.log(`   CPF: ${sensitive.cpf}`);
      console.log(`   Nome da Mãe: ${sensitive.nomeMae}`);
      console.log(`   Data Nascimento: ${sensitive.dataNascimento}`);
      console.log(`   Email: ${sensitive.email}`);
      console.log(`   WhatsApp: ${sensitive.whatsapp}`);
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
  addSensitiveData();
}

module.exports = { addSensitiveData, generateCPF, generateBirthDate, generateWhatsApp, generateMotherName };
