import { Inject, Injectable, inject, runInInjectionContext } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { IPacienteConvenio } from "../models/paciente-convenio.models";
import { IPacienteConvenioSalvarDto } from "../dto/paciente-convenio-salvar";

@Injectable({
  providedIn: 'root',
})

export class PacienteConvenioService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}api/PacienteConvenio`;

  listarPorPaciente(pacienteId: number | string, somenteAtivos: boolean): Observable<IPacienteConvenio[]>{

    return this.http.get<IPacienteConvenio[]>(`${this.apiUrl}/${pacienteId}/${somenteAtivos}`);
  }

  atualizar(lista: IPacienteConvenioSalvarDto[]): Observable<IPacienteConvenio[]>{
    return this.http.post<IPacienteConvenio[]>(`${this.apiUrl}`, lista);
  }
}
