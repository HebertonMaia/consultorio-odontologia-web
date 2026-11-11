import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { IConsultaProcedimentoLog } from "../models/consulta-procedimento-log.models";

@Injectable({
  providedIn: 'root',
})

export class ConsultaProcedimentoLogService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl + 'api/ConsultaProcedimentoLog';

  obterPorId(consultaProcedimentoId: number | string): Observable<IConsultaProcedimentoLog> {
    return this.http.get<IConsultaProcedimentoLog>(this.apiUrl + '/' + consultaProcedimentoId);
  }

  listarPorConsulta(consultaId: number | string): Observable<IConsultaProcedimentoLog[]> {
    return this.http.get<IConsultaProcedimentoLog[]>(this.apiUrl + '/por-consulta-id/' + consultaId);
  }
}
