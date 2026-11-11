import { HttpErrorResponse } from '@angular/common/http';

export function uExtrairErro(er: HttpErrorResponse): string {
  console.error(er);

  // 400 de validação do ASP.NET: { errors: { Campo: ["msg", ...] } }
  if ((er.status === 400 || er.status === 500 || er.status === 401) && er.error?.errors) {

    const mensagens = Object.values(er.error.errors as Record<string, string[]>).flat();

    if (mensagens.length > 0)
      return mensagens.join(' ');
  }

  switch (er.status) {
    case 0:   return 'Não foi possível conectar ao servidor. Tente novamente.';
    case 400: return typeof er.error === 'string' ? er.error : 'Requisição inválida.';
    case 401:
          return typeof er.error === 'string' && er.error.trim() !== ''
            ? er.error
            : 'Sessão expirada. Faça login novamente.';
    case 403: return 'Você não tem permissão para esta ação.';
    case 404: return 'Registro não encontrado.';
    case 500: return typeof er.error === 'string' && er.error.trim() !== ''
            ? er.error
            : 'Erro interno no servidor. Tente novamente mais tarde.';
    default:
      return typeof er.error === 'string' && er.error.trim() !== ''
        ? er.error
        : 'Ocorreu um erro inesperado. Tente novamente.';
  }
}
