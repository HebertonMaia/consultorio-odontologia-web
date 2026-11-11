import { PacienteService } from '../../../services/paciente.service';
import { ConsultaService } from '../../../services/consulta.service';
import { Component, inject, signal, input, computed, OnInit } from '@angular/core';
import { IPaciente } from '../../../models/paciente.model';
import { IConsulta } from '../../../models/consulta.models';
import { forkJoin } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DentistaService } from '../../../services/dentista.service';
import { IDentista } from '../../../models/dentista.models';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import { IPacienteConvenio } from '../../../models/paciente-convenio.models';
import { PacienteConvenioService } from '../../../services/paciente-convenio.service';
import { uPrimeiraUltimaParteTexto } from '../../../util/string.util';
import { IUsuario } from '../../../models/usuario.models';
import { UsuarioService } from '../../../services/usuario.service';
import { IProcedimento } from '../../../models/procedimento.models';
import { ProcedimentoService } from '../../../services/procedimento.service';
import { ITipoPagamento } from '../../../models/tipo-pagamento.models';
import { IPagamento } from '../../../models/pagamento.models';
import { PagamentoService } from '../../../services/pagamento.service';
import { uCorStatus } from '../../../util/status.util';
import { StatusConsultaService } from '../../../services/status-consulta.service';
import { IStatusConsulta } from '../../../models/statusConsulta.models';
import { IConsultaProcedimento } from '../../../models/consulta-procedimento.models';
import { IConsultaProcedimentoSalvarDto } from '../../../dto/Agenda/consulta-procedimento-salvar.dto';
import { ConsultaProcedimentoService } from '../../../services/consulta-procedimento.service';
import { ProcedimentoEditaPgtoModal } from '../../shared/procedimento-edita-pgto-modal/procedimento-edita-pgto-modal';
import { ConfirmaModal } from '../../shared/confirma-modal/confirma-modal';
import { ConsultaProcedimentoLogService } from '../../../services/consulta-procedimento-log.service';
import { IConsultaProcedimentoLog } from '../../../models/consulta-procedimento-log.models';
import { IConsultaLog } from '../../../models/consulta-log.models';
import { ConsultaLogService } from '../../../services/consulta-log.service';
import { IAtualizaObsDentistaDto } from '../../../dto/Agenda/atualiza-obs-dentista.dto';
import { IConsultaAtualizaStatusDto } from '../../../dto/Agenda/consulta-atualiza-status.dto';
import { AlteraStatusConsultaModal } from '../../shared/altera-status-consulta-modal/altera-status-consulta-modal';
import { viewChild, ElementRef, effect } from '@angular/core';
import { uExtrairErro } from '../../../util/erro.util';
import { SessionService } from '../../../services/auth/session.service';
import { uClassPerfil } from '../../../util/classPerfil.util';

@Component({
  selector: 'app-detalhe-consulta',
  imports: [RouterLink, FormsModule, DatePipe, CurrencyPipe, NgxMaskPipe, ProcedimentoEditaPgtoModal, ConfirmaModal, AlteraStatusConsultaModal],
  templateUrl: './detalhe-consulta.html',
  styleUrl: './detalhe-consulta.scss',
})

export class DetalheConsulta implements OnInit {
  readonly session = inject(SessionService);

