// Script para popular anúncios com dados sensíveis simulados
// Adiciona dados pessoais, documentos e pagamentos para teste

const admin = require("firebase-admin");
require('dotenv').config({ path: './config-firebase-only.env' });

// Inicializar Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
  });
  console.log("✅ Firebase Admin SDK inicializado com sucesso");
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error.message);
  process.exit(1);
}

const db = admin.firestore();

// Lista de fotos para documentos simulados
const fotosDocumentos = [
  'foto (1).jpg', 'foto (2).jpg', 'foto (3).jpg', 'foto (4).jpg', 'foto (5).jpg',
  'foto (6).jpg', 'foto (7).jpg', 'foto (8).jpg', 'foto (9).jpg', 'foto (10).jpg',
  'avatar.jpg', 'avatar (2).jpg', 'avatar (3).jpg', 'avatar (4).jpg', 'avatar (5).jpg',
  'a1.jpg', 'a2.jpg', 'a3.jpg', 'd4.jpg', 'Stories.jpg'
];

// Função para gerar CPF simulado
function generateCPF() {
  const cpf = Math.floor(Math.random() * 900000000) + 100000000;
  return cpf.toString().replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para gerar RG simulado
function generateRG() {
  const rg = Math.floor(Math.random() * 90000000) + 10000000;
  return rg.toString().replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
}

// Função para gerar email simulado
function generateEmail(nome) {
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com.br', 'outlook.com', 'uol.com.br'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const cleanName = nome.toLowerCase().replace(/\s+/g, '');
  const numbers = Math.floor(Math.random() * 999) + 1;
  return `${cleanName}${numbers}@${domain}`;
}

// Função para gerar endereço completo simulado
function generateEndereco(bairro) {
  const ruas = [
    'Rua das Flores', 'Avenida Central', 'Rua do Comércio', 'Avenida Principal',
    'Rua da Paz', 'Avenida das Palmeiras', 'Rua do Sol', 'Avenida dos Estados',
    'Rua das Rosas', 'Avenida Brasil', 'Rua da Liberdade', 'Avenida Paulista',
    'Rua das Margaridas', 'Avenida Copacabana', 'Rua do Mar', 'Avenida Ipanema'
  ];
  
  const rua = ruas[Math.floor(Math.random() * ruas.length)];
  const numero = Math.floor(Math.random() * 9999) + 1;
  const complemento = Math.random() > 0.7 ? `Apto ${Math.floor(Math.random() * 999) + 1}` : '';
  
  return `${rua}, ${numero}${complemento ? ', ' + complemento : ''}, ${bairro}, Brasília - DF`;
}

// Função para gerar dados bancários simulados
function generateBankData() {
  const banks = [
    { name: 'Banco do Brasil', code: '001' },
    { name: 'Caixa Econômica Federal', code: '104' },
    { name: 'Bradesco', code: '237' },
    { name: 'Itaú', code: '341' },
    { name: 'Santander', code: '033' },
    { name: 'Nubank', code: '260' },
    { name: 'Inter', code: '077' }
  ];
  
  const bank = banks[Math.floor(Math.random() * banks.length)];
  const account = Math.floor(Math.random() * 900000) + 100000;
  const agency = Math.floor(Math.random() * 9000) + 1000;
  
  return {
    banco: bank.name,
    codigo_banco: bank.code,
    agencia: agency.toString(),
    conta: account.toString(),
    tipo_conta: Math.random() > 0.5 ? 'Corrente' : 'Poupança',
    pix: generatePIX()
  };
}

// Função para gerar PIX simulado
function generatePIX() {
  const types = ['cpf', 'email', 'telefone', 'chave_aleatoria'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  switch (type) {
    case 'cpf':
      return generateCPF();
    case 'email':
      return generateEmail('pix');
    case 'telefone':
      return `+5561${Math.floor(Math.random() * 900000000) + 100000000}`;
    case 'chave_aleatoria':
      return `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
    default:
      return generateCPF();
  }
}

// Função para gerar dados de pagamento simulados
function generatePaymentData() {
  const paymentMethods = ['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência', 'Dinheiro'];
  const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
  
  return {
    metodo_pagamento: method,
    aceita_pix: true,
    aceita_cartao: Math.random() > 0.3,
    aceita_dinheiro: Math.random() > 0.2,
    taxa_cartao: Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : 0,
    desconto_pix: Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : 0
  };
}

// Função para gerar dados de verificação simulados
function generateVerificationData() {
  return {
    documento_frente: fotosDocumentos[Math.floor(Math.random() * fotosDocumentos.length)],
    documento_verso: fotosDocumentos[Math.floor(Math.random() * fotosDocumentos.length)],
    documento_selfie: fotosDocumentos[Math.floor(Math.random() * fotosDocumentos.length)],
    comprovante_residencia: fotosDocumentos[Math.floor(Math.random() * fotosDocumentos.length)],
    status_verificacao: Math.random() > 0.2 ? 'aprovado' : 'pendente',
    data_verificacao: admin.firestore.FieldValue.serverTimestamp(),
    verificador_id: `verificador_${Math.floor(Math.random() * 100) + 1}`
  };
}

// Função para gerar dados pessoais simulados
function generatePersonalData(nome, bairro) {
  const nacionalidades = ['Brasileira', 'Argentina', 'Colombiana', 'Venezuelana', 'Peruana', 'Chilena'];
  const etnias = ['Branca', 'Parda', 'Negra', 'Indígena', 'Amarela', 'Não informado'];
  const estadosCivis = ['Solteira', 'Casada', 'Divorciada', 'Viúva', 'União Estável'];
  const escolaridades = ['Ensino Fundamental', 'Ensino Médio', 'Ensino Superior', 'Pós-graduação', 'Não informado'];
  
  return {
    nome_real: nome,
    nome_artistico: nome,
    cpf: generateCPF(),
    rg: generateRG(),
    email_pessoal: generateEmail(nome),
    email_comercial: generateEmail(nome + 'comercial'),
    endereco_completo: generateEndereco(bairro),
    cep: `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}`,
    nacionalidade: nacionalidades[Math.floor(Math.random() * nacionalidades.length)],
    etnia: etnias[Math.floor(Math.random() * etnias.length)],
    estado_civil: estadosCivis[Math.floor(Math.random() * estadosCivis.length)],
    escolaridade: escolaridades[Math.floor(Math.random() * escolaridades.length)],
    profissao: 'Acompanhante',
    altura: (Math.random() * 30 + 150).toFixed(0), // 150-180cm
    peso: (Math.random() * 30 + 45).toFixed(0), // 45-75kg
    tipo_sanguineo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][Math.floor(Math.random() * 8)],
    contato_emergencia: `+5561${Math.floor(Math.random() * 900000000) + 100000000}`,
    nome_contato_emergencia: `Contato ${Math.floor(Math.random() * 100) + 1}`,
    parentesco_emergencia: ['Mãe', 'Pai', 'Irmã', 'Irmão', 'Amiga', 'Amigo'][Math.floor(Math.random() * 6)]
  };
}

// Função para gerar dados de saúde simulados
function generateHealthData() {
  return {
    ultimo_exame: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Últimos 90 dias
    proximo_exame: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Próximos 30 dias
    vacinas_em_dia: Math.random() > 0.1,
    alergias: Math.random() > 0.7 ? ['Poeira', 'Pólen', 'Frutos do mar'][Math.floor(Math.random() * 3)] : 'Nenhuma',
    medicamentos: Math.random() > 0.8 ? 'Anticoncepcional' : 'Nenhum',
    restricoes_alimentares: Math.random() > 0.9 ? 'Vegetariana' : 'Nenhuma'
  };
}

// Função para gerar dados de preferências simulados
function generatePreferences() {
  const idiomas = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Italiano'];
  const hobbies = ['Música', 'Cinema', 'Leitura', 'Esportes', 'Viagem', 'Culinária', 'Arte'];
  
  return {
    idiomas: idiomas.slice(0, Math.floor(Math.random() * 3) + 1),
    hobbies: hobbies.slice(0, Math.floor(Math.random() * 4) + 1),
    musica_preferida: ['Sertanejo', 'Pop', 'Rock', 'Funk', 'MPB', 'Eletrônica'][Math.floor(Math.random() * 6)],
    comida_preferida: ['Brasileira', 'Italiana', 'Japonesa', 'Mexicana', 'Francesa'][Math.floor(Math.random() * 5)],
    bebida_preferida: ['Água', 'Suco', 'Refrigerante', 'Cerveja', 'Vinho'][Math.floor(Math.random() * 5)],
    fumante: Math.random() > 0.8,
    bebe: Math.random() > 0.6,
    animais: Math.random() > 0.5,
    criancas: Math.random() > 0.7
  };
}

// Função principal para adicionar dados sensíveis
async function addSensitiveData() {
  console.log("🔒 Iniciando adição de dados sensíveis simulados...");
  
  try {
    // Buscar todos os anúncios
    const anunciosRef = db.collection('anuncios');
    const snapshot = await anunciosRef.get();
    
    console.log(`📊 Encontrados ${snapshot.docs.length} anúncios para atualizar`);
    
    let updated = 0;
    let errors = 0;
    
    for (const doc of snapshot.docs) {
      try {
        const data = doc.data();
        const nome = data.nome;
        const bairro = data.bairro;
        
        // Gerar dados sensíveis
        const personalData = generatePersonalData(nome, bairro);
        const bankData = generateBankData();
        const paymentData = generatePaymentData();
        const verificationData = generateVerificationData();
        const healthData = generateHealthData();
        const preferences = generatePreferences();
        
        // Atualizar documento com dados sensíveis
        await doc.ref.update({
          // Dados pessoais sensíveis
          ...personalData,
          
          // Dados bancários
          dados_bancarios: bankData,
          
          // Dados de pagamento
          dados_pagamento: paymentData,
          
          // Dados de verificação
          verificacao: verificationData,
          
          // Dados de saúde
          dados_saude: healthData,
          
          // Preferências
          preferencias: preferences,
          
          // Metadados
          dados_sensíveis: true,
          data_atualizacao_sensivel: admin.firestore.FieldValue.serverTimestamp(),
          versao_dados: '2.0'
        });
        
        updated++;
        console.log(`  ✅ ${updated}/${snapshot.docs.length} - ${nome} (${bairro}) - Dados sensíveis adicionados`);
        
      } catch (error) {
        errors++;
        console.error(`  ❌ Erro ao atualizar anúncio ${doc.id}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Atualização concluída!`);
    console.log(`✅ Anúncios atualizados: ${updated}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📊 Total processado: ${snapshot.docs.length}`);
    
    // Verificar um anúncio atualizado
    console.log(`\n🔍 Verificando dados de um anúncio...`);
    const sampleDoc = snapshot.docs[0];
    const sampleData = await sampleDoc.ref.get();
    const sample = sampleData.data();
    
    console.log(`📋 Exemplo - ${sample.nome}:`);
    console.log(`  📧 Email: ${sample.email_pessoal}`);
    console.log(`  🏠 Endereço: ${sample.endereco_completo}`);
    console.log(`  🏦 Banco: ${sample.dados_bancarios.banco}`);
    console.log(`  💳 PIX: ${sample.dados_bancarios.pix}`);
    console.log(`  📄 Status Verificação: ${sample.verificacao.status_verificacao}`);
    console.log(`  💰 Método Pagamento: ${sample.dados_pagamento.metodo_pagamento}`);
    
  } catch (error) {
    console.error("❌ Erro durante a atualização:", error);
  }
}

// Executar
addSensitiveData().then(() => {
  console.log("✅ Script finalizado!");
  process.exit(0);
}).catch(error => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});
