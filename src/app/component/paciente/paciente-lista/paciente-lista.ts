import { PacienteService } from '../../../services/paciente.service';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { IPaciente } from '../../../models/paciente.model';
import { RouterLink } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { FormsModule } from '@angular/forms';
import { IPacienteConsultarDto } from '../../../dto/paciente-consultar.dto'
import { uExtrairErro } from '../../../util/erro.util';

@Component({
  selector: 'app-paciente-lista',
  imports: [RouterLink, NgxMaskDirective, FormsModule],
  templateUrl: './paciente-lista.html',
  styleUrl: './paciente-lista.scss',
})
export class PacienteLista implements OnInit {
  private readonly pacienteService = inject(PacienteService);

  protected readonly pacientes = signal<IPaciente[]>([]);
  protected readonly pacientesOrderBy = computed(() =>
      [...this.pacientes()].sort((a, b) => a.nome.localeCompare(b.nome))
  );

  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected readonly filtroNome = signal('');
  protected readonly filtroCpf = signal('');
  protected readonly filtroStatus = signal('1');

  protected readonly STATUS_AGENDADA = 1;
  protected readonly STATUS_REALIZADA = 2;

  // ngOnInit = "gancho de ciclo de vida": o Angular chama este método
  // uma vez, logo depois de criar o componente. Lugar certo para buscar dados.
  ngOnInit(): void {

    this.pesquisarFiltros();

  }

  pesquisarFiltros(){
    this.carregando.set(true);

    const pacienteConsultarDto = this.criarDtoConsultaFiltro();

    this.pacienteService.listarFiltros(pacienteConsultarDto).subscribe({
      next: (dados) =>
        {
          this.pacientes.set(dados);
          this.carregando.set(false);
        },
        error: (er) =>
          {
            this.erro.set(uExtrairErro(er));
            this.carregando.set(false);
          }
    });
  }

  protected contarConsultas(pacienteId: number, statusId: number): number {
    return 0;
    /*return this.consultas().filter(a =>
      Number(a.pacienteId) === Number(pacienteId) &&
      Number(a.statusConsultaId) === Number(statusId)
    ).length; */
  }

  private criarDtoConsultaFiltro(): IPacienteConsultarDto {
    return {
      nome: this.filtroNome().trim(),
      cpf: this.filtroCpf().trim(),
      ativo: this.filtroStatus() === '1'
    };
  }
}
