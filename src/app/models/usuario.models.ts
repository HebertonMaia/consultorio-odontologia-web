import { IPerfil } from "./perfil.models";

export interface IUsuario{
  usuarioId: number;
  nome: string;
  login: string;
  ativo: boolean;
  perfil: IPerfil;
}
