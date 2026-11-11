import { Component, inject, signal, computed, output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PacienteService } from '../../../services/paciente.service';
import { IPaciente } from '../../../models/paciente.model';
import { NgxMaskPipe } from 'ngx-mask';
import { DatePipe } from '@angular/common';
import { IPacienteConsultarDto } from '../../../dto/paciente-consultar.dto';
import { uExtrairErro } from '../../../util/erro.util';

@Component({
  selector: 'app-paciente-escolher-modal',
  imports: [FormsModule, NgxMaskPipe, DatePipe],
  templateUrl: './paciente-escolher-modal.html',
  styleUrl: './paciente-escolher-modal.scss',
})

export class PacienteEscolherModal implements OnInit {
  private readonly pacienteService = inject(PacienteService);

  // output = avisa o pai. Aqui mandamos o paciente escolhido.
  readonly pacienteSelecionado = output<IPaciente>();
  // e avisamos quando o modal pede para fechar (X ou clicar fora)
  readonly fechar = output<void>();

  protected readonly filtroNome = signal('');
  protected readonly filtroCpf = signal('');
  protected readonly pacientesLista = signal<IPaciente[]>([]);
  protected readonly pacientesListOrderBy = computed(() =>
    this.pacientesLista().filter(p =>
      [...this.pacientesLista()].sort((a,b)=> a.nome.localeCompare(b.nome))
    ));

  protected readonly carregando = signal(false);
  protected readonly erro = signal<string[] | null>([]);

  // o modal busca os próprios dados, assim o pai não precisa saber disso
  ngOnInit(): void {
    // this.pacienteService.listar().subscribe({
    //   next: (dados) => this.pacientesLista.set(dados)
    // });
    this.pesquisarConsultas();
  }

  escolher(paciente: IPaciente) {
    this.pacienteSelecionado.emit(paciente);  // manda o escolhido pro pai
    this.fechar.emit();                        // e pede pra fechar
  }

  pesquisarConsultas(){
    this.carregando.set(true);

    const dto = this.criarDtoPesquisaPaciente();

    this.pacienteService.listarFiltros(dto).subscribe({
      next: (result) => {
        this.pacientesLista.set(result);
        this.carregando.set(false);
      },
      error: (er) => {
        this.erro.set([uExtrairErro(er)]);
        this.carregando.set(false);
      }
    });
  }

  criarDtoPesquisaPaciente(): IPacienteConsultarDto {
    return {
      nome: this.filtroNome().toLowerCase().trim(),
      cpf: this.filtroCpf().trim(),
      ativo: true
    };
  }
}
