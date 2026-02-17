const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendSecurityAlert(email, ip, timestamp) {
    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Mansão do Job'}" <${process.env.EMAIL_USER}>`,
        replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER,
        to: email,
        subject: '⚠️ Alerta de Segurança - Tentativa de Login Não Autorizada',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #e74c3c;">Alerta de Segurança</h2>
                <p>Uma tentativa de login foi detectada de um IP não autorizado:</p>
                <ul>
                    <li><strong>IP:</strong> ${ip}</li>
                    <li><strong>Data/Hora:</strong> ${timestamp}</li>
                </ul>
                <p>Se você não reconhece esta tentativa de login, por favor, entre em contato com o suporte imediatamente.</p>
                <p style="color: #7f8c8d; font-size: 12px;">Esta é uma mensagem automática. Por favor, não responda este e-mail.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de alerta enviado para ${email}`);
    } catch (error) {
        console.error('Erro ao enviar e-mail de alerta:', error);
    }
}

async function sendSecurityCode(email, code) {
    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Mansão do Job'}" <${process.env.EMAIL_USER}>`,
        replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER,
        to: email,
        subject: '🔐 Seu Código de Segurança',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Código de Segurança</h2>
                <p>Seu código de segurança para login é:</p>
                <div style="background-color: #f5f6fa; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
                    ${code}
                </div>
                <p>Este código é válido por 5 minutos.</p>
                <p style="color: #7f8c8d; font-size: 12px;">Esta é uma mensagem automática. Por favor, não responda este e-mail.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Código de segurança enviado para ${email}`);
    } catch (error) {
        console.error('Erro ao enviar código de segurança:', error);
    }
}

module.exports = {
    sendSecurityAlert,
    sendSecurityCode
}; 