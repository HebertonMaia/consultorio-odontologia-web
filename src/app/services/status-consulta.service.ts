import { Inject, Injectable, inject, runInInjectionContext } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { IStatusConsulta } from "../models/statusConsulta.models";

@Injectable({
  providedIn: 'root',
})

export class StatusConsultaService{
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl + 'api/statusConsulta';

  // TODOS OS STATUS
  buscaTodosStatus(): Observable<IStatusConsulta[]> {
    return this.http.get<IStatusConsulta[]>(this.apiUrl);
  }

  // TODOS OS STATUS
  buscaPorId(statusId: number): Observable<IStatusConsulta> {
    return this.http.get<IStatusConsulta>(this.apiUrl + '/' + statusId);
  }
}
