#!/usr/bin/env node

/**
 * Análise Detalhada de Vulnerabilidades por Tipo de Upload
 * Verifica fotos, áudios, vídeos, documentos e vídeo de conferência
 */

import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './config-firebase-mongodb.env' });

// Configuração do Firebase
const firebaseServiceAccount = {
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
    credential: admin.credential.cert(firebaseServiceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
  });
  
  console.log("✅ Firebase Admin SDK inicializado");
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error.message);
  process.exit(1);
}

const db = admin.firestore();
const storage = admin.storage();

class AnaliseVulnerabilidadesDetalhada {
  constructor() {
    this.tiposUpload = {
      fotos: {
        campos: ['foto_capa', 'foto_banner', 'foto_stories', 'galeria_1', 'galeria_2', 'galeria_3', 'galeria_4', 'galeria_5', 'galeria_6', 'galeria_7', 'galeria_8'],
        limiteTamanho: 1 * 1024 * 1024, // 1MB
        limiteQuantidade: 11,
        tiposPermitidos: ['image/jpeg', 'image/png', 'image/webp']
      },
      audios: {
        campos: ['audio'],
        limiteTamanho: 10 * 1024 * 1024, // 10MB
        limiteQuantidade: 1,
        tiposPermitidos: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
      },
      videos: {
        campos: ['video_capa', 'verification-video'],
        limiteTamanho: 100 * 1024 * 1024, // 100MB
        limiteQuantidade: 2,
        tiposPermitidos: ['video/mp4', 'video/avi', 'video/mov', 'video/webm']
      },
      documentos: {
        campos: ['documento-frente', 'documento-verso', 'selfie-documento'],
        limiteTamanho: 5 * 1024 * 1024, // 5MB
        limiteQuantidade: 3,
        tiposPermitidos: ['image/jpeg', 'image/png', 'application/pdf']
      }
    };
  }

  /**
   * Analisa vulnerabilidades por tipo de upload
   */
  async analisarVulnerabilidadesPorTipo() {
    console.log("\n🔍 ANÁLISE DETALHADA DE VULNERABILIDADES POR TIPO:");
    console.log("==================================================");
    
    const anunciosSnapshot = await db.collection('anuncios').get();
    console.log(`\n📊 Total de anúncios analisados: ${anunciosSnapshot.size}`);
    
    const resultados = {
      fotos: { total: 0, duplicados: 0, grandes: 0, suspeitos: 0 },
      audios: { total: 0, duplicados: 0, grandes: 0, suspeitos: 0 },
      videos: { total: 0, duplicados: 0, grandes: 0, suspeitos: 0 },
      documentos: { total: 0, duplicados: 0, grandes: 0, suspeitos: 0 }
    };
    
    // Analisar cada anúncio
    anunciosSnapshot.forEach(doc => {
      const data = doc.data();
      const analise = this.analisarAnuncioPorTipo(data);
      
      // Somar resultados
      Object.keys(resultados).forEach(tipo => {
        resultados[tipo].total += analise[tipo].total;
        resultados[tipo].duplicados += analise[tipo].duplicados;
        resultados[tipo].grandes += analise[tipo].grandes;
        resultados[tipo].suspeitos += analise[tipo].suspeitos;
      });
    });
    
    // Mostrar resultados por tipo
    Object.keys(resultados).forEach(tipo => {
      this.mostrarResultadosTipo(tipo, resultados[tipo]);
    });
    
    return resultados;
  }

  /**
   * Analisa um anúncio específico por tipo de arquivo
   */
  analisarAnuncioPorTipo(dadosAnuncio) {
    const resultados = {
      fotos: { total: 0, duplicados: 0, grandes: 0, suspeitos: 0 },
      audios: { total: 0, duplicados: 0, grandes: 0, suspeitos: 0 },
      videos: { total: 0, duplicados: 0, grandes: 0, suspeitos: 0 },
      documentos: { total: 0, duplicados: 0, grandes: 0, suspeitos: 0 }
    };
    
    Object.keys(this.tiposUpload).forEach(tipo => {
      const config = this.tiposUpload[tipo];
      const analise = this.analisarTipoEspecifico(dadosAnuncio, config);
      
      resultados[tipo] = analise;
    });
    
    return resultados;
  }

