import { ConsultaService } from '../../../services/consulta.service';
import { Component, OnInit, computed, inject, signal, viewChild, ElementRef, effect } from '@angular/core';
import { IPaciente } from '../../../models/paciente.model';
import { IConsulta } from '../../../models/consulta.models';
import { forkJoin } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DentistaService } from '../../../services/dentista.service';
import { IDentista } from '../../../models/dentista.models';
import { ConsiguracaoSistemaService } from '../../../services/configuracao-sistema.service';
import { DatePipe } from '@angular/common';
import { PacienteEscolherModal } from '../../shared/paciente-escolher-modal/paciente-escolher-modal';
import { NgxMaskPipe } from 'ngx-mask';
import { IPacienteConvenio } from '../../../models/paciente-convenio.models';
import { PacienteConvenioService } from '../../../services/paciente-convenio.service';
import { IConsultaSalvarDto } from '../../../dto/Agenda/consulta-salvar.dto';
import { uExtrairErro } from '../../../util/erro.util';

@Component({
  selector: 'app-criar-consulta',
  imports: [RouterLink, FormsModule, DatePipe, PacienteEscolherModal, NgxMaskPipe],
  templateUrl: './criar-consulta.html',
  styleUrl: './criar-consulta.scss',
})

export class CriarConsulta implements OnInit {
  private readonly configSistemaService = inject(ConsiguracaoSistemaService);
  private readonly dentistaService = inject(DentistaService);
  private readonly consultaService = inject(ConsultaService);
  private readonly pacienteConvenioService = inject(PacienteConvenioService);
  private readonly router = inject(Router);        // para voltar à lista depois de salvar
  readonly erroBox = viewChild<ElementRef<HTMLDivElement>>('erroBox');

  protected readonly carregando = signal(true);
  protected readonly erro = signal<string[] | null>(null);

  protected readonly dentistaLista = signal<IDentista[]>([]);
  protected readonly dentistaListaOrderBy = computed(() =>
    [...this.dentistaLista()].sort((a, b) => a.nome.localeCompare(b.nome)));

  protected readonly filtroDentistaId = signal('');
  protected readonly filtroDataConsulta = signal('');
  protected readonly filtroPacinteNome = signal('');
  protected readonly horariosAgendadosDentista = signal<string[]>([]);
  protected readonly intervaloMinimoentreConsulta_Min = signal('');
  protected readonly horarioConsulta = signal('');
  protected readonly mostrarDivHorarioConsulta = signal(false);
  protected readonly dataEscolhida = signal(new Date());

  protected readonly pacienteJaEscolhido = signal(false);
  protected readonly exibirModalPaciente = signal(false);
  protected readonly pacienteEscolhido = signal<IPaciente | null>(null);
  protected readonly observacaoAdm = signal('');

  protected readonly listPacienteConvenio = signal<IPacienteConvenio[] | null>([]);

  constructor() {
    effect(() => {
      if (this.erro()?.length) {
        // espera o Angular pintar a div, depois rola
        setTimeout(() =>
          this.erroBox()?.nativeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        );
      }
    });
  }

