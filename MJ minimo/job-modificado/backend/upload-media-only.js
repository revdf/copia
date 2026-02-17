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

const storage = admin.storage();
const db = admin.firestore();

// Configurações
const MEDIA_PATH = '/Users/troll/Desktop/teste';

class MediaUploader {
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

  async uploadAllMedia() {
    try {
      console.log('🚀 Iniciando upload de mídia...');
      
      // Carregar fotos
      const photosPath = path.join(MEDIA_PATH, 'fotos');
      const photos = fs.readdirSync(photosPath)
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
        .map(file => path.join(photosPath, file));

      // Carregar vídeos
      const videosPath = path.join(MEDIA_PATH, 'video');
      const videos = fs.readdirSync(videosPath)
        .filter(file => /\.(mp4|avi|mov|wmv)$/i.test(file))
        .map(file => path.join(videosPath, file));

      // Carregar áudios
      const audiosPath = path.join(MEDIA_PATH, 'audio');
      const audios = fs.readdirSync(audiosPath)
        .filter(file => /\.(mp3|wav|ogg|m4a)$/i.test(file))
        .map(file => path.join(audiosPath, file));

      console.log(`📁 Mídia encontrada: ${photos.length} fotos, ${videos.length} vídeos, ${audios.length} áudios`);

      let uploadedCount = 0;
      let errorCount = 0;

      // Upload das fotos
      console.log('\n📸 Fazendo upload das fotos...');
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const fileName = path.basename(photo);
        const url = await this.uploadFile(photo, `media/photos/${fileName}`);
        if (url) {
          uploadedCount++;
        } else {
          errorCount++;
        }
        
        // Pequena pausa
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Upload dos vídeos
      console.log('\n🎥 Fazendo upload dos vídeos...');
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const fileName = path.basename(video);
        const url = await this.uploadFile(video, `media/videos/${fileName}`);
        if (url) {
          uploadedCount++;
        } else {
          errorCount++;
        }
        
        // Pequena pausa
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Upload dos áudios
      console.log('\n🎵 Fazendo upload dos áudios...');
      for (let i = 0; i < audios.length; i++) {
        const audio = audios[i];
        const fileName = path.basename(audio);
        const url = await this.uploadFile(audio, `media/audio/${fileName}`);
        if (url) {
          uploadedCount++;
        } else {
          errorCount++;
        }
        
        // Pequena pausa
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('\n🎉 Upload de mídia concluído!');
      console.log(`📊 Resumo:`);
      console.log(`   ✅ Arquivos enviados: ${uploadedCount}`);
      console.log(`   ❌ Erros: ${errorCount}`);
      console.log(`   📊 Taxa de sucesso: ${((uploadedCount / (uploadedCount + errorCount)) * 100).toFixed(1)}%`);

      // Verificar resultado
      const [files] = await this.bucket.getFiles();
      console.log(`\n🔍 Verificação: ${files.length} arquivos no Firebase Storage`);

    } catch (error) {
      console.error('❌ Erro geral:', error);
    } finally {
      process.exit(0);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const uploader = new MediaUploader();
  uploader.uploadAllMedia();
}

module.exports = { MediaUploader };
