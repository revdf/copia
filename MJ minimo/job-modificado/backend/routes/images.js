/**
 * Rota para servir imagens da pasta fotinha
 * GET /api/images/:filename
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Caminho para a pasta de fotos
const fotosPath = path.join(__dirname, '../../..', 'fotinha', 'fotos');

/**
 * GET /api/images/:filename
 * Serve imagens da pasta fotinha/fotos
 */
router.get('/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(fotosPath, filename);
        
        // Verificar se o arquivo existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Imagem não encontrada' });
        }
        
        // Enviar arquivo
        res.sendFile(filePath);
    } catch (error) {
        console.error('❌ Erro ao servir imagem:', error);
        res.status(500).json({ error: 'Erro ao carregar imagem' });
    }
});

export default router;









