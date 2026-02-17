// Script para adicionar níveis aos anúncios existentes
// Usa a API existente para criar novos anúncios com níveis

import fs from 'fs';
import path from 'path';

// Configurações dos níveis
const LEVELS_CONFIG = {
  N1: { count: 29, name: "Premium VIP", priceMultiplier: 2.0 },
  N3: { count: 15, name: "Destaque", priceMultiplier: 1.5 },
  N7: { count: 199, name: "Padrão", priceMultiplier: 1.0 }
};

const CATEGORIES = ['mulheres', 'massagistas', 'trans', 'homens', 'webcam'];

// Nomes por categoria
const NAMES_BY_CATEGORY = {
  mulheres: ['Ana', 'Maria', 'Julia', 'Sofia', 'Camila', 'Isabella', 'Lara', 'Beatriz', 'Gabriela', 'Mariana', 'Fernanda', 'Amanda', 'Carolina', 'Patricia', 'Aline', 'Renata', 'Vanessa', 'Cristina', 'Monica', 'Adriana', 'Luciana', 'Silvia', 'Roberta', 'Daniela', 'Priscila', 'Tatiana', 'Juliana', 'Fabiana', 'Alessandra', 'Raquel'],
  massagistas: ['Luna', 'Valentina', 'Bianca', 'Aurora', 'Estrela', 'Diva', 'Princesa', 'Rainha', 'Goddess', 'Venus', 'Athena', 'Aphrodite', 'Cleopatra', 'Nefertiti', 'Isis', 'Hera', 'Demeter', 'Persephone', 'Artemis', 'Diana', 'Freya', 'Frigg', 'Sif', 'Idun', 'Hel', 'Ran', 'Skadi', 'Gerd', 'Nanna', 'Sigyn'],
  trans: ['Luna', 'Valentina', 'Bianca', 'Aurora', 'Estrela', 'Diva', 'Princesa', 'Rainha', 'Goddess', 'Venus', 'Athena', 'Aphrodite', 'Cleopatra', 'Nefertiti', 'Isis', 'Hera', 'Demeter', 'Persephone', 'Artemis', 'Diana', 'Freya', 'Frigg', 'Sif', 'Idun', 'Hel', 'Ran', 'Skadi', 'Gerd', 'Nanna', 'Sigyn'],
  homens: ['João', 'Pedro', 'Carlos', 'Rafael', 'Lucas', 'Gabriel', 'Diego', 'Bruno', 'Felipe', 'André', 'Marcos', 'Rodrigo', 'Thiago', 'Gustavo', 'Eduardo', 'Fernando', 'Ricardo', 'Alexandre', 'Daniel', 'Antonio', 'Roberto', 'Paulo', 'José', 'Francisco', 'Luiz', 'Miguel', 'Henrique', 'Vitor', 'Leonardo', 'Matheus'],
  webcam: ['Luna', 'Valentina', 'Bianca', 'Aurora', 'Estrela', 'Diva', 'Princesa', 'Rainha', 'Goddess', 'Venus', 'Athena', 'Aphrodite', 'Cleopatra', 'Nefertiti', 'Isis', 'Hera', 'Demeter', 'Persephone', 'Artemis', 'Diana', 'Freya', 'Frigg', 'Sif', 'Idun', 'Hel', 'Ran', 'Skadi', 'Gerd', 'Nanna', 'Sigyn']
};

const SURNAMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa'];
const BAIRROS_BRASILIA = ['Asa Norte', 'Asa Sul', 'Lago Sul', 'Lago Norte', 'Sudoeste', 'Noroeste', 'Guará', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Gama', 'Santa Maria', 'São Sebastião', 'Planaltina', 'Sobradinho', 'Brazlândia', 'Recanto das Emas', 'Riacho Fundo', 'Candangolândia', 'Núcleo Bandeirante', 'Park Way', 'Vicente Pires'];

// Carregar fotos disponíveis
function loadAvailablePhotos() {
  try {
    const photos = fs.readdirSync('/Users/troll/Desktop/copia do job/fotinha/fotos')
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .map(file => `/Users/troll/Desktop/copia do job/fotinha/fotos/${file}`);
    
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
    webcam: { min: 100, max: 300 }
  };
  
  const basePrice = basePrices[categoria] || basePrices.mulheres;
  const multiplier = LEVELS_CONFIG[level].priceMultiplier;
  const baseAmount = basePrice.min + Math.random() * (basePrice.max - basePrice.min);
  const finalAmount = Math.floor(baseAmount * multiplier);
  
  return finalAmount;
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
    preco: preco,
    price: preco,
    preco_hora: preco,
    price_per_hour: preco,
    preco_30min: Math.floor(preco * 0.6),
    preco_45min: Math.floor(preco * 0.8),
    preco_1h: preco,
    
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
    project: 'copia-do-job'
  };
}

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

// Função principal
async function addLevelsToExisting() {
  try {
    console.log('🚀 Adicionando anúncios com níveis N1, N3, N7...');
    
    // Carregar fotos disponíveis
    const availablePhotos = loadAvailablePhotos();
    if (availablePhotos.length === 0) {
      console.error('❌ Nenhuma foto encontrada!');
      return;
    }
    
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
            
            // Fazer requisição POST para criar anúncio
            const response = await makeRequest('http://localhost:5001/api/anuncios', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(anuncio)
            });
            
            if (response.ok) {
              totalCreated++;
              if ((i + 1) % 10 === 0 || i === config.count - 1) {
                console.log(`    ✅ ${i + 1}/${config.count} anúncios ${level} criados`);
              }
            } else {
              console.error(`    ❌ Erro ao criar anúncio ${i + 1} ${level}: ${response.status}`);
            }
            
            // Pequena pausa para não sobrecarregar
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (error) {
            console.error(`    ❌ Erro ao criar anúncio ${i + 1} ${level}:`, error.message);
          }
        }
        
        console.log(`  ✅ ${config.count} anúncios ${level} criados para ${categoria}`);
      }
    }
    
    console.log(`\n🎉 Adição concluída!`);
    console.log(`📊 Total de anúncios criados: ${totalCreated}`);
    
    // Verificar resultado
    console.log('\n🔍 Verificando resultado...');
    const verifyResponse = await makeRequest('http://localhost:5001/api/anuncios');
    const allAnuncios = await verifyResponse.json();
    
    console.log(`📊 Total de anúncios no banco: ${allAnuncios.length}`);
    
    // Contar por nível
    const niveisCount = { N1: 0, N3: 0, N7: 0, 'sem nivel': 0 };
    allAnuncios.forEach(anuncio => {
      if (anuncio.nivel) {
        niveisCount[anuncio.nivel] = (niveisCount[anuncio.nivel] || 0) + 1;
      } else {
        niveisCount['sem nivel']++;
      }
    });
    
    console.log('\n📊 Distribuição por nível:');
    Object.entries(niveisCount).forEach(([nivel, count]) => {
      console.log(`  ${nivel}: ${count} anúncios`);
    });
    
    // Verificar stories
    const storiesCount = allAnuncios.filter(ad => ad.foto_stories).length;
    console.log(`\n📸 Anúncios com fotos para stories: ${storiesCount}/${allAnuncios.length}`);
    
    if (storiesCount === allAnuncios.length) {
      console.log('✅ Todos os anúncios têm fotos para stories!');
    } else {
      console.log('⚠️ Alguns anúncios não têm fotos para stories');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addLevelsToExisting();
}

export { addLevelsToExisting };
