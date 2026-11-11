// Valida a data de nascimento no formato "AAAA-MM-DD" (o que o input type="date" entrega).
// Devolve a mensagem de erro, ou null quando está tudo certo.
export function uValidarDataNascimento(data: string): string | null {
  if (data === '') {
    return 'Informe a data de nascimento.';
  }

  const hoje = dataDeHoje();

  // Nesse formato, comparar texto funciona: "2001-03-01" < "2026-09-18"
  if (data > hoje) {
    return 'A data de nascimento não pode estar no futuro.';
  }

  // Mesmo dia e mês de hoje, 120 anos atrás
  const limite = `${Number(hoje.substring(0, 4)) - 120}${hoje.substring(4)}`;
  if (data < limite) {
    return 'Data de nascimento inválida.';
  }

  return null;
}

// Data de hoje no formato "AAAA-MM-DD"
function dataDeHoje(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  // getMonth() começa em 0 (janeiro = 0), por isso o + 1
  // padStart(2, '0') coloca zero à esquerda: "9" vira "09"
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
