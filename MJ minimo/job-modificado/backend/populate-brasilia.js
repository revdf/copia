// Script para popular o Firebase com dados de teste - APENAS BRASÍLIA
// Cria 25 anúncios para cada categoria, todos em Brasília

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

// Lista de fotos disponíveis
const fotosDisponiveis = [
  'foto (1).jpg', 'foto (2).jpg', 'foto (3).jpg', 'foto (4).jpg', 'foto (5).jpg',
  'foto (6).jpg', 'foto (7).jpg', 'foto (8).jpg', 'foto (9).jpg', 'foto (10).jpg',
  'foto (11).jpg', 'foto (12).jpg', 'foto (13).jpg', 'foto (14).jpg', 'foto (15).jpg',
  'foto (16).jpg', 'foto (17).jpg', 'foto (18).jpg', 'foto (19).jpg', 'foto (20).jpg',
  'foto (21).jpg', 'foto (22).jpg', 'foto (23).jpg', 'foto (24).jpg', 'foto (25).jpg',
  'foto (26).jpg', 'foto (27).jpg', 'foto (28).jpg', 'foto (29).jpg', 'foto (30).jpg',
  'avatar.jpg', 'avatar (2).jpg', 'avatar (3).jpg', 'avatar (4).jpg', 'avatar (5).jpg',
  'avatar (6).jpg', 'avatar (7).jpg', 'avatar (8).jpg', 'avatar (9).jpg', 'avatar (10).jpg',
  'avatar (11).jpg', 'avatar (12).jpg', 'avatar (13).jpg', 'avatar (14).jpg', 'avatar (15).jpg',
  'a1.jpg', 'a2.jpg', 'a3.jpg', 'd4.jpg', 'Stories.jpg', '46_62fa0.jpg'
];

// Bairros de Brasília (Regiões Administrativas)
const bairrosBrasilia = [
  'Asa Norte', 'Asa Sul', 'Lago Sul', 'Lago Norte', 'Sudoeste', 'Noroeste',
  'Águas Claras', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Gama', 'Santa Maria',
  'São Sebastião', 'Planaltina', 'Sobradinho', 'Sobradinho II', 'Brazlândia',
  'Candangolândia', 'Cruzeiro', 'Guará', 'Núcleo Bandeirante', 'Paranoá',
  'Park Way', 'Riacho Fundo', 'Riacho Fundo II', 'Recanto das Emas',
  'SIA', 'SCIA', 'SIG', 'SIN', 'SIT', 'SIV', 'SML', 'SMU', 'SMV',
  'Vicente Pires', 'Arniqueira', 'Fercal', 'Itapoã', 'Jardim Botânico',
  'Varjão', 'Estrutural', 'Sol Nascente', 'Pôr do Sol'
];

