import admin from 'firebase-admin';
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

// Configurações esperadas
const EXPECTED_LEVELS = {
  N1: 29,
  N3: 15,
  N5: 0,
  N7: 199
};

const CATEGORIES = ['mulheres', 'massagistas', 'trans', 'homens'];

// Função para verificar população
async function verifyPopulation() {
  try {
    console.log('🔍 Verificando população do banco de dados...');
    console.log('📊 Especificações esperadas:');
    console.log('   - N1 (Premium VIP): 29 anúncios por categoria');
    console.log('   - N3 (Destaque): 15 anúncios por categoria');
    console.log('   - N5 (Intermediário): 0 anúncios');
    console.log('   - N7 (Padrão): 199 anúncios por categoria');
    console.log('   - Total por categoria: 243 anúncios');
    console.log('   - Total geral: 1.215 anúncios');
    console.log('');

    // Buscar todos os anúncios
    const snapshot = await db.collection('anuncios').get();
    const anuncios = [];
    
    snapshot.docs.forEach(doc => {
      anuncios.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`📊 Total de anúncios encontrados: ${anuncios.length}`);
    console.log('');

    // Verificar por categoria
    const stats = {
      total: anuncios.length,
      porCategoria: {},
      porNivel: {},
      comStories: 0,
      semStories: 0,
      ativos: 0,
      inativos: 0
    };

    // Inicializar contadores
    CATEGORIES.forEach(categoria => {
      stats.porCategoria[categoria] = {
        total: 0,
        N1: 0, N3: 0, N5: 0, N7: 0
      };
    });

    Object.keys(EXPECTED_LEVELS).forEach(nivel => {
      stats.porNivel[nivel] = 0;
    });

    // Processar anúncios
    anuncios.forEach(anuncio => {
      const categoria = anuncio.categoria || anuncio.category;
      const nivel = anuncio.nivel || anuncio.level;
      
      // Contar por categoria
      if (stats.porCategoria[categoria]) {
        stats.porCategoria[categoria].total++;
        if (stats.porCategoria[categoria][nivel] !== undefined) {
          stats.porCategoria[categoria][nivel]++;
        }
      }
      
      // Contar por nível
      if (stats.porNivel[nivel] !== undefined) {
        stats.porNivel[nivel]++;
      }
      
      // Verificar stories
      if (anuncio.foto_stories && anuncio.foto_stories.trim() !== '') {
        stats.comStories++;
      } else {
        stats.semStories++;
      }
      
      // Verificar status
      if (anuncio.ativo && anuncio.status === 'ativo') {
        stats.ativos++;
      } else {
        stats.inativos++;
      }
    });

    // Exibir resultados por categoria
    console.log('📋 RESULTADOS POR CATEGORIA:');
    console.log('═'.repeat(80));
    
    let totalEsperado = 0;
    let totalReal = 0;
    
    CATEGORIES.forEach(categoria => {
      const catStats = stats.porCategoria[categoria];
      const esperado = Object.values(EXPECTED_LEVELS).reduce((sum, count) => sum + count, 0);
      
      console.log(`\n${categoria.toUpperCase()}:`);
      console.log(`  Total: ${catStats.total} (esperado: ${esperado})`);
      
      Object.keys(EXPECTED_LEVELS).forEach(nivel => {
        const real = catStats[nivel] || 0;
        const esperado = EXPECTED_LEVELS[nivel];
        const status = real === esperado ? '✅' : real > esperado ? '⚠️' : '❌';
        
        console.log(`    ${nivel}: ${real} (esperado: ${esperado}) ${status}`);
        totalEsperado += esperado;
        totalReal += real;
      });
    });

    // Exibir resultados por nível
    console.log('\n📊 RESULTADOS POR NÍVEL:');
    console.log('═'.repeat(50));
    
    Object.keys(EXPECTED_LEVELS).forEach(nivel => {
      const real = stats.porNivel[nivel];
      const esperado = EXPECTED_LEVELS[nivel] * CATEGORIES.length;
      const status = real === esperado ? '✅' : real > esperado ? '⚠️' : '❌';
      
      console.log(`${nivel}: ${real} (esperado: ${esperado}) ${status}`);
    });

    // Verificar stories
    console.log('\n📸 VERIFICAÇÃO DE STORIES:');
    console.log('═'.repeat(40));
    console.log(`Com fotos para stories: ${stats.comStories}`);
    console.log(`Sem fotos para stories: ${stats.semStories}`);
    
    if (stats.semStories === 0) {
      console.log('✅ Todos os anúncios têm fotos para stories!');
    } else {
      console.log(`❌ ${stats.semStories} anúncios não têm fotos para stories`);
    }

    // Verificar status
    console.log('\n🔄 VERIFICAÇÃO DE STATUS:');
    console.log('═'.repeat(35));
    console.log(`Ativos: ${stats.ativos}`);
    console.log(`Inativos: ${stats.inativos}`);

    // Resumo geral
    console.log('\n🎯 RESUMO GERAL:');
    console.log('═'.repeat(30));
    console.log(`Total de anúncios: ${stats.total}`);
    console.log(`Total esperado: ${totalEsperado}`);
    
    if (stats.total === totalEsperado) {
      console.log('✅ Quantidade total correta!');
    } else {
      console.log(`❌ Quantidade total incorreta! Diferença: ${stats.total - totalEsperado}`);
    }

    // Verificar distribuição
    const distribuicaoCorreta = CATEGORIES.every(categoria => {
      const catStats = stats.porCategoria[categoria];
      return Object.keys(EXPECTED_LEVELS).every(nivel => {
        const real = catStats[nivel] || 0;
        const esperado = EXPECTED_LEVELS[nivel];
        return real === esperado;
      });
    });

    if (distribuicaoCorreta) {
      console.log('✅ Distribuição por categoria e nível correta!');
    } else {
      console.log('❌ Distribuição por categoria e nível incorreta!');
    }

    // Verificar níveis premium
    const n1Count = stats.porNivel.N1;
    const n3Count = stats.porNivel.N3;
    const n7Count = stats.porNivel.N7;
    
    console.log('\n💎 VERIFICAÇÃO DE NÍVEIS PREMIUM:');
    console.log('═'.repeat(45));
    console.log(`N1 (Premium VIP): ${n1Count} anúncios`);
    console.log(`N3 (Destaque): ${n3Count} anúncios`);
    console.log(`N7 (Padrão): ${n7Count} anúncios`);
    
    // Verificar se N1 e N3 são destaques
    const n1Destaques = anuncios.filter(a => a.nivel === 'N1' && a.destaque).length;
    const n3Destaques = anuncios.filter(a => a.nivel === 'N3' && a.destaque).length;
    
    console.log(`\nN1 com destaque: ${n1Destaques}/${n1Count}`);
    console.log(`N3 com destaque: ${n3Destaques}/${n3Count}`);
    
    if (n1Destaques === n1Count && n3Destaques === n3Count) {
      console.log('✅ Todos os N1 e N3 estão marcados como destaque!');
    } else {
      console.log('❌ Alguns N1 ou N3 não estão marcados como destaque!');
    }

    // Exibir alguns exemplos
    console.log('\n📝 EXEMPLOS DE ANÚNCIOS:');
    console.log('═'.repeat(30));
    
    const exemplos = anuncios.slice(0, 5);
    exemplos.forEach((anuncio, index) => {
      console.log(`${index + 1}. ${anuncio.nome} (${anuncio.categoria}, ${anuncio.nivel})`);
      console.log(`   Preço: R$ ${anuncio.preco_1h}`);
      console.log(`   Stories: ${anuncio.foto_stories ? '✅' : '❌'}`);
      console.log(`   Destaque: ${anuncio.destaque ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('❌ Erro ao verificar população:', error);
  } finally {
    process.exit(0);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyPopulation();
}

export { verifyPopulation };
