// Servidor simples para servir imagens
// Este servidor serve as imagens da pasta fotinha/fotos

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5503;

// Configurar CORS
app.use(cors({
  origin: [
    "http://localhost:5502",
    "http://127.0.0.1:5502",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  credentials: true
}));

// Servir arquivos estáticos da pasta fotinha
app.use('/fotinha', express.static(path.join(__dirname, '..', 'fotinha'), {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  }
}));

// Rota específica para fotos com espaços
app.get('/fotinha/fotos/*', (req, res) => {
  const fileName = req.params[0];
  const filePath = path.join(__dirname, '..', 'fotinha', 'fotos', fileName);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log(`❌ Erro ao servir arquivo: ${fileName}`);
      res.status(404).send('Arquivo não encontrado');
    }
  });
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor de imagens funcionando',
    port: PORT,
    fotos: '/fotinha/fotos/'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🖼️ Servidor de imagens iniciado!');
  console.log(`🔗 Porta: ${PORT}`);
  console.log(`📁 Servindo: /fotinha/fotos/`);
  console.log(`🌐 Acesse: http://localhost:${PORT}/fotinha/fotos/`);
  console.log('');
  console.log('📋 URLs de exemplo:');
  console.log(`   http://localhost:${PORT}/fotinha/fotos/foto (1).jpg`);
  console.log(`   http://localhost:${PORT}/fotinha/fotos/avatar (2).jpg`);
  console.log(`   http://localhost:${PORT}/fotinha/fotos/gallery-1754067033867-856036152.jpg`);
});

module.exports = app;
