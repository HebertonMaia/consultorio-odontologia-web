import { ConvenioService } from './../../../services/convenio.service';
import { IConvenio } from '../../../models/convenio.models';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IConsulta } from '../../../models/consulta.models';
import { uExtrairErro } from '../../../util/erro.util';
import { SessionService } from '../../../services/auth/session.service';

@Component({
  selector: 'app-convenio-lista',
  imports: [RouterLink],
  templateUrl: './convenio-lista.html',
  styleUrl: './convenio-lista.scss',
})
export class ConvenioLista implements OnInit {
  readonly sessionService = inject(SessionService);
  private readonly convenioService = inject(ConvenioService);

  protected readonly convenioLista = signal<IConvenio[]>([]);
  protected readonly convenioListaOrderBy = computed(() =>
    this.convenioLista().filter(p =>
    [...this.convenioLista()].sort((a,b)=> a.nomeFantasia.localeCompare(b.nomeFantasia))
    ));
  protected readonly consultas = signal<IConsulta[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  ngOnInit(): void {
    this.carregarListaConvenio();
  }

  carregarListaConvenio(): void {
    this.convenioService.listar().subscribe({
      next: (r) => {
        this.convenioLista.set(r);
        this.carregando.set(false);
      },
      error: (er) => {
        this.erro.set(uExtrairErro(er));
        this.carregando.set(true);
      }
    });
  }
}