  private readonly dentistaService = inject(DentistaService);
  private readonly router = inject(Router);        // para voltar à lista depois de salvar
  private readonly consultaService = inject(ConsultaService);
  private readonly consultaProcedimentoService = inject(ConsultaProcedimentoService);
  private readonly pacienteService = inject(PacienteService);
  private readonly pacienteConvenioService = inject(PacienteConvenioService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly procedimentoService = inject(ProcedimentoService);
  private readonly pagamentoService = inject(PagamentoService);
  private readonly statusConsultaService = inject(StatusConsultaService);
  private readonly consultaProcedimentoLogService = inject(ConsultaProcedimentoLogService);
  private readonly consultaLogService = inject(ConsultaLogService);

  readonly ClassPerfil = uClassPerfil;
  readonly erroBox = viewChild<ElementRef<HTMLDivElement>>('erroBox');

  protected readonly carregando = signal(true);
  protected readonly erro = signal<string[]>([]);

  // MODAL
  protected readonly exibeModalEditValores = signal(false);
  protected readonly consultaProcedimentoIdSelecionadoPai = signal<number>(0);

  protected readonly nomeResumido = uPrimeiraUltimaParteTexto;
  protected readonly listPacienteConvenio = signal<IPacienteConvenio[] | null>([]);
  protected readonly consulta = signal<IConsulta | null>(null);
  protected readonly usuario = signal<IUsuario | null>(null);
  protected readonly dentista = signal<IDentista | null>(null);
  protected readonly paciente = signal<IPaciente | null>(null);
  protected readonly procedimentoSelecionado = signal<IProcedimento | null>(null);
  protected readonly statusConsulta = signal<IStatusConsulta | null>(null);

  protected readonly listPagamento = signal<IPagamento[]>([]);
  protected readonly listPagamentoOrderBy = computed(() =>
    [...this.listPagamento()].sort((a, b) => a.descricao.localeCompare(b.descricao)));

  protected readonly listTipoPagamento = signal<ITipoPagamento[]>([]);
  protected readonly listTipoPagamentoOrderBy = computed(() =>
    [...this.listTipoPagamento()].sort((a, b) => a.descricao.localeCompare(b.descricao)));

  protected readonly listProcedimento = signal<IProcedimento[]>([]);
  protected readonly listProcedimentoOrderBy = computed(() =>
    [...this.listProcedimento()].sort((a, b) => a.descricao.localeCompare(b.descricao)));

  protected readonly listConsultaProcedimento = signal<IConsultaProcedimentoSalvarDto[]>([]);
  protected readonly listConsultaProcedimentoSalvo = signal<IConsultaProcedimento[]>([]);

  // LOGS PROCEDIMENTO
  protected readonly logsProcedimentoAberto = signal(false);
  protected readonly listConsultaProcedimentoLog = signal<IConsultaProcedimentoLog[]>([]);
  protected readonly listConsultaProcedimentoLogOrderBy = computed(() =>
    [...this.listConsultaProcedimentoLog()].sort(
      (a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime()));

  // LOGS CONSULTA
  protected readonly logsConsultaAberto = signal(false);
  protected readonly listConsultaLog = signal<IConsultaLog[]>([]);
  protected readonly listConsultaLogOrderBy = computed(() =>
    [...this.listConsultaLog()].sort(
      (a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime()));

  // MODAL CONFIRMAÇÃO EXCLUIR PROCEDIMENTO
  protected readonly exibeConfirmaInativar = signal(false);
  protected readonly idParaInativar = signal<number>(0);

  protected readonly obsDentista = signal('');
  // MODAL CONFIRMAÇÃO FINALIZAR CONSULTA
  protected readonly exibeConfirmaFinalizarConsulta = signal(false);

  // MODAL ALTERAR STATUS
  protected readonly abreAlteracaoStatusModal = signal(false);
  protected readonly devolveErroAoFilho_Msg = signal<string>('');
  protected readonly devolveErroAoFilho_statusSelcionado = signal<string>('');
  protected readonly devolveErroAoFilho_dataSelcionada = signal<string>('');
  protected readonly devolveErroAoFilho_horarioSelcionado = signal<string>('');
  //protected readonly statusConsultaAtualModal = computed(() => this.consulta()!.statusConsultaId);

  //protected readonly dataConsultaReagendada = signal<Date | null>(null);
  //protected readonly horaConsultaReagendada = signal('');
  //protected readonly obsAdm = signal('');

  protected readonly corStatus = uCorStatus;

  readonly id = input<string>();

  // HABILITA BOTÃO PARA FINALIZAR A CONSULTA
  protected readonly procedimentosAcertadosPgto = computed(() => {

    if(this.consultaFinalizada())
      return false;

    const lista = this.listConsultaProcedimentoSalvo();

    return lista.length > 0 &&                          // tem pelo menos 1 procedimento
      lista.every(p => p.pagamentoId > 0);          // e TODOS com pagamento acertado
  });

  // HABILITA BOTÃO PARA OUTROS STATUS DA CONSULTA
  /*
  1 - AGENDADA
  2 - REAGENDADA
  */
  readonly consultaFinalizada = computed(
    () => {
      if(this.consulta()!.statusConsultaId === 1 || this.consulta()!.statusConsultaId === 2)
        return false;
      else
        return true;
    });

  constructor() {
    effect(() => {
      if (this.erro().length > 0) {
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

    this.preencheDadosConsulta();
  }

  preencheDadosConsulta() {

    // DADOS DA CONSULTA
    this.consultaService.listarPorId(this.id()!)
      .subscribe({
        next: (result) => {
          this.consulta.set(result);

          if(this.consulta()!.observacaoDentista)
            this.obsDentista.set(this.consulta()!.observacaoDentista);

          this.carregaDemaisConsultas();
        },
        error: (er) => {
          this.erro.set([uExtrairErro(er)]);
          this.carregando.set(false);
        }
      });
  }

  // INCLUIR NOVO
  incluirProcedimento() {

    this.limpaErros();
    this.carregando.set(true);

    if(this.procedimentoSelecionado() === null){
      this.erro.set(['Informe um procedimento válido']);
      this.carregando.set(false);
      return;
    }

    const obj = this.CriaObjConsultaProcedimentoSalvar();

    this.consultaProcedimentoService.criar(obj).subscribe({
      next: () => {
        this.recarregaProcedimentos_E_Log();
        this.carregando.set(false);
      },
      error: (er) => {
        this.carregando.set(false);
        this.erro.set([er.error]);
      }
    });
  }

  // EXCLUIR PROCEDIMENTO
  inativarConsultaProcedimento(consultaProcedimentoId: number) {

    this.limpaErros();
    this.carregando.set(true);

    // ALTERAR STATUS
    this.consultaProcedimentoService.inativar(consultaProcedimentoId).subscribe({
      next: () => {
        this.recarregaProcedimentos_E_Log();

        this.carregando.set(false);
      },
      error: (er) => {
        this.erro.set([uExtrairErro(er)]);
        this.carregando.set(false);
      }
    });
  }

  alterarValorFinanceiro(consultaProcedimentoId: number) {
    this.limpaErros();
    this.carregando.set(true);

    this.consultaProcedimentoIdSelecionadoPai.set(consultaProcedimentoId);

    this.exibeModalEditValores.set(true);

    this.recarregaProcedimentos_E_Log();

    this.carregando.set(false);
  }

  carregaDemaisConsultas() {
    // DEMAIS DADOS
    forkJoin({
      dadosUsuario: this.usuarioService.listarPorId(this.consulta()!.usuarioId),
      dadosDentista: this.dentistaService.buscarPorId(this.consulta()!.dentistaId),
      dadosPaciente: this.pacienteService.buscarPorId(this.consulta()!.pacienteId),
      dadosPacienteConvenio: this.pacienteConvenioService.listarPorPaciente(this.consulta()!.pacienteId, true),
      dadosPagamento: this.pagamentoService.listar(),
      dadosStatus: this.statusConsultaService.buscaPorId(this.consulta()!.statusConsultaId),
      dadosConsultaProcedimento: this.consultaProcedimentoService.listarPorConsulta(this.consulta()!.consultaId),
      dadosProcedimento: this.procedimentoService.listar(),
      dadosConsultaProcedimentoLog: this.consultaProcedimentoLogService.listarPorConsulta(this.consulta()!.consultaId),
      dadosConsultaLog: this.consultaLogService.listarPorConsulta(this.consulta()!.consultaId)
    })
      .subscribe({
        next: (result) => {
          this.usuario.set(result.dadosUsuario);
          this.dentista.set(result.dadosDentista);
          this.paciente.set(result.dadosPaciente);
          this.listPacienteConvenio.set(result.dadosPacienteConvenio);
          this.listPagamento.set(result.dadosPagamento);
          this.statusConsulta.set(result.dadosStatus);
          this.listConsultaProcedimentoSalvo.set(result.dadosConsultaProcedimento.filter(a => a.ativo));
          this.listProcedimento.set(result.dadosProcedimento.filter(a => a.ativo));
          this.listConsultaProcedimentoLog.set(result.dadosConsultaProcedimentoLog);
          this.listConsultaLog.set(result.dadosConsultaLog);

          this.carregando.set(false);
        },
        error: (er) => {
          this.erro.set([uExtrairErro(er)]);
          this.carregando.set(false);
        }
      });
  }

  private CriaObjConsultaProcedimentoSalvar(): IConsultaProcedimentoSalvarDto {
    return {
      consultaId: this.consulta()!.consultaId,
      procedimentoId: Number(this.procedimentoSelecionado())
    };
  }

  private limpaErros() {
    this.erro.set([]);
  }

  //#region CARREGA LOGS

  private CarregaProcedimentosSalvos() {

    this.consultaProcedimentoService.listarPorConsulta(this.consulta()!.consultaId)
      .subscribe({
        next: (result) => {
          this.listConsultaProcedimentoSalvo.set(result.filter(a => a.ativo));
        },
        error: (er) => {
          this.erro.set([uExtrairErro(er)]);
        }
      });
  }

  private CarregaProcedimentosLogs() {

    this.consultaProcedimentoLogService.listarPorConsulta(this.consulta()!.consultaId)
      .subscribe({
        next: (result) => {
          this.listConsultaProcedimentoLog.set(result);
          this.carregando.set(false);
        },
        error: (er) => {
          this.erro.set([uExtrairErro(er)]);
          this.carregando.set(false);
        }
      });
  }

  private CarregaConsultaLogs() {

    this.consultaLogService.listarPorConsulta(this.consulta()!.consultaId)
      .subscribe({
        next: (result) => {
          this.listConsultaLog.set(result);
        },
        error: (er) => {
          this.erro.set([uExtrairErro(er)]);
        }
      });
  }

  // RECARREGA TODOS
  recarregaProcedimentos_E_Log() {

    this.carregando.set(true);

    this.CarregaProcedimentosSalvos();
    this.CarregaConsultaLogs();
    this.CarregaProcedimentosLogs();

    this.carregando.set(false);
  }

  //#endregion

  //#region ALTERAÇÃO DE STATUS CONSULTA

  // ABRE MODAL DE CONFIRMAÇÃO - FINALIZAR CONSULTA
  finalizarConsulta() {
    this.exibeConfirmaFinalizarConsulta.set(true);
  }

  // CONFIRMAÇÃO DE FINALIZAÇÃO
  modalConfirmarFinalizacaoConsulta() {

    const statisIdFinalizacao = 3;

    const dto = this.criaDtoAtualizaStatus(statisIdFinalizacao);

    this.confirmarFinalizacaoConsulta(dto, false); // FINALIZAR
  }

  // RECEBE ALTERAÇÃO DE ATUALIZAÇÃO DE STATUS DA MODAL
  recebeAlteracaoStatusModal(dto: IConsultaAtualizaStatusDto) {

    this.confirmarFinalizacaoConsulta(dto, true); // FINALIZAR

  }

  // CONFIRMA EFETIVAMENTE A ALTERAÇÃO DO STATUS
  private confirmarFinalizacaoConsulta(dto: IConsultaAtualizaStatusDto, origemModal: boolean) {

    this.consultaService.atualizarStatus(this.id()!, dto)
      .subscribe({
        next: () => this.router.navigate(['/agenda']),
        error: (er) => {

          if(origemModal){
            this.devolveErroAoFilho_Msg.set(er.error); // DEVOLVO O ERRO PARA O FILHO
            this.devolveErroAoFilho_statusSelcionado.set(dto.statusId.toString());

            if(dto.statusId === 2) {
              this.devolveErroAoFilho_dataSelcionada.set(dto.dataReagendamentoConsulta!);
              this.devolveErroAoFilho_horarioSelcionado.set(dto.horarioReagendamentoConsulta!);
            }


            this.abreAlteracaoStatusModal.set(true); // ABRE A MODAL NOVAMENTE
          }
          else
            this.erro.set([uExtrairErro(er)]);

          this.carregando.set(false);
        }
      });
  }

  private criaDtoAtualizaStatus(statusId: number): IConsultaAtualizaStatusDto {
    return {
      statusId: statusId,
      dataReagendamentoConsulta: null,
      horarioReagendamentoConsulta: null
    };
  }

  abreModalAlteraStatus(){
    this.devolveErroAoFilho_Msg.set(''); // DEVOLVO SEM MSG DE ERRO PARA O FILHO
    this.devolveErroAoFilho_statusSelcionado.set('');
    this.devolveErroAoFilho_dataSelcionada.set('');
    this.devolveErroAoFilho_horarioSelcionado.set('');

    this.abreAlteracaoStatusModal.set(true);
  }

  //#endregion

  incluirObsDentista() {

    this.carregando.set(true);

    const dto: IAtualizaObsDentistaDto = {
      descricao: this.obsDentista()
    };

    this.consultaService.atualizarObsDentista(this.id()!, dto)
      .subscribe({
        next: () => {
          this.carregando.set(true);
          this.recarregaProcedimentos_E_Log();
        },
        error: (er) => {
          this.erro.set([uExtrairErro(er)]);
          this.carregando.set(true);
        }
      });
  }

  //#region EXCLUIR PROCEDIMENTO

  pedirConfirmacaoInativar(id: number) {
    this.idParaInativar.set(id);
    this.exibeConfirmaInativar.set(true);
  }

  confirmarInativacao() {

    this.inativarConsultaProcedimento(this.idParaInativar());

    this.exibeConfirmaInativar.set(false);
  }

  //#endregion
}
