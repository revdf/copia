const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './config.env' });

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
const storage = admin.storage();

// Configurações
const MEDIA_PATH = '/Users/troll/Desktop/teste';
const ADS_PER_CATEGORY = 30;
const TOTAL_ADS = 360; // 12 categorias × 30 anúncios

// Categorias definidas
const CATEGORIES = [
  // Mulheres
  { gender: 'mulher', type: 'acompanhantes', page: 'premium.html' },
  { gender: 'mulher', type: 'massagistas', page: 'massagistas.html' },
  { gender: 'mulher', type: 'sexo-virtual', page: 'webcam.html' },
  
  // Trans
  { gender: 'trans', type: 'acompanhantes', page: 'trans.html' },
  { gender: 'trans', type: 'massagistas', page: 'trans.html' },
  { gender: 'trans', type: 'sexo-virtual', page: 'trans.html' },
  
  // Homens
  { gender: 'homem', type: 'acompanhantes', page: 'homens.html' },
  { gender: 'homem', type: 'massagistas', page: 'homens.html' },
  { gender: 'homem', type: 'sexo-virtual', page: 'homens.html' },
  
  // Mulher de Luxo
  { gender: 'mulher-luxo', type: 'acompanhantes', page: 'luxo.html' },
  { gender: 'mulher-luxo', type: 'massagistas', page: 'luxo.html' },
  { gender: 'mulher-luxo', type: 'sexo-virtual', page: 'luxo.html' }
];

// Dados para geração realista
const NAMES = {
  mulher: [
    'Ana', 'Maria', 'Julia', 'Sofia', 'Camila', 'Isabella', 'Lara', 'Beatriz', 'Gabriela', 'Mariana',
    'Fernanda', 'Amanda', 'Carolina', 'Patricia', 'Aline', 'Renata', 'Vanessa', 'Cristina', 'Monica', 'Adriana',
    'Luciana', 'Silvia', 'Roberta', 'Daniela', 'Priscila', 'Tatiana', 'Juliana', 'Fabiana', 'Alessandra', 'Raquel'
  ],
  trans: [
    'Luna', 'Valentina', 'Bianca', 'Aurora', 'Estrela', 'Diva', 'Princesa', 'Rainha', 'Goddess', 'Venus',
    'Athena', 'Aphrodite', 'Cleopatra', 'Nefertiti', 'Isis', 'Hera', 'Demeter', 'Persephone', 'Artemis', 'Diana',
    'Freya', 'Frigg', 'Sif', 'Idun', 'Hel', 'Ran', 'Skadi', 'Gerd', 'Nanna', 'Sigyn'
  ],
  homem: [
    'João', 'Pedro', 'Carlos', 'Rafael', 'Lucas', 'Gabriel', 'Diego', 'Bruno', 'Felipe', 'André',
    'Marcos', 'Rodrigo', 'Thiago', 'Gustavo', 'Eduardo', 'Fernando', 'Ricardo', 'Alexandre', 'Daniel', 'Antonio',
    'Roberto', 'Paulo', 'José', 'Francisco', 'Luiz', 'Miguel', 'Henrique', 'Vitor', 'Leonardo', 'Matheus'
  ],
  'mulher-luxo': [
    'Victoria', 'Isabella', 'Sophia', 'Charlotte', 'Amelia', 'Olivia', 'Ava', 'Mia', 'Harper', 'Evelyn',
    'Abigail', 'Emily', 'Elizabeth', 'Sofia', 'Avery', 'Ella', 'Madison', 'Scarlett', 'Grace', 'Chloe',
    'Camila', 'Penelope', 'Riley', 'Layla', 'Lillian', 'Nora', 'Zoey', 'Mila', 'Aubrey', 'Hannah'
  ]
};

const SURNAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
  'Rocha', 'Dias', 'Monteiro', 'Cardoso', 'Reis', 'Araújo', 'Cunha', 'Moreira', 'Mendes', 'Nunes'
];

const CITIES = {
  'São Paulo': ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André'],
  'Rio de Janeiro': ['Rio de Janeiro', 'Niterói', 'Nova Iguaçu', 'Duque de Caxias', 'São Gonçalo'],
  'Minas Gerais': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim'],
  'Bahia': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro'],
  'Paraná': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'],
  'Rio Grande do Sul': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'],
  'Pernambuco': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina'],
  'Ceará': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral'],
  'Pará': ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas'],
  'Goiás': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia']
};

