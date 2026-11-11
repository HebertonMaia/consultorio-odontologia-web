import { Component, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-telefone-lista',
  imports: [
    FormsModule,       // o filho usa [(ngModel)] no input
    NgxMaskDirective   // o filho usa mask="..." no input
  ],
  templateUrl: './telefone-lista.html',
  styleUrl: './telefone-lista.scss',
})
export class TelefoneLista {
  // model = lista compartilhada com o pai: se o filho muda, o pai vê; se o pai muda, o filho vê.
  // Sem "protected": o pai precisa enxergar este campo.
  readonly telefoneListaCpm = model<string[]>([]);
  readonly telefoneListaCpm_2 = model<string[]>([]);

  // Texto digitado no input. Só interessa ao filho, então o pai nem sabe que existe.
  protected readonly telefone = signal('');

  incluir() {
    const telefone = this.telefone().trim();

    if (
      telefone === '' ||
      telefone.length < 14 ||
      this.telefoneListaCpm().includes(telefone)
    ) {
      this.telefone.set('');
      return;
    }

    // update() no model avisa o pai automaticamente
    this.telefoneListaCpm.update(l => [...l, telefone]);
    this.telefone.set('');
  }

  remover(tel: string) {
    this.telefoneListaCpm.update(l => l.filter(t => t !== tel));
  }
}
