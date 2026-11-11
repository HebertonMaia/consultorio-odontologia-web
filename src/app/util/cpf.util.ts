// Valida um CPF pelos dígitos verificadores.
// Aceita com ou sem máscara: "529.982.247-25" ou "52998224725".
export function uValidarCpf(cpf: string): boolean {
  const numeros = cpf.replace(/\D/g, '');   // deixa só os dígitos

  if (numeros.length !== 11) {
    return false;
  }

  // "111.111.111-11" passa na conta, mas não é um CPF de verdade.
  // A expressão lê: "um dígito, seguido de mais 10 iguais a ele".
  if (/^(\d)\1{10}$/.test(numeros)) {
    return false;
  }

  // O 10º dígito é calculado com os 9 primeiros; o 11º, com os 10 primeiros
  const digito1 = calcularDigito(numeros.substring(0, 9), 10);
  const digito2 = calcularDigito(numeros.substring(0, 10), 11);

  return digito1 === Number(numeros[9]) && digito2 === Number(numeros[10]);
}

// Calcula um dígito verificador.
// Cada número é multiplicado por um peso que começa em pesoInicial e vai diminuindo.
// Sem "export": só é usada aqui dentro, como um método private.
function calcularDigito(base: string, pesoInicial: number): number {
  let soma = 0;

  for (let i = 0; i < base.length; i++) {
    soma += Number(base[i]) * (pesoInicial - i);
  }

  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}
