import { Inject, Injectable, inject, runInInjectionContext } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

import { IPaciente } from '../models/paciente.model'
import { IPacienteSalvarDto } from "../dto/paciente-salvar.dto";
import { IPacienteConsultarDto } from "../dto/paciente-consultar.dto";

@Injectable({
  providedIn: 'root',
})

export class PacienteService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}api/paciente`;

  listar(): Observable<IPaciente[]>{
    return this.http.get<IPaciente[]>(this.apiUrl);
  }

  // GET /paciente → por id
  buscarPorId(id: number | string): Observable<IPaciente>{
    return this.http.get<IPaciente>(`${this.apiUrl}/${id}`);
  }

  incluirNovo(pacienteNovo: IPacienteSalvarDto): Observable<IPaciente>{
    return this.http.post<IPaciente>(this.apiUrl, pacienteNovo);
  }

  atualizar(pacienteId: number | string, pacienteNovo: IPacienteSalvarDto): Observable<IPaciente>{
    return this.http.put<IPaciente>(`${this.apiUrl}/${pacienteId}`, pacienteNovo);
  }

  listarFiltros(filtro: IPacienteConsultarDto): Observable<IPaciente[]>{
    let params = new HttpParams().set("ativo", filtro.ativo);

    if(filtro.nome) params = params.set('nome', filtro.nome);

    if (filtro.cpf) params = params.set('cpf', filtro.cpf);

    return this.http.get<IPaciente[]>(this.apiUrl + '/filtros', { params });
  }
}