  /**
   * Analisa um tipo específico de arquivo
   */
  analisarTipoEspecifico(dadosAnuncio, config) {
    let total = 0;
    let duplicados = 0;
    let grandes = 0;
    let suspeitos = 0;
    const urlsEncontradas = new Set();
    
    config.campos.forEach(campo => {
      const url = dadosAnuncio[`${campo}_url`];
      const nome = dadosAnuncio[`${campo}_name`];
      const tamanho = dadosAnuncio[`${campo}_size`];
      
      if (url) {
        total++;
        
        // Verificar duplicatas
        if (urlsEncontradas.has(url)) {
          duplicados++;
        } else {
          urlsEncontradas.add(url);
        }
        
        // Verificar tamanho
        if (tamanho && tamanho > config.limiteTamanho) {
          grandes++;
        }
        
        // Verificar tipo suspeito
        if (nome) {
          const extensao = nome.split('.').pop().toLowerCase();
          const tiposSuspeitos = ['exe', 'bat', 'cmd', 'scr', 'pif', 'com', 'dll', 'sys'];
          if (tiposSuspeitos.includes(extensao)) {
            suspeitos++;
          }
        }
      }
    });
    
    return { total, duplicados, grandes, suspeitos };
  }

  /**
   * Mostra resultados para um tipo específico
   */
  mostrarResultadosTipo(tipo, resultados) {
    console.log(`\n📁 ${tipo.toUpperCase()}:`);
    console.log(`   📊 Total: ${resultados.total}`);
    console.log(`   🔄 Duplicados: ${resultados.duplicados}`);
    console.log(`   📏 Grandes: ${resultados.grandes}`);
    console.log(`   ⚠️ Suspeitos: ${resultados.suspeitos}`);
    
    if (resultados.duplicados > 0) {
      console.log(`   🚨 VULNERABILIDADE: Arquivos duplicados encontrados!`);
    }
    if (resultados.grandes > 0) {
      console.log(`   🚨 VULNERABILIDADE: Arquivos muito grandes encontrados!`);
    }
    if (resultados.suspeitos > 0) {
      console.log(`   🚨 VULNERABILIDADE: Tipos de arquivo suspeitos encontrados!`);
    }
  }

