// firebase-config.js
// Configuração Firebase para conexão direta (sem Node.js)
// Configuração padronizada para seguir o backend (copia-do-job)
// ⚠️ IMPORTANTE: Obtenha a API Key real do Firebase Console do projeto copia-do-job
// Link: https://console.firebase.google.com/project/copia-do-job/settings/general

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// 🔧 Configuração Firebase - Projeto mansao-do-job
const firebaseConfig = {
  apiKey: "AIzaSyCCU3l-J-7JrlWXKVlQJAit9VypIi7hn38",
  authDomain: "mansao-do-job.firebaseapp.com",
  projectId: "mansao-do-job",
  storageBucket: "mansao-do-job.firebasestorage.app",
  messagingSenderId: "606628146135",
  appId: "1:606628146135:web:b374ed2678d20991577992"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar serviços
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log("🔥 Firebase configurado com sucesso!");
console.log("📊 Projeto:", firebaseConfig.projectId);
console.log("📦 Storage:", firebaseConfig.storageBucket);
