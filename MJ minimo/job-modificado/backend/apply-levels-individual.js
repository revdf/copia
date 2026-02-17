// Script para aplicar os níveis N1, N3, N7 ao banco usando atualizações individuais
// Usa o endpoint PUT individual que funciona

import fs from 'fs';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

// Função para aplicar níveis ao banco
async function applyLevelsIndividual() {
  try {
    console.log('🚀 Aplicando níveis N1, N3, N7 ao banco de dados (individual)...');
    
    // 1. Verificar se o arquivo de atualizações existe
    if (!fs.existsSync('anuncios-updates.json')) {
      console.error('❌ Arquivo anuncios-updates.json não encontrado!');
      console.log('💡 Execute primeiro: node update-ads-with-levels.js');
      return;
    }
    
    // 2. Carregar atualizações
    const updates = JSON.parse(fs.readFileSync('anuncios-updates.json', 'utf8'));
    console.log(`📊 ${updates.length} atualizações carregadas`);
    
    // 3. Buscar anúncios existentes para obter IDs
    console.log('📡 Buscando anúncios existentes...');
    const response = await makeRequest('http://localhost:5001/api/anuncios');
    const anuncios = await response.json();
    
    console.log(`📊 ${anuncios.length} anúncios encontrados no banco`);
    
    // 4. Mapear atualizações com IDs reais
    const updatesWithIds = [];
    let matchedCount = 0;
    
    for (const update of updates) {
      const anuncio = anuncios.find(ad => 
        ad.nome === update.nome && ad.categoria === update.categoria
      );
      
      if (anuncio && anuncio.id) {
        updatesWithIds.push({
          id: anuncio.id,
          nivel: update.nivel,
          level: update.level,
          nivel_nome: update.nivel_nome,
          level_name: update.level_name,
          destaque: update.destaque,
          premium: update.premium,
          preco: update.preco,
          price: update.price,
          preco_hora: update.preco_hora,
          price_per_hour: update.price_per_hour,
          preco_30min: update.preco_30min,
          preco_45min: update.preco_45min,
          preco_1h: update.preco_1h,
          updatedAt: new Date().toISOString()
        });
        matchedCount++;
      }
    }
    
    console.log(`🔗 ${matchedCount} anúncios mapeados com IDs`);
    
    if (matchedCount === 0) {
      console.error('❌ Nenhum anúncio foi mapeado! Verifique os nomes e categorias.');
      return;
    }
    
    // 5. Aplicar atualizações individuais
    console.log('📝 Aplicando atualizações individuais ao banco...');
    
    let totalUpdated = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < updatesWithIds.length; i++) {
      const update = updatesWithIds[i];
      
      try {
        const { id, ...updateData } = update;
        
        const response = await makeRequest(`http://localhost:5001/api/anuncios/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
          totalUpdated++;
          if ((i + 1) % 10 === 0 || i === updatesWithIds.length - 1) {
            console.log(`✅ ${i + 1}/${updatesWithIds.length} anúncios processados`);
          }
        } else {
          console.error(`❌ Erro ao atualizar anúncio ${i + 1}: ${response.status}`);
          totalErrors++;
        }
        
        // Pequena pausa entre atualizações
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`❌ Erro ao atualizar anúncio ${i + 1}:`, error.message);
        totalErrors++;
      }
    }
    
    console.log(`\n🎉 Atualização concluída!`);
    console.log(`📊 Total de anúncios atualizados: ${totalUpdated}`);
    console.log(`❌ Total de erros: ${totalErrors}`);
    
    // 6. Verificar resultado
    console.log('\n🔍 Verificando resultado...');
    const verifyResponse = await makeRequest('http://localhost:5001/api/anuncios');
    const updatedAnuncios = await verifyResponse.json();
    
    // Contar por nível
    const niveisCount = { N1: 0, N3: 0, N7: 0, 'sem nivel': 0 };
    updatedAnuncios.forEach(anuncio => {
      if (anuncio.nivel) {
        niveisCount[anuncio.nivel] = (niveisCount[anuncio.nivel] || 0) + 1;
      } else {
        niveisCount['sem nivel']++;
      }
    });
    
    console.log('\n📊 Distribuição por nível após atualização:');
    Object.entries(niveisCount).forEach(([nivel, count]) => {
      console.log(`  ${nivel}: ${count} anúncios`);
    });
    
    // Verificar destaque e premium
    const destaqueCount = updatedAnuncios.filter(ad => ad.destaque).length;
    const premiumCount = updatedAnuncios.filter(ad => ad.premium).length;
    
    console.log(`\n⭐ Anúncios em destaque: ${destaqueCount}`);
    console.log(`💎 Anúncios premium: ${premiumCount}`);
    
    // Verificar stories
    const storiesCount = updatedAnuncios.filter(ad => ad.foto_stories).length;
    console.log(`📸 Anúncios com fotos para stories: ${storiesCount}/${updatedAnuncios.length}`);
    
    // 7. Status final
    console.log('\n🎯 Status final:');
    const temNiveis = niveisCount.N1 > 0 || niveisCount.N3 > 0 || niveisCount.N7 > 0;
    const temStories = storiesCount === updatedAnuncios.length;
    const temDestaque = destaqueCount > 0;
    const temPremium = premiumCount > 0;
    
    console.log(`Níveis implementados: ${temNiveis ? '✅' : '❌'}`);
    console.log(`Fotos para stories: ${temStories ? '✅' : '❌'}`);
    console.log(`Anúncios em destaque: ${temDestaque ? '✅' : '❌'}`);
    console.log(`Anúncios premium: ${temPremium ? '✅' : '❌'}`);
    
    if (temNiveis && temStories && temDestaque && temPremium) {
      console.log('\n🎉 SUCESSO! Os níveis foram aplicados com sucesso!');
      console.log('🌐 Agora acesse http://127.0.0.1:8080/A_02__premium.html para ver os resultados');
    } else {
      console.log('\n⚠️ Ainda há problemas - verifique os logs acima');
    }
    
  } catch (error) {
    console.error('❌ Erro ao aplicar níveis:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  applyLevelsIndividual();
}

export { applyLevelsIndividual };












