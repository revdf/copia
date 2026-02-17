const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { loginLimiter, ipWhitelist, logLoginAttempt, checkBlocked } = require('../middleware/security');
const { sendSecurityAlert, sendSecurityCode } = require('../services/emailService');
const AuthenticatorService = require('../services/authenticatorService');
const axios = require('axios');
const { rateLimit, ipWhitelist: simpleIpWhitelist, checkBlocked: simpleCheckBlocked, logLoginAttempt: simpleLogLoginAttempt } = require('../middleware/simpleSecurity');

// Middleware para verificar o token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

// Middleware para verificar reCAPTCHA
const verifyRecaptcha = async (req, res, next) => {
    const { recaptchaToken } = req.body;
    
    if (!recaptchaToken) {
        return res.status(400).json({ message: 'Token reCAPTCHA não fornecido' });
    }

    try {
        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: recaptchaToken
            }
        });

        if (!response.data.success) {
            return res.status(400).json({ message: 'Verificação reCAPTCHA falhou' });
        }
    } catch (error) {
        console.error('Erro ao verificar reCAPTCHA:', error);
        return res.status(500).json({ message: 'Erro ao verificar reCAPTCHA' });
    }

    next();
};

// Rota para configurar autenticação de dois fatores
router.post('/setup-2fa', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const secret = AuthenticatorService.generateSecret();
        const qrCode = await AuthenticatorService.generateQRCode(secret);
        const backupCodes = AuthenticatorService.generateBackupCodes();

        user.twoFactorAuth = {
            enabled: false,
            secret: secret.base32,
            backupCodes: backupCodes.map(code => ({ code, used: false }))
        };

        await user.save();

        res.json({
            qrCode,
            backupCodes,
            secret: secret.base32
        });
    } catch (error) {
        console.error('Erro ao configurar 2FA:', error);
        res.status(500).json({ message: 'Erro ao configurar autenticação de dois fatores' });
    }
});

// Rota para verificar e ativar 2FA
router.post('/verify-2fa', verifyToken, async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const isValid = AuthenticatorService.verifyToken(user.twoFactorAuth.secret, token);
        
        if (isValid) {
            user.twoFactorAuth.enabled = true;
            await user.save();
            res.json({ message: 'Autenticação de dois fatores ativada com sucesso' });
        } else {
            res.status(400).json({ message: 'Código inválido' });
        }
    } catch (error) {
        console.error('Erro ao verificar 2FA:', error);
        res.status(500).json({ message: 'Erro ao verificar autenticação de dois fatores' });
    }
});

// Rota de login
router.post('/login', 
    rateLimit,
    ipWhitelist,
    checkBlocked,
    logLoginAttempt,
    async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar se o usuário existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        // Verificar se é um administrador
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        // Verificar a senha
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            'sua_chave_secreta_aqui',
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Verificar token
router.get('/verify-token', verifyToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// Rota protegida de exemplo
router.get('/dashboard', verifyToken, (req, res) => {
    res.json({ message: 'Acesso permitido ao dashboard' });
});

module.exports = router; 