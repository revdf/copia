/**
 * Mapa de Capitais Brasileiras
 * Usado como fallback quando cidade não é detectada
 */

const capitaisBrasileiras = {
    'AC': 'Rio Branco',
    'AL': 'Maceió',
    'AP': 'Macapá',
    'AM': 'Manaus',
    'BA': 'Salvador',
    'CE': 'Fortaleza',
    'DF': 'Brasília',
    'ES': 'Vitória',
    'GO': 'Goiânia',
    'MA': 'São Luís',
    'MT': 'Cuiabá',
    'MS': 'Campo Grande',
    'MG': 'Belo Horizonte',
    'PA': 'Belém',
    'PB': 'João Pessoa',
    'PR': 'Curitiba',
    'PE': 'Recife',
    'PI': 'Teresina',
    'RJ': 'Rio de Janeiro',
    'RN': 'Natal',
    'RS': 'Porto Alegre',
    'RO': 'Porto Velho',
    'RR': 'Boa Vista',
    'SC': 'Florianópolis',
    'SP': 'São Paulo',
    'SE': 'Aracaju',
    'TO': 'Palmas'
};

/**
 * Obtém a capital de um estado
 * @param {string} estado - Sigla do estado (ex: 'SP', 'RJ')
 * @returns {string|null} - Nome da capital ou null se não encontrado
 */
function obterCapital(estado) {
    if (!estado) return null;
    const estadoUpper = estado.toUpperCase();
    return capitaisBrasileiras[estadoUpper] || null;
}

/**
 * Verifica se uma cidade é uma capital
 * @param {string} cidade - Nome da cidade
 * @param {string} estado - Sigla do estado
 * @returns {boolean}
 */
function ehCapital(cidade, estado) {
    if (!cidade || !estado) return false;
    const capital = obterCapital(estado);
    return capital && cidade.toLowerCase() === capital.toLowerCase();
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.capitaisBrasileiras = capitaisBrasileiras;
    window.obterCapital = obterCapital;
    window.ehCapital = ehCapital;
}









