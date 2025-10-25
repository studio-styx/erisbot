export function formatNumber(numero: string | number) {
    if (typeof numero !== 'number') {
        // Tenta converter para número, se for string, por exemplo
        numero = Number(numero);
        if (isNaN(numero)) {
            return 'Número Inválido';
        }
    }

    // 1. Formata o número com 2 casas decimais, no locale pt-BR
    const formatoPadrao = numero.toLocaleString('pt-BR', {
        minimumFractionDigits: 2, // Garante que a vírgula e os centavos .00 apareçam temporariamente
        maximumFractionDigits: 2
    });

    // 2. Verifica se o formato termina com ',00' (centavos zero)
    if (formatoPadrao.endsWith(',00')) {
        // Se terminar com ',00', remove o ',00'
        return formatoPadrao.replace(',00', '');
    } else {
        // Caso contrário, retorna o formato com os centavos
        return formatoPadrao;
    }
}