export interface IConsultaProcedimento {
  consultaProcedimentoId: number;
  consultaId: number;
  procedimentoId: number;
  procedimentoDescricao: string;
  pagamentoId: number;
  pagamentoDescricao: string;
  valor: number;
  ativo: boolean;
}
