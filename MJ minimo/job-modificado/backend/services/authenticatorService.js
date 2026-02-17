const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class AuthenticatorService {
    static generateSecret() {
        return speakeasy.generateSecret({
            name: 'Mansão do Job Admin'
        });
    }

    static async generateQRCode(secret) {
        try {
            const otpauthUrl = speakeasy.otpauthURL({
                secret: secret.base32,
                label: 'Mansão do Job Admin',
                issuer: 'Mansão do Job'
            });
            
            return await QRCode.toDataURL(otpauthUrl);
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
            throw error;
        }
    }

    static verifyToken(secret, token) {
        return speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 1 // Permite uma janela de 30 segundos para cada lado
        });
    }

    static generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 8; i++) {
            codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
        }
        return codes;
    }
}

module.exports = AuthenticatorService; 