  /**
   * Verifica vulnerabilidades específicas em vídeo de conferência
   */
  async verificarVideoConferencia() {
    console.log("\n🎥 VERIFICANDO VÍDEO DE CONFERÊNCIA:");
    console.log("====================================");
    
    // Buscar por campos relacionados a conferência
    const anunciosSnapshot = await db.collection('anuncios').get();
    let videosConferencia = 0;
    let videosConferenciaGrandes = 0;
    let videosConferenciaSuspeitos = 0;
    
    anunciosSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Verificar campos que podem ser vídeo de conferência
      const camposConferencia = ['verification-video', 'video_verificacao', 'video_conferencia', 'conference_video'];
      
      camposConferencia.forEach(campo => {
        const url = data[`${campo}_url`];
        const nome = data[`${campo}_name`];
        const tamanho = data[`${campo}_size`];
        
        if (url) {
          videosConferencia++;
          
          // Verificar tamanho (limite específico para conferência: 50MB)
          if (tamanho && tamanho > 50 * 1024 * 1024) {
            videosConferenciaGrandes++;
          }
          
          // Verificar tipo suspeito
          if (nome) {
            const extensao = nome.split('.').pop().toLowerCase();
            const tiposSuspeitos = ['exe', 'bat', 'cmd', 'scr', 'pif', 'com'];
            if (tiposSuspeitos.includes(extensao)) {
              videosConferenciaSuspeitos++;
            }
          }
        }
      });
    });
    
    console.log(`📊 Vídeos de conferência encontrados: ${videosConferencia}`);
    console.log(`📏 Vídeos muito grandes: ${videosConferenciaGrandes}`);
    console.log(`⚠️ Vídeos suspeitos: ${videosConferenciaSuspeitos}`);
    
    if (videosConferenciaGrandes > 0) {
      console.log(`🚨 VULNERABILIDADE: Vídeos de conferência muito grandes!`);
    }
    if (videosConferenciaSuspeitos > 0) {
      console.log(`🚨 VULNERABILIDADE: Tipos suspeitos em vídeos de conferência!`);
    }
    
    return {
      total: videosConferencia,
      grandes: videosConferenciaGrandes,
      suspeitos: videosConferenciaSuspeitos
    };
  }

  /**
   * Verifica vulnerabilidades em documentos de verificação
   */
  async verificarDocumentosVerificacao() {
    console.log("\n📄 VERIFICANDO DOCUMENTOS DE VERIFICAÇÃO:");
    console.log("==========================================");
    
    const anunciosSnapshot = await db.collection('anuncios').get();
    let documentosVerificacao = 0;
    let documentosGrandes = 0;
    let documentosSuspeitos = 0;
    let documentosDuplicados = 0;
    
    const urlsEncontradas = new Set();
    
    anunciosSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Campos de documentos de verificação
      const camposDocumentos = ['documento-frente', 'documento-verso', 'selfie-documento'];
      
      camposDocumentos.forEach(campo => {
        const url = data[`${campo}_url`];
        const nome = data[`${campo}_name`];
        const tamanho = data[`${campo}_size`];
        
        if (url) {
          documentosVerificacao++;
          
          // Verificar duplicatas
          if (urlsEncontradas.has(url)) {
            documentosDuplicados++;
          } else {
            urlsEncontradas.add(url);
          }
          
          // Verificar tamanho (limite específico para documentos: 5MB)
          if (tamanho && tamanho > 5 * 1024 * 1024) {
            documentosGrandes++;
          }
          
          // Verificar tipo suspeito
          if (nome) {
            const extensao = nome.split('.').pop().toLowerCase();
            const tiposSuspeitos = ['exe', 'bat', 'cmd', 'scr', 'pif', 'com'];
            if (tiposSuspeitos.includes(extensao)) {
              documentosSuspeitos++;
            }
          }
        }
      });
    });
    
    console.log(`📊 Documentos de verificação encontrados: ${documentosVerificacao}`);
    console.log(`🔄 Documentos duplicados: ${documentosDuplicados}`);
    console.log(`📏 Documentos muito grandes: ${documentosGrandes}`);
    console.log(`⚠️ Documentos suspeitos: ${documentosSuspeitos}`);
    
    if (documentosDuplicados > 0) {
      console.log(`🚨 VULNERABILIDADE: Documentos duplicados encontrados!`);
    }
    if (documentosGrandes > 0) {
      console.log(`🚨 VULNERABILIDADE: Documentos muito grandes!`);
    }
    if (documentosSuspeitos > 0) {
      console.log(`🚨 VULNERABILIDADE: Tipos suspeitos em documentos!`);
    }
    
    return {
      total: documentosVerificacao,
      duplicados: documentosDuplicados,
      grandes: documentosGrandes,
      suspeitos: documentosSuspeitos
    };
  }

  /**
   * Verifica vulnerabilidades específicas em áudios
   */
  async verificarAudios() {
    console.log("\n🎵 VERIFICANDO ÁUDIOS:");
    console.log("======================");
    
    const anunciosSnapshot = await db.collection('anuncios').get();
    let audios = 0;
    let audiosGrandes = 0;
    let audiosSuspeitos = 0;
    let audiosDuplicados = 0;
    
    const urlsEncontradas = new Set();
    
    anunciosSnapshot.forEach(doc => {
      const data = doc.data();
      
      const url = data['audio_url'];
      const nome = data['audio_name'];
      const tamanho = data['audio_size'];
      
      if (url) {
        audios++;
        
        // Verificar duplicatas
        if (urlsEncontradas.has(url)) {
          audiosDuplicados++;
        } else {
          urlsEncontradas.add(url);
        }
        
        // Verificar tamanho (limite específico para áudio: 10MB)
        if (tamanho && tamanho > 10 * 1024 * 1024) {
          audiosGrandes++;
        }
        
        // Verificar tipo suspeito
        if (nome) {
          const extensao = nome.split('.').pop().toLowerCase();
          const tiposSuspeitos = ['exe', 'bat', 'cmd', 'scr', 'pif', 'com'];
          if (tiposSuspeitos.includes(extensao)) {
            audiosSuspeitos++;
          }
        }
      }
    });
    
    console.log(`📊 Áudios encontrados: ${audios}`);
    console.log(`🔄 Áudios duplicados: ${audiosDuplicados}`);
    console.log(`📏 Áudios muito grandes: ${audiosGrandes}`);
    console.log(`⚠️ Áudios suspeitos: ${audiosSuspeitos}`);
    
    if (audiosDuplicados > 0) {
      console.log(`🚨 VULNERABILIDADE: Áudios duplicados encontrados!`);
    }
    if (audiosGrandes > 0) {
      console.log(`🚨 VULNERABILIDADE: Áudios muito grandes!`);
    }
    if (audiosSuspeitos > 0) {
      console.log(`🚨 VULNERABILIDADE: Tipos suspeitos em áudios!`);
    }
    
    return {
      total: audios,
      duplicados: audiosDuplicados,
      grandes: audiosGrandes,
      suspeitos: audiosSuspeitos
    };
  }

  /**
   * Gera relatório final de vulnerabilidades
   */
  gerarRelatorioFinal(resultados, videoConferencia, documentosVerificacao, audios) {
    console.log("\n📋 RELATÓRIO FINAL DE VULNERABILIDADES:");
    console.log("=======================================");
    
    let totalVulnerabilidades = 0;
    
    // Verificar vulnerabilidades por tipo
    Object.keys(resultados).forEach(tipo => {
      const resultado = resultados[tipo];
      if (resultado.duplicados > 0 || resultado.grandes > 0 || resultado.suspeitos > 0) {
        totalVulnerabilidades++;
        console.log(`\n🚨 ${tipo.toUpperCase()}: VULNERÁVEL`);
        if (resultado.duplicados > 0) console.log(`   - ${resultado.duplicados} arquivos duplicados`);
        if (resultado.grandes > 0) console.log(`   - ${resultado.grandes} arquivos muito grandes`);
        if (resultado.suspeitos > 0) console.log(`   - ${resultado.suspeitos} tipos suspeitos`);
      } else {
        console.log(`\n✅ ${tipo.toUpperCase()}: SEGURO`);
      }
    });
    
    // Verificar vídeo de conferência
    if (videoConferencia.grandes > 0 || videoConferencia.suspeitos > 0) {
      totalVulnerabilidades++;
      console.log(`\n🚨 VÍDEO DE CONFERÊNCIA: VULNERÁVEL`);
      if (videoConferencia.grandes > 0) console.log(`   - ${videoConferencia.grandes} vídeos muito grandes`);
      if (videoConferencia.suspeitos > 0) console.log(`   - ${videoConferencia.suspeitos} tipos suspeitos`);
    } else {
      console.log(`\n✅ VÍDEO DE CONFERÊNCIA: SEGURO`);
    }
    
    // Verificar documentos de verificação
    if (documentosVerificacao.duplicados > 0 || documentosVerificacao.grandes > 0 || documentosVerificacao.suspeitos > 0) {
      totalVulnerabilidades++;
      console.log(`\n🚨 DOCUMENTOS DE VERIFICAÇÃO: VULNERÁVEL`);
      if (documentosVerificacao.duplicados > 0) console.log(`   - ${documentosVerificacao.duplicados} documentos duplicados`);
      if (documentosVerificacao.grandes > 0) console.log(`   - ${documentosVerificacao.grandes} documentos muito grandes`);
      if (documentosVerificacao.suspeitos > 0) console.log(`   - ${documentosVerificacao.suspeitos} tipos suspeitos`);
    } else {
      console.log(`\n✅ DOCUMENTOS DE VERIFICAÇÃO: SEGURO`);
    }
    
    // Verificar áudios
    if (audios.duplicados > 0 || audios.grandes > 0 || audios.suspeitos > 0) {
      totalVulnerabilidades++;
      console.log(`\n🚨 ÁUDIOS: VULNERÁVEL`);
      if (audios.duplicados > 0) console.log(`   - ${audios.duplicados} áudios duplicados`);
      if (audios.grandes > 0) console.log(`   - ${audios.grandes} áudios muito grandes`);
      if (audios.suspeitos > 0) console.log(`   - ${audios.suspeitos} tipos suspeitos`);
    } else {
      console.log(`\n✅ ÁUDIOS: SEGURO`);
    }
    
    console.log(`\n📊 RESUMO FINAL:`);
    console.log(`   Total de tipos vulneráveis: ${totalVulnerabilidades}`);
    console.log(`   Status geral: ${totalVulnerabilidades === 0 ? '✅ SEGURO' : '🚨 VULNERÁVEL'}`);
    
    return {
      totalVulnerabilidades,
      status: totalVulnerabilidades === 0 ? 'SEGURO' : 'VULNERÁVEL'
    };
  }
}

// Executar análise detalhada
async function executarAnaliseDetalhada() {
  const analise = new AnaliseVulnerabilidadesDetalhada();
  
  try {
    // Analisar vulnerabilidades por tipo
    const resultados = await analise.analisarVulnerabilidadesPorTipo();
    
    // Verificar vídeo de conferência
    const videoConferencia = await analise.verificarVideoConferencia();
    
    // Verificar documentos de verificação
    const documentosVerificacao = await analise.verificarDocumentosVerificacao();
    
    // Verificar áudios
    const audios = await analise.verificarAudios();
    
    // Gerar relatório final
    const relatorio = analise.gerarRelatorioFinal(resultados, videoConferencia, documentosVerificacao, audios);
    
    return relatorio;
    
  } catch (error) {
    console.error("❌ Erro na análise detalhada:", error.message);
  }
}

executarAnaliseDetalhada();
