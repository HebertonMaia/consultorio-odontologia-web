export interface IPacienteSalvarDto{
  //pacienteId: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  email: string;
  ativo: boolean;
  endereco:
  {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  telefones: string[];
}
