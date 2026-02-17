// Demo do sistema de população - sem necessidade de Firebase
// Este script demonstra como o sistema funcionaria

import fs from 'fs';
import path from 'path';

// Configurações dos níveis conforme especificação
const LEVELS_CONFIG = {
  N1: {
    count: 29,
    name: "Premium VIP",
    description: "Destaque premium com fotos nos stories",
    features: ["24h disponível", "Fotos em destaque", "Prioridade máxima"],
    priceMultiplier: 2.0
  },
  N3: {
    count: 15,
    name: "Destaque",
    description: "Rodízio em página com destaque",
    features: ["14h às 00h", "Destaque rotativo", "Prioridade alta"],
    priceMultiplier: 1.5
  },
  N5: {
    count: 0, // Conforme especificação, N5 não tem anúncios
    name: "Intermediário",
    description: "Nível intermediário",
    features: ["Horário comercial", "Visibilidade média"],
    priceMultiplier: 1.2
  },
  N7: {
    count: 199,
    name: "Padrão",
    description: "Anúncios padrão para todas as páginas",
    features: ["15h às 01h", "Visibilidade padrão", "Preço acessível"],
    priceMultiplier: 1.0
  }
};

// Categorias principais
const CATEGORIES = [
  'mulheres',    // A_02__premium.html
  'massagistas', // A_03__massagistas.html
  'trans',       // A_04__trans.html
  'homens',      // A_05__homens.html
];

// Caminho para as fotos
const FOTOS_PATH = '/Users/troll/Desktop/copia do job/fotinha/fotos';

// Nomes por categoria
const NAMES_BY_CATEGORY = {
  mulheres: [
    'Ana', 'Maria', 'Julia', 'Sofia', 'Camila', 'Isabella', 'Lara', 'Beatriz', 'Gabriela', 'Mariana',
    'Fernanda', 'Amanda', 'Carolina', 'Patricia', 'Aline', 'Renata', 'Vanessa', 'Cristina', 'Monica', 'Adriana',
    'Luciana', 'Silvia', 'Roberta', 'Daniela', 'Priscila', 'Tatiana', 'Juliana', 'Fabiana', 'Alessandra', 'Raquel',
    'Victoria', 'Isabella', 'Sophia', 'Charlotte', 'Amelia', 'Olivia', 'Ava', 'Mia', 'Harper', 'Evelyn',
    'Abigail', 'Emily', 'Elizabeth', 'Sofia', 'Avery', 'Ella', 'Madison', 'Scarlett', 'Grace', 'Chloe'
  ],
  massagistas: [
    'Luna', 'Valentina', 'Bianca', 'Aurora', 'Estrela', 'Diva', 'Princesa', 'Rainha', 'Goddess', 'Venus',
    'Athena', 'Aphrodite', 'Cleopatra', 'Nefertiti', 'Isis', 'Hera', 'Demeter', 'Persephone', 'Artemis', 'Diana',
    'Freya', 'Frigg', 'Sif', 'Idun', 'Hel', 'Ran', 'Skadi', 'Gerd', 'Nanna', 'Sigyn',
    'Maya', 'Sakura', 'Lotus', 'Jasmine', 'Rose', 'Lily', 'Iris', 'Dahlia', 'Orchid', 'Tulip'
  ],
  trans: [
    'Luna', 'Valentina', 'Bianca', 'Aurora', 'Estrela', 'Diva', 'Princesa', 'Rainha', 'Goddess', 'Venus',
    'Athena', 'Aphrodite', 'Cleopatra', 'Nefertiti', 'Isis', 'Hera', 'Demeter', 'Persephone', 'Artemis', 'Diana',
    'Freya', 'Frigg', 'Sif', 'Idun', 'Hel', 'Ran', 'Skadi', 'Gerd', 'Nanna', 'Sigyn',
    'Crystal', 'Diamond', 'Pearl', 'Ruby', 'Sapphire', 'Emerald', 'Topaz', 'Amethyst', 'Opal', 'Jade'
  ],
  homens: [
    'João', 'Pedro', 'Carlos', 'Rafael', 'Lucas', 'Gabriel', 'Diego', 'Bruno', 'Felipe', 'André',
    'Marcos', 'Rodrigo', 'Thiago', 'Gustavo', 'Eduardo', 'Fernando', 'Ricardo', 'Alexandre', 'Daniel', 'Antonio',
    'Roberto', 'Paulo', 'José', 'Francisco', 'Luiz', 'Miguel', 'Henrique', 'Vitor', 'Leonardo', 'Matheus',
    'Adrian', 'Sebastian', 'Christian', 'Maximilian', 'Alexander', 'Nicholas', 'Benjamin', 'Samuel', 'David', 'Michael'
  ],
};

const SURNAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
  'Rocha', 'Dias', 'Monteiro', 'Cardoso', 'Reis', 'Araújo', 'Cunha', 'Moreira', 'Mendes', 'Nunes'
];

// Bairros de Brasília
const BAIRROS_BRASILIA = [
  'Asa Norte', 'Asa Sul', 'Lago Sul', 'Lago Norte', 'Sudoeste', 'Noroeste',
  'Guará', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Gama', 'Santa Maria',
  'São Sebastião', 'Planaltina', 'Sobradinho', 'Brazlândia', 'Recanto das Emas',
  'Riacho Fundo', 'Candangolândia', 'Núcleo Bandeirante', 'Park Way', 'Vicente Pires'
];

// Preços base por categoria
const BASE_PRICES = {
  mulheres: { min: 300, max: 800 },
  massagistas: { min: 200, max: 500 },
  trans: { min: 250, max: 600 },
  homens: { min: 200, max: 500 },
};

// Descrições por categoria
const DESCRIPTIONS = {
  mulheres: [
    "Sou uma mulher elegante e sofisticada, pronta para proporcionar momentos únicos e inesquecíveis.",
    "Com charme natural e personalidade envolvente, ofereço companhia de qualidade para os mais diversos momentos.",
    "Sou discreta, elegante e tenho experiência em proporcionar encontros memoráveis e prazerosos.",
    "Com educação refinada e personalidade cativante, estou pronta para acompanhá-lo em qualquer ocasião especial."
  ],
  massagistas: [
    "Massagista profissional com anos de experiência em técnicas relaxantes e terapêuticas.",
    "Especializada em massagens que aliviam o estresse e proporcionam bem-estar completo.",
    "Com formação em diversas técnicas de massagem, ofereço tratamentos personalizados.",
    "Massagista certificada, pronta para proporcionar relaxamento e alívio das tensões."
  ],
  trans: [
    "Sou uma pessoa trans elegante e sofisticada, pronta para proporcionar momentos únicos e inesquecíveis.",
    "Com charme natural e personalidade envolvente, ofereço companhia de qualidade para os mais diversos momentos.",
    "Sou discreta, elegante e tenho experiência em proporcionar encontros memoráveis e prazerosos.",
    "Com educação refinada e personalidade cativante, estou pronta para acompanhá-lo em qualquer ocasião especial."
  ],
  homens: [
    "Sou um homem elegante e sofisticado, pronto para proporcionar momentos únicos e inesquecíveis.",
    "Com charme natural e personalidade envolvente, ofereço companhia de qualidade para os mais diversos momentos.",
    "Sou discreto, elegante e tenho experiência em proporcionar encontros memoráveis e prazerosos.",
    "Com educação refinada e personalidade cativante, estou pronto para acompanhá-la em qualquer ocasião especial."
  ],
};

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
  const basePrice = BASE_PRICES[categoria] || BASE_PRICES.mulheres;
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
  const descricao = DESCRIPTIONS[categoria][Math.floor(Math.random() * DESCRIPTIONS[categoria].length)];
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
    nivel_descricao: levelConfig.description,
    level_description: levelConfig.description,
    destaque: level === 'N1' || level === 'N3', // N1 e N3 são destaques
    premium: level === 'N1', // Apenas N1 é premium
    
    // Dados pessoais
    idade: (18 + Math.floor(Math.random() * 20)).toString(), // 18-37 anos
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
    descricao: descricao,
    description: descricao,
    
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
    
    // Características do nível
    disponibilidade: levelConfig.features[0],
    features: levelConfig.features,
    
    // Metadados
    environment: 'demo',
    project: 'copia-do-job',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Função principal para demonstrar o sistema
