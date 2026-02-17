// Script para popular o banco de dados Firebase com dados de teste
// Este script cria anúncios para todas as categorias usando as fotos disponíveis

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

const db = admin.firestore();

// Lista de fotos disponíveis
const fotos = [
  "46_62fa0.jpg", "a1.jpg", "a2.jpg", "a3.jpg", "ai-generated-8677975_1280.jpg",
  "avatar (10).jpg", "avatar (11).jpg", "avatar (12).jpg", "avatar (13).jpg", "avatar (14).jpg",
  "avatar (15).jpg", "avatar (2).jpg", "avatar (3).jpg", "avatar (4).jpg", "avatar (5).jpg",
  "avatar (6).jpg", "avatar (7).jpg", "avatar (8).jpg", "avatar (9).jpg", "avatar.jpg",
  "banner-1754067033862-450989503.jpg", "banner-1754069202781-935737209.jpg", "banner-1754069235482-384004072.jpg",
  "banner-1758325591837-144474964.jpg", "banner-1758344326693-728967205.jpg", "d4.jpg",
  "fantasy-8643203_1280.jpg", "fantasy-8777508_1280.jpg", "foto (1).jpg", "foto (10).jpg",
  "foto (11).jpg", "foto (12).jpg", "foto (14).jpg", "foto (15).jpg", "foto (16).jpg",
  "foto (17).jpg", "foto (18).jpg", "foto (19).jpg", "foto (2).jpg", "foto (20).jpg",
  "foto (21).jpg", "foto (23).jpg", "foto (24).jpg", "foto (25).jpg", "foto (26).jpg",
  "foto (27).jpg", "foto (28).jpg", "foto (29).jpg", "foto (3).jpg", "foto (30).jpg",
  "foto (4).jpg", "foto (6).jpg", "foto (7).jpg", "foto (9).jpg", "gallery-1754066002497-392420749.jpg",
  "gallery-1754066002498-190062412.jpg", "gallery-1754067033863-877995329.jpg", "gallery-1754067033864-643429901.jpg",
  "gallery-1754067033866-783292598.jpg", "gallery-1754067033867-856036152.jpg", "gallery-1754067033868-42282832.jpg",
  "gallery-1754067033875-866454060.jpg", "gallery-1754067242464-204946083.jpg", "gallery-1754067242465-583263449.jpg",
  "gallery-1754067242468-113506136.jpg", "gallery-1754067242469-235838273.jpg", "gallery-1754067242470-512007312.jpg",
  "gallery-1754067242471-447468496.jpg", "gallery-1754067242474-673008590.jpg", "gallery-1754069202782-176082186.jpg",
  "gallery-1754069235483-707578537.jpg", "gallery-1758325591839-201375365.jpg", "gallery-1758328749449-406070344.jpg",
  "gallery-1758328749451-202689672.jpg", "gallery-1758328749452-79075247.jpg", "gallery-1758328749453-605633108.jpg",
  "gallery-1758344326695-924859152.jpg", "gallery-1758344326696-342217565.jpg", "gallery-1758344326697-419020392.jpg",
  "one-person-8742116_1280.jpg", "outdoors-7213961_1280.jpg", "Stories.jpg"
];

