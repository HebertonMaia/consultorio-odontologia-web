import { ConsultaService } from '../../../services/consulta.service';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { FormsModule } from '@angular/forms';
import { DentistaService } from '../../../services/dentista.service';
import { IDentista } from '../../../models/dentista.models';
import { IFiltroConsultarAgendaDto } from '../../../dto/Agenda/filtro-consulta-agenda.dto';
import { IConsultaAgendaDto } from '../../../dto/Agenda/agenda-consulta.dto';
import { DatePipe } from '@angular/common';
import { uPrimeiraUltimaParteTexto } from '../../../util/string.util';
import { uCorStatus } from '../../../util/status.util';
import { uExtrairErro } from '../../../util/erro.util';
import { SessionService } from '../../../services/auth/session.service';

@Component({
  selector: 'app-consulta-agenda',
  imports: [RouterLink, NgxMaskDirective, FormsModule, DatePipe],
  templateUrl: './consulta-agenda.html',
  styleUrl: './consulta-agenda.scss',
})
export class ConsultaAgenda implements OnInit {

  readonly session = inject(SessionService);
  private readonly dentistaService = inject(DentistaService);
  private readonly consultaService = inject(ConsultaService);

  protected readonly carregando = signal(true);
  protected readonly erro = signal<string[] | null>(null);

  protected readonly filtroDataInicial = signal(this.setDataFiltro(0));
  protected readonly filtroDataFinal = signal(this.setDataFiltro(5));
  protected readonly filtroPacinteNome = signal('');
  protected readonly filtroPacinteCpf = signal('');
  protected readonly filtroDentistaId = signal('0');

  protected readonly dentistaLista = signal<IDentista[]>([]);
  protected readonly dentistaListaOrderBy = computed(() =>
    [...this.dentistaLista()].sort((a, b) => a.nome.localeCompare(b.nome))
    );

  protected readonly agendaLista = signal<IConsultaAgendaDto[]>([]);
  protected readonly agendaListaOrderBy = computed(() =>
    [...this.agendaLista()].sort(
      (a, b) => new Date(a.data_consulta).getTime() - new Date(b.data_consulta).getTime()
    )
  );

  protected readonly nomeResumido = uPrimeiraUltimaParteTexto;
  protected readonly corStatus = uCorStatus;


  ngOnInit(): void {
    this.carregando.set(false);

    this.obterDentistas();

    this.pesquisarConsultas();
  }

  obterDentistas() {
    this.dentistaService.listar().subscribe({
      next: (result) => {
        this.dentistaLista.set(result);//.filter(a => a.ativo));
        this.carregando.set(false);
      },
      error: (er) => {
        this.erro.set([uExtrairErro(er)]);
        this.carregando.set(false);
      }
    });
  }

  pesquisarConsultas(): void{

    this.carregando.set(true);

    if(!this.validaFiltros()){
      this.carregando.set(false);
      return;
    }

    this.consultaService.buscarPorFiltroAgenda(this.criaFiltrosDto()).subscribe({
      next: (result) => {
        this.agendaLista.set(result);
        this.carregando.set(false);
      },
      error: (er) => {
        this.erro.set([uExtrairErro(er)]);
        this.carregando.set(false);
      }
    });

  }

  private validaFiltros(): boolean {
    const erros: string[] = [];

    const _dataInicial = new Date(this.filtroDataInicial());
    const _dataFinal = new Date(this.filtroDataFinal());

    if (isNaN(_dataInicial.getTime()) || isNaN(_dataFinal.getTime())) {
      erros.push('Preenchimento das datas é obrigatório');
    }

    if (_dataInicial.getTime() > _dataFinal.getTime()) {
      erros.push('Preenchimento das datas é obrigatório');
    }

    this.erro.set(erros);
    return erros.length === 0;
  }

  private criaFiltrosDto(): IFiltroConsultarAgendaDto{
    return {
      dataInicial: new Date(this.filtroDataInicial()),
      dataFinal: new Date(this.filtroDataFinal()),
      nomePaciente: this.filtroPacinteNome().trim(),
      cpf: this.filtroPacinteCpf().trim(),
      dentistaId: (this.filtroDentistaId() === '0' ? 0 : Number(this.filtroDentistaId()))
    };
  }

  setDataFiltro(dias: number): string {
    const d = new Date();
    if(dias > 0)
      d.setDate(d.getDate() + 7);                 // soma 7 dias

    const texto = d.toISOString().split('T')[0]; // "2026-10-30"

    return texto;
  }
}
