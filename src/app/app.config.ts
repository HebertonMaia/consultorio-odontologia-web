import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding  } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNgxMask } from 'ngx-mask';
import { authInterceptor } from './interceptors/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // Registra o HttpClient na aplicação inteira.
    // Sem esta linha, qualquer service que peça o HttpClient quebra com o erro
    // "NullInjectorError: No provider for HttpClient" (erro clássico de iniciante).
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideNgxMask(),    // liga as máscaras no app inteiro

    // withComponentInputBinding → o :id da URL chega direto no input() do componente
    provideRouter(routes, withComponentInputBinding()),
  ]
};
