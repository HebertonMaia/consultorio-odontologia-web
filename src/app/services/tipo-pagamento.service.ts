import { ITipoPagamento } from '../models/tipo-pagamento.models';
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root',
})

export class TipoPagamentoService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl + 'api/pagamento';

  listar(): Observable<ITipoPagamento[]> {
    return this.http.get<ITipoPagamento[]>(this.apiUrl);
  }

  listarPorId(id: string | number): Observable<ITipoPagamento> {
    return this.http.get<ITipoPagamento>(this.apiUrl + '/' + id);
  }
}
