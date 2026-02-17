const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');

// Configuração do Redis para armazenar tentativas de login
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

// Rate limiting para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas por IP
    message: 'Muitas tentativas de login. Tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware para verificar IP permitido
const ipWhitelist = async (req, res, next) => {
    const allowedIPs = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];

    if (allowedIPs.length > 0) {
        const clientIP = req.ip;
        if (!allowedIPs.includes(clientIP)) {
            return res.status(403).json({
                message: 'Acesso não permitido deste IP'
            });
        }
    }
    next();
};

// Middleware para registrar tentativas de login
const logLoginAttempt = async (req, res, next) => {
    const { email } = req.body;
    const ip = req.ip;
    const timestamp = new Date().toISOString();

    try {
        await redisClient.hSet('login_attempts', `${email}:${ip}`, timestamp);

        // Verificar número de tentativas nos últimos 15 minutos
        const attempts = await redisClient.hGetAll('login_attempts');
        const userAttempts = Object.entries(attempts)
            .filter(([key]) => key.startsWith(email))
            .filter(([_, time]) => {
                const attemptTime = new Date(time);
                const now = new Date();
                return (now - attemptTime) < 15 * 60 * 1000;
            });

        if (userAttempts.length >= 5) {
            // Bloquear por 15 minutos
            await redisClient.set(`blocked:${email}`, 'true', 'EX', 15 * 60);
            return res.status(429).json({
                message: 'Muitas tentativas. Conta bloqueada temporariamente.'
            });
        }
    } catch (error) {
        console.error('Erro ao registrar tentativa de login:', error);
    }
    next();
};

// Middleware para verificar bloqueio
const checkBlocked = async (req, res, next) => {
    const { email } = req.body;

    try {
        const isBlocked = await redisClient.get(`blocked:${email}`);
        if (isBlocked) {
            return res.status(429).json({
                message: 'Conta bloqueada temporariamente. Tente novamente mais tarde.'
            });
        }
    } catch (error) {
        console.error('Erro ao verificar bloqueio:', error);
    }
    next();
};

module.exports = {
    rateLimit: loginLimiter, // Exportando o rate limiter configurado para login
    ipWhitelist,
    checkBlocked,
    logLoginAttempt
};