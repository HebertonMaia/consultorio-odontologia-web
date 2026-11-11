export function uCorStatus(statusId: number): string {

    switch (statusId) {
      case 1: return 'text-bg-primary';   // Agendada
      case 2: return 'text-bg-warning';   // Reagendada
      case 3: return 'text-bg-success';   // Realizada
      case 4:
      case 5:
      case 8: return 'text-bg-danger';    // Canceladas (paciente, dentista, clínica)
      case 6:
      case 7: return 'text-bg-secondary'; // Ausências (paciente, dentista)
      default: return 'text-bg-light';
    }
}
