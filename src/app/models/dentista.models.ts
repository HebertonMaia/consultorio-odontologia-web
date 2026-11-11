import { IEspecialidade } from "./especialidade.models";

export interface IDentista{
  dentistaId: number;
  nome: string;
  cro: string;
  email: string;
  ativo: boolean;
  telefones: string[];
  especialidades: IEspecialidade[];
}
