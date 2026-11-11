import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'
import { UsuarioEditarDadosModal } from '../../component/shared/usuario-editar-dados-modal/usuario-editar-dados-modal';
import { SessionService } from '../../services/auth/session.service';
import { uPrimeiraUltimaParteTexto } from '../../util/string.util';
import { uClassPerfil } from '../../util/classPerfil.util';

@Component({
  selector: 'app-menu',
  // Componente standalone: tudo o que o HTML usa precisa ser importado aqui.
  // RouterLink       → faz o atributo routerLink funcionar
  // RouterLinkActive → marca o link da página atual (classe "active")
  imports: [RouterLink, UsuarioEditarDadosModal],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {

  readonly menuUsuarioAberto = signal(false);
  readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly exibeUsuarioModal = signal(false);

  readonly nomeSobreNome = uPrimeiraUltimaParteTexto;
  readonly classPerfil = uClassPerfil;

  retornaLabelPerfil(perfil: string){
    if(perfil.toLowerCase() === 'administrador')
      return 'secondary';
    else if(perfil.toLowerCase() === 'administração clínica')
      return 'danger';
    else if(perfil.toLowerCase() === 'recepcionista')
      return 'warning';
    else if(perfil.toLowerCase() === 'dentista')
      return 'success';
    else
      return 'light'
  }

  /* MODAL USUÁRIO MEUS DADOS */
  abrirMeusDados() {

  }


  sair() {
    this.session.encerrarSessao();        // limpa o localStorage e os signals
    this.router.navigate(['/login']);     // volta para o login
    this.menuUsuarioAberto.set(false);    // fecha o dropdown, para não ficar aberto quando ele voltar a logar
  }
}