const SERVICES = {
  acompanhantes: ['Acompanhante', 'Encontro', 'Jantar', 'Eventos', 'Viagens', 'Fantasias'],
  massagistas: ['Massagem Relaxante', 'Massagem Terapêutica', 'Massagem Sensual', 'Drenagem', 'Reflexologia', 'Shiatsu'],
  'sexo-virtual': ['Webcam', 'Chat Hot', 'Fantasias Virtuais', 'Shows Privados', 'Interação Online', 'Conteúdo Personalizado']
};

const APPEARANCES = ['Magra', 'Média', 'Gordinha', 'Atlética'];
const ETHNICITIES = ['Branca', 'Parda', 'Negra', 'Asiática', 'Indígena'];
const LANGUAGES = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Italiano'];
const ACCEPTANCES = ['Dinheiro', 'Cartão', 'PIX', 'Transferência', 'Presentes'];

// Sistema de mídia sequencial
class MediaManager {
  constructor() {
    this.photoIndex = 0;
    this.videoIndex = 0;
    this.audioIndex = 0;
    this.photos = [];
    this.videos = [];
    this.audios = [];
    this.loadMediaFiles();
  }

  loadMediaFiles() {
    // Carregar fotos
    const photosPath = path.join(MEDIA_PATH, 'fotos');
    if (fs.existsSync(photosPath)) {
      this.photos = fs.readdirSync(photosPath)
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
        .map(file => path.join(photosPath, file));
    }

    // Carregar vídeos
    const videosPath = path.join(MEDIA_PATH, 'video');
    if (fs.existsSync(videosPath)) {
      this.videos = fs.readdirSync(videosPath)
        .filter(file => /\.(mp4|avi|mov|wmv)$/i.test(file))
        .map(file => path.join(videosPath, file));
    }

    // Carregar áudios
    const audiosPath = path.join(MEDIA_PATH, 'audio');
    if (fs.existsSync(audiosPath)) {
      this.audios = fs.readdirSync(audiosPath)
        .filter(file => /\.(mp3|wav|ogg|m4a)$/i.test(file))
        .map(file => path.join(audiosPath, file));
    }

    console.log(`📁 Mídia carregada: ${this.photos.length} fotos, ${this.videos.length} vídeos, ${this.audios.length} áudios`);
  }

  getNextPhoto() {
    if (this.photos.length === 0) return null;
    const photo = this.photos[this.photoIndex % this.photos.length];
    this.photoIndex++;
    return photo;
  }

  getNextVideo() {
    if (this.videos.length === 0) return null;
    const video = this.videos[this.videoIndex % this.videos.length];
    this.videoIndex++;
    return video;
  }

  getNextAudio() {
    if (this.audios.length === 0) return null;
    const audio = this.audios[this.audioIndex % this.audios.length];
    this.audioIndex++;
    return audio;
  }

  getPhotos(count = 8) {
    const photos = [];
    for (let i = 0; i < count; i++) {
      const photo = this.getNextPhoto();
      if (photo) photos.push(photo);
    }
    return photos;
  }
}

// Gerador de dados realistas
class DataGenerator {
  constructor() {
    this.mediaManager = new MediaManager();
  }

  generateName(gender) {
    const names = NAMES[gender] || NAMES.mulher;
    const name = names[Math.floor(Math.random() * names.length)];
    const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    return `${name} ${surname}`;
  }

  generateLocation() {
    const states = Object.keys(CITIES);
    const state = states[Math.floor(Math.random() * states.length)];
    const cities = CITIES[state];
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    return {
      estado: state,
      cidade: city,
      bairro: this.generateBairro(city)
    };
  }

  generateBairro(city) {
    const bairros = [
      'Centro', 'Zona Sul', 'Zona Norte', 'Zona Oeste', 'Zona Leste',
      'Copacabana', 'Ipanema', 'Leblon', 'Botafogo', 'Flamengo',
      'Vila Madalena', 'Pinheiros', 'Itaim Bibi', 'Jardins', 'Moema',
      'Savassi', 'Funcionários', 'Lourdes', 'Santo Agostinho', 'Cidade Nova'
    ];
    return bairros[Math.floor(Math.random() * bairros.length)];
  }

