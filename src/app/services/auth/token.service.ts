import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: 'root',
})

export class TokenService {

  private readonly TOKEN_KEY = 'consultorio.token';
  readonly logado = signal(this.temToken());

  salvar(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.logado.set(true);
  }

  obter(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  remover(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.logado.set(false);
  }

  private temToken(): boolean {
    return this.obter() !== null;
  }
}
