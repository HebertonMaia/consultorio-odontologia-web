export interface IConsultaAgendaDto {
  consulta_id: number;
  data_consulta: Date;
  status_consulta_id: number;
  statusConsultaDescricao: string;
  consultaFinalizada: boolean;
  data_cadastro: Date;
  dentista_id: number;
  dentistaNome: string;
  dentistaStatus: boolean;
  telefonesDentista: string;
  especialidades: string;
  paciente_id: number;
  pacienteNome: string;
  cpf: string;
  data_nascimento: Date;
  telefonesPaciente: string;
  usuario_id: number;
  usuarioNome: string;

  observacao_adm: string;
  observacao_dentista: string;
}