// Função para selecionar fotos aleatórias
function getRandomPhotos(count = 6) {
  const shuffled = [...fotosDisponiveis].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Função para gerar telefone aleatório (DDD 61 - Brasília)
function getRandomPhone() {
  const number = Math.floor(Math.random() * 900000000) + 100000000;
  return `+5561${number}`;
}

// Função para gerar WhatsApp aleatório (DDD 61 - Brasília)
function getRandomWhatsApp() {
  const number = Math.floor(Math.random() * 900000000) + 100000000;
  return `+5561${number}`;
}

// Função para gerar preço baseado na categoria
function getPriceByCategory(categoria) {
  const prices = {
    'premium': [400, 500, 600, 700, 800, 900, 1000],
    'massagista': [150, 200, 250, 300, 350, 400],
    'trans': [200, 250, 300, 350, 400, 450],
    'homem': [200, 250, 300, 350, 400, 450],
    'webcam': [50, 80, 100, 120, 150, 200]
  };
  const categoryPrices = prices[categoria] || [100, 150, 200, 250, 300];
  return categoryPrices[Math.floor(Math.random() * categoryPrices.length)];
}

// Função para gerar idade aleatória
function getRandomAge() {
  return Math.floor(Math.random() * 25) + 18; // 18-42 anos
}

// Função para selecionar bairro aleatório de Brasília
function getRandomBairro() {
  return bairrosBrasilia[Math.floor(Math.random() * bairrosBrasilia.length)];
}

// Função para gerar descrição baseada na categoria
function getDescriptionByCategory(categoria, nome, bairro) {
  const descriptions = {
    'premium': [
      `Acompanhante de luxo ${nome} em ${bairro}, elegância e sofisticação em cada encontro.`,
      `Garota de programa premium ${nome} no ${bairro}, atendimento de luxo com total discrição.`,
      `Modelo premium ${nome} em ${bairro}, beleza natural e atendimento personalizado.`,
      `Escort de luxo ${nome} no ${bairro}, momentos especiais com total privacidade.`,
      `Acompanhante VIP ${nome} em ${bairro}, experiência única e inesquecível.`
    ],
    'massagista': [
      `Massagista profissional ${nome} em ${bairro}, relaxamento total e bem-estar garantido.`,
      `Terapeuta especializada ${nome} no ${bairro}, técnicas avançadas de relaxamento.`,
      `Massagista qualificada ${nome} em ${bairro}, atendimento personalizado e discreto.`,
      `Profissional em massagens ${nome} no ${bairro}, alívio do stress e tensões do dia a dia.`,
      `Massagista experiente ${nome} em ${bairro}, momentos de relaxamento e prazer.`
    ],
    'trans': [
      `Garota trans elegante ${nome} em ${bairro}, momentos únicos de prazer e diversão.`,
      `Transexual linda e sensual ${nome} no ${bairro}, atendimento especial e carinhoso.`,
      `Escort trans ${nome} em ${bairro}, atendimento personalizado e muito carinho.`,
      `Modelo trans ${nome} no ${bairro}, experiência marcante com total respeito.`,
      `Acompanhante trans ${nome} em ${bairro}, beleza e sensualidade em cada encontro.`
    ],
    'homem': [
      `Garoto de programa ${nome} em ${bairro}, atendimento masculino com total discrição.`,
      `Acompanhante VIP masculino ${nome} no ${bairro}, experiência premium personalizada.`,
      `Modelo masculino ${nome} em ${bairro}, beleza e charme para momentos únicos.`,
      `Escort masculino ${nome} no ${bairro}, elegância e sofisticação em cada encontro.`,
      `Acompanhante masculino ${nome} em ${bairro}, momentos especiais e inesquecíveis.`
    ],
    'webcam': [
      `Webcam girl ${nome} em ${bairro}, entretenimento adulto de alta qualidade.`,
      `Modelo cam ${nome} no ${bairro}, shows exclusivos e momentos de prazer.`,
      `Modelo online ${nome} em ${bairro}, shows privados e interação direta.`,
      `Modelo webcam ${nome} no ${bairro}, shows ao vivo e interação personalizada.`,
      `Webcam girl ${nome} em ${bairro}, entretenimento adulto de alta qualidade.`
    ]
  };
  const categoryDescriptions = descriptions[categoria] || [`Acompanhante ${nome} em ${bairro}, atendimento de qualidade.`];
  return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
}

// Função para gerar nome baseado na categoria
function getNameByCategory(categoria, index) {
  const names = {
    'premium': ['Isabella', 'Sophia', 'Valentina', 'Manuela', 'Giovanna', 'Alice', 'Laura', 'Luiza', 'Beatriz', 'Heloísa', 'Lívia', 'Maria Eduarda', 'Cecília', 'Eloá', 'Lara', 'Maria Clara', 'Isadora', 'Antonella', 'Esther', 'Pietra', 'Lavínia', 'Vitória', 'Bianca', 'Catarina', 'Lorena'],
    'massagista': ['Ana', 'Maria', 'Fernanda', 'Camila', 'Juliana', 'Patrícia', 'Aline', 'Sandra', 'Denise', 'Márcia', 'Renata', 'Cristina', 'Adriana', 'Simone', 'Luciana', 'Vanessa', 'Priscila', 'Daniela', 'Mônica', 'Tatiana', 'Luciana', 'Silvia', 'Regina', 'Eliane', 'Rosana'],
    'trans': ['Luna', 'Aurora', 'Bella', 'Stella', 'Luna', 'Aria', 'Nova', 'Zara', 'Maya', 'Iris', 'Violet', 'Ruby', 'Jade', 'Sage', 'Ivy', 'Hazel', 'Willow', 'Poppy', 'Daisy', 'Rose', 'Lily', 'Iris', 'Violet', 'Ruby', 'Jade'],
    'homem': ['Gabriel', 'Rafael', 'Lucas', 'Mateus', 'Gustavo', 'Arthur', 'Felipe', 'Bruno', 'Eduardo', 'Diego', 'Thiago', 'Rodrigo', 'Marcelo', 'André', 'Carlos', 'João', 'Pedro', 'Henrique', 'Vitor', 'Caio', 'Leonardo', 'Nicolas', 'Samuel', 'Daniel', 'Antônio'],
    'webcam': ['Luna', 'Stella', 'Aria', 'Nova', 'Zara', 'Maya', 'Iris', 'Violet', 'Ruby', 'Jade', 'Sage', 'Ivy', 'Hazel', 'Willow', 'Poppy', 'Daisy', 'Rose', 'Lily', 'Iris', 'Violet', 'Ruby', 'Jade', 'Sage', 'Ivy', 'Hazel']
  };
  const categoryNames = names[categoria] || ['Ana', 'Maria', 'João', 'Pedro', 'Lucas'];
  return categoryNames[index % categoryNames.length];
}

// Função para criar anúncio
function createAdvertisement(categoria, index) {
  const nome = getNameByCategory(categoria, index);
  const fotos = getRandomPhotos(6);
  const bairro = getRandomBairro();
  const preco = getPriceByCategory(categoria);
  const idade = getRandomAge();
  const telefone = getRandomPhone();
  const whatsapp = getRandomWhatsApp();
  const descricao = getDescriptionByCategory(categoria, nome, bairro);

  return {
    // Dados básicos
    nome: nome,
    name: nome,
    categoria: categoria,
    category: categoria,
    tipo: categoria,
    status: 'ativo',
    
    // Dados pessoais
    idade: idade,
    age: idade,
    cidade: 'Brasília',
    city: 'Brasília',
    estado: 'DF',
    state: 'DF',
    bairro: bairro,
    neighborhood: bairro,
    
    // Contato
    telefone: telefone,
    phone: telefone,
    whatsapp: whatsapp,
    
    // Preços
    preco: preco,
    price: preco,
    preco_hora: preco,
    price_per_hour: preco,
    
    // Descrições
    descricao: descricao,
    description: descricao,
    
    // Imagens
    foto_capa: fotos[0],
    coverImage: fotos[0],
    foto_stories: fotos[1],
    profileImage: fotos[1],
    galeria_1: fotos[2],
    galeria_2: fotos[3],
    galeria_3: fotos[4],
    galeria_4: fotos[5],
    galeria_5: fotos[0],
    galeria_6: fotos[1],
    images: fotos,
    
    // Status
    ativo: true,
    verificado: true,
    destaque: Math.random() > 0.7, // 30% chance de ser destaque
    views: Math.floor(Math.random() * 1000) + 50,
    likes: Math.floor(Math.random() * 100) + 10,
    
    // Metadados
    environment: 'test',
    project: 'copia-do-job',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
}

// Função principal para popular o Firebase
async function populateBrasilia() {
  console.log("🏛️ Iniciando população do Firebase - APENAS BRASÍLIA...");
  console.log(`📍 Bairros disponíveis: ${bairrosBrasilia.length}`);
  
  const categorias = ['premium', 'massagista', 'trans', 'homem', 'webcam'];
  const anunciosPorCategoria = 25;
  
  try {
    // Limpar dados existentes
    console.log("🗑️ Limpando dados existentes...");
    const anunciosRef = db.collection('anuncios');
    const snapshot = await anunciosRef.get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✅ ${snapshot.docs.length} anúncios antigos removidos`);
    
    // Criar novos anúncios
    console.log("📝 Criando novos anúncios para Brasília...");
    
    for (const categoria of categorias) {
      console.log(`\n📋 Criando anúncios para categoria: ${categoria.toUpperCase()}`);
      
      for (let i = 0; i < anunciosPorCategoria; i++) {
        const anuncio = createAdvertisement(categoria, i);
        
        try {
          await anunciosRef.add(anuncio);
          console.log(`  ✅ ${i + 1}/25 - ${anuncio.nome} (${anuncio.bairro}/DF) - R$ ${anuncio.preco}`);
        } catch (error) {
          console.error(`  ❌ Erro ao criar anúncio ${i + 1}:`, error.message);
        }
      }
      
      console.log(`✅ ${anunciosPorCategoria} anúncios criados para ${categoria}`);
    }
    
    // Verificar total
    const finalSnapshot = await anunciosRef.get();
    console.log(`\n🎉 População concluída!`);
    console.log(`📊 Total de anúncios: ${finalSnapshot.docs.length}`);
    console.log(`🏛️ Todos em Brasília/DF`);
    console.log(`📋 Categorias: ${categorias.join(', ')}`);
    console.log(`📍 Bairros utilizados: ${bairrosBrasilia.length} diferentes`);
    console.log(`🖼️ Fotos utilizadas: ${fotosDisponiveis.length} diferentes`);
    
    // Estatísticas por bairro
    console.log(`\n📊 Distribuição por bairro:`);
    const bairroStats = {};
    finalSnapshot.docs.forEach(doc => {
      const bairro = doc.data().bairro;
      bairroStats[bairro] = (bairroStats[bairro] || 0) + 1;
    });
    
    Object.entries(bairroStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([bairro, count]) => {
        console.log(`  📍 ${bairro}: ${count} anúncios`);
      });
    
  } catch (error) {
    console.error("❌ Erro durante a população:", error);
  }
}

// Executar
populateBrasilia().then(() => {
  console.log("✅ Script finalizado!");
  process.exit(0);
}).catch(error => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});
