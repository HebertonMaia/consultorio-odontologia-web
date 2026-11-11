import { PacienteConvenioService } from './../../../services/paciente-convenio.service';
import { PacienteService } from '../../../services/paciente.service';
import { IPaciente } from '../../../models/paciente.model';
import { Component, inject, signal, input, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { BuscaCepService } from '../../../services/busca-cep.service';
import { IPacienteSalvarDto } from '../../../dto/paciente-salvar.dto';
import { uValidarCpf } from '../../../util/cpf.util';
import { uValidarDataNascimento } from '../../../util/dataNascimento.util';
import { uValidarEmail } from '../../../util/email.util';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { uSIGLAS_UF } from '../../../util/uf.util';
import { TelefoneLista } from '../../shared/telefone-lista/telefone-lista';
import { IPacienteConvenio } from '../../../models/paciente-convenio.models';
import { IConvenio } from '../../../models/convenio.models';
import { ConvenioService } from '../../../services/convenio.service';
import { IPacienteConvenioSalvarDto } from '../../../dto/paciente-convenio-salvar';
import { uExtrairErro } from '../../../util/erro.util';

@Component({
  selector: 'app-paciente-form',
  imports: [
    FormsModule,
    NgxMaskDirective, // permite usar mask="..." no HTML
    RouterLink // permite usar routerLink no HTML
    ,
    TelefoneLista
],
  templateUrl: './paciente-form.html',
  styleUrl: './paciente-form.scss',
})

export class PacienteForm implements OnInit {

  readonly id = input<string>();

  protected readonly edicaoTela = computed(() => this.id() !== undefined);

  private readonly pacienteService = inject(PacienteService);
  protected readonly pacienteConvenioService = inject(PacienteConvenioService);     // true enquanto espera a resposta
  private readonly convenioService = inject(ConvenioService);
  private readonly router = inject(Router);        // para voltar à lista depois de salvar
  protected readonly salvando = signal(true);     // true enquanto espera a resposta

  private readonly buscaCep = inject(BuscaCepService);
  protected readonly nome = signal('');
  protected readonly cpf = signal('');
  protected readonly dataNascimento = signal('');
  protected readonly email = signal('');
  protected readonly status = signal('');
  protected readonly sexo = signal('');

  // endereço
  protected readonly cep = signal('');
  protected readonly logradouro = signal('');
  protected readonly numero = signal('');
  protected readonly complemento = signal('');
  protected readonly bairro = signal('');
  protected readonly cidade = signal('');
  protected readonly uf = signal('');

  protected readonly telefone = signal('');
  protected readonly telefoneLista = signal<string[]>([]);

  protected readonly erro = signal<string[]>([]);

  // PACIENTE CONVÊNIO
  protected readonly convenio = signal('');
  protected readonly numCarteirinha = signal('');
  protected readonly listPacienteConvenio = signal<IPacienteConvenio[] | null>([]);
  protected readonly listaConvenio = signal<IConvenio[]>([]);
  protected readonly listaConvenioOrderBy = computed(() =>
    this.listaConvenio().filter(p =>
    [...this.listaConvenio()].sort((a,b)=> a.nomeFantasia.localeCompare(b.nomeFantasia))
    ));

  // no componente
  protected readonly ufs = uSIGLAS_UF;

  // O Angular chama este método uma vez, quando a tela abre
  ngOnInit(): void {

    // Novo cadastro: nada para carregar, a tela abre vazia
    if (!this.edicaoTela())
      {
        this.status.set('1');
        this.salvando.set(false);
        return;
      }

    forkJoin({
      dadosPaciente: this.pacienteService.buscarPorId(this.id()!),
      dadosPacienteConvenio: this.pacienteConvenioService.listarPorPaciente(this.id()!, false),
      dadosConvenio: this.convenioService.listar()
    })
    .subscribe({
      next: (dados) => {
        this.preencherTela(dados.dadosPaciente);
        this.listPacienteConvenio.set(dados.dadosPacienteConvenio);
        this.listaConvenio.set(dados.dadosConvenio.filter(a=> a.ativo));
        this.salvando.set(false);
      },
      error: (er) => {
        this.erro.set([uExtrairErro(er)]);
        this.salvando.set(false);
      }
    });


    /*
    this.pacienteService.buscarPorId(this.id()!).subscribe({
      next: (paciente) => this.preencherTela(paciente),
      error: (er) => this.msgErros.set([er.error])
    });
    */
  }

  // PREENCHER TELA, MODO EDIÇÃO
  preencherTela(paciente: IPaciente){
      this.nome.set(paciente.nome);
      this.cpf.set(paciente.cpf);
      this.dataNascimento.set(paciente.dataNascimento);
      this.email.set(paciente.email);
      this.status.set(paciente.ativo ? '1' : '0');
      this.sexo.set(paciente.sexo);

      this.cep.set(paciente.endereco.cep);
      this.logradouro.set(paciente.endereco.logradouro);
      this.numero.set(paciente.endereco.numero);
      this.bairro.set(paciente.endereco.bairro);
      this.complemento.set(paciente.endereco.complemento);
      this.cidade.set(paciente.endereco.cidade);
      this.uf.set(paciente.endereco.uf);

      this.telefoneLista.set(paciente.telefones);
  }

  consultaCep() {
    const cepSomenteNumero = this.cep().replace(/\D/g, '');

    if (cepSomenteNumero.length !== 8)
      return;

    this.buscaCep.buscar(cepSomenteNumero).subscribe({
      next: (r) => {
        // Daqui para baixo, a resposta JÁ chegou
        this.logradouro.set(r.logradouro);
        this.bairro.set(r.bairro);
        this.cidade.set(r.localidade);   // no ViaCEP a cidade se chama "localidade"
        this.uf.set(r.uf);
      },
      error: (er) => console.error(er.error)
    });
  }



  salvarPaciente() {

    this.salvando.set(true);   // antes do requisicao.subscribe

    const pacienteSalvarDto = this.criaPacienteSalvarDto();

    if (!this.validaFormulario(pacienteSalvarDto))
    {
      this.salvando.set(false);
      return;
    }

    /*
    let requisicao: Observable<IPaciente>;

    if(this.edicaoTela()) // EDIÇÃO DE DADOS
    {
      requisicao = this.pacienteService.atualizar(this.id()!, pacienteSalvarDto);
    }
    else // NOVO PACIENTE
    {
      requisicao = this.pacienteService.incluirNovo(pacienteSalvarDto);
    }

    requisicao.subscribe({
        next: () => this.router.navigate(['/pacientes']),
        error: (er) => {
          this.msgErros.set([er.error]);
          this.salvando.set(false); // libera o botão para tentar de novo
        }
      });
      */

      forkJoin({
        dadosIncluirAtualizar: (this.edicaoTela() ? this.pacienteService.atualizar(this.id()!, pacienteSalvarDto) : this.pacienteService.incluirNovo(pacienteSalvarDto)),
        dadosPacienteConvenio: this.pacienteConvenioService.atualizar(this.criarDtoSalvarPacienteConvenio())
      })
      .subscribe({
        next: () => this.router.navigate(['/pacientes']),
        error: (er) => {
          this.erro.set([uExtrairErro(er)]);
          this.salvando.set(false); // libera o botão para tentar de novo
        }
      });
  }

 private criarDtoSalvarPacienteConvenio(): IPacienteConvenioSalvarDto[] {

  if(this.listPacienteConvenio()?.length === 0){ // SEM VÍNCULO DE PACIENTE CONVÊNIO CADASTRADO
    return [];
  } else {
    let listSalvarDto: IPacienteConvenioSalvarDto[] = [];

    for (let index = 0; index < this.listPacienteConvenio()!.length; index++) {

      const elementos = this.listPacienteConvenio()![index];

      if(!elementos.ativo && elementos.pacienteConvenioId === 0) // PARA NÃO INCLUIR NOVOS REGISTROS INATIVADOS
        continue;

      const obj = this.criarObjDtoSalvarPacienteConvenio(elementos);

      listSalvarDto.push(obj);
    }

    return listSalvarDto;
  }
 }

 private criarObjDtoSalvarPacienteConvenio(item: IPacienteConvenio): IPacienteConvenioSalvarDto {
    return {
      pacienteConvenioId: item.pacienteConvenioId,
      pacienteId: item.pacienteId,
      convenioId: item.convenioId,
      numeroCarteirinha: item.numeroCarteirinha,
      ativo: item.ativo
    };
 }


  private validaFormulario(pacienteDto: IPacienteSalvarDto): boolean {
    const erros: string[] = [];

    // NOME
    if (pacienteDto.nome === '')
      erros.push('Informe um nome válido para o paciene');

    if (!pacienteDto.nome.includes(' '))
      erros.push('Informe um nome e sobrenome válido para o paciene');

    // CPF
    if (pacienteDto.cpf && !uValidarCpf(pacienteDto.cpf))
      erros.push('Cpf inválido');

    // SEXO
    if(pacienteDto.sexo === '')
      erros.push('Informe o sexo');

    // DATA NASCIMENTO
    const erroData = uValidarDataNascimento(pacienteDto.dataNascimento);

    if (erroData !== null)
      erros.push(erroData);

    // CEP
    if (pacienteDto.endereco.cep === '')
      erros.push('Informe um cep')

    // LOGRADOURO
    if (pacienteDto.endereco.logradouro === '')
      erros.push('Informe um logradouro')

    if (!pacienteDto.endereco.logradouro.includes(' '))
      erros.push('Informe um logradouro válido')

    // NUMERO
    if (pacienteDto.endereco.numero === '')
      erros.push('Informe um número')

    // BAIRRO
    if (pacienteDto.endereco.bairro === '')
      erros.push('Informe um bairro')

    // CIDADE
    if (pacienteDto.endereco.cidade === '')
      erros.push('Informe uma cidade')

    // UF
    if (pacienteDto.endereco.uf === '')
      erros.push('Informe uma uf')

    // EMAIL
    if (pacienteDto.email && !uValidarEmail(pacienteDto.email))
      erros.push('Informe um email válido')

    // TELEFONE
    if (this.telefoneLista().length < 1)
      erros.push('Informe no mínimo um telefone para contato')

    this.erro.set(erros);   // se não houver erros, limpa a lista da tela
    return erros.length === 0;
  }

  private criaPacienteSalvarDto(): IPacienteSalvarDto {
    return {
      nome: this.nome().trim(),
      cpf: this.cpf().trim(),
      dataNascimento: this.dataNascimento().trim(),
      email: this.email().trim(),
      ativo: (this.status() === "1" ? true : false),
      sexo: this.sexo(),
      endereco: {
        cep: this.cep().trim(),
        logradouro: this.logradouro().trim(),
        numero: this.numero().trim(),
        complemento: this.complemento().trim(),
        bairro: this.bairro().trim(),
        cidade: this.cidade().trim(),
        uf: this.uf().trim(),
      },
      telefones: this.telefoneLista()
    };
  }

  addConvenioList(){
    this.erro.set([]);

    if(this.convenio() === '' || this.numCarteirinha().trim() === '')
    {
      this.erro.set(['Convênio e número de carteirinha precisam estar preenchidos']);
      return;
    }

    if(this.listPacienteConvenio()!.length > 0)
    {
      const vinculoJaExiste = this.listPacienteConvenio()!.some(a=>
        a.convenioId.toString() === this.convenio() &&
        a.numeroCarteirinha === this.numCarteirinha().trim());

        if(vinculoJaExiste){
          this.erro.set(['Este convênio já está vinculado a esse número de carteirinha']);
          return;
        }
    }

    const objDto = this.criaDtoPacienteConvenio();

    this.listPacienteConvenio.update(l => [...(l ?? []), objDto]);

    this.convenio.set('');
    this.numCarteirinha.set('');
  }

  private criaDtoPacienteConvenio():IPacienteConvenio  {
    return {
      pacienteConvenioId: 0,
      pacienteId: Number(this.id()!),
      convenioId: Number(this.convenio()),
      convenioNome: this.listaConvenio()
                          .find(a=> a.convenioId === Number(this.convenio()))?.nomeFantasia ?? '',
      numeroCarteirinha: this.numCarteirinha().trim(),
      ativo: true
    };
  }
}
