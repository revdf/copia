// Script para testar a validação de CPF

// Função para validar CPF (versão corrigida)
function validateCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais (CPFs inválidos conhecidos)
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let firstDigit = remainder < 2 ? 0 : 11 - remainder;
    
    if (firstDigit !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let secondDigit = remainder < 2 ? 0 : 11 - remainder;
    
    if (secondDigit !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Função para gerar CPF válido para teste
function generateValidCPF() {
    // Gera 9 dígitos aleatórios
    let cpf = '';
    for (let i = 0; i < 9; i++) {
        cpf += Math.floor(Math.random() * 10);
    }
    
    // Calcula primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let firstDigit = remainder < 2 ? 0 : 11 - remainder;
    cpf += firstDigit;
    
    // Calcula segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let secondDigit = remainder < 2 ? 0 : 11 - remainder;
    cpf += secondDigit;
    
    return cpf;
}

// Função para testar a validação
function testCPFValidation() {
    console.log('🧪 Testando validação de CPF...\n');
    
    // CPFs válidos conhecidos
    const validCPFs = [
        '11144477735',
        '12345678909',
        '98765432100',
        '12345678901',
        '00011122233'
    ];
    
    // CPFs inválidos conhecidos
    const invalidCPFs = [
        '11111111111', // Todos iguais
        '00000000000', // Todos zeros
        '12345678900', // Dígito verificador incorreto
        '123456789',   // Muito curto
        '123456789012', // Muito longo
        'abcdefghijk'  // Não numérico
    ];
    
    console.log('✅ Testando CPFs válidos:');
    validCPFs.forEach(cpf => {
        const isValid = validateCPF(cpf);
        console.log(`  ${cpf}: ${isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
    });
    
    console.log('\n❌ Testando CPFs inválidos:');
    invalidCPFs.forEach(cpf => {
        const isValid = validateCPF(cpf);
        console.log(`  ${cpf}: ${isValid ? '❌ VÁLIDO (ERRO!)' : '✅ INVÁLIDO'}`);
    });
    
    console.log('\n🎲 Testando CPFs gerados aleatoriamente:');
    for (let i = 0; i < 5; i++) {
        const generatedCPF = generateValidCPF();
        const isValid = validateCPF(generatedCPF);
        console.log(`  ${generatedCPF}: ${isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
    }
    
    console.log('\n📊 Resumo dos testes:');
    console.log(`✅ CPFs válidos testados: ${validCPFs.length}`);
    console.log(`❌ CPFs inválidos testados: ${invalidCPFs.length}`);
    console.log(`🎲 CPFs gerados: 5`);
    
    // Teste específico para o problema reportado
    console.log('\n🔍 Teste específico para números aleatórios:');
    const randomNumbers = [
        '12345678901',
        '98765432100',
        '11144477735',
        '55566677788',
        '99988877766'
    ];
    
    randomNumbers.forEach(cpf => {
        const isValid = validateCPF(cpf);
        console.log(`  ${cpf}: ${isValid ? '✅ ACEITO' : '❌ REJEITADO'}`);
    });
}

// Executar testes
testCPFValidation();

// Exportar função para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateCPF, generateValidCPF };
}










