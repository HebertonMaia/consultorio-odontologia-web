// guards/perfil.guard.ts
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from '../services/auth/session.service';

export const perfilGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const session = inject(SessionService);
  const router = inject(Router);

  // perfis permitidos vêm do 'data' da rota
  const permitidos = route.data['perfis'] as string[] | undefined;
  const perfilAtual = session.perfilNome();

  // rota sem restrição de perfil → libera
  if (!permitidos || permitidos.length === 0) {
    return true;
  }

  // o perfil do usuário está na lista?
  if (perfilAtual && permitidos.includes(perfilAtual)) {
    return true;
  }

  // sem permissão → manda pra uma tela que todos acessam
  router.navigate(['/agenda']);

  return false;
};
