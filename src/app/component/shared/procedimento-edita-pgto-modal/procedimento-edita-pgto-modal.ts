import { IPagamento } from './../../../models/pagamento.models';
import { Component, inject, signal, computed, output, OnInit, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PagamentoService } from '../../../services/pagamento.service';
import { ConsultaProcedimentoService } from '../../../services/consulta-procedimento.service';
import { IConsultaProcedimentoEditarDto } from '../../../dto/Agenda/consulta-procedimento-editar.dto';
import { uExtrairErro } from '../../../util/erro.util';

@Component({
  selector: 'app-procedimento-edita-pgto-modal',
  imports: [FormsModule],
  templateUrl: './procedimento-edita-pgto-modal.html',
  styleUrl: './procedimento-edita-pgto-modal.scss',
})
export class ProcedimentoEditaPgtoModal implements OnInit{

  private readonly pagamentoService = inject(PagamentoService);
  private readonly consultaProcedimentoService = inject(ConsultaProcedimentoService);

  readonly consultaProcedimentoIdSelecionadoFilho = input.required<number>();

  protected readonly pagamentoSelecionado = signal(0);
  protected readonly valorPgtoModal = signal('');
  protected readonly fechar = output<void>();

  protected readonly listPagamento = signal<IPagamento[]>([]);
  protected readonly listPagamentoOrderBy = computed(() =>
    [...this.listPagamento()].sort((a, b) => a.descricao.localeCompare(b.descricao)));

  protected readonly carregando = signal(true);
  protected readonly erro = signal('');

  protected readonly pgtoComValor = signal(false);

  protected readonly valorCentavos = signal(0);
  // o texto formatado que aparece no campo
  protected readonly valorFormatado = computed(() =>
  (this.valorCentavos() / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
);

  readonly salvoRecarregarDados = output<void>();

  ngOnInit(): void {

      this.carregaComboPagamento();
  }

  // SALVA
  salvaEdicaoPgtoModal() {

    if(this.pagamentoSelecionado().toString() === '') {
      this.erro.set('Informe o pagamento');
        return;
    }

    if(this.pgtoComValor()) {
      if(this.valorPgtoModal() === null || this.valorPgtoModal() === '' || Number(this.valorPgtoModal()) <= 0 ) {
        this.erro.set('Informe o valor do procedimento');
        return;
      }
    }

    const objEditar = this.criarEdicaoPgto();

    this.consultaProcedimentoService.alterar(this.consultaProcedimentoIdSelecionadoFilho(), objEditar)
      .subscribe({
        next: () => {
          this.salvoRecarregarDados.emit(); // informa ao pai para recarregar os dados da tela de trás
          this.fechar.emit(); // FECHA MODAL
        },
        error: (er) => {
          this.erro.set(uExtrairErro(er));
          this.carregando.set(false);
        }
      });
  }

  private carregaComboPagamento() {

    this.carregando.set(true);

    this.pagamentoService.listar()
      .subscribe({
        next: (result) => {
          this.listPagamento.set(result);
          this.carregarDadosPagamento();  // CARREGA DADOS DO PAGAMENTO
        },
        error: (er) => {
          this.erro.set(uExtrairErro(er));
          this.carregando.set(false);
        }
      });
  }

  private carregarDadosPagamento() {

    this.consultaProcedimentoService.obterPorId(this.consultaProcedimentoIdSelecionadoFilho())
      .subscribe({
        next: (result) => {
          if(result.pagamentoId) {
            //this.pagamentoSelecionado.set((result.pagamentoId === null ? 0 : Number(result.pagamentoId)));
            this.pagamentoSelecionado.set(Number(result.pagamentoId));

            const pgto = this.listPagamento().find(a=> a.pagamentoId === result.pagamentoId); // PEGO A FORMA DE PAGAMENTO SALVA DESSE PROCEDIMENTO
            this.pgtoComValor.set(pgto!.infoPgto);
          }

          if(result.valor)
            this.valorPgtoModal.set(result.valor.toString());
          else
            this.valorPgtoModal.set('');

          this.carregando.set(false);
        },
        error: (er) => {
          this.erro.set(uExtrairErro(er));
          this.carregando.set(false);
        }
      });
  }

  private criarEdicaoPgto(): IConsultaProcedimentoEditarDto {
    return {
      pagamentoId: Number(this.pagamentoSelecionado()),
      valor: (this.pgtoComValor() ? (this.valorCentavos() / 100) : 0)
    };
  }

  verificaInfoPgto() {

    if(this.pagamentoSelecionado().toString() === '') {
      this.pgtoComValor.set(false);
    }
    else {
      const pgto = this.listPagamento().find(a=> a.pagamentoId === Number(this.pagamentoSelecionado()));

      this.pgtoComValor.set(pgto!.infoPgto);
    }
  }

  aoDigitarValor(e: Event) {
    const input = e.target as HTMLInputElement;
    const digitos = input.value.replace(/\D/g, '');   // mantém só os números
    this.valorCentavos.set(Number(digitos));          // tudo é centavo
  }
}
