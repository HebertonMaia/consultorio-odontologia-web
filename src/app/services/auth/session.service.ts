import { Injectable, signal } from "@angular/core";

interface ISessao {
  token: string;
  usuarioNome: string;
  usuarioId: number;
  perfilNome: string;
}

@Injectable({
  providedIn: 'root',
})

export class SessionService {

  private readonly KEY = 'consultorio.sessao';

  // signals que a UI inteira consome
  readonly usuarioId   = signal<number | null>(null);
  readonly usuarioNome = signal<string | null>(null);
  readonly perfilNome  = signal<string | null>(null);
  readonly logado      = signal(false);

  constructor() {
    this.rehidratar();   // ao iniciar o app, recarrega a sessão salva (sobrevive ao refresh)
  }

  iniciarSessao(dados: ISessao): void {
    localStorage.setItem(this.KEY, JSON.stringify(dados));   // persiste tudo junto
    this.aplicar(dados);                                     // atualiza os signals
  }

  encerrarSessao(): void {
    localStorage.removeItem(this.KEY);
    this.usuarioId.set(null);
    this.usuarioNome.set(null);
    this.perfilNome.set(null);
    this.logado.set(false);
  }

  obterToken(): string | null {
    return this.lerStorage()?.token ?? null;   // o interceptor usa este
  }

  private rehidratar(): void {
    const dados = this.lerStorage();
    if (dados) this.aplicar(dados);
  }

  private aplicar(dados: ISessao): void {
    this.usuarioId.set(dados.usuarioId);
    this.usuarioNome.set(dados.usuarioNome);
    this.perfilNome.set(dados.perfilNome);
    this.logado.set(true);
  }

  private lerStorage(): ISessao | null {
    const raw = localStorage.getItem(this.KEY);
    return raw ? (JSON.parse(raw) as ISessao) : null;
  }
}
