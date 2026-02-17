// Script para verificar estatísticas do banco de dados populado
// Este script mostra informações sobre os dados criados

const admin = require("firebase-admin");
require('dotenv').config({ path: './config-firebase-only.env' });

// Inicializar Firebase Admin SDK
const serviceAccount = {
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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

const db = admin.firestore();

// Função para obter estatísticas
async function obterEstatisticas() {
  console.log("📊 ESTATÍSTICAS DO BANCO DE DADOS - copia-do-job");
  console.log(`🌍 Ambiente: ${process.env.ENVIRONMENT}`);
  console.log(`🔥 Firebase: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log("=" * 60);
  console.log("");
  
  try {
    // Estatísticas de anúncios
    console.log("📋 ANÚNCIOS:");
    const anunciosSnapshot = await db.collection('anuncios').get();
    const anuncios = [];
    anunciosSnapshot.forEach(doc => {
      anuncios.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`   Total de anúncios: ${anuncios.length}`);
    
    // Agrupar por categoria
    const categorias = {};
    anuncios.forEach(anuncio => {
      const cat = anuncio.categoria || 'indefinida';
      categorias[cat] = (categorias[cat] || 0) + 1;
    });
    
    console.log("   Por categoria:");
    Object.entries(categorias).forEach(([categoria, count]) => {
      console.log(`     - ${categoria}: ${count} anúncios`);
    });
    
    // Preços
    const precos = anuncios.map(a => a.preco || 0).filter(p => p > 0);
    if (precos.length > 0) {
      const precoMin = Math.min(...precos);
      const precoMax = Math.max(...precos);
      const precoMedio = precos.reduce((a, b) => a + b, 0) / precos.length;
      
      console.log("   Preços:");
      console.log(`     - Mínimo: R$ ${precoMin}`);
      console.log(`     - Máximo: R$ ${precoMax}`);
      console.log(`     - Médio: R$ ${Math.round(precoMedio)}`);
    }
    
    // Anúncios em destaque
    const destaque = anuncios.filter(a => a.destaque).length;
    console.log(`   - Em destaque: ${destaque}`);
    
    // Views e likes
    const totalViews = anuncios.reduce((sum, a) => sum + (a.views || 0), 0);
    const totalLikes = anuncios.reduce((sum, a) => sum + (a.likes || 0), 0);
    console.log(`   - Total de views: ${totalViews}`);
    console.log(`   - Total de likes: ${totalLikes}`);
    
    console.log("");
    
    // Estatísticas de usuários
    console.log("👥 USUÁRIOS:");
    const usuariosSnapshot = await db.collection('usuarios').get();
    const usuarios = [];
    usuariosSnapshot.forEach(doc => {
      usuarios.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`   Total de usuários: ${usuarios.length}`);
    
    // Usuários por status
    const status = {};
    usuarios.forEach(usuario => {
      const stat = usuario.status || 'indefinido';
      status[stat] = (status[stat] || 0) + 1;
    });
    
    console.log("   Por status:");
    Object.entries(status).forEach(([stat, count]) => {
      console.log(`     - ${stat}: ${count} usuários`);
    });
    
    // Usuários por role
    const roles = {};
    usuarios.forEach(usuario => {
      const role = usuario.role || 'indefinido';
      roles[role] = (roles[role] || 0) + 1;
    });
    
    console.log("   Por tipo:");
    Object.entries(roles).forEach(([role, count]) => {
      console.log(`     - ${role}: ${count} usuários`);
    });
    
    console.log("");
    
    // Estatísticas gerais
    console.log("📈 RESUMO GERAL:");
    console.log(`   - Total de documentos: ${anuncios.length + usuarios.length}`);
    console.log(`   - Anúncios: ${anuncios.length}`);
    console.log(`   - Usuários: ${usuarios.length}`);
    console.log(`   - Categorias de anúncios: ${Object.keys(categorias).length}`);
    console.log(`   - Projeto: ${process.env.PROJECT_NAME || 'copia-do-job'}`);
    console.log(`   - Ambiente: ${process.env.ENVIRONMENT}`);
    
    console.log("");
    console.log("🔗 Links úteis:");
    console.log(`   - Firebase Console: https://console.firebase.google.com/u/0/project/${process.env.FIREBASE_PROJECT_ID}/firestore`);
    console.log(`   - API de anúncios: http://localhost:5001/api/anuncios`);
    console.log(`   - Página de teste: http://127.0.0.1:5502/frontend/src/cadastro-simples-teste.html`);
    
    console.log("");
    console.log("✅ Banco de dados populado com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro ao obter estatísticas:", error.message);
  }
  
  process.exit(0);
}

// Executar
obterEstatisticas().catch(error => {
  console.error("❌ Erro:", error);
  process.exit(1);
});















