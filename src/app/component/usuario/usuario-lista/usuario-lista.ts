import { Component, OnInit, computed, inject, signal, output, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { IUsuario } from '../../../models/usuario.models';
import { UsuarioEditarDadosModal } from '../../shared/usuario-editar-dados-modal/usuario-editar-dados-modal';
import { uExtrairErro } from '../../../util/erro.util';   // ajuste o caminho relativo

@Component({
  selector: 'app-usuario-lista',
  imports: [FormsModule, UsuarioEditarDadosModal],
  templateUrl: './usuario-lista.html',
  styleUrl: './usuario-lista.scss',
})
export class UsuarioLista implements OnInit {

  private readonly usuarioService = inject(UsuarioService);

  protected readonly listUsuario = signal<IUsuario[]>([]);
  protected readonly listUsuarioOrderBy = computed(() =>
    this.listUsuario().filter(p =>
    [...this.listUsuario()].sort((a,b)=> a.nome.localeCompare(b.nome))
    ));

  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected readonly exibeModalUsuario = signal(false);
  protected readonly usuarioIdModal = signal<number>(0);

  ngOnInit(): void {
    this.carregaUsuarios();
  }

  carregaUsuarios() {
    this.usuarioService.listar()
      .subscribe({
        next: (result) => {
          this.listUsuario.set(result.filter(a=> a.usuarioId !== 1));
          this.carregando.set(false);
        },
        error: (er) => {
          this.erro.set(uExtrairErro(er));
          this.carregando.set(false);
        }
      });
  }

  abreModalUsuario(usuarioId: number){
    this.usuarioIdModal.set(usuarioId);
    this.exibeModalUsuario.set(true);
  }
}
