// Middleware de segurança simplificado
const rateLimit = (req, res, next) => {
    next();
};

const ipWhitelist = (req, res, next) => {
    next();
};

const checkBlocked = (req, res, next) => {
    next();
};

const logLoginAttempt = (req, res, next) => {
    next();
};

module.exports = {
    rateLimit,
    ipWhitelist,
    checkBlocked,
    logLoginAttempt
}; 