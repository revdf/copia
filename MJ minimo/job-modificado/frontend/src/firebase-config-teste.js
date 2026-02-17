// Firebase Configuration para PROJETO DE TESTE - copia-do-job
// Este arquivo usa as configurações do projeto de teste isolado
// ⚠️ IMPORTANTE: Obtenha a API Key real do Firebase Console do projeto copia-do-job
// Link: https://console.firebase.google.com/project/copia-do-job/settings/general

const firebaseConfig = {
  apiKey: "AIzaSyCCU3l-J-7JrlWXKVlQJAit9VypIi7hn38",
  authDomain: "mansao-do-job.firebaseapp.com",
  projectId: "mansao-do-job",
  storageBucket: "mansao-do-job.firebasestorage.app",
  messagingSenderId: "606628146135",
  appId: "1:606628146135:web:b374ed2678d20991577992",
  measurementId: "G-4EZJTTZNC4"
};

// Exportar configuração
if (typeof module !== "undefined" && module.exports) {
  module.exports = firebaseConfig;
} else {
  window.firebaseConfig = firebaseConfig;
}

// Log para identificar que está usando configuração de teste
console.log("🔥 Firebase configurado para PROJETO DE TESTE: copia-do-job");
console.log("⚠️  ATENÇÃO: Este é um ambiente de TESTE isolado!");















