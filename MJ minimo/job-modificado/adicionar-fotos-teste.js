#!/usr/bin/env node

// Script para adicionar fotos da pasta teste ao banco de dados
const fs = require('fs');
const path = require('path');

console.log('🚀 ADICIONANDO FOTOS DA PASTA TESTE AO BANCO DE DADOS');
console.log('====================================================');

// Lista das fotos da pasta teste
const fotosTeste = [
  'avatar (5).jpg',
  'avatar (7).jpg', 
  'avatar.jpg',
  'modelo  B.jpg',
  'modelo A.jpg',
  'modelo A2.jpg',
  'modelo A3.jpg',
  'modelo PH_1.jpg',
  'modelo PH_2.jpg',
  'quadrada (3).jpg',
  'quadrado (14).jpg',
  'quadrado (6).jpg',
  'quadrado (9).jpg',
  'retangulo (1).jpg',
  'retangulo (2).jpg',
  'retangulo (4).jpg'
];

// Dados de exemplo para os anúncios
const anunciosExemplo = [
  {
    nome: 'Modelo A',
    categoria: 'trans',
    descricao: 'Modelo profissional com experiência em diversas áreas',
    preco: 150,
    telefone: '(11) 99999-0001',
    fotos: ['modelo A.jpg', 'avatar.jpg']
  },
  {
    nome: 'Modelo A2',
    categoria: 'trans',
    descricao: 'Modelo versátil e profissional',
    preco: 180,
    telefone: '(11) 99999-0002',
    fotos: ['modelo A2.jpg', 'avatar (5).jpg']
  },
  {
    nome: 'Modelo A3',
    categoria: 'trans',
    descricao: 'Modelo experiente e dedicada',
    preco: 200,
    telefone: '(11) 99999-0003',
    fotos: ['modelo A3.jpg', 'avatar (7).jpg']
  },
  {
    nome: 'Modelo B',
    categoria: 'trans',
    descricao: 'Modelo profissional com portfólio diversificado',
    preco: 160,
    telefone: '(11) 99999-0004',
    fotos: ['modelo  B.jpg', 'quadrada (3).jpg']
  },
  {
    nome: 'Modelo PH 1',
    categoria: 'trans',
    descricao: 'Modelo especializada em fotos profissionais',
    preco: 170,
    telefone: '(11) 99999-0005',
    fotos: ['modelo PH_1.jpg', 'quadrado (6).jpg']
  },
  {
    nome: 'Modelo PH 2',
    categoria: 'trans',
    descricao: 'Modelo com experiência em diversos estilos',
    preco: 190,
    telefone: '(11) 99999-0006',
    fotos: ['modelo PH_2.jpg', 'quadrado (9).jpg']
  }
];

async function adicionarAnuncios() {
  try {
    console.log('📋 Preparando dados dos anúncios...');
    
    for (const anuncio of anunciosExemplo) {
      const anuncioData = {
        ...anuncio,
        dataCriacao: new Date().toISOString(),
        ativo: true,
        visualizacoes: 0,
        favoritos: 0
      };
      
      console.log(`📝 Adicionando anúncio: ${anuncio.nome}`);
      
      const response = await fetch('http://localhost:5001/api/anuncios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(anuncioData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Anúncio ${anuncio.nome} adicionado com sucesso! ID: ${result.id || 'N/A'}`);
      } else {
        console.log(`❌ Erro ao adicionar anúncio ${anuncio.nome}: ${response.status}`);
      }
    }
    
    console.log('\n🎉 Processo concluído!');
    console.log('📊 Verificando total de anúncios...');
    
    const response = await fetch('http://localhost:5001/api/anuncios');
    const anuncios = await response.json();
    console.log(`📈 Total de anúncios no banco: ${anuncios.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao adicionar anúncios:', error.message);
  }
}

// Verificar se o backend está rodando
async function verificarBackend() {
  try {
    const response = await fetch('http://localhost:5001/api/anuncios');
    if (response.ok) {
      console.log('✅ Backend está funcionando!');
      return true;
    } else {
      console.log('❌ Backend não está respondendo corretamente');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend não está rodando na porta 5001');
    console.log('💡 Inicie o backend primeiro: cd backend && node simple-server.js');
    return false;
  }
}

// Executar script
async function main() {
  const backendOk = await verificarBackend();
  
  if (backendOk) {
    await adicionarAnuncios();
  } else {
    console.log('\n🔄 Execute este script novamente após iniciar o backend');
  }
}

main();