// Função para obter fotos aleatórias
function getRandomFotos(count) {
  const shuffled = [...fotos].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Função para gerar nome aleatório
function getRandomName() {
  const nomes = [
    "Ana", "Beatriz", "Camila", "Diana", "Elena", "Fernanda", "Gabriela", "Helena", "Isabela", "Julia",
    "Karina", "Larissa", "Mariana", "Natália", "Olivia", "Patricia", "Rafaela", "Sofia", "Tatiana", "Valentina",
    "Alex", "Bruno", "Carlos", "Diego", "Eduardo", "Felipe", "Gabriel", "Henrique", "Igor", "João",
    "Kaique", "Lucas", "Marcos", "Nicolas", "Otávio", "Pedro", "Rafael", "Samuel", "Thiago", "Vitor"
  ];
  return nomes[Math.floor(Math.random() * nomes.length)];
}

// Função para gerar descrição aleatória
function getRandomDescription(categoria) {
  const descricoes = {
    premium: [
      "Garota de programa premium, atendimento de luxo com total discrição.",
      "Acompanhante de alto padrão, experiência única e inesquecível.",
      "Modelo premium, beleza natural e atendimento personalizado.",
      "Escort de luxo, elegância e sofisticação em cada encontro.",
      "Acompanhante VIP, momentos especiais com total privacidade."
    ],
    massagista: [
      "Massagista profissional, relaxamento total e bem-estar garantido.",
      "Terapeuta especializada em massagens relaxantes e terapêuticas.",
      "Massagista experiente, alívio do stress e tensões do dia a dia.",
      "Profissional em massagens, técnicas avançadas de relaxamento.",
      "Massagista qualificada, atendimento personalizado e discreto."
    ],
    trans: [
      "Transexual linda e sensual, atendimento especial e carinhoso.",
      "Garota trans elegante, momentos únicos de prazer e diversão.",
      "Acompanhante trans, beleza e sensualidade em cada encontro.",
      "Modelo trans, experiência marcante com total respeito.",
      "Escort trans, atendimento personalizado e muito carinho."
    ],
    homem: [
      "Garoto de programa, atendimento masculino com total discrição.",
      "Acompanhante masculino, momentos especiais e inesquecíveis.",
      "Escort masculino, elegância e sofisticação em cada encontro.",
      "Modelo masculino, beleza e charme para momentos únicos.",
      "Acompanhante VIP masculino, experiência premium personalizada."
    ],
    webcam: [
      "Modelo webcam, shows ao vivo e interação personalizada.",
      "Garota de webcam, diversão garantida em tempo real.",
      "Modelo cam, shows exclusivos e momentos de prazer.",
      "Webcam girl, entretenimento adulto de alta qualidade.",
      "Modelo online, shows privados e interação direta."
    ]
  };
  
  const lista = descricoes[categoria] || descricoes.premium;
  return lista[Math.floor(Math.random() * lista.length)];
}

// Função para gerar preço baseado na categoria
function getRandomPrice(categoria) {
  const precos = {
    premium: [300, 400, 500, 600, 700, 800],
    massagista: [150, 200, 250, 300, 350],
    trans: [200, 250, 300, 350, 400],
    homem: [200, 250, 300, 350, 400],
    webcam: [50, 80, 100, 120, 150]
  };
  
  const lista = precos[categoria] || precos.premium;
  return lista[Math.floor(Math.random() * lista.length)];
}

// Função para gerar telefone aleatório
function getRandomPhone() {
  const ddd = ["11", "21", "31", "41", "51", "61", "71", "81", "85", "92"];
  const numero = Math.floor(Math.random() * 90000000) + 10000000;
  return `+55${ddd[Math.floor(Math.random() * ddd.length)]}${numero}`;
}

// Função para criar anúncio
async function criarAnuncio(categoria, index) {
  const fotosSelecionadas = getRandomFotos(8);
  const nome = getRandomName();
  const preco = getRandomPrice(categoria);
  
  const anuncio = {
    // Dados básicos
    nome: nome,
    name: nome, // fallback
    categoria: categoria,
    category: categoria, // fallback
    status: "ativo",
    
    // Imagens
    foto_capa: fotosSelecionadas[0],
    coverImage: fotosSelecionadas[0], // fallback
    foto_stories: fotosSelecionadas[1],
    profileImage: fotosSelecionadas[1], // fallback
    galeria_1: fotosSelecionadas[2],
    galeria_2: fotosSelecionadas[3],
    galeria_3: fotosSelecionadas[4],
    galeria_4: fotosSelecionadas[5],
    galeria_5: fotosSelecionadas[6],
    galeria_6: fotosSelecionadas[7],
    images: fotosSelecionadas,
    
    // Localização
    cidade: "São Paulo",
    city: "São Paulo", // fallback
    estado: "SP",
    state: "SP", // fallback
    bairro: "Centro",
    neighborhood: "Centro", // fallback
    
    // Contato
    telefone: getRandomPhone(),
    phone: getRandomPhone(), // fallback
    whatsapp: getRandomPhone(),
    
    // Preços
    preco: preco,
    price: preco, // fallback
    preco_hora: preco,
    price_per_hour: preco, // fallback
    
    // Descrição
    descricao: getRandomDescription(categoria),
    description: getRandomDescription(categoria), // fallback
    
    // Metadados
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    environment: "test",
    project: "copia-do-job",
    tipo: categoria,
    ativo: true,
    verificado: true,
    destaque: Math.random() > 0.7, // 30% chance de ser destaque
    views: Math.floor(Math.random() * 1000),
    likes: Math.floor(Math.random() * 100)
  };
  
  try {
    const docRef = await db.collection('anuncios').add(anuncio);
    console.log(`✅ ${categoria} ${index + 1}: ${nome} - R$ ${preco} (ID: ${docRef.id})`);
    return docRef.id;
  } catch (error) {
    console.error(`❌ Erro ao criar ${categoria} ${index + 1}:`, error.message);
    return null;
  }
}

// Função principal
async function popularBanco() {
  console.log("🚀 Iniciando população do banco de dados Firebase...");
  console.log(`📊 Projeto: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`🌍 Ambiente: ${process.env.ENVIRONMENT}`);
  console.log(`📸 Fotos disponíveis: ${fotos.length}`);
  console.log("");
  
  const categorias = {
    premium: 50,
    massagista: 20,
    trans: 20,
    homem: 20,
    webcam: 20
  };
  
  let totalCriados = 0;
  const idsCriados = [];
  
  for (const [categoria, quantidade] of Object.entries(categorias)) {
    console.log(`📝 Criando ${quantidade} anúncios de ${categoria.toUpperCase()}...`);
    
    for (let i = 0; i < quantidade; i++) {
      const id = await criarAnuncio(categoria, i);
      if (id) {
        idsCriados.push(id);
        totalCriados++;
      }
      
      // Pequena pausa para não sobrecarregar o Firebase
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ ${categoria.toUpperCase()}: ${quantidade} anúncios criados`);
    console.log("");
  }
  
  console.log("🎉 POPULAÇÃO CONCLUÍDA!");
  console.log(`📊 Total de anúncios criados: ${totalCriados}`);
  console.log(`📋 Categorias:`);
  console.log(`   - Premium: 50 anúncios`);
  console.log(`   - Massagista: 20 anúncios`);
  console.log(`   - Trans: 20 anúncios`);
  console.log(`   - Homem: 20 anúncios`);
  console.log(`   - Webcam: 20 anúncios`);
  console.log("");
  console.log("🔗 Verifique os dados no Firebase Console:");
  console.log(`   https://console.firebase.google.com/u/0/project/${process.env.FIREBASE_PROJECT_ID}/firestore`);
  console.log("");
  console.log("🧪 Para testar via API:");
  console.log("   curl http://localhost:5001/api/anuncios");
  
  process.exit(0);
}

// Executar
popularBanco().catch(error => {
  console.error("❌ Erro na população do banco:", error);
  process.exit(1);
});















