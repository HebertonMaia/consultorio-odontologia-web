// Valida CNPJ nos dois formatos: só números (antigo) e alfanumérico (a partir de 2026).
// Aceita com ou sem máscara: "11.222.333/0001-81" ou "11222333000181".
export function uValidarCnpj(cnpj: string): boolean {
  // Tira pontos, barra e traço, e deixa as letras maiúsculas
  const limpo = cnpj.replace(/[^0-9A-Za-z]/g, '').toUpperCase();

  if (limpo.length !== 14) {
    return false;
  }

  // Descarta "00000000000000", "AAAAAAAAAAAAAA" e afins
  if (/^(.)\1{13}$/.test(limpo)) {
    return false;
  }

  // Os 2 últimos caracteres têm que ser números
  if (!/^\d{2}$/.test(limpo.substring(12))) {
    return false;
  }

  const digito1 = calcularDigito(limpo.substring(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digito2 = calcularDigito(limpo.substring(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return `${digito1}${digito2}` === limpo.substring(12);
}

// Calcula um dígito verificador multiplicando cada caractere pelo seu peso.
function calcularDigito(base: string, pesos: number[]): number {
  let soma = 0;

  for (let i = 0; i < base.length; i++) {
    // charCodeAt dá o código do caractere: '0' é 48, 'A' é 65.
    // Tirando 48, o '0' vira 0, o '9' vira 9 e o 'A' vira 17 — a regra da Receita.
    soma += (base.charCodeAt(i) - 48) * pesos[i];
  }

  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}
