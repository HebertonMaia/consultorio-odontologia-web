import { IEndereco } from "./endereco.models";

export interface IPaciente {
  pacienteId: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  email: string;
  ativo: boolean;
  endereco: IEndereco;
  telefones: string[];
}