  generateDescription(gender, type) {
    const descriptions = {
      acompanhantes: [
        `Sou uma ${gender === 'mulher' ? 'mulher' : gender === 'homem' ? 'homem' : 'pessoa trans'} elegante e sofisticada, pronta para proporcionar momentos únicos e inesquecíveis.`,
        `Com charme natural e personalidade envolvente, ofereço companhia de qualidade para os mais diversos momentos.`,
        `Sou discreta, elegante e tenho experiência em proporcionar encontros memoráveis e prazerosos.`,
        `Com educação refinada e personalidade cativante, estou pronta para acompanhá-lo em qualquer ocasião especial.`
      ],
      massagistas: [
        `Massagista profissional com anos de experiência em técnicas relaxantes e terapêuticas.`,
        `Especializada em massagens que aliviam o estresse e proporcionam bem-estar completo.`,
        `Com formação em diversas técnicas de massagem, ofereço tratamentos personalizados.`,
        `Massagista certificada, pronta para proporcionar relaxamento e alívio das tensões.`
      ],
      'sexo-virtual': [
        `Modelo webcam experiente, pronta para shows privados e interações personalizadas.`,
        `Especializada em conteúdo adulto online, oferecendo experiências únicas e excitantes.`,
        `Com anos de experiência em webcam, proporciono shows memoráveis e interativos.`,
        `Modelo profissional, pronta para realizar suas fantasias mais secretas online.`
      ]
    };

    const baseDescription = descriptions[type][Math.floor(Math.random() * descriptions[type].length)];
    const additionalText = [
      'Sou pontual, discreta e tenho total comprometimento com a satisfação do cliente.',
      'Atendo com carinho, dedicação e sempre busco superar as expectativas.',
      'Valorizo a privacidade e ofereço um atendimento personalizado e exclusivo.',
      'Tenho experiência comprovada e referências de clientes satisfeitos.'
    ];

    return `${baseDescription} ${additionalText[Math.floor(Math.random() * additionalText.length)]}`;
  }

  generatePrices(type) {
    const basePrices = {
      acompanhantes: { min: 200, max: 800 },
      massagistas: { min: 150, max: 500 },
      'sexo-virtual': { min: 50, max: 200 }
    };

    const luxoMultiplier = 1.5;
    const base = basePrices[type] || basePrices.acompanhantes;
    
    const preco_30min = Math.floor((base.min + Math.random() * (base.max - base.min)) * 0.6);
    const preco_45min = Math.floor(preco_30min * 1.3);
    const preco_1h = Math.floor(preco_30min * 1.8);

    return {
      preco_30min: preco_30min.toString(),
      preco_45min: preco_45min.toString(),
      preco_1h: preco_1h.toString()
    };
  }

  generatePhysicalInfo(gender) {
    const weights = {
      mulher: { min: 45, max: 80 },
      trans: { min: 50, max: 85 },
      homem: { min: 60, max: 100 },
      'mulher-luxo': { min: 45, max: 70 }
    };

    const heights = {
      mulher: { min: 150, max: 175 },
      trans: { min: 155, max: 180 },
      homem: { min: 165, max: 190 },
      'mulher-luxo': { min: 155, max: 175 }
    };

    const weightRange = weights[gender] || weights.mulher;
    const heightRange = heights[gender] || heights.mulher;

    return {
      peso: Math.floor(weightRange.min + Math.random() * (weightRange.max - weightRange.min)),
      altura: `${(heightRange.min + Math.random() * (heightRange.max - heightRange.min) / 100).toFixed(2)}m`,
      aparencia: APPEARANCES[Math.floor(Math.random() * APPEARANCES.length)],
      etnia: ETHNICITIES[Math.floor(Math.random() * ETHNICITIES.length)]
    };
  }

  generateServices(type) {
    const allServices = SERVICES[type] || SERVICES.acompanhantes;
    const numServices = Math.floor(Math.random() * 3) + 2; // 2-4 serviços
    const selectedServices = [];
    
    for (let i = 0; i < numServices; i++) {
      const service = allServices[Math.floor(Math.random() * allServices.length)];
      if (!selectedServices.includes(service)) {
        selectedServices.push(service);
      }
    }
    
    return selectedServices;
  }

