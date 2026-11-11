// Confere o formato básico: texto@texto.texto, sem espaços.
export function uValidarEmail(email: string): boolean {
  // [^\s@]+  → um ou mais caracteres que NÃO são espaço nem @
  // @        → exatamente um @
  // \.       → um ponto depois do @ (o domínio: email.com, empresa.com.br)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
