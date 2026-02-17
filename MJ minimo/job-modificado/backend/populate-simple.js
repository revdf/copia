import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
  console.log('✅ Firebase Admin inicializado');
}

const db = admin.firestore();

// Configurações dos níveis conforme especificação
const LEVELS_CONFIG = {
  N1: { count: 29, name: "Premium VIP", priceMultiplier: 2.0 },
  N3: { count: 15, name: "Destaque", priceMultiplier: 1.5 },
  N7: { count: 199, name: "Padrão", priceMultiplier: 1.0 }
};

const CATEGORIES = ['mulheres', 'massagistas', 'trans', 'homens'];
const FOTOS_PATH = '/Users/troll/Desktop/copia do job/fotinha/fotos';

// Nomes por categoria
const NAMES_BY_CATEGORY = {
  mulheres: ['Ana', 'Maria', 'Julia', 'Sofia', 'Camila', 'Isabella', 'Lara', 'Beatriz', 'Gabriela', 'Mariana', 'Fernanda', 'Amanda', 'Carolina', 'Patricia', 'Aline', 'Renata', 'Vanessa', 'Cristina', 'Monica', 'Adriana', 'Luciana', 'Silvia', 'Roberta', 'Daniela', 'Priscila', 'Tatiana', 'Juliana', 'Fabiana', 'Alessandra', 'Raquel'],
  massagistas: ['Luna', 'Valentina', 'Bianca', 'Aurora', 'Estrela', 'Diva', 'Princesa', 'Rainha', 'Goddess', 'Venus', 'Athena', 'Aphrodite', 'Cleopatra', 'Nefertiti', 'Isis', 'Hera', 'Demeter', 'Persephone', 'Artemis', 'Diana', 'Freya', 'Frigg', 'Sif', 'Idun', 'Hel', 'Ran', 'Skadi', 'Gerd', 'Nanna', 'Sigyn'],
  trans: ['Luna', 'Valentina', 'Bianca', 'Aurora', 'Estrela', 'Diva', 'Princesa', 'Rainha', 'Goddess', 'Venus', 'Athena', 'Aphrodite', 'Cleopatra', 'Nefertiti', 'Isis', 'Hera', 'Demeter', 'Persephone', 'Artemis', 'Diana', 'Freya', 'Frigg', 'Sif', 'Idun', 'Hel', 'Ran', 'Skadi', 'Gerd', 'Nanna', 'Sigyn'],
  homens: ['João', 'Pedro', 'Carlos', 'Rafael', 'Lucas', 'Gabriel', 'Diego', 'Bruno', 'Felipe', 'André', 'Marcos', 'Rodrigo', 'Thiago', 'Gustavo', 'Eduardo', 'Fernando', 'Ricardo', 'Alexandre', 'Daniel', 'Antonio', 'Roberto', 'Paulo', 'José', 'Francisco', 'Luiz', 'Miguel', 'Henrique', 'Vitor', 'Leonardo', 'Matheus'],
};

const SURNAMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa'];
const BAIRROS_BRASILIA = ['Asa Norte', 'Asa Sul', 'Lago Sul', 'Lago Norte', 'Sudoeste', 'Noroeste', 'Guará', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Gama', 'Santa Maria', 'São Sebastião', 'Planaltina', 'Sobradinho', 'Brazlândia', 'Recanto das Emas', 'Riacho Fundo', 'Candangolândia', 'Núcleo Bandeirante', 'Park Way', 'Vicente Pires'];

// Carregar fotos disponíveis
function loadAvailablePhotos() {
  try {
    const photos = fs.readdirSync(FOTOS_PATH)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .map(file => path.join(FOTOS_PATH, file));
    
    console.log(`📸 ${photos.length} fotos carregadas`);
    return photos;
  } catch (error) {
    console.error('❌ Erro ao carregar fotos:', error.message);
    return [];
  }
}

// Gerar nome aleatório
function generateName(categoria) {
  const names = NAMES_BY_CATEGORY[categoria] || NAMES_BY_CATEGORY.mulheres;
  const name = names[Math.floor(Math.random() * names.length)];
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  return `${name} ${surname}`;
}

// Gerar preço baseado na categoria e nível
function generatePrice(categoria, level) {
  const basePrices = {
    mulheres: { min: 300, max: 800 },
    massagistas: { min: 200, max: 500 },
    trans: { min: 250, max: 600 },
    homens: { min: 200, max: 500 },
  };
  
  const basePrice = basePrices[categoria] || basePrices.mulheres;
  const multiplier = LEVELS_CONFIG[level].priceMultiplier;
  const baseAmount = basePrice.min + Math.random() * (basePrice.max - basePrice.min);
  const finalAmount = Math.floor(baseAmount * multiplier);
  
  return {
    preco_30min: Math.floor(finalAmount * 0.6).toString(),
    preco_45min: Math.floor(finalAmount * 0.8).toString(),
    preco_1h: finalAmount.toString()
  };
}

// Gerar telefone aleatório
function generatePhone() {
  const ddd = ['11', '21', '31', '41', '51', '61', '71', '81', '85', '95'];
  const numero = Math.floor(Math.random() * 90000000) + 10000000;
  return `+55${ddd[Math.floor(Math.random() * ddd.length)]}${numero}`;
}

// Selecionar fotos aleatórias
function selectRandomPhotos(availablePhotos, count = 8) {
  const selected = [];
  for (let i = 0; i < count; i++) {
    const photo = availablePhotos[Math.floor(Math.random() * availablePhotos.length)];
    selected.push(photo);
  }
  return selected;
}

// Criar anúncio
function createAdvertisement(categoria, level, index, availablePhotos) {
  const nome = generateName(categoria);
  const fotos = selectRandomPhotos(availablePhotos, 8);
  const preco = generatePrice(categoria, level);
  const bairro = BAIRROS_BRASILIA[Math.floor(Math.random() * BAIRROS_BRASILIA.length)];
  const levelConfig = LEVELS_CONFIG[level];
  
  return {
    // Dados básicos
    nome: nome,
    name: nome,
    categoria: categoria,
    category: categoria,
    tipo: categoria,
    status: 'ativo',
    
    // Nível e destaque
    nivel: level,
    level: level,
    nivel_nome: levelConfig.name,
    level_name: levelConfig.name,
    destaque: level === 'N1' || level === 'N3',
    premium: level === 'N1',
    
    // Dados pessoais
    idade: (18 + Math.floor(Math.random() * 20)).toString(),
    age: (18 + Math.floor(Math.random() * 20)).toString(),
    cidade: 'Brasília',
    city: 'Brasília',
    estado: 'DF',
    state: 'DF',
    bairro: bairro,
    neighborhood: bairro,
    
    // Contato
    telefone: generatePhone(),
    phone: generatePhone(),
    whatsapp: generatePhone(),
    
    // Preços
    preco: preco.preco_1h,
    price: preco.preco_1h,
    preco_hora: preco.preco_1h,
    price_per_hour: preco.preco_1h,
    preco_30min: preco.preco_30min,
    preco_45min: preco.preco_45min,
    preco_1h: preco.preco_1h,
    
    // Descrições
    descricao: `Sou uma ${categoria === 'homem' ? 'pessoa' : 'mulher'} elegante e sofisticada, pronta para proporcionar momentos únicos e inesquecíveis.`,
    description: `Sou uma ${categoria === 'homem' ? 'pessoa' : 'mulher'} elegante e sofisticada, pronta para proporcionar momentos únicos e inesquecíveis.`,
    
    // Imagens - TODOS têm fotos para stories
    foto_capa: fotos[0],
    coverImage: fotos[0],
    foto_stories: fotos[1], // OBRIGATÓRIO para stories
    profileImage: fotos[1],
    galeria_1: fotos[2],
    galeria_2: fotos[3],
    galeria_3: fotos[4],
    galeria_4: fotos[5],
    galeria_5: fotos[6],
    galeria_6: fotos[7],
    images: fotos,
    
    // Status e metadados
    ativo: true,
    verificado: true,
    views: Math.floor(Math.random() * 1000) + 50,
    likes: Math.floor(Math.random() * 100) + 10,
    
    // Metadados
    environment: 'test',
    project: 'copia-do-job',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
}

// Função principal para popular o banco
async function populateSimple() {
  try {
    console.log('🚀 Iniciando população do banco com níveis N1, N3, N7...');
    
    // Carregar fotos disponíveis
    const availablePhotos = loadAvailablePhotos();
    if (availablePhotos.length === 0) {
      console.error('❌ Nenhuma foto encontrada! Verifique o caminho:', FOTOS_PATH);
      return;
    }
    
    // Limpar dados existentes
    console.log('🗑️ Limpando dados existentes...');
    const anunciosRef = db.collection('anuncios');
    const snapshot = await anunciosRef.get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✅ ${snapshot.docs.length} anúncios antigos removidos`);
    
    let totalCreated = 0;
    
    // Criar anúncios para cada categoria
    for (const categoria of CATEGORIES) {
      console.log(`\n📂 Processando categoria: ${categoria.toUpperCase()}`);
      
      // Criar anúncios para cada nível
      for (const [level, config] of Object.entries(LEVELS_CONFIG)) {
        console.log(`  📋 Criando ${config.count} anúncios ${level} (${config.name})...`);
        
        for (let i = 0; i < config.count; i++) {
          try {
            const anuncio = createAdvertisement(categoria, level, i, availablePhotos);
            await anunciosRef.add(anuncio);
            totalCreated++;
            
            if ((i + 1) % 10 === 0 || i === config.count - 1) {
              console.log(`    ✅ ${i + 1}/${config.count} anúncios ${level} criados`);
            }
          } catch (error) {
            console.error(`    ❌ Erro ao criar anúncio ${i + 1} ${level}:`, error.message);
          }
        }
        
        console.log(`  ✅ ${config.count} anúncios ${level} criados para ${categoria}`);
      }
    }
    
    // Verificar resultado final
    const finalSnapshot = await anunciosRef.get();
    console.log(`\n🎉 População concluída!`);
    console.log(`📊 Total de anúncios criados: ${totalCreated}`);
    console.log(`📊 Total no banco: ${finalSnapshot.docs.length}`);
    
    // Estatísticas por categoria e nível
    console.log(`\n📊 Distribuição por categoria e nível:`);
    for (const categoria of CATEGORIES) {
      console.log(`\n  ${categoria.toUpperCase()}:`);
      for (const [level, config] of Object.entries(LEVELS_CONFIG)) {
        console.log(`    ${level}: ${config.count} anúncios (${config.name})`);
      }
    }
    
    // Verificar stories
    const storiesCount = finalSnapshot.docs.filter(doc => doc.data().foto_stories).length;
    console.log(`\n📸 Anúncios com fotos para stories: ${storiesCount}/${finalSnapshot.docs.length}`);
    
    if (storiesCount === finalSnapshot.docs.length) {
      console.log('✅ Todos os anúncios têm fotos para stories!');
    } else {
      console.log('⚠️ Alguns anúncios não têm fotos para stories');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    process.exit(0);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  populateSimple();
}

export { populateSimple, LEVELS_CONFIG, CATEGORIES };