  generateSocialMedia() {
    const instagram = `@${Math.random().toString(36).substring(2, 15)}`;
    const facebook = Math.random().toString(36).substring(2, 15);
    const twitter = `@${Math.random().toString(36).substring(2, 10)}`;
    
    return {
      instagram,
      facebook,
      twitter,
      privacidade: Math.random() > 0.5 ? 'publico' : 'privado'
    };
  }

  generateAdData(category) {
    const { gender, type } = category;
    const name = this.generateName(gender);
    const location = this.generateLocation();
    const physicalInfo = this.generatePhysicalInfo(gender);
    const prices = this.generatePrices(type);
    const services = this.generateServices(type);
    const socialMedia = this.generateSocialMedia();
    
    // Gerar mídia
    const mainPhoto = this.mediaManager.getNextPhoto();
    const photos = this.mediaManager.getPhotos(8);
    const video = this.mediaManager.getNextVideo();
    const audio = this.mediaManager.getNextAudio();

    return {
      // Dados básicos
      nome: name,
      name: name, // fallback
      idade: (18 + Math.floor(Math.random() * 20)).toString(), // 18-37 anos
      nacionalidade: 'Brasileira',
      descricao: this.generateDescription(gender, type),
      
      // Localização
      estado: location.estado,
      cidade: location.cidade,
      bairro: location.bairro,
      endereco: `${location.bairro}, ${location.cidade}`,
      
      // Categoria e tipo
      category: type,
      categoria: type,
      gender: gender,
      tipo: type,
      status: 'active',
      
      // Informações físicas
      peso: physicalInfo.peso.toString(),
      altura: physicalInfo.altura,
      aparencia: physicalInfo.aparencia,
      etnia: physicalInfo.etnia,
      idiomas: LANGUAGES.slice(0, Math.floor(Math.random() * 3) + 1).join(', '),
      aceita: ACCEPTANCES.slice(0, Math.floor(Math.random() * 3) + 1).join(', '),
      
      // Serviços
      servicos: services.join(', '),
      verificacao: Math.random() > 0.3 ? 'verificado' : 'pendente',
      
      // Preços
      preco_30min: prices.preco_30min,
      preco_45min: prices.preco_45min,
      preco_1h: prices.preco_1h,
      
      // Redes sociais
      instagram: socialMedia.instagram,
      facebook: socialMedia.facebook,
      twitter: socialMedia.twitter,
      privacidade: socialMedia.privacidade,
      
      // Mídia
      foto_capa: mainPhoto,
      coverImage: mainPhoto, // fallback
      foto_stories: mainPhoto,
      profileImage: mainPhoto, // fallback
      galeria_1: photos[0] || null,
      galeria_2: photos[1] || null,
      galeria_3: photos[2] || null,
      galeria_4: photos[3] || null,
      galeria_5: photos[4] || null,
      galeria_6: photos[5] || null,
      galeria_7: photos[6] || null,
      galeria_8: photos[7] || null,
      images: photos,
      videoUrl: video,
      audioUrl: audio,
      
      // Metadados
      createdAt: new Date(),
      updatedAt: new Date(),
      syncedAt: new Date(),
      isActive: true,
      isPublic: true,
      
      // IDs únicos
      firebaseId: `ad_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      advertiserId: `adv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    };
  }
}

// Sistema de upload para Firebase
class FirebaseUploader {
  constructor() {
    this.bucket = storage.bucket();
  }

