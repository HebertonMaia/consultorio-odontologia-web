// guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from '../services/auth/session.service';

export const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (session.logado()) {
    return true;                      // tem sessão → pode entrar
  }

  router.navigate(['/login']);        // sem sessão → vai pro login
  return false;                       // ...e bloqueia a navegação
};
