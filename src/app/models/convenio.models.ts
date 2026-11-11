export interface IConvenio{
  convenioId: number;
  registroAns: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  ativo: boolean;
  telefones: string[];
  emails: string[];
  sites: string[];
  dataCadastro: string;
}
