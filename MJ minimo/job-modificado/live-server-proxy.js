const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = 8080;

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'frontend/src')));

// Proxy simples para a API do backend
app.use('/api', (req, res) => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Erro no proxy:', err);
    res.status(500).json({ error: 'Erro no proxy para API' });
  });

  req.pipe(proxyReq);
});

// Rota para servir o index.html por padrão
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/index.html'));
});

// Rota para todas as outras páginas HTML
app.get('*.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src', req.path));
});

app.listen(PORT, () => {
  console.log(`🚀 Live Server Proxy rodando na porta ${PORT}`);
  console.log(`📁 Servindo arquivos de: frontend/src/`);
  console.log(`🔗 Proxy API: /api -> http://localhost:5000`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
  console.log(`📋 URLs disponíveis:`);
  console.log(`   - Página Principal: http://localhost:${PORT}/`);
  console.log(`   - Premium: http://localhost:${PORT}/premium.html`);
  console.log(`   - Cadastro: http://localhost:${PORT}/criar-conta-Anuncio.html`);
  console.log(`   - Anúncios: http://localhost:${PORT}/anunciar_GP_01.html`);
  console.log(`   - API: http://localhost:${PORT}/api/advertisements`);
});
