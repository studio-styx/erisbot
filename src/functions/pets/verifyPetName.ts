export function verifyPetName(name: string): string[] {
    const errors: string[] = [];

    if (/^@everyone$|^@here$/i.test(name.trim())) {
        errors.push("O nome contém menções proibidas (@everyone/@here).");
    }


    // Lista negra expandida
    const blacklistNames = [
        "eris", "éris", "porra", "desgraça", "fdp", "puta", "puto", "merda", "merdinha",
        "caralho", "nazista", "nazismo", "narcizista", "desgraçado", "putinha", "diabo",
        "deus", "jesus", "demonio", "demônio", "deusa", "foda", "bosta", "cabrao", "cabra",
        "bicha", "viado", "bucha", "cacete", "filho da puta", "piranha", "idiota", "burro",
        "imbecil", "maldito", "diabinho", "inferno", "putaqueopariu", "@everyone", "@here",
        "god", "hitler", "stalin", "trump", "bolsonaro", "boso", "lula"
    ];

    // Normaliza o nome: remove acentos, deixa minúsculo e retira números e caracteres especiais
    const sanitized = name
        .normalize("NFD")                  // separa os acentos
        .replace(/[\u0300-\u036f]/g, "")   // remove acentos
        .replace(/[^a-zA-Z\s]/g, "")       // remove números e caracteres especiais
        .toLowerCase()
        .trim();

    // Verifica se o nome está na lista negra
    blacklistNames.forEach(badWord => {
        if (sanitized.includes(badWord)) {
            errors.push(`O nome contém a palavra proibida: "${badWord}"`);
        }
    });

    // Verifica tamanho mínimo e máximo
    if (sanitized.length < 2) errors.push("O nome é muito curto.");
    if (sanitized.length > 20) errors.push("O nome é muito longo.");

    return errors;
}
