import { StatusConsultaService } from './../../../services/status-consulta.service';
import { Component, inject, signal, computed, output, OnInit, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IStatusConsulta } from '../../../models/statusConsulta.models';
import { uValidaDataHora, uMontaDataHora, uMontaData, uDateParaString } from '../../../util/data.util';
import { IConsultaAtualizaStatusDto } from '../../../dto/Agenda/consulta-atualiza-status.dto';
import { ConsultaService } from '../../../services/consulta.service';
import { uExtrairErro } from '../../../util/erro.util';

@Component({
  selector: 'app-altera-status-consulta-modal',
  imports: [FormsModule],
  templateUrl: './altera-status-consulta-modal.html',
  styleUrl: './altera-status-consulta-modal.scss',
})

export class AlteraStatusConsultaModal implements OnInit {

  private readonly statusConsultaService = inject(StatusConsultaService);
  private readonly consultaService = inject(ConsultaService);

  protected readonly carregando = signal(true);
  protected readonly erro = signal<string[]>([]);

  // MSG DE ERRO QUE O PAI DEVOLVE
  readonly erroDevolvido_msg = input<string>('');
  // ERRO - STATUS SELECIONADO QUE O PAI DEVOLVE
  readonly erroDevolvido_statusSelecionado = input<string>('');
  // ERRO - DATA SELECIONADA QUE O PAI DEVOLVE
  readonly erroDevolvido_dataSelecionada = input<string>('');
  // ERRO - HORÁRIO SELECIONADO QUE O PAI DEVOLVE
  readonly erroDevolvido_horarioSelecionado = input<string>('');

  // STATUS ATUAL DA CONSULTA
  readonly statusConsultaAtualModal = input<number>();
  // ID DO DENTISTA
  readonly dentistaIdModal = input<number>();

  // COMANDO DE FECHAR A MODAL
  readonly fechar = output<void>();
  // ENVIA DADOS AO PAI
  readonly salvar = output<IConsultaAtualizaStatusDto>();

  protected readonly statusSelecionado = signal('');
  protected readonly dataReagendamentoModal = signal('');
  protected readonly horarioReagendamentoModal = signal('');

  protected readonly listStatus = signal<IStatusConsulta[]>([]);
  protected readonly listStatusOrderBy = computed(() =>
    [...this.listStatus()].sort((a, b) => a.descricao.localeCompare(b.descricao)));

  protected readonly listAgendaAberta = signal<IAgendaDia[]>([]);
  readonly listAgendaAbertaOrderBy = computed(() =>
                                                  [...this.listAgendaAberta()]
                                                    .map(dia => ({ ...dia, horarios: [...dia.horarios].sort() }))
                                                );

  ngOnInit(): void {
    this.erro.set([]);
    this.carregaStatus();

    if(this.erroDevolvido_msg())
    {
      this.erro.set([this.erroDevolvido_msg()]);

      this.statusSelecionado.set(this.erroDevolvido_statusSelecionado()); // ABRE A MODAL COM O STATUS SELECIONADO

      if(this.erroDevolvido_statusSelecionado() === '2') { // REAGENDAMENTO
        const data = uMontaData(this.erroDevolvido_dataSelecionada());
        this.listaAgendaAbertaDentista(); // RECARREGA AS INFORMAÇÕES
        this.dataReagendamentoModal.set(this.erroDevolvido_dataSelecionada());
        this.horarioReagendamentoModal.set(this.erroDevolvido_horarioSelecionado());
      }
    }
  }

  carregaStatus() {

    this.statusConsultaService.buscaTodosStatus()
      .subscribe({
        next: (result) => {
          this.listStatus.set(result);
          this.carregando.set(false);
        },
        error: (er) => {
          this.erro.set(er.message);
          this.carregando.set(false);
        }
      });
  }

  salvaAlteracaoStatusModal() {

    if (!this.statusSelecionado())
    {
      this.erro.set(['Informe um status para alteração']);
      return
    }

    if(this.statusSelecionado() === '2') { // SE FOR REAGENDAMENTO
      if(!uValidaDataHora(this.dataReagendamentoModal(), this.horarioReagendamentoModal()))
      {
        this.erro.set(['Data ou horário inválidos']);
        return
      }
    }

    const dto: IConsultaAtualizaStatusDto = {
      statusId: Number(this.statusSelecionado()),
      dataReagendamentoConsulta:
      (
        this.statusSelecionado() === '2' // REAGENDAMENTO
          ? this.dataReagendamentoModal()
          : null
      ),
      horarioReagendamentoConsulta:
      (
        this.statusSelecionado() === '2'
          ? this.horarioReagendamentoModal()
          : null
      )
    };

    this.salvar.emit(dto);

    this.fechar.emit();
  }

  erroAlteracaoStatus(erro: string) {
    this.erro.set([erro]);
  }

  listaAgendaAbertaDentista(){

    if(this.statusSelecionado() === '2') // REAGENDAMENTO
    {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      this.consultaService.buscarAgendaAbertaDentista(Number(this.dentistaIdModal()), hoje)
        .subscribe({
          next: (result) => {
            this.listAgendaAberta.set(this.preencheAgendaAbertaDentista(result));
            this.carregando.set(false);
          },
          error: (er) => {
            this.erro.set([uExtrairErro(er)]);
            this.carregando.set(false);
          }
        });
    }
  }

  private preencheAgendaAbertaDentista(datas: Date[] | null | undefined): IAgendaDia[] {

    if (!datas || datas.length === 0) return [];

    const z = (n: number) => String(n).padStart(2, '0');
    const formataData = (d: Date) => `${z(d.getDate())}/${z(d.getMonth() + 1)}/${d.getFullYear()}`;
    const formataHora = (d: Date) => `${z(d.getHours())}:${z(d.getMinutes())}h`;

    // 1. converte para Date e ordena pelo instante completo
    const ordenadas = datas
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());

    // 2. agrupa por dia num Map
    const mapa = new Map<string, string[]>();
    for (const d of ordenadas) {
      const chave = formataData(d);
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave)!.push(formataHora(d));
    }

    // 3. transforma o Map em array
    return Array.from(mapa, ([data, horarios]) => ({ data, horarios }));
  }
}
