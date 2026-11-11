import { ConvenioService } from '../../../services/convenio.service';
import { IConvenio } from '../../../models/convenio.models';
import { Component, inject, signal, input, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { IConvenioSalvarDto } from '../../../dto/convenio-salvar.dto';
import { uValidarEmail } from '../../../util/email.util';
import { uValidarCnpj } from '../../../util/cnpj.util';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { TelefoneLista } from '../../shared/telefone-lista/telefone-lista';
import { uExtrairErro } from '../../../util/erro.util';

@Component({
  selector: 'app-convenio-form',
  imports: [
    FormsModule,
    NgxMaskDirective, // permite usar mask="..." no HTML
    RouterLink // permite usar routerLink no HTML]
    ,TelefoneLista
  ],
  templateUrl: './convenio-form.html',
  styleUrl: './convenio-form.scss',
})

export class ConvenioForm implements OnInit {
private readonly convenioService = inject(ConvenioService);

  // pega o id na rota da url
  readonly id = input<string>();

  protected readonly edicaoTela = computed(() => this.id() !== undefined);

  private readonly router = inject(Router);        // para voltar à lista depois de salvar
  protected readonly salvando = signal(false);     // true enquanto espera a resposta

  protected readonly razaoSocial = signal('');
  protected readonly nomeFantasia = signal('');
  protected readonly registroANS = signal('');
  protected readonly cnpj = signal('');
  protected readonly status = signal('');

  protected readonly telefone = signal('');
  protected readonly telefoneLista = signal<string[]>([]);

  protected readonly email = signal('');
  protected readonly emailLista = signal<string[]>([]);

  protected readonly site = signal('');
  protected readonly siteLista = signal<string[]>([]);

  protected readonly erro = signal<string[]>([]);

  //#region [    TELEFONE    ]

  incluiTelefoneLista() {
    const telefone = this.telefone().trim();

    if (
      telefone === '' ||
      telefone.length < 14 ||
      this.telefoneLista()?.includes(telefone)
    ) {
      this.telefone.set('');
      return;
    }

    this.telefoneLista.update(l => [...l, this.telefone()]);
    this.telefone.set('');
  }

  removerTelefone(tel: string) {
    this.telefoneLista.set(this.telefoneLista().filter(t => t !== tel));
  }

  //#endregion

  //#region [    EMAIL    ]

  incluiEmailLista() {
    const email = this.email().trim();

    if (
      email === '' ||
      this.emailLista()?.includes(email) ||
      !uValidarEmail(email)
    ) {
      this.email.set('');
      return;
    }

    this.emailLista.update(e => [...e, this.email()]);
    this.email.set('');
  }

  removerEmail(email: string) {
    this.emailLista.set(this.emailLista().filter(t => t !== email));
  }

  //#endregion

 //#region [    SITE    ]

  incluiSiteLista() {
    const site = this.site().trim();

    if (
      site === '' ||
      this.siteLista()?.includes(site)
    ) {
      this.site.set('');
      return;
    }

    this.siteLista.update(e => [...e, this.site()]);
    this.site.set('');
  }

  removerSite(site: string) {
    this.siteLista.set(this.siteLista().filter(t => t !== site));
  }

  //#endregion

  ngOnInit(): void {

    if (!this.edicaoTela()) {
      this.status.set('1');
      return;
    }

    this.convenioService.buscarPorId(this.id()!).subscribe({
      next: (dados) => this.preenchertela(dados),
      error: (er) => this.erro.set([uExtrairErro(er)])
    });
  }

  preenchertela(convenio: IConvenio) {
    this.nomeFantasia.set(convenio.nomeFantasia);
    this.razaoSocial.set(convenio.razaoSocial);
    this.registroANS.set(convenio.registroAns);
    this.cnpj.set(convenio.cnpj);
    this.status.set(convenio.ativo ? '1' : '0');

    this.telefoneLista.set(convenio.telefones);
    this.emailLista.set(convenio.emails);
    this.siteLista.set(convenio.sites);
  }

  salvarConvenio() {
    this.salvando.set(true);

    const convenioDto = this.criaConvenioSalvarDto();

    if (!this.validaFormulario(convenioDto)) {
      this.salvando.set(false);
      return;
    }

    let requisicao: Observable<IConvenio>;

    if(this.edicaoTela()) // EDIÇÃO CONVÊNIO
    {
      requisicao = this.convenioService.atualizar(this.id()!, convenioDto);
    }
    else // NOVO CONVÊNIO
    {
      requisicao = this.convenioService.incluirNovo(convenioDto);
    }

    requisicao.subscribe({
        next: (dados) =>
        {
          this.router.navigate(['/convenios']);
          this.salvando.set(false); // libera o botão para tentar de novo
        },
        error: (er) =>
        {
          this.erro.set([uExtrairErro(er)]);
          this.salvando.set(false); // libera o botão para tentar de novo
        }
      });
  }

  private validaFormulario(convenioDto: IConvenioSalvarDto): boolean {
    const erros: string[] = [];

    // NOME FANTASIA
    if (convenioDto.nomeFantasia === '')
      erros.push('Informe um nome fantasia válido');

    // RAZÃO SOCIAL
    if (convenioDto.razaoSocial === '')
      erros.push('Informe uma razão social válida');

    // REGISTRO ANS
    if (convenioDto.registroAns === '' || convenioDto.registroAns.length !== 6)
      erros.push('Informe um registro ANS inválido');

    // CNPJ
    if (!uValidarCnpj(convenioDto.cnpj))
      erros.push('Cnpj inválido');

    // TELEFONE
    if (this.telefoneLista().length < 1)
      erros.push('Informe no mínimo um telefone para contato do convênio');

    this.erro.set(erros);   // se não houver erros, limpa a lista da tela
    return erros.length === 0;
  }

  private criaConvenioSalvarDto(): IConvenioSalvarDto {
    return {
      nomeFantasia: this.nomeFantasia().trim(),
      razaoSocial: this.razaoSocial().trim(),
      registroAns: this.registroANS().trim(),
      cnpj: this.cnpj().trim(),
      ativo: (this.status() === "1" ? true : false),
      emails: this.emailLista(),
      telefones: this.telefoneLista(),
      sites: this.siteLista()
    };
  }
}
