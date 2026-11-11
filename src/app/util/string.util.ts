export function uPrimeiraUltimaParteTexto(texto: string): string {

  if (texto === null) return '';

  const textoSemEspacos = texto.replace('  ', ' ').trim(); // RETIRA ESPAÇOS DUPLOS E ESPAÇOS NO INÍCIO E NO FIM

  if (textoSemEspacos.split(' ').length === 1) {
    return textoSemEspacos;
  }

  const partes = textoSemEspacos.split(' ');

  return partes[0] + ' ' + partes[partes.length - 1];
}

export function uPrimeiraLetraMaiuscula(texto: string): string {

  if (!texto) return '';

  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}