  async uploadFile(filePath, destination) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
        return null;
      }

      const fileName = path.basename(filePath);
      const file = this.bucket.file(`${destination}/${fileName}`);
      
      // Usar upload com stream
      const stream = file.createWriteStream({
        metadata: {
          contentType: this.getContentType(fileName)
        }
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
          console.error(`❌ Erro no upload de ${filePath}:`, error.message);
          resolve(null);
        });

        stream.on('finish', async () => {
          try {
            // Tornar o arquivo público
            await file.makePublic();
            
            const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${destination}/${fileName}`;
            console.log(`✅ Upload concluído: ${fileName}`);
            resolve(publicUrl);
          } catch (error) {
            console.error(`❌ Erro ao tornar público ${fileName}:`, error.message);
            resolve(null);
          }
        });

        // Ler e escrever o arquivo
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(stream);
      });
    } catch (error) {
      console.error(`❌ Erro no upload de ${filePath}:`, error.message);
      return null;
    }
  }

  getContentType(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    const types = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.avi': 'video/avi',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/mp4'
    };
    return types[ext] || 'application/octet-stream';
  }

  async uploadAdMedia(adData) {
    const mediaUrls = {};
    const adId = adData.firebaseId;

    // Upload foto de capa
    if (adData.foto_capa) {
      const capaUrl = await this.uploadFile(adData.foto_capa, `advertisements/${adId}/capa`);
      if (capaUrl) {
        mediaUrls.foto_capa = capaUrl;
        mediaUrls.coverImage = capaUrl;
        mediaUrls.foto_stories = capaUrl;
        mediaUrls.profileImage = capaUrl;
      }
    }

    // Upload galeria de fotos
    const galleryUrls = [];
    for (let i = 1; i <= 8; i++) {
      const photoKey = `galeria_${i}`;
      if (adData[photoKey]) {
        const photoUrl = await this.uploadFile(adData[photoKey], `advertisements/${adId}/galeria`);
        if (photoUrl) {
          galleryUrls.push(photoUrl);
          mediaUrls[photoKey] = photoUrl;
        }
      }
    }
    mediaUrls.images = galleryUrls;

    // Upload vídeo
    if (adData.videoUrl) {
      const videoUrl = await this.uploadFile(adData.videoUrl, `advertisements/${adId}/video`);
      if (videoUrl) {
        mediaUrls.videoUrl = videoUrl;
      }
    }

    // Upload áudio
    if (adData.audioUrl) {
      const audioUrl = await this.uploadFile(adData.audioUrl, `advertisements/${adId}/audio`);
      if (audioUrl) {
        mediaUrls.audioUrl = audioUrl;
      }
    }

    return mediaUrls;
  }
}

// Função principal
async function generateAllAds() {
  try {
    console.log('🚀 Iniciando geração de 360 anúncios...');
    console.log(`📊 Categorias: ${CATEGORIES.length}`);
    console.log(`📊 Anúncios por categoria: ${ADS_PER_CATEGORY}`);
    console.log(`📊 Total: ${TOTAL_ADS} anúncios`);

    const dataGenerator = new DataGenerator();
    const uploader = new FirebaseUploader();
    
    let totalCreated = 0;
    let totalErrors = 0;

    for (const category of CATEGORIES) {
      console.log(`\n📂 Processando categoria: ${category.gender} - ${category.type}`);
      
      for (let i = 1; i <= ADS_PER_CATEGORY; i++) {
        try {
          console.log(`  📝 Criando anúncio ${i}/${ADS_PER_CATEGORY}...`);
          
          // Gerar dados do anúncio
          const adData = dataGenerator.generateAdData(category);
          
          // Upload de mídia
          console.log(`    📤 Fazendo upload de mídia...`);
          const mediaUrls = await uploader.uploadAdMedia(adData);
          
          // Combinar dados com URLs de mídia
          const finalAdData = {
            ...adData,
            ...mediaUrls
          };
          
          // Salvar no Firebase
          const docRef = db.collection('advertisements').doc(adData.firebaseId);
          await docRef.set(finalAdData);
          
          totalCreated++;
          console.log(`    ✅ Anúncio criado: ${adData.nome}`);
          
          // Pequena pausa para não sobrecarregar
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`    ❌ Erro ao criar anúncio ${i}:`, error.message);
          totalErrors++;
        }
      }
      
      console.log(`✅ Categoria ${category.gender} - ${category.type} concluída!`);
    }

    console.log('\n🎉 Geração de anúncios concluída!');
    console.log(`📊 Resumo:`);
    console.log(`   ✅ Anúncios criados: ${totalCreated}`);
    console.log(`   ❌ Erros: ${totalErrors}`);
    console.log(`   📊 Taxa de sucesso: ${((totalCreated / TOTAL_ADS) * 100).toFixed(1)}%`);

    // Verificar resultado
    const snapshot = await db.collection('advertisements').get();
    console.log(`\n🔍 Verificação: ${snapshot.size} anúncios no Firebase`);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    process.exit(0);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  generateAllAds();
}

module.exports = { generateAllAds, DataGenerator, MediaManager, FirebaseUploader };
