import { set } from 'vue/types/umd';
import { IEspecialidade } from './../../../models/especialidade.models';
import { DentistaService } from '../../../services/dentista.service';
import { IDentista } from '../../../models/dentista.models';
import { Component, inject, signal, input, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { IDentistaSalvarDto } from '../../../dto/Dentista/dentista-salvar.dto';
import { uValidarEmail } from '../../../util/email.util';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { uSIGLAS_UF } from '../../../util/uf.util';
import { EspecialidadeService } from '../../../services/especialidade.service';
import { TelefoneLista } from '../../shared/telefone-lista/telefone-lista';
import { uExtrairErro } from '../../../util/erro.util';

@Component({
  selector: 'app-dentista-form',
  imports: [
    FormsModule,
    NgxMaskDirective, // permite usar mask="..." no HTML
    RouterLink // permite usar routerLink no HTML]
    ,
    TelefoneLista
],
  templateUrl: './dentista-form.html',
  styleUrl: './dentista-form.scss',
})
export class DentistaForm implements OnInit {

  private readonly dentistaService = inject(DentistaService);
  private readonly especialidadeService = inject(EspecialidadeService);

  // pega o id na rota da url
  readonly id = input<string>();

  protected readonly edicaoTela = computed(() => this.id() !== undefined);

  private readonly router = inject(Router);        // para voltar à lista depois de salvar
  protected readonly salvando = signal(false);     // true enquanto espera a resposta

  protected readonly nome = signal('');
  protected readonly croUf = signal('');
  protected readonly cro = signal('');
  protected readonly status = signal('');
  protected readonly email = signal('');

  protected readonly telefone = signal('');
  protected readonly telefoneLista = signal<string[]>([]);

  protected readonly especialidadesBanco = signal<IEspecialidade[]>([]);
  protected readonly especialidadesBancoOrderBy = computed(() => [...this.especialidadesBanco()]
                  .sort((a, b) => a.descricao.localeCompare(b.descricao)));


  protected readonly especialidade = signal('');
  protected readonly especialidadeLista = signal<IEspecialidade[]>([]);

  protected readonly erro = signal<string[]>([]);

  protected readonly ufs = uSIGLAS_UF;

  //#region [    ESPECIALIDADE    ]

  incluiEspecialidadeLista() {

    const especialidadeId = this.especialidade().trim(); // ID DA ESPECIALIDADE
    const especialidadeObj = this.especialidadesBanco()
                                  .find(e=> e.especialidadeId.toString() === especialidadeId);

    // EVITAR INCLUIR DUPLICIDADES
    if (
      especialidadeId === '' ||
      this.especialidadeLista()?.some(a=> a.especialidadeId === especialidadeObj?.especialidadeId)
    ) {
      this.especialidade.set('');
      return;
    }

    // RETIRO O ITEM ESCOLHIDO DA COMBO
    this.especialidadesBanco.set(this.especialidadesBanco().filter(a=> a.especialidadeId !== especialidadeObj?.especialidadeId));
    this.especialidadeLista.update(e => [...e, especialidadeObj!]);
    this.especialidade.set('');
  }

  removerEspecialidade(especialidadeId: number) {
    this.especialidadeLista.set(this.especialidadeLista().filter(esp => esp.especialidadeId !== especialidadeId));
  }

  //#endregion

  ngOnInit(): void {

    this.especialidadeService.listar().subscribe({
      next: (dados) => { this.especialidadesBanco.set(dados);  },
      error: (er) => this.erro.set([uExtrairErro(er)])
    });

    if (!this.edicaoTela()) {
      this.status.set('1');
      return;
    }

    this.dentistaService.buscarPorId(this.id()!).subscribe({
      next: (dados) => this.preenchertela(dados),
      error: (er) => this.erro.set([uExtrairErro(er)])
    });
  }

  preenchertela(dentista: IDentista) {
    this.nome.set(dentista.nome);
    this.croUf.set(dentista.cro.split('-')[0]); // RJ-00000
    this.cro.set(dentista.cro.split('-')[1]);   // RJ-00000
    this.status.set(dentista.ativo ? '1' : '0');
    this.email.set(dentista.email);

    this.telefoneLista.set(dentista.telefones);

    this.especialidadeLista.set(dentista.especialidades);
  }

  salvarDentista() {
    this.salvando.set(true);

    const dentistaDto = this.criaDentistaSalvarDto();

    if (!this.validaFormulario(dentistaDto)) {
      this.salvando.set(false);
      return;
    }

    let requisicao: Observable<IDentista>;

    if(this.edicaoTela()) // EDIÇÃO DENTISTA
    {
      requisicao = this.dentistaService.atualizar(this.id()!, dentistaDto);
    }
    else // NOVO DENTISTA
    {
      requisicao = this.dentistaService.incluirNovo(dentistaDto);
    }

    requisicao.subscribe({
        next: () => this.router.navigate(['/dentistas']),
        error: (er) => {
          this.erro.set([uExtrairErro(er)]);
          this.salvando.set(false); // libera o botão para tentar de novo
        }
      });
  }

  private validaFormulario(dentistaDto: IDentistaSalvarDto): boolean {
    const erros: string[] = [];

    // NOME
    if (dentistaDto.nome === '')
      erros.push('Informe um nome válido para o dentista');

    if (!dentistaDto.nome.includes(' '))
      erros.push('Informe um nome e sobrenome válido para o paciene');

    // CRO
    if (!this.validaCro(dentistaDto.cro))
      erros.push('Cro inválido');

    // EMAIL
    if (dentistaDto.email && !uValidarEmail(dentistaDto.email))
      erros.push('Informe um email válido');

    // TELEFONE
    if (this.telefoneLista().length < 1)
      erros.push('Informe no mínimo um telefone para contato');

    // TELEFONE
    if (this.especialidadeLista().length < 1)
      erros.push('Informe no mínimo uma especialidade do dentista');

    this.erro.set(erros);   // se não houver erros, limpa a lista da tela
    return erros.length === 0;
  }

  private criaDentistaSalvarDto(): IDentistaSalvarDto {
    return {
      nome: this.nome().trim(),
      cro: `${this.croUf().trim()}-${this.cro().trim()}`,
      email: this.email().trim(),
      ativo: (this.status() === "1" ? true : false),
      telefones: this.telefoneLista(),
      especialidades: this.especialidadeLista()
    };
  }

  validaCro(cro: string) {
    if (!cro?.trim())
      return false;

    if (cro.length < 5) // RJ-9
      return false;

    if (!cro.includes('-')) // SEM TRAÇO SEPARANDO O CRO
      return false;

    if (cro.indexOf('-') !== 2) // SE O TRAÇO NÃO ESTIVER NA 2ª (COMEÇANDO COM 0) POSIÇÃO => 'RJ-'
      return false;

    const uf = cro.substring(0, 2);

    if (!uSIGLAS_UF.includes(uf)) // SIGLA DA UF INVÁLIDA
      return false;

    return true;
  }
}