  ngOnInit(): void {
    this.carregando.set(true);

    this.obterDentistas();
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

  pesquisarConsultasDentista() {
    this.carregando.set(true);

    this.mostrarDivHorarioConsulta.set(false);

    if (!this.validaPesquisaAgendaDentista()) {
      this.carregando.set(false);
      return;
    }

    const dataConsulta = this.montaDataConsulta();

    forkJoin({
      agendas: this.consultaService.buscarAgendaDentista(this.filtroDentistaId(), dataConsulta),
      intervaloMinConsultas: this.configSistemaService.intervaloMinimoMinConsultas()
    })
      .subscribe({
        next: (result) => {
          this.exibirDatasAgendadasDentista(result.agendas.filter(a=> a.consultaFinalizada === false));
          this.intervaloMinimoentreConsulta_Min.set(result.intervaloMinConsultas.valor);
          this.mostrarDivHorarioConsulta.set(true);
          this.carregando.set(false);
          this.dataEscolhida.set(dataConsulta);
        },
        error: (er) => {
          this.erro.set([uExtrairErro(er)]);
          this.mostrarDivHorarioConsulta.set(false);
          this.carregando.set(false);
        }
      });
  }

  private validaPesquisaAgendaDentista(): boolean {
    const erros: string[] = [];

    const dataConsulta = this.montaDataConsulta();

    if (isNaN(dataConsulta.getTime())) {
      erros.push('Preenchimento da data é obrigatório');
    }

    dataConsulta.setHours(0, 0, 0, 0); // ZERANDO O HORÁRIO DA DATA DE CONSULTA

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // ZERANDO O HORÁRIO DA DATA ATUAL, 'AGORA'

    if(dataConsulta.getTime() < hoje.getTime()){
      erros.push('A data da consulta não pode ser menor que a atual');
    }

    if (this.filtroDentistaId() === '') {
      erros.push('Preenchimento do dentista é obrigatório');
    }

    this.erro.set(erros);
    return erros.length === 0;
  }

  private exibirDatasAgendadasDentista(listConsultas: IConsulta[]) {
    if (listConsultas.length > 0) {

      try {
          const listHorarios = listConsultas
            .map(o => new Date(o.dataConsulta))
            .sort((a, b) => a.getTime() - b.getTime())
            .map(d => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

          this.horariosAgendadosDentista.set(listHorarios);
        } catch (e) {
          this.erro.set(['Erro ao montar os horários: ' + e]);
        }
    }
  }

  // ABRE A MODAL
  abrirModalEscolherPaciente() {
    this.exibirModalPaciente.set(true);
  }

  fecharModalPaciente(){
     this.exibirModalPaciente.set(false);
      this.pacienteJaEscolhido.set(true);
  }

  // QUANDO O PACIENTE FOR SELECIONADO ELE É PASSADO PARA O PAI E A MODAL É FECHADA
  aoSelecionarPaciente(paciente: IPaciente) {

    this.pacienteConvenioService.listarPorPaciente(paciente.pacienteId, true)
        .subscribe({
          next: (result) => {
            this.listPacienteConvenio.set(result);
            this.carregando.set(false);
          },
        });

    this.pacienteEscolhido.set(paciente);     // guarda quem foi escolhido
    this.exibirModalPaciente.set(false);     // fecha o modal
  }

  // AGENDA CONSULTA
  agendarConsulta() {

    this.carregando.set(true);

    if(!this.validaAgendamentoConsulta()){
      this.carregando.set(false);
      return;
    }

    const dataHoraConsulta = this.montaDataHoraMinutoConsulta();

    const dtoSalvarAgendamento = this.criarDtoSalvarAgendamento(dataHoraConsulta);

    this.consultaService.criarConsulta(dtoSalvarAgendamento)
      .subscribe({
        next: (result) => this.router.navigate(['/agenda']),
        error: (er) => {
          this.erro.set([uExtrairErro(er)]);
          this.carregando.set(false);
        }
      });
  }

  private criarDtoSalvarAgendamento(dataHoraConsulta: Date): IConsultaSalvarDto  {
    return {
      pacienteId: this.pacienteEscolhido()!.pacienteId,
      dentistaId: Number(this.filtroDentistaId()),
      dataConsulta: this.paraIsoLocal(dataHoraConsulta),
      obsAdm: this.observacaoAdm()
    };
  }

  private paraIsoLocal(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
       + `T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  }

  private validaAgendamentoConsulta(){
    const erros: string[] = [];

    if(this.horarioConsulta() === '') {
      erros.push('O horário da consulta não foi preenchido');
    }

    const dataHoraConsulta = this.montaDataHoraMinutoConsulta();

    if(dataHoraConsulta.getTime() < Date.now()){
      erros.push('A data da consulta não pode ser menor que a atual');
    }

    if(erros.length > 0)
      this.erro.set(erros);

    return erros.length === 0;
  }

  private montaDataHoraMinutoConsulta(): Date {
  const data = this.dataEscolhida();                          // já é Date
  const [hora, min] = this.horarioConsulta().split(':').map(Number);

  return new Date(
    data.getFullYear(),
    data.getMonth(),    // atenção: aqui NÃO usa -1
    data.getDate(),
    hora,
    min
  );
  }

  private montaDataConsulta(): Date{
    const [ano, mes, dia] = this.filtroDataConsulta().split('-').map(Number);
    const dataConsulta = new Date(ano, mes - 1, dia);

    return dataConsulta;
  }
}
