// confirma-modal.ts
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirma-modal',
  imports: [],
  templateUrl: './confirma-modal.html',
})
export class ConfirmaModal {
  // textos vêm do pai (com valor padrão, caso não passe)
  readonly titulo = input('Confirmar ação');
  readonly mensagem = input('Tem certeza?');
  readonly textoConfirmar = input('Confirmar');
  readonly textoCancelar = input('Cancelar');
  readonly classBtn = input('btn btn-danger');

  // avisa o pai qual botão foi clicado
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}
