// Script para aplicar os níveis N3 e N7 restantes

import fs from 'fs';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

// Função para aplicar níveis restantes
async function applyRemainingLevels() {
  try {
    console.log('🔄 Aplicando níveis N3 e N7 restantes...');
    
    // 1. Buscar todos os anúncios
    const response = await makeRequest('http://localhost:5001/api/anuncios');
    const anuncios = await response.json();
    
    console.log(`📊 Total de anúncios: ${anuncios.length}`);
    
    // 2. Separar por categoria
    const categorias = ['massagista', 'trans', 'homem', 'webcam'];
    const updates = [];
    
    categorias.forEach(categoria => {
      const anunciosCategoria = anuncios.filter(ad => 
        ad.categoria === categoria || ad.category === categoria
      );
      
      const semNivel = anunciosCategoria.filter(ad => !ad.nivel);
      const comNivel = anunciosCategoria.filter(ad => ad.nivel);
      
      console.log(`\n📂 ${categoria}:`);
      console.log(`  Total: ${anunciosCategoria.length}`);
      console.log(`  Com nível: ${comNivel.length}`);
      console.log(`  Sem nível: ${semNivel.length}`);
      
      // Aplicar N3 (15 anúncios)
      const n3Count = Math.min(15, semNivel.length);
      for (let i = 0; i < n3Count; i++) {
        updates.push({
          id: semNivel[i].id,
          nivel: 'N3',
          level: 'N3',
          nivel_nome: 'Destaque',
          level_name: 'Destaque',
          destaque: true,
          premium: false,
          updatedAt: new Date().toISOString()
        });
      }
      
      // Aplicar N7 (resto)
      const n7Count = semNivel.length - n3Count;
      for (let i = n3Count; i < semNivel.length; i++) {
        updates.push({
          id: semNivel[i].id,
          nivel: 'N7',
          level: 'N7',
          nivel_nome: 'Padrão',
          level_name: 'Padrão',
          destaque: false,
          premium: false,
          updatedAt: new Date().toISOString()
        });
      }
      
      console.log(`  N3 aplicados: ${n3Count}`);
      console.log(`  N7 aplicados: ${n7Count}`);
    });
    
    console.log(`\n🔄 Total de atualizações: ${updates.length}`);
    
    // 3. Aplicar atualizações
    let successCount = 0;
    let errorCount = 0;
    
    for (const update of updates) {
      try {
        const response = await makeRequest(`http://localhost:5001/api/anuncios/${update.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(update)
        });
        
        if (response.ok) {
          successCount++;
          console.log(`✅ ${update.id}: ${update.nivel}`);
        } else {
          errorCount++;
          console.log(`❌ ${update.id}: ${response.status}`);
        }
      } catch (error) {
        errorCount++;
        console.log(`❌ ${update.id}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Resultado:`);
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    
    // 4. Verificar resultado final
    console.log('\n🔍 Verificando resultado final...');
    const finalResponse = await makeRequest('http://localhost:5001/api/anuncios');
    const finalAnuncios = await finalResponse.json();
    
    categorias.forEach(categoria => {
      const anunciosCategoria = finalAnuncios.filter(ad => 
        ad.categoria === categoria || ad.category === categoria
      );
      
      const n1Count = anunciosCategoria.filter(ad => ad.nivel === 'N1').length;
      const n3Count = anunciosCategoria.filter(ad => ad.nivel === 'N3').length;
      const n7Count = anunciosCategoria.filter(ad => ad.nivel === 'N7').length;
      const semNivel = anunciosCategoria.filter(ad => !ad.nivel).length;
      
      console.log(`\n📂 ${categoria}:`);
      console.log(`  N1: ${n1Count}`);
      console.log(`  N3: ${n3Count}`);
      console.log(`  N7: ${n7Count}`);
      console.log(`  Sem nível: ${semNivel}`);
    });
    
    console.log('\n🎉 Níveis aplicados com sucesso!');
    console.log('📱 Recarregue as páginas para ver as mudanças');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  applyRemainingLevels();
}

export { applyRemainingLevels };












