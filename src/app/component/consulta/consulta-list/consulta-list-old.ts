import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { FormsModule } from '@angular/forms';
import { ConsultaService } from '../../../services/consulta.service';
import { IConsultarConsultaPorDentista } from '../../../dto/Agenda/consultar-consulta-por-dentista.dto';

@Component({
  selector: 'app-consulta-list-old',
  imports: [RouterLink, NgxMaskDirective, FormsModule],
  templateUrl: './consulta-list-old.html'
})
export class ConsultaList implements OnInit {
 private readonly consultaService = inject(ConsultaService);

  protected readonly filtroVisao = signal('1');
  /*  1 - Por dentista
      2 - Por Paciente
  */

  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected readonly filtroDentistaNome = signal('');
  protected readonly filtroDentistaEspecialidade = signal('');

  protected readonly filtroPacienteNome = signal('');
  protected readonly filtroPacienteCpf = signal('');
  protected readonly separador = signal('<br/>')

  protected readonly dentistaLista = signal<IConsultarConsultaPorDentista[]>([]);

  ngOnInit(): void {
    this.pesquisar(this.filtroVisao());
  }

  pesquisar(filtroVisao: string) {

    this.carregando.set(true);

    if(filtroVisao === '1') { // DENTISTA
      this.consultaService.buscarPorDentista(this.filtroDentistaNome(), this.filtroDentistaEspecialidade())
        .subscribe({
          next: (r) => {
            this.dentistaLista.set(r);
            this.carregando.set(false);
          },
          error: (er) => {
            this.erro.set(er.error);
            this.carregando.set(false);
          }
        });
    }
  }
}
