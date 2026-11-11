import { IDentista } from '../../../models/dentista.models';
import { DentistaService } from '../../../services/dentista.service';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IConsulta } from '../../../models/consulta.models';
import { FormsModule } from '@angular/forms';
import { IDentistaConsultarDto } from '../../../dto/Dentista/dentista-consultar.dto';
import { uExtrairErro } from '../../../util/erro.util';
import { SessionService } from '../../../services/auth/session.service';

@Component({
  selector: 'app-dentista-lista',
  imports: [RouterLink, FormsModule],
  templateUrl: './dentista-lista.html',
  styleUrl: './dentista-lista.scss',
})

export class DentistaLista implements OnInit {
  readonly sessionService = inject(SessionService);
  private readonly dentistaService = inject(DentistaService);

  protected readonly dentistasLista = signal<IDentista[]>([]);
  protected readonly dentistasListaOrderBy = computed(() =>
    this.dentistasLista().filter(p =>
    [...this.dentistasLista()].sort((a,b)=> a.nome.localeCompare(b.nome))
    ));

  protected readonly consultas = signal<IConsulta[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected readonly filtroNome = signal('');
  protected readonly filtroEspecialidade = signal('');
  protected readonly filtroStatus = signal('1');

  ngOnInit(): void {
    this.carregarListaDentistas();
  }

  carregarListaDentistas(): void {

    const dto = this.criarConsultaDto();

    this.dentistaService.listarFiltros(dto).subscribe({
      next: (dados) => {
        this.dentistasLista.set(dados);
        this.carregando.set(false);
      },
      error: (er) => {
        this.erro.set(uExtrairErro(er));
        this.carregando.set(false);
      }
    });
  }

  private criarConsultaDto(): IDentistaConsultarDto {
    return {
      nome: this.filtroNome().trim(),
      especialidade: this.filtroEspecialidade().trim(),
      ativo: this.filtroStatus() === '1'
    };
  }
}

