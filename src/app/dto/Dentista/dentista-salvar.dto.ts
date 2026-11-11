import { IEspecialidade } from "../../models/especialidade.models";

export interface IDentistaSalvarDto{
  nome: string;
  cro: string;
  email: string;
  ativo: boolean;
  especialidades: IEspecialidade[];
  telefones: string[];
}
