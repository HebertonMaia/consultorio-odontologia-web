export interface IConsulta{
  consultaId: number;
  pacienteId: number;
  pacienteNome: string;
  dentistaId: number;
  dataConsulta: string;
  dataCadastro: string;
  statusConsultaId: number;
  consultaFinalizada: boolean;
  observacaoAdm: string;
  observacaoDentista: string;
  usuarioId: number;
}
