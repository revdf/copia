// firebase-utils.js
// Utilitários para conexão direta com Firebase (sem Node.js)

import { db, storage } from "./firebase-config.js";
import { collection, getDocs, query, where, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// 🎯 Função para carregar todos os anúncios
export async function carregarTodosAnuncios() {
  try {
    console.log("📡 Carregando anúncios do Firebase...");
    const anunciosRef = collection(db, "anuncios");
    const snapshot = await getDocs(anunciosRef);
    const anuncios = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const anuncio = {
        id: doc.id,
        ...data,
        // Converter foto_capa para URL
        foto_capa: await getImageUrl(data.foto_capa)
      };
      anuncios.push(anuncio);
    }

    console.log(`✅ ${anuncios.length} anúncios carregados do Firebase`);
    return anuncios;
  } catch (error) {
    console.error("❌ Erro ao carregar anúncios:", error);
    return [];
  }
}

// 🎯 Função para carregar anúncios por categoria
export async function carregarAnunciosPorCategoria(categoria) {
  try {
    console.log(`📡 Carregando anúncios da categoria: ${categoria}`);
    const anunciosRef = collection(db, "anuncios");
    const q = query(anunciosRef, where("categoria", "==", categoria));
    const snapshot = await getDocs(q);
    const anuncios = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const anuncio = {
        id: doc.id,
        ...data,
        foto_capa: await getImageUrl(data.foto_capa)
      };
      anuncios.push(anuncio);
    }

    console.log(`✅ ${anuncios.length} anúncios da categoria ${categoria} carregados`);
    return anuncios;
  } catch (error) {
    console.error(`❌ Erro ao carregar anúncios da categoria ${categoria}:`, error);
    return [];
  }
}

// 🎯 Função para carregar anúncios em destaque
export async function carregarAnunciosDestaque(limite = 6) {
  try {
    console.log(`📡 Carregando ${limite} anúncios em destaque...`);
    const anunciosRef = collection(db, "anuncios");
    const q = query(anunciosRef, where("destaque", "==", true), limit(limite));
    const snapshot = await getDocs(q);
    const anuncios = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const anuncio = {
        id: doc.id,
        ...data,
        foto_capa: await getImageUrl(data.foto_capa)
      };
      anuncios.push(anuncio);
    }

    console.log(`✅ ${anuncios.length} anúncios em destaque carregados`);
    return anuncios;
  } catch (error) {
    console.error("❌ Erro ao carregar anúncios em destaque:", error);
    return [];
  }
}

// 🎯 Função para converter nome de arquivo em URL do Firebase Storage
export async function getImageUrl(filename) {
  try {
    if (!filename) return null;
    
    // Se já é uma URL completa, retorna como está
    if (filename.startsWith('http')) {
      return filename;
    }
    
    // Buscar no Firebase Storage
    const imageRef = ref(storage, filename);
    const url = await getDownloadURL(imageRef);
    console.log(`🔥 Imagem carregada do Firebase Storage: ${filename}`);
    return url;
  } catch (error) {
    console.log(`⚠️ Imagem não encontrada no Firebase Storage: ${filename}`);
    // Fallback para avatar padrão
    try {
      const defaultRef = ref(storage, 'avatar.jpg');
      const defaultUrl = await getDownloadURL(defaultRef);
      console.log(`🔄 Usando avatar padrão para: ${filename}`);
      return defaultUrl;
    } catch (defaultError) {
      console.log(`❌ Avatar padrão também não encontrado`);
      return 'https://via.placeholder.com/300x400/FFB6C1/FFFFFF?text=Sem+Imagem';
    }
  }
}

// 🎯 Função para renderizar anúncios em cards
export function renderizarAnuncios(anuncios, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error(`❌ Container não encontrado: ${containerSelector}`);
    return;
  }

  if (anuncios.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <h3>Nenhum anúncio encontrado</h3>
        <p>Tente novamente mais tarde.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = anuncios.map(anuncio => `
    <div class="ad-card" data-id="${anuncio.id}">
      <div class="ad-image">
        <img src="${anuncio.foto_capa || 'https://via.placeholder.com/300x400'}" 
             alt="${anuncio.nome || 'Anúncio'}" 
             loading="lazy"
             onerror="this.src='https://via.placeholder.com/300x400/FFB6C1/FFFFFF?text=Erro+Carregamento'">
        <div class="ad-badge">${anuncio.categoria || 'Premium'}</div>
      </div>
      <div class="ad-info">
        <h3 class="ad-name">${anuncio.nome || 'Nome não informado'}</h3>
        <p class="ad-location">${anuncio.cidade || 'Brasília'}, ${anuncio.estado || 'DF'}</p>
        <p class="ad-neighborhood">${anuncio.bairro || 'Centro'}</p>
        <div class="ad-price">R$ ${anuncio.preco || '0'}</div>
        <div class="ad-details">
          <span class="ad-age">${anuncio.idade || 'N/A'} anos</span>
          <span class="ad-views">👁️ ${anuncio.views || 0}</span>
        </div>
      </div>
    </div>
  `).join('');

  console.log(`✅ ${anuncios.length} anúncios renderizados`);
}

// 🎯 Função para mostrar loading
export function mostrarLoading(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (container) {
    container.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Carregando anúncios...</p>
      </div>
    `;
  }
}

// 🎯 Função para mostrar erro
export function mostrarErro(containerSelector, mensagem = "Erro ao carregar dados") {
  const container = document.querySelector(containerSelector);
  if (container) {
    container.innerHTML = `
      <div class="error">
        <h3>❌ Erro</h3>
        <p>${mensagem}</p>
        <button onclick="location.reload()">Tentar novamente</button>
      </div>
    `;
  }
}

console.log("🔧 Firebase Utils carregado com sucesso!");
