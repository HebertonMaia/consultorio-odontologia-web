
// VALIDA DATA
export function uValidaData(valor: string | Date | null): boolean {
  if (!valor) return false;                 // vazio/null não vale

  const data = new Date(valor);
  return !isNaN(data.getTime());            // Invalid Date → getTime() é NaN
}

// VALIDA DATA HORA
export function uValidaDataHora(valor_data: string | Date | null, valor_hora: string): boolean {

  if (!valor_data) return false;                 // vazio/null não vale

  const data = new Date(valor_data);

  if(isNaN(data.getTime()))            // Invalid Date → getTime() é NaN
    return false;

  if(isNaN(uMontaDataHora(data, valor_hora).getTime()))
    return false;

  return true;
}

// MONTA DATA E HORA
export function uMontaDataHora(valor_data: Date | string, valor_hora: string): Date {
  const [ano, mes, dia] = typeof valor_data === 'string'
    ? valor_data.split('-').map(Number)                          // "2026-11-06" → [2026, 11, 6]
    : [valor_data.getFullYear(), valor_data.getMonth() + 1, valor_data.getDate()];

  const [hora, min] = valor_hora.split(':').map(Number);

  return new Date(ano, mes - 1, dia, hora, min);                 // mes-1: construtor é 0-based
}

// MONTA DATA E HORA
export function uMontaData(valor_data: Date | string): Date {
  const [ano, mes, dia] = typeof valor_data === 'string'
    ? valor_data.split('-').map(Number)                          // "2026-11-06" → [2026, 11, 6]
    : [valor_data.getFullYear(), valor_data.getMonth() + 1, valor_data.getDate()];

  return new Date(ano, mes - 1, dia);                 // mes-1: construtor é 0-based
}

export function uDateParaString(valor: Date): string {
  if (typeof valor === 'string') return valor;   // já está pronta
  const z = (n: number) => String(n).padStart(2, '0');
  return `${valor.getFullYear()}-${z(valor.getMonth() + 1)}-${z(valor.getDate())}`;
}
