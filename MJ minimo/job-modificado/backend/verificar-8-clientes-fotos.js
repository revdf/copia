#!/usr/bin/env node

/**
 * Verificação de Clientes com Fotos
 * Verifica se os 8 clientes específicos têm pastas com fotos no Storage
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

class VerificacaoClientesFotos {
  constructor() {
    // Lista dos 8 clientes específicos
    this.clientesEspecificos = [
      { email: 'kekel@gmail.com', uid: 'aRRYDQr7JNhBlcUHEdGWROGMT6M2' },
      { email: 'bobboy@gmail.com', uid: 'KNPE1OLDIWOq5uzx3QYgzgHPeml2' },
      { email: 'dill@gmail.com', uid: 'u7mzDvO1TcVcPC2Gf7Y0qG36yJJ3' },
      { email: 'nina@gmail.com', uid: 'MZK9xuoj2pZrKH3VOVrSCN2mRS83' },
      { email: 'kaka@gmail.com', uid: '5sQjxwjmNHcKAAYXln1URpz0nWh2' },
      { email: 'lili@gmail.com', uid: '90wwDEi6BaVQUtVH0VPDKP1uVlN2' },
      { email: 'dada@gmail.com', uid: 'V5Ocnho53yUAgERie3fLGeEnIa22' },
      { email: 'pepeu@gmail.com', uid: 'x3la07rXlrcf8GsERSHRMe0lFG93' }
    ];
  }

  /**
   * Verifica se cada cliente tem pasta com fotos
   */
  async verificarClientesComFotos() {
    console.log("🔍 VERIFICANDO OS 8 CLIENTES ESPECÍFICOS:");
    console.log("==========================================");
    
    const resultados = [];
    
    for (const cliente of this.clientesEspecificos) {
      console.log(`\n👤 Verificando: ${cliente.email}`);
      console.log(`🆔 UID: ${cliente.uid}`);
      
      const resultado = await this.verificarClienteIndividual(cliente);
      resultados.push(resultado);
    }
    
    return resultados;
  }

  /**
   * Verifica um cliente individual
   */
  async verificarClienteIndividual(cliente) {
    try {
      // 1. Verificar se tem registro no Firestore
      const anuncioSnapshot = await db.collection('anuncios')
        .where('userId', '==', cliente.uid)
        .get();
      
      let temRegistroFirestore = false;
      let dadosAnuncio = null;
      
      if (!anuncioSnapshot.empty) {
        temRegistroFirestore = true;
        dadosAnuncio = anuncioSnapshot.docs[0].data();
        console.log(`   ✅ Registro no Firestore: ${anuncioSnapshot.docs[0].id}`);
        console.log(`   📝 Nome: ${dadosAnuncio.nome || 'N/A'}`);
        console.log(`   🏷️ Categoria: ${dadosAnuncio.categoria || 'N/A'}`);
      } else {
        console.log(`   ❌ Sem registro no Firestore`);
      }
      
      // 2. Verificar se tem pasta no Storage
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({ 
        prefix: `anuncios/${anuncioSnapshot.empty ? cliente.uid : anuncioSnapshot.docs[0].id}/` 
      });
      
      let temPastaStorage = false;
      let arquivosEncontrados = [];
      
      if (files.length > 0) {
        temPastaStorage = true;
        arquivosEncontrados = files.map(file => ({
          nome: file.name,
          tamanho: file.metadata?.size || 0,
          tipo: file.metadata?.contentType || 'unknown'
        }));
        
        console.log(`   ✅ Pasta no Storage: ${files.length} arquivos`);
        
        // Mostrar tipos de arquivos
        const tiposArquivos = {};
        arquivosEncontrados.forEach(arquivo => {
          const tipo = arquivo.tipo.split('/')[0];
          tiposArquivos[tipo] = (tiposArquivos[tipo] || 0) + 1;
        });
        
        console.log(`   📁 Tipos de arquivos:`);
        Object.entries(tiposArquivos).forEach(([tipo, quantidade]) => {
          console.log(`      - ${tipo}: ${quantidade} arquivos`);
        });
        
        // Calcular tamanho total
        const tamanhoTotal = arquivosEncontrados.reduce((total, arquivo) => total + arquivo.tamanho, 0);
        const tamanhoMB = (tamanhoTotal / (1024 * 1024)).toFixed(2);
        console.log(`   💾 Tamanho total: ${tamanhoMB} MB`);
        
      } else {
        console.log(`   ❌ Sem pasta no Storage`);
      }
      
      // 3. Determinar status
      let status = 'INCOMPLETO';
      if (temRegistroFirestore && temPastaStorage) {
        status = 'COMPLETO';
      } else if (temRegistroFirestore && !temPastaStorage) {
        status = 'SEM_FOTOS';
      } else if (!temRegistroFirestore && temPastaStorage) {
        status = 'ORFAO';
      } else {
        status = 'INEXISTENTE';
      }
      
      console.log(`   📊 Status: ${status}`);
      
      return {
        cliente,
        temRegistroFirestore,
        temPastaStorage,
        dadosAnuncio,
        arquivosEncontrados,
        status,
        totalArquivos: arquivosEncontrados.length,
        tamanhoTotal: arquivosEncontrados.reduce((total, arquivo) => total + arquivo.tamanho, 0)
      };
      
    } catch (error) {
      console.error(`   ❌ Erro ao verificar ${cliente.email}:`, error.message);
      return {
        cliente,
        temRegistroFirestore: false,
        temPastaStorage: false,
        dadosAnuncio: null,
        arquivosEncontrados: [],
        status: 'ERRO',
        totalArquivos: 0,
        tamanhoTotal: 0
      };
    }
  }

  /**
   * Gera relatório final
   */
  gerarRelatorioFinal(resultados) {
    console.log("\n📊 RELATÓRIO FINAL:");
    console.log("===================");
    
    const estatisticas = {
      total: resultados.length,
      completos: 0,
      semFotos: 0,
      orfaos: 0,
      inexistentes: 0,
      erros: 0
    };
    
    resultados.forEach(resultado => {
      switch (resultado.status) {
        case 'COMPLETO':
          estatisticas.completos++;
          break;
        case 'SEM_FOTOS':
          estatisticas.semFotos++;
          break;
        case 'ORFAO':
          estatisticas.orfaos++;
          break;
        case 'INEXISTENTE':
          estatisticas.inexistentes++;
          break;
        case 'ERRO':
          estatisticas.erros++;
          break;
      }
    });
    
    console.log(`📊 Total de clientes verificados: ${estatisticas.total}`);
    console.log(`✅ Completos (com registro e fotos): ${estatisticas.completos}`);
    console.log(`📝 Sem fotos (só registro): ${estatisticas.semFotos}`);
    console.log(`🗑️ Órfãos (só fotos): ${estatisticas.orfaos}`);
    console.log(`❌ Inexistentes: ${estatisticas.inexistentes}`);
    console.log(`⚠️ Erros: ${estatisticas.erros}`);
    
    console.log("\n📋 DETALHAMENTO POR CLIENTE:");
    console.log("============================");
    
    resultados.forEach((resultado, index) => {
      const tamanhoMB = (resultado.tamanhoTotal / (1024 * 1024)).toFixed(2);
      console.log(`${index + 1}. ${resultado.cliente.email}`);
      console.log(`   Status: ${resultado.status}`);
      console.log(`   Registro Firestore: ${resultado.temRegistroFirestore ? '✅' : '❌'}`);
      console.log(`   Pasta Storage: ${resultado.temPastaStorage ? '✅' : '❌'}`);
      console.log(`   Arquivos: ${resultado.totalArquivos}`);
      console.log(`   Tamanho: ${tamanhoMB} MB`);
      if (resultado.dadosAnuncio) {
        console.log(`   Nome: ${resultado.dadosAnuncio.nome || 'N/A'}`);
        console.log(`   Categoria: ${resultado.dadosAnuncio.categoria || 'N/A'}`);
      }
      console.log("");
    });
    
    return estatisticas;
  }

  /**
   * Executa verificação completa
   */
  async executarVerificacao() {
    console.log("🔍 INICIANDO VERIFICAÇÃO DOS 8 CLIENTES");
    console.log("=========================================");
    
    try {
      // Verificar cada cliente
      const resultados = await this.verificarClientesComFotos();
      
      // Gerar relatório
      const estatisticas = this.gerarRelatorioFinal(resultados);
      
      // Resumo final
      console.log("\n🎯 RESUMO FINAL:");
      console.log("================");
      
      if (estatisticas.completos === estatisticas.total) {
        console.log("🎉 TODOS OS CLIENTES TÊM FOTOS!");
      } else if (estatisticas.completos > 0) {
        console.log(`✅ ${estatisticas.completos} clientes têm fotos completas`);
        console.log(`⚠️ ${estatisticas.total - estatisticas.completos} clientes precisam de atenção`);
      } else {
        console.log("❌ NENHUM CLIENTE TEM FOTOS COMPLETAS!");
      }
      
    } catch (error) {
      console.error("❌ Erro na verificação:", error.message);
    }
  }
}

// Executar verificação
async function executarVerificacao() {
  const verificacao = new VerificacaoClientesFotos();
  await verificacao.executarVerificacao();
}

executarVerificacao();