async function demonstratePopulation() {
  try {
    console.log('🚀 DEMONSTRAÇÃO - Sistema de População com Níveis N1, N3, N5, N7');
    console.log('');
    console.log('📊 Especificações:');
    console.log('   - N1 (Premium VIP): 29 anúncios por categoria');
    console.log('   - N3 (Destaque): 15 anúncios por categoria');
    console.log('   - N5 (Intermediário): 0 anúncios (conforme especificação)');
    console.log('   - N7 (Padrão): 199 anúncios por categoria');
      console.log('   - Categorias: mulheres, massagistas, trans, homens');
    console.log('   - Total por categoria: 243 anúncios');
    console.log('   - Total geral: 1.215 anúncios');
    console.log('');
    
    // Carregar fotos disponíveis
    const availablePhotos = loadAvailablePhotos();
    if (availablePhotos.length === 0) {
      console.error('❌ Nenhuma foto encontrada! Verifique o caminho:', FOTOS_PATH);
      return;
    }
    
    let totalCreated = 0;
    const allAdvertisements = [];
    
    // Criar anúncios para cada categoria
    for (const categoria of CATEGORIES) {
      console.log(`\n📂 Processando categoria: ${categoria.toUpperCase()}`);
      
      // Criar anúncios para cada nível
      for (const [level, config] of Object.entries(LEVELS_CONFIG)) {
        if (config.count === 0) {
          console.log(`  ⏭️ Pulando ${level} (quantidade: 0)`);
          continue;
        }
        
        console.log(`  📋 Criando ${config.count} anúncios ${level} (${config.name})...`);
        
        for (let i = 0; i < config.count; i++) {
          try {
            const anuncio = createAdvertisement(categoria, level, i, availablePhotos);
            allAdvertisements.push(anuncio);
            totalCreated++;
            
            if ((i + 1) % 50 === 0 || i === config.count - 1) {
              console.log(`    ✅ ${i + 1}/${config.count} anúncios ${level} criados`);
            }
          } catch (error) {
            console.error(`    ❌ Erro ao criar anúncio ${i + 1} ${level}:`, error.message);
          }
        }
        
        console.log(`  ✅ ${config.count} anúncios ${level} criados para ${categoria}`);
      }
    }
    
    // Salvar em arquivo JSON para demonstração
    const outputFile = 'demo-anuncios.json';
    fs.writeFileSync(outputFile, JSON.stringify(allAdvertisements, null, 2));
    
    // Verificar resultado final
    console.log(`\n🎉 Demonstração concluída!`);
    console.log(`📊 Total de anúncios criados: ${totalCreated}`);
    console.log(`📁 Dados salvos em: ${outputFile}`);
    
    // Estatísticas por categoria e nível
    console.log(`\n📊 Distribuição por categoria e nível:`);
    for (const categoria of CATEGORIES) {
      console.log(`\n  ${categoria.toUpperCase()}:`);
      for (const [level, config] of Object.entries(LEVELS_CONFIG)) {
        if (config.count > 0) {
          const count = allAdvertisements.filter(a => a.categoria === categoria && a.nivel === level).length;
          console.log(`    ${level}: ${count} anúncios (${config.name})`);
        }
      }
    }
    
    // Verificar stories
    const storiesCount = allAdvertisements.filter(ad => ad.foto_stories).length;
    console.log(`\n📸 Anúncios com fotos para stories: ${storiesCount}/${allAdvertisements.length}`);
    
    if (storiesCount === allAdvertisements.length) {
      console.log('✅ Todos os anúncios têm fotos para stories!');
    } else {
      console.log('⚠️ Alguns anúncios não têm fotos para stories');
    }
    
    // Verificar destaques
    const n1Count = allAdvertisements.filter(a => a.nivel === 'N1').length;
    const n3Count = allAdvertisements.filter(a => a.nivel === 'N3').length;
    const n1Destaques = allAdvertisements.filter(a => a.nivel === 'N1' && a.destaque).length;
    const n3Destaques = allAdvertisements.filter(a => a.nivel === 'N3' && a.destaque).length;
    
    console.log(`\n💎 Verificação de destaques:`);
    console.log(`N1 com destaque: ${n1Destaques}/${n1Count}`);
    console.log(`N3 com destaque: ${n3Destaques}/${n3Count}`);
    
    if (n1Destaques === n1Count && n3Destaques === n3Count) {
      console.log('✅ Todos os N1 e N3 estão marcados como destaque!');
    } else {
      console.log('❌ Alguns N1 ou N3 não estão marcados como destaque!');
    }
    
    // Exibir alguns exemplos
    console.log(`\n📝 Exemplos de anúncios gerados:`);
    console.log('═'.repeat(50));
    
    const exemplos = allAdvertisements.slice(0, 5);
    exemplos.forEach((anuncio, index) => {
      console.log(`${index + 1}. ${anuncio.nome} (${anuncio.categoria}, ${anuncio.nivel})`);
      console.log(`   Preço: R$ ${anuncio.preco_1h}`);
      console.log(`   Stories: ${anuncio.foto_stories ? '✅' : '❌'}`);
      console.log(`   Destaque: ${anuncio.destaque ? '✅' : '❌'}`);
      console.log(`   Premium: ${anuncio.premium ? '✅' : '❌'}`);
    });
    
    console.log(`\n🎯 Para usar com Firebase real:`);
    console.log(`1. Configure o arquivo config.env com suas credenciais Firebase`);
    console.log(`2. Execute: node populate-with-levels.js`);
    console.log(`3. Verifique: node verify-population.js`);
    
  } catch (error) {
    console.error('❌ Erro na demonstração:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstratePopulation();
}

export { demonstratePopulation, LEVELS_CONFIG, CATEGORIES };












