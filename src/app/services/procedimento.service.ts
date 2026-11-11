import { IProcedimento } from './../models/procedimento.models';
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root',
})

export class ProcedimentoService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl + 'api/Procedimento';

  listar(): Observable<IProcedimento[]> {
      return this.http.get<IProcedimento[]>(this.apiUrl);
    }
}
