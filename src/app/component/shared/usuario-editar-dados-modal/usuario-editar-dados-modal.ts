import { Component, inject, signal, computed, output, OnInit, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PerfilService } from '../../../services/perfil.service';
import { IPerfil } from '../../../models/perfil.models';
import { UsuarioService } from '../../../services/usuario.service';
import { IUsuario } from '../../../models/usuario.models';
import { IUsuarioSalvar } from '../../../dto/usuario/usuario-salvar.dto';
import { Router } from '@angular/router';
import { uExtrairErro } from '../../../util/erro.util';
import { SessionService } from '../../../services/auth/session.service';


@Component({
  selector: 'app-usuario-editar-dados-modal',
  imports: [FormsModule],
  templateUrl: './usuario-editar-dados-modal.html',
  styleUrl: './usuario-editar-dados-modal.scss',
})
export class UsuarioEditarDadosModal implements OnInit {

  readonly session = inject(SessionService);
  private readonly perfilService = inject(PerfilService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);

  readonly usuarioId = input<number>(0);
  readonly fechar = output<void>();
  readonly salvar = output<void>();
  //readonly salvar = output<void>();

  protected readonly listPerfil = signal<IPerfil[]>([]);
  protected readonly listPerfilOrderBy = computed(() =>
    [...this.listPerfil()].sort((a, b) => a.descricao.localeCompare(b.descricao))
  );

  protected readonly usuario = signal<IUsuario | null>(null);

  protected readonly nomeUsuario = signal('');
  protected readonly loginUsuario = signal('');
  protected readonly senhaUsuario = signal('');
  protected readonly perfilUsuario = signal('');
  protected readonly statusUsuario = signal('1');
  protected readonly editarSenhaUsuario = signal(false);

  protected readonly carregando = signal(true);
  protected readonly erro = signal<string[]>([]);

  protected readonly desabilitaCampoSenha = signal(false);

  ngOnInit(): void {
    this.carregarPerfil();

    if(this.usuarioId() === 0)
      this.desabilitaCampoSenha.set(false);
    else
      this.desabilitaCampoSenha.set(true);
  }

  habilitaDesabilitaCampoSenha(event: Event){

    const marcado = (event.target as HTMLInputElement).checked;

    if(marcado){
      this.desabilitaCampoSenha.set(false);
    } else {
      this.desabilitaCampoSenha.set(true);
    }

    this.senhaUsuario.set('');
  }

  private carregarPerfil() {
    this.perfilService.listar()
      .subscribe({
        next: (result) => {

          this.listPerfil.set(result.filter(a=> a.perfilId !== 1));

          if (this.usuarioId() !== 0) // EDIÇÃO USUÁRIO
            this.carregarUsuario();
          else
            this.carregando.set(false);
        },
        error: (er) => {
          this.erro.set([uExtrairErro(er)]);
          this.carregando.set(false);
        }
      });
  }

  private carregarUsuario() {
    this.usuarioService.listarPorId(this.usuarioId())
      .subscribe({
        next: (result) => {
          this.carregaTelaDadosUsuario(result);
          this.carregando.set(false);
        },
        error: (er) => {
          this.erro.set([uExtrairErro(er)]);
          this.carregando.set(false);
        }
      });
  }

  private carregaTelaDadosUsuario(usuario: IUsuario) {
    this.nomeUsuario.set(usuario.nome);
    this.loginUsuario.set(usuario.login);
    this.senhaUsuario.set('');
    this.editarSenhaUsuario.set(false);
    this.perfilUsuario.set(usuario.perfil.perfilId.toString());
    this.statusUsuario.set(usuario.ativo ? '1' : '0');
  }

  salvaUsuarioModal() {

    this.carregando.set(true);

    if (!this.validaForm()) {
      this.carregando.set(false);
      return;
    }

    const dto = this.criarDtoUsuario();

    if (this.usuarioId() === 0) { // NOVO USUÁRIO
      this.usuarioService.criar(dto)
        .subscribe({
          next: () => {
            this.router.navigate(['/usuarios']);
            this.salvar.emit();
            this.fechar.emit();
          },
          error: (er) => {
            this.erro.set([uExtrairErro(er)]);
            this.carregando.set(false);
          }
        });
    }
    else {
      this.usuarioService.atualizar(this.usuarioId(), dto)
        .subscribe({
          next: () => {
            //this.router.navigate(['/usuarios']);
            this.salvar.emit();
            this.fechar.emit();
          },
          error: (er) => {
            this.erro.set([uExtrairErro(er)]);
            this.carregando.set(false);
          }
        });
    }
  }

  validaForm(): boolean {
    const erros: string[] = [];

    if (this.nomeUsuario().trim() === '')
      erros.push('Informe um nome válido');

    if (this.loginUsuario().trim() === '')
      erros.push('Informe um login válido');

    if (this.usuarioId() === 0) { // NOVO USUÁRIO
      if (this.senhaUsuario() === '') // SENHA VAZIA
        erros.push('Informe uma senha válida');
    } else if (this.editarSenhaUsuario() && this.senhaUsuario() === '') // EDITAR USUÁRIO, MARCAR NOVA SENHA E O CAMPO SENHA ESTIVER VAZIO
      erros.push('Informe uma senha válida');

    if (this.perfilUsuario() === '')
      erros.push('Informe um perfil');

    if (erros.length > 0)
      this.erro.set(erros);

    return (erros.length === 0 ? true : false);
  }

  criarDtoUsuario(): IUsuarioSalvar {
    return {
      nome: this.nomeUsuario().trim(),
      login: this.loginUsuario().trim(),
      senha: this.senhaUsuario().trim(),
      perfilId: Number(this.perfilUsuario()),
      ativo: (this.statusUsuario() === '1' ? true : false),
      email: '',
    };
  }
}
