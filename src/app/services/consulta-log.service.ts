import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { IConsultaLog } from "../models/consulta-log.models";

@Injectable({
  providedIn: 'root',
})

export class ConsultaLogService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl + 'api/ConsultaLog';

  listarPorConsulta(consultaId: number | string): Observable<IConsultaLog[]> {
    return this.http.get<IConsultaLog[]>(this.apiUrl + '/' + consultaId);
  }
}
