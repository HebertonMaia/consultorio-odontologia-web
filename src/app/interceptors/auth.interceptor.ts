import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';   // + HttpErrorResponse
import { inject } from '@angular/core';
import { Router } from '@angular/router';                                      // novo
import { catchError, throwError } from 'rxjs';                                 // novo
import { SessionService } from '../services/auth/session.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const token = session.obterToken();
  const router = inject(Router);

  // sem token (ex.: a própria chamada de login) → segue sem mexer
  if (!token) {
    return next(req);
  }

 const reqComToken = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(reqComToken).pipe(
    catchError((er: HttpErrorResponse) => {
      if (er.status === 401) {
        session.encerrarSessao();
        router.navigate(['/login']);
      }
      return throwError(() => er);         // repassa o erro para quem chamou
    })
  );
};
