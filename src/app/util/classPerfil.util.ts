export function uClassPerfil(perfil: string): string {

  let estilo = '';

    if(perfil.toLowerCase() === 'administrador')
      estilo = 'secondary';
    else if(perfil.toLowerCase() === 'administração clínica')
      estilo = 'danger';
    else if(perfil.toLowerCase() === 'recepcionista')
      estilo = 'warning';
    else if(perfil.toLowerCase() === 'dentista')
      estilo = 'success';
    else
      estilo = 'light';

    return `badge mt-1 text-bg-${estilo}`;
}